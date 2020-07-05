var fs = require('fs');
const fastcsv = require("fast-csv");

/* Dependencies */
let express = require("express");
let request = require("request");
let mysql = require("mysql");
let schedule = require('node-schedule');
let app = express();
let http = require('http');
let https = require('https');
let dbPass = require('./mysqlkey.json');

// // Certificate
// let privateKey = fs.readFileSync('/etc/letsencrypt/live/covid-19datamap.com/privkey.pem', 'utf8');
// let certificate = fs.readFileSync('/etc/letsencrypt/live/covid-19datamap.com/cert.pem', 'utf8');
// let ca = fs.readFileSync('/etc/letsencrypt/live/covid-19datamap.com/chain.pem', 'utf8');

// let credentials = {
// 	key: privateKey,
// 	cert: certificate,
// 	ca: ca
// };

// Initialize Database
let conn = mysql.createConnection({
    host: dbPass.host,
    user: dbPass.user,
    password: dbPass.password,
    port:dbPass.port,
    database: dbPass.database, // use who_data.sql to create database
    multipleStatements: true
});

// Connect when server starts
conn.connect(function(err) {
	if (err) {
		console.log("Error connecting to database...");
	} else {
		console.log("Database successfully connected!");
	}
});

let download = (url, path, callback) => {
  request.head(url, (err, res, body) => {
    request(url)
      .pipe(fs.createWriteStream(path))
      .on('close', callback)
  })
};

const url = 'https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/owid-covid-data.csv';
const path = 'owid-covid-data.csv';

function instertISO() {
  let stream = fs.createReadStream("iso-table.csv");
  //temporary table definition
  let q1 = "CREATE TEMPORARY TABLE iso_full(name TEXT, `alpha-2` TEXT, `alpha-3` TEXT, `country-code` TEXT, `iso_3166-2` TEXT, region TEXT, `sub-region` TEXT, `intermediate-region` TEXT, `region-code` TEXT, `sub-region-code` TEXT, `intermediate-region-code` TEXT);"
  //need a better way to insert new data
  let q2 = "DROP TABLE iso;"
  let q3 = "CREATE TABLE iso(name TEXT, `alpha-3` TEXT, `country-code` TEXT);"
  conn.query(q1, function(err) {
      if (err) {
        console.log("error creating temporary table");
        console.log(err);
      }
    });

  conn.query(q2, function(err) {
      if (err) {
        console.log("error dropping table, it probably doesn't exist");
        console.log(err);
      }
    });

  conn.query(q3, function(err) {
      if (err) {
        console.log("error creating table");
        console.log(err);
      }
    });

  let csvData = [];
  let csvStream = fastcsv
    .parse()
    .on("data", function(data) {
      csvData.push(data);
    })
    .on("end", function() {
      // remove the first line: header
      csvData.shift();

      let updateQuery = "INSERT INTO iso_full (name,`alpha-2`,`alpha-3`,`country-code`,`iso_3166-2`,region,`sub-region`,`intermediate-region`,`region-code`,`sub-region-code`,`intermediate-region-code`) VALUES ?";
      conn.query(updateQuery, [csvData], function(err) {
          if (err) {
            console.log(err);
            console.log("error during data insert");
          } else {
            console.log("insert ISO successful");
          }
        });
      insertData();
      // conn.query("SHOW WARNINGS;", (error, response) => {
      //     console.log(error || response);
      //   });
      // save csvData
    });

  stream.pipe(csvStream);

  function insertData(){
    let insertQuery = "INSERT INTO iso (name, `alpha-3`,`country-code`) SELECT name, `alpha-3`,`country-code` FROM iso_full;"

    conn.query(insertQuery, function(err) {
        if (err) {
          console.log("error during data insert");
          console.log(err);
        } else {
          console.log("iso data update successful");
        }
      });
  }
}

//updating database
function updateDatabase() {
  let stream = fs.createReadStream("owid-covid-data.csv");
  //temporary table definition
  let q1 = "CREATE TEMPORARY TABLE world_data_full (iso_code TEXT, continent TEXT, location TEXT, date TEXT, total_cases NUMERIC, new_cases NUMERIC, total_deaths NUMERIC, new_deaths NUMERIC, total_cases_per_million TEXT, new_cases_per_million TEXT, total_deaths_per_million TEXT, new_deaths_per_million TEXT, total_tests TEXT, new_tests TEXT, total_tests_per_thousand TEXT, new_tests_per_thousand TEXT, new_tests_smoothed TEXT, new_tests_smoothed_per_thousand TEXT, tests_units TEXT, stringency_index TEXT, population TEXT, population_density TEXT, median_age TEXT, aged_65_older TEXT, aged_70_older TEXT, gdp_per_capita TEXT, extreme_poverty TEXT, cvd_death_rate TEXT, diabetes_prevalence TEXT, female_smokers TEXT, male_smokers TEXT, handwashing_facilities TEXT, hospital_beds_per_thousand TEXT, life_expectancy TEXT);"
  //need a better way to insert new data
  let q2 = "DROP TABLE world_data;"
  let q3 = "CREATE TABLE world_data (iso_code CHAR(3), Country VARCHAR(100), Confirmed INT, Confirmed_last24h INT, Deaths INT, Deaths_last24h INT, Date TEXT);"
  conn.query(q1, function(err) {
      if (err) {
        console.log("error creating temporary table");
        console.log(err);
      }
    });

  conn.query(q2, function(err) {
      if (err) {
        console.log("error dropping table, it probably doesn't exist");
        console.log(err);
      }
    });

  conn.query(q3, function(err) {
      if (err) {
        console.log("error creating table");
        console.log(err);
      }
    });

  let csvData = [];
  let csvStream = fastcsv
    .parse()
    .on("data", function(data) {
      csvData.push(data);
    })
    .on("end", function() {
      // remove the first line: header
      csvData.shift();

      let updateQuery = "INSERT INTO world_data_full (iso_code,continent,location,date,total_cases,new_cases,total_deaths,new_deaths,total_cases_per_million,new_cases_per_million,total_deaths_per_million,new_deaths_per_million,total_tests,new_tests,total_tests_per_thousand,new_tests_per_thousand,new_tests_smoothed,new_tests_smoothed_per_thousand,tests_units,stringency_index,population,population_density,median_age,aged_65_older,aged_70_older,gdp_per_capita,extreme_poverty,cvd_death_rate,diabetes_prevalence,female_smokers,male_smokers,handwashing_facilities,hospital_beds_per_thousand,life_expectancy) VALUES ?";
      conn.query(updateQuery, [csvData], function(err) {
          if (err) {
            console.log("error inserting csv data");
            console.log(err);
          } else {
            console.log("data import successful...");
          }
        });
      insertData();
      // conn.query("SHOW WARNINGS;", (error, response) => {
      //     console.log(error || response);
      //   });
      // save csvData
    });

  stream.pipe(csvStream);

  function insertData() {
    let insertQuery = "INSERT INTO world_data (iso_code,Country,Confirmed,Confirmed_last24h,Deaths,Deaths_last24h,Date) SELECT iso_code,location,total_cases,new_cases,total_deaths,new_deaths,date FROM world_data_full;"
    let indexQuery = "CREATE INDEX country_code ON world_data (iso_code, Country);"
    conn.query(insertQuery, function(err) {
        if (err) {
          console.log("error during data insert");
          console.log(err);
        } else {
          console.log("world_data update successful...");
        }
      });

    conn.query(indexQuery, function(err) {
        if (err) {
          console.log("error adding index");
          console.log(err);
        } else {
          console.log("world_data index successful");
        }
      });
  }


  // let indexQ = "CREATE INDEX country_code ON world_data (iso_code, Country);"
  //
  // conn.query(indexQ, function(err) {
  //     if (err) {
  //       console.log("error creating index");
  //       console.log(err);
  //     } else {
  //       console.log("index created");
  //     }
  //   });

}

/* Endpoints */
app.get("/countrydata", function(req, res){
    // let statement = "SELECT I.`alpha-3` AS id, W.Date AS Date, W.Confirmed AS Confirmed FROM world AS W INNER JOIN iso as I ON W.Country = I.who_name GROUP BY I.`alpha-3`,W.Date,W.Confirmed;";
    // let statement = "SELECT DISTINCT id_date.id AS id, IFNULL(W.Date,id_date.Date) AS Date, IFNULL(W.Confirmed,0) AS Confirmed FROM world AS W RIGHT JOIN (SELECT T1.id AS ID, T1.Date AS Date, I1.who_name AS Name  FROM (SELECT DISTINCT i.`alpha-3` AS id, W.Date as Date FROM iso AS i, world AS w) AS T1 INNER JOIN iso AS I1 ON T1.id = I1.`alpha-3`) AS id_date ON W.Country = id_date.Name AND W.Date = id_date.Date UNION SELECT 'CHN' AS id, Date, Confirmed FROM china WHERE Location='Total';";
    // let statement = "SELECT DISTINCT id_date.id AS id, DATE(IFNULL(W.Date,id_date.Date)) AS Date, IFNULL(W.Confirmed,0) AS Confirmed FROM world_data AS W RIGHT JOIN (SELECT I1.`country-code` AS ID, T1.Date AS Date, I1.who_name AS Name  FROM (SELECT DISTINCT i.`alpha-3` AS id, W.Date as Date FROM iso AS i, world_data AS w) AS T1 INNER JOIN iso AS I1 ON T1.id = I1.`alpha-3`) AS id_date ON W.Country = id_date.Name AND W.Date = id_date.Date;";
    // let statement = "SELECT DISTINCT id_date.id AS id, DATE(IFNULL(W.Date,id_date.Date)) AS Date, IFNULL(W.Confirmed,0) AS Confirmed FROM world_data AS W RIGHT JOIN (SELECT I1.`country-code` AS ID, T1.Date AS Date, I1.`alpha-3` AS Name FROM (SELECT DISTINCT i.`alpha-3` AS id, W.Date as Date FROM iso AS i, world_data AS w) AS T1 INNER JOIN iso AS I1 ON T1.id = I1.`alpha-3`) AS id_date ON W.iso_code = id_date.Name AND W.Date = id_date.Date;"
    let statement = "SELECT DISTINCT id_date.id AS id, DATE(IFNULL(W.Date,id_date.Date)) AS Date, IFNULL(W.Confirmed,0) AS Confirmed, IFNULL(W.Confirmed_last24h,0) AS Confirmed_last24h, IFNULL(W.Deaths,0) AS Deaths, IFNULL(W.Deaths_last24h,0) AS Deaths_last24h FROM world_data AS W RIGHT JOIN (SELECT I1.`country-code` AS ID, T1.Date AS Date, I1.`alpha-3` AS Name FROM (SELECT DISTINCT i.`alpha-3` AS id, w.Date as Date FROM iso AS i, world_data AS w) AS T1 INNER JOIN iso AS I1 ON T1.id = I1.`alpha-3`) AS id_date ON W.iso_code = id_date.Name AND W.Date = id_date.Date;"

    conn.query(statement,function(err, rows, fields) {
        if (err) {
            console.log('Error during query select...' + err.sqlMessage);
            res.json({"failed":"countrydata"}); res.status(500);

        } else {
            let output = {};
            // console.log(rows);
            for(let i = 0; i < rows.length; i++){
              if (!(rows[i].id in output)) {
                output[rows[i].id] = [];
              }
              output[rows[i].id].push({"date": rows[i].Date, "cases": rows[i].Confirmed, "cases_last24": rows[i].Confirmed_last24h, "deaths": rows[i].Deaths, "deaths_last24": rows[i].Deaths_last24h});
            }
            res.json(output);
        }
    });
});

app.get("/dateRange", function(req, res){
    let statement = "SELECT Min(DATE(Date)) AS First_Day ,MAX(DATE(Date)) AS Last_Day FROM world_data;"

    conn.query(statement,function(err, rows, fields) {
        if (err) {
            console.log('Error during query select...' + err.sqlMessage);
            res.json({"failed":"dateRange"}); res.status(500);

        } else {
            let output = {"First_Day": rows[0].First_Day, "Last_Day": rows[0].Last_Day};

            res.json(output);
        }
    });
});

app.get("/getMax", function(req, res){
    let statement = "SELECT MAX(Confirmed) AS Confirmed, MAX(Confirmed_last24h) AS Confirmed_last24h, MAX(Deaths) AS Deaths, MAX(Deaths_last24h) AS Deaths_last24h FROM world_data;"

    conn.query(statement,function(err, rows, fields) {
        if (err) {
            console.log('Error during query select...' + err.sqlMessage);
            res.json({"failed":"getMax"}); res.status(500);

        } else {
            let output = {"Confirmed": rows[0].Confirmed, "Confirmed_last24h": rows[0].Confirmed_last24h, "Deaths": rows[0].Deaths, "Deaths_last24h": rows[0].Deaths_last24h};

            res.json(output);
        }
    });
});

app.get("/getTotalByDay", function(req, res){
    let country_code = req.query.country_code;
    let statement = "";
    // let statement = "SELECT Date, SUM(Confirmed) AS Confirmed, SUM(Confirmed_last24h) AS Confirmed_last24h, SUM(Deaths) AS Deaths, SUM(Deaths_last24h) AS Deaths_last24h FROM world_data GROUP BY Date ORDER BY Date;"
    if (country_code) {
      statement = "SELECT Date, Confirmed, Confirmed_last24h, Deaths, Deaths_last24h FROM world_data AS W INNER JOIN iso AS I ON I.`alpha-3` = W.iso_code WHERE I.`country-code`=" + `'${country_code}'` + " GROUP BY Date ORDER BY Date;"
    } else {
      statement = "SELECT Date, Confirmed, Confirmed_last24h, Deaths, Deaths_last24h FROM world_data WHERE country='World' GROUP BY Date ORDER BY Date;"
    }
    conn.query(statement,function(err, rows, fields) {
        if (err) {
            console.log('Error during query select...' + err.sqlMessage);
            res.json({"failed":"getTotalByDay"}); res.status(500);

        } else {
          let output = [];
          // console.log(rows);
          for(let i = 0; i < rows.length; i++){
            output.push({"Date": rows[i].Date, "Confirmed": rows[i].Confirmed, "Confirmed_last24h": rows[i].Confirmed_last24h, "Deaths": rows[i].Deaths, "Deaths_last24h": rows[i].Deaths_last24h});
          }
          // console.log(output);
          res.json(output);

        }
    });
});

app.get("/getTotalMax", function(req, res){
    let statement = "SELECT MAX(Confirmed) AS Confirmed, MAX(Confirmed_last24h) AS Confirmed_last24h, MAX(Deaths) AS Deaths, MAX(Deaths_last24h) AS Deaths_last24h FROM (SELECT Date, Confirmed, Confirmed_last24h, Deaths, Deaths_last24h FROM world_data WHERE Country='World' GROUP BY Date) AS S;"

    conn.query(statement,function(err, rows, fields) {
        if (err) {
            console.log('Error during query select...' + err.sqlMessage);
            res.json({"failed":"getTotalMax"}); res.status(500);

        } else {
          let output = {"Confirmed": rows[0].Confirmed, "Confirmed_last24h": rows[0].Confirmed_last24h, "Deaths": rows[0].Deaths, "Deaths_last24h": rows[0].Deaths_last24h};
          // console.log(output);
          res.json(output);

        }
    });
});

// Only use static files from static folder
app.use(express.static("./static", {dotfiles: 'allow'}));

let httpServer = http.createServer(app);
// let httpsServer = https.createServer(credentials, app);

httpServer.listen(3000, () => {
	console.log("Server Running on Port 3000...");
});

// httpsServer.listen(8443, () => {
// 	console.log('HTTPS Server Running on port 8443...');
// });

//http.listen(3000, function (){
//    console.log("Server Running on Port 3000...")
//});

//data downloaded and inserted into database at 8:01 AM
var j = schedule.scheduleJob('01 08 * * *', function(){
  console.log("Updating database...");
  download(url, path, () => {
    console.log('Data downloaded...');
    updateDatabase();
  })

  // instertISO();
});
