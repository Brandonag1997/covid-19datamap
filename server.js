var fs = require("fs");
const fastcsv = require("fast-csv");
const csvparse = require("csv-parse");

/* Dependencies */
let express = require("express");
let request = require("request");
const postgres = require("postgres");
let stream = require("stream");
const { promisify } = require("util");
let dbPass = require("./pgkey.json");
let schedule = require("node-cron");
let app = express();
let http = require("http");
//let https = require('https');

const finishedAsync = promisify(stream.finished);
// global variable to store value for slow query
var countryData = {};

// varaiables for https
//let privateKey = fs.readFileSync('/etc/letsencrypt/live/covid-19datamap.com/privkey.pem', 'utf8');
//let certificate = fs.readFileSync('/etc/letsencrypt/live/covid-19datamap.com/cert.pem', 'utf8');
//let ca = fs.readFileSync('/etc/letsencrypt/live/covid-19datamap.com/chain.pem', 'utf8');

//let credentials = {
//   	key: privateKey,
//    	cert: certificate,
//    	ca: ca
//    };

// Initialize Database
const sql = postgres({
  host: dbPass.host,
  user: dbPass.user,
  password: dbPass.password,
  port: dbPass.port,
  database: dbPass.database,
});

let download = (url, path, callback) => {
  request.head(url, (err, res, body) => {
    request(url).pipe(fs.createWriteStream(path)).on("close", callback);
  });
};

async function downloadFile(url, outputPath) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const writer = fs.createWriteStream(outputPath);
    await new Promise((resolve, reject) => {
      stream.Readable.fromWeb(response.body)
        .pipe(writer)
        .on("finish", resolve)
        .on("error", reject);
    });
  } catch (error) {
    console.error(error.message);
  }
}

async function parseCSV(filePath, useHeaders = true) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(filePath)) {
      return reject(new Error(`File not found: ${filePath}`));
    }
    const rows = [];
    fs.createReadStream(filePath)
      .on("error", reject)
      .pipe(fastcsv.parse({ headers: useHeaders, trim: true }))
      .on("error", (err) => reject(err))
      .on("data", (row) => rows.push(row))
      .on("end", () => {
        if (rows.length === 0) return resolve({ headers: [], rows: [] });
        if (useHeaders) {
          const headers = Object.keys(rows[0]);
          resolve({ headers, rows });
        } else {
          const headers = null;
          resolve({ headers, rows });
        }
      });
  });
}

async function parseCSV2(filePath, useHeaders = true) {
  if (!fs.existsSync(filePath)) {
    return reject(new Error(`File not found: ${filePath}`));
  }

  const rows = [];
  const parser = fs
    .createReadStream(filePath)
    .pipe(csvparse.parse({ columns: useHeaders }));
  parser.on("readable", function () {
    let row;
    while ((row = parser.read()) !== null) {
      rows.push(row);
    }
  });
  await finishedAsync(parser);
  return rows;
}

async function instertISO() {
  //temporary table definition
  iso_setup = [
    sql`
    CREATE TEMPORARY TABLE iso_full (
      name TEXT,
      "alpha-2" TEXT,
      "alpha-3" TEXT,
      "country-code" TEXT,
      "iso_3166-2" TEXT,
      region TEXT,
      "sub-region" TEXT,
      "intermediate-region" TEXT,
      "region-code" TEXT,
      "sub-region-code" TEXT,
      "intermediate-region-code" TEXT
    )
  `,
    sql`DROP TABLE IF EXISTS iso`,
    sql`CREATE TABLE iso (name TEXT, "alpha-3" TEXT, "country-code" TEXT)`,
  ];
  for (const q of iso_setup) {
    await q;
  }

  try {
    const { headers: iso_headers, rows: iso_rows } =
      await parseCSV("iso-table.csv");
    const insertFull = sql`
      INSERT INTO iso_full ${sql(iso_rows)}
    `;
    const insertSubset = sql`
      INSERT INTO iso (name, "alpha-3", "country-code")
      SELECT name, "alpha-3", "country-code" FROM iso_full;
    `;

    insert_data = [insertFull, insertSubset];

    for (const q of insert_data) {
      await q;
    }
  } catch (error) {
    console.error("failed to parse csv:", error.message);
  }
}

//get column names
async function findColumns() {
  console.log("Getteing column names from codebook");
  let q1 = sql`DROP TABLE IF EXISTS codebook`;
  let q2 = sql`CREATE TABLE codebook (column_id SERIAL PRIMARY KEY, column_name TEXT, source TEXT, category TEXT, description TEXT)`;
  codebook_setup = [q1, q2];
  for (const q of codebook_setup) {
    await q;
  }

  const { headers: codebook_headers, rows: codebook_rows } = await parseCSV(
    "owid-covid-codebook.csv",
    true,
  ); //file that contains column names and descriptions

  for (let index = 0; index < codebook_rows.length; index++) {
    codebook_rows[index].column_name = codebook_rows[index]["column"];
    delete codebook_rows[index]["column"];
  }

  await sql`INSERT INTO codebook ${sql(codebook_rows)}`;
}

//updating database
async function updateDatabase(updateDetails = false) {
  console.log("Downloading data...");
  const dataURL = "https://covid.ourworldindata.org/data/owid-covid-data.csv";
  const dataPath = "owid-covid-data.csv";
  await downloadFile(dataURL, dataPath);
  console.log("Data downloaded...");

  const q1 = sql`
    CREATE TEMPORARY TABLE world_data_full (
      iso_code TEXT,
      continent TEXT,
      location TEXT,
      date TEXT,
      total_cases TEXT,
      new_cases TEXT,
      new_cases_smoothed TEXT,
      total_deaths TEXT,
      new_deaths TEXT,
      new_deaths_smoothed TEXT,
      total_cases_per_million TEXT,
      new_cases_per_million TEXT,
      new_cases_smoothed_per_million TEXT,
      total_deaths_per_million TEXT,
      new_deaths_per_million TEXT,
      new_deaths_smoothed_per_million TEXT,
      reproduction_rate TEXT,
      icu_patients TEXT,
      icu_patients_per_million TEXT,
      hosp_patients TEXT,
      hosp_patients_per_million TEXT,
      weekly_icu_admissions TEXT,
      weekly_icu_admissions_per_million TEXT,
      weekly_hosp_admissions TEXT,
      weekly_hosp_admissions_per_million TEXT,
      total_tests TEXT,
      new_tests TEXT,
      total_tests_per_thousand TEXT,
      new_tests_per_thousand TEXT,
      new_tests_smoothed TEXT,
      new_tests_smoothed_per_thousand TEXT,
      positive_rate TEXT,
      tests_per_case TEXT,
      tests_units TEXT,
      total_vaccinations TEXT,
      people_vaccinated TEXT,
      people_fully_vaccinated TEXT,
      total_boosters TEXT,
      new_vaccinations TEXT,
      new_vaccinations_smoothed TEXT,
      total_vaccinations_per_hundred TEXT,
      people_vaccinated_per_hundred TEXT,
      people_fully_vaccinated_per_hundred TEXT,
      total_boosters_per_hundred TEXT,
      new_vaccinations_smoothed_per_million TEXT,
      new_people_vaccinated_smoothed TEXT,
      new_people_vaccinated_smoothed_per_hundred TEXT,
      stringency_index TEXT,
      population TEXT,
      population_density TEXT,
      median_age TEXT,
      aged_65_older TEXT,
      aged_70_older TEXT,
      gdp_per_capita TEXT,
      extreme_poverty TEXT,
      cardiovasc_death_rate TEXT,
      diabetes_prevalence TEXT,
      female_smokers TEXT,
      male_smokers TEXT,
      handwashing_facilities TEXT,
      hospital_beds_per_thousand TEXT,
      life_expectancy TEXT,
      human_development_index TEXT,
      excess_mortality TEXT,
      excess_mortality_cumulative TEXT,
      excess_mortality_cumulative_absolute TEXT,
      excess_mortality_cumulative_per_million TEXT
    )
  `;
  const q2 = sql`DROP TABLE IF EXISTS world_data`;
  const q3 = sql`
  CREATE TABLE world_data (
    iso_code TEXT,
    Country TEXT,
    Confirmed BIGINT,
    Confirmed_last24h_smoothed BIGINT,
    Deaths BIGINT,
    Deaths_last24h BIGINT,
    total_vaccinations BIGINT,
    people_vaccinated BIGINT,
    people_fully_vaccinated BIGINT,
    new_vaccinations BIGINT,
    Date TEXT
  )
  `;
  const world_data_setup = [q1, q2, q3];
  for (const query of world_data_setup) {
    await query;
  }

  let q4 = sql`DROP TABLE IF EXISTS country_details`;
  let q5 = sql`
  CREATE TABLE country_details (
    iso_code TEXT,
    population TEXT,
    population_density TEXT,
    median_age TEXT,
    hospital_beds_per_thousand TEXT,
    life_expectancy TEXT,
    PRIMARY KEY (iso_code)
  )
  `;
  const country_details_queries = [q4, q5];
  for (const query of country_details_queries) {
    await query;
  }

  const { headers: data_headers, rows: data_rows } = await parseCSV(
    "owid-covid-data.csv",
    true,
  );

  let index = 0; //fixme make parallel
  let data_slice;
  while (index < data_rows.length) {
    if (index + 500 > data_rows.length) {
      data_slice = data_rows.slice(index);
      //console.log(data_slice);
    } else {
      data_slice = data_rows.slice(index, index + 500);
    }
    index += 500;
    await sql`INSERT INTO world_data_full ${sql(data_slice)}`;
  }

  const insertQuery = sql`
    INSERT INTO
      world_data (
        iso_code,
        Country,
        Confirmed,
        Confirmed_last24h_smoothed,
        Deaths,
        Deaths_last24h,
        total_vaccinations,
        people_vaccinated,
        people_fully_vaccinated,
        new_vaccinations,
        Date
      )
    SELECT
      iso_code,
      location,
      COALESCE(NULLIF(total_cases, '')::BIGINT, 0),
      COALESCE(NULLIF(new_cases_smoothed, '')::numeric::BIGINT, 0),
      COALESCE(NULLIF(total_deaths, '')::BIGINT, 0),
      COALESCE(NULLIF(new_deaths, '')::BIGINT, 0),
      COALESCE(NULLIF(total_vaccinations, '')::BIGINT, 0),
      COALESCE(NULLIF(people_vaccinated, '')::BIGINT, 0),
      COALESCE(NULLIF(people_fully_vaccinated, '')::BIGINT, 0),
      COALESCE(NULLIF(new_vaccinations, '')::BIGINT, 0),
      date
    FROM
      world_data_full`;
  const indexQuery = sql`CREATE INDEX country_code ON world_data (iso_code, Country)`;
  const world_data_insert = [insertQuery, indexQuery];
  for (const query of world_data_insert) {
    await query;
  }
  console.log("world data inserted");

  if (updateDetails == true) {
    await sql`
      INSERT INTO
        country_details (
          iso_code,
          population,
          population_density,
          median_age,
          hospital_beds_per_thousand,
          life_expectancy
        )
      SELECT DISTINCT ON (W.iso_code)
        W.iso_code,
        W.population,
        W.population_density,
        W.median_age,
        W.hospital_beds_per_thousand,
        W.life_expectancy
      FROM
        world_data_full as W
      ORDER BY 
        W.iso_code,
        W.date
      ON CONFLICT (iso_code) DO UPDATE
      SET
        population = EXCLUDED.population,
        population_density = EXCLUDED.population_density,
        median_age = EXCLUDED.median_age,
        hospital_beds_per_thousand = EXCLUDED.hospital_beds_per_thousand,
        life_expectancy = EXCLUDED.life_expectancy
      `;
    await getCountryData();
  }
}

async function getCountryData() {
  console.log("getting country data");
  const statement = sql`
    SELECT DISTINCT
      id_date.id AS id,
      DATE (COALESCE (W.Date, id_date.Date)) AS Date,
      COALESCE(W.Confirmed, 0) AS Confirmed,
      COALESCE(W.Confirmed_last24h_smoothed, 0) AS Confirmed_last24h,
      COALESCE(W.Deaths, 0) AS Deaths,
      COALESCE(W.Deaths_last24h, 0) AS Deaths_last24h,
      COALESCE(W.total_vaccinations, 0) AS total_vaccinations,
      COALESCE(W.people_vaccinated, 0) AS people_vaccinated,
      COALESCE(W.people_fully_vaccinated, 0) AS people_fully_vaccinated,
      COALESCE(W.new_vaccinations, 0) AS vaccinations_last24h
    FROM
      world_data AS W
      RIGHT JOIN (
        SELECT
          I1."country-code" AS ID,
          T1.Date AS Date,
          I1."alpha-3" AS Name
        FROM
          (
            SELECT DISTINCT
              i."alpha-3" AS id,
              w.Date as Date
            FROM
              iso AS i,
              world_data AS w
          ) AS T1
          INNER JOIN iso AS I1 ON T1.id = I1."alpha-3"
      ) AS id_date ON W.iso_code = id_date.Name
      AND W.Date = id_date.Date;
    `;
  try {
    const rows = await statement;

    const output = {};
    for (const row of rows) {
      if (!output[row.id]) {
        output[row.id] = [];
      }
      output[row.id].push({
        date: row.date,
        cases: row.confirmed,
        cases_last24: row.confirmed_last24h,
        deaths: row.deaths,
        deaths_last24: row.deaths_last24h,
        total_vaccinations: row.total_vaccinations,
        people_vaccinated: row.people_vaccinated,
        people_fully_vaccinated: row.people_fully_vaccinated,
        vaccinations_last24h: row.vaccinations_last24h,
      });
    }
    countryData = output;
    console.log("country data cached");
  } catch (error) {
    console.log("getCountryData, Error during query select..." + error.message);
  }
}
/* Endpoints */
app.get("/countrydata", function (req, res) {
  res.json(countryData);
});

app.get("/dateRange", async (req, res) => {
  let statement = sql`
  SELECT
    Min(DATE (Date)) AS first_day,
    MAX(DATE (Date)) AS last_day
  FROM
    world_data
  `;

  try {
    const row = await statement;
    const output = { First_Day: row[0].first_day, Last_Day: row[0].last_day };
    res.json(output);
  } catch (error) {
    console.log("dateRange, Error during query select..." + error.message);
    res.json({ failed: "dateRange" });
    res.status(500);
  }
});

app.get("/getMax", async (req, res) => {
  const statement = sql`
    SELECT
      MAX(Confirmed) AS Confirmed,
      MAX(Confirmed_last24h_smoothed) AS Confirmed_last24h,
      MAX(Deaths) AS Deaths,
      MAX(Deaths_last24h) AS Deaths_last24h,
      MAX(total_vaccinations) AS total_vaccinations,
      MAX(people_vaccinated) AS people_vaccinated,
      MAX(people_fully_vaccinated) AS people_fully_vaccinated,
      MAX(new_vaccinations) AS vaccinations_last24h
    FROM
      world_data
    WHERE
      Country != 'World'
  `;

  try {
    const row = await statement;
    const output = {
      Confirmed: row[0].confirmed,
      Confirmed_last24h: row[0].confirmed_last24h,
      Deaths: row[0].deaths,
      Deaths_last24h: row[0].deaths_last24h,
      total_vaccinations: row[0].total_vaccinations,
      people_vaccinated: row[0].people_vaccinated,
      people_fully_vaccinated: row[0].people_fully_vaccinated,
      vaccinations_last24h: row[0].vaccinations_last24h,
    };
    res.json(output);
  } catch (error) {
    console.log("getMax, Error during query select..." + error.message);
    res.json({ failed: "getMax" });
    res.status(500);
  }
});

app.get("/getTotalByDay", async (req, res) => {
  let country_code = req.query.country_code;
  let statement;
  if (country_code) {
    statement = sql`
    SELECT
      Date,
      Confirmed,
      Confirmed_last24h_smoothed AS Confirmed_last24h,
      Deaths,
      Deaths_last24h,
      total_vaccinations,
      people_vaccinated,
      people_fully_vaccinated,
      new_vaccinations AS vaccinations_last24h
    FROM
      world_data AS W
      INNER JOIN iso AS I ON I."alpha-3" = W.iso_code
    WHERE
      I."country-code" = ${country_code}
    ORDER BY
      Date
    `;
  } else {
    statement = sql`
    SELECT
      Date,
      Confirmed,
      Confirmed_last24h_smoothed AS Confirmed_last24h,
      Deaths,
      Deaths_last24h,
      total_vaccinations,
      people_vaccinated,
      people_fully_vaccinated,
      new_vaccinations AS vaccinations_last24h
    FROM
      world_data
    WHERE
      country = 'World'
    ORDER BY
      Date
    `;
  }
  try {
    const rows = await statement;
    let output = [];
    for (let i = 0; i < rows.length; i++) {
      output.push({
        Date: rows[i].date,
        Confirmed: rows[i].confirmed,
        Confirmed_last24h: rows[i].confirmed_last24h,
        Deaths: rows[i].deaths,
        Deaths_last24h: rows[i].deaths_last24h,
        total_vaccinations: rows[i].total_vaccinations,
        people_vaccinated: rows[i].people_vaccinated,
        people_fully_vaccinated: rows[i].people_fully_vaccinated,
        vaccinations_last24h: rows[i].vaccinations_last24h,
      });
    }
    res.json(output);
  } catch (error) {
    console.log("getTotalByDay, Error during query select..." + error.message);
    res.json({ failed: "getTotalByDay" });
    res.status(500);
  }
});

app.get("/getTotalMax", async (req, res) => {
  let statement = sql`
  SELECT
    MAX(Confirmed) AS Confirmed,
    MAX(Confirmed_last24h_smoothed) AS Confirmed_last24h,
    MAX(Deaths) AS Deaths,
    MAX(Deaths_last24h) AS Deaths_last24h,
    MAX(total_vaccinations) AS total_vaccinations,
    MAX(people_vaccinated) AS people_vaccinated,
    MAX(people_fully_vaccinated) AS people_fully_vaccinated,
    MAX(new_vaccinations) AS vaccinations_last24h
  FROM
    world_data
  `;

  try {
    const row = await statement;
    const output = {
      Confirmed: row[0].confirmed,
      Confirmed_last24h: row[0].confirmed_last24h,
      Deaths: row[0].deaths,
      Deaths_last24h: row[0].deaths_last24h,
      total_vaccinations: row[0].total_vaccinations,
      people_vaccinated: row[0].people_vaccinated,
      people_fully_vaccinated: row[0].people_fully_vaccinated,
      vaccinations_last24h: row[0].vaccinations_last24h,
    };
    res.json(output);
  } catch (error) {
    console.log("getTotalMax, Error during query select..." + error.message);
    res.json({ failed: "getTotalMax" });
    res.status(500);
  }
});

app.get("/getDetails", async (req, res) => {
  let country_code = req.query.country_code;
  let statement;
  if (country_code) {
    statement = sql`
    SELECT
      population
    FROM
      country_details AS CD
      INNER JOIN iso AS I ON I."alpha-3" = CD.iso_code
    WHERE
      I."country-code" = ${country_code}
    `;
  } else {
    statement = sql`SELECT 7762000000 as population`; //need to add better way to get world population
  }
  try {
    const rows = await statement;
    output = [];
    for (let i = 0; i < rows.length; i++) {
      output.push({ population: rows[i].population });
    }
    res.json(output);
  } catch (error) {
    console.log("getDetails, Error during query select..." + error.message);
    res.json({ failed: "getDetails" });
    res.status(500);
  }
});

// Only use static files from static folder
app.use(express.static("./static", { dotfiles: "allow" }));

let httpServer = http.createServer(app);
httpServer.listen(3000, () => {
  console.log("Server Running on Port 3000...");
});

//let httpsServer = https.createServer(credentials, app);
//httpsServer.listen(8443, () => {
//    console.log('HTTPS Server Running on port 8443...');
//});

(async () => {
  await instertISO();
  const headerURL =
    "https://covid.ourworldindata.org/data/owid-covid-codebook.csv";
  const headerPath = "owid-covid-codebook.csv";
  await downloadFile(headerURL, headerPath);
  await findColumns();
  await updateDatabase(true);
  await getCountryData();
})();

//data downloaded and inserted into database at 8:01 AM
//var j = schedule.schedule('01 12 * * *', function(){
//console.log("Updating database...");
//#download(headerURL, headerPath, () => {
//#  findColumns();
//#});
//instertISO();
//});
