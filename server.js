var fs = require('fs');

/* Dependencies */
let express = require("express");
let request = require("request");
let mysql = require("mysql");
let app = express();

// // let schedule = require('node-schedule');
// let countryToCode = require('./static/countryTable.json');
let dbPass = require('../mysqlkey.json');

// Initialize Database
let conn = mysql.createConnection({
    host: dbPass.host,
    user: dbPass.user,
    password: dbPass.password,
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


/* Endpoints */
app.get("/countrydata", function(req, res){
    // let statement = "SELECT I.`alpha-3` AS id, W.Date AS Date, W.Confirmed AS Confirmed FROM world AS W INNER JOIN iso as I ON W.Country = I.who_name GROUP BY I.`alpha-3`,W.Date,W.Confirmed;";
    // let statement = "SELECT DISTINCT id_date.id AS id, IFNULL(W.Date,id_date.Date) AS Date, IFNULL(W.Confirmed,0) AS Confirmed FROM world AS W RIGHT JOIN (SELECT T1.id AS ID, T1.Date AS Date, I1.who_name AS Name  FROM (SELECT DISTINCT i.`alpha-3` AS id, W.Date as Date FROM iso AS i, world AS w) AS T1 INNER JOIN iso AS I1 ON T1.id = I1.`alpha-3`) AS id_date ON W.Country = id_date.Name AND W.Date = id_date.Date UNION SELECT 'CHN' AS id, Date, Confirmed FROM china WHERE Location='Total';";
    let statement = "SELECT DISTINCT id_date.id AS id, DATE(IFNULL(W.Date,id_date.Date)) AS Date, IFNULL(W.Confirmed,0) AS Confirmed FROM world AS W RIGHT JOIN (SELECT I1.`country-code` AS ID, T1.Date AS Date, I1.who_name AS Name  FROM (SELECT DISTINCT i.`alpha-3` AS id, W.Date as Date FROM iso AS i, world AS w) AS T1 INNER JOIN iso AS I1 ON T1.id = I1.`alpha-3`) AS id_date ON W.Country = id_date.Name AND W.Date = id_date.Date UNION SELECT '156' AS id, DATE(Date) as Date, Confirmed FROM china1 WHERE Location='Total';";
    // let statement = "SELECT DISTINCT id_date.id AS id, IFNULL(W.Date,id_date.Date) AS Date, IFNULL(W.Confirmed,0) AS Confirmed FROM world AS W RIGHT JOIN (SELECT I1.`country-code` AS ID, T1.Date AS Date, I1.who_name AS Name  FROM (SELECT DISTINCT i.`alpha-3` AS id, W.Date as Date FROM iso AS i, world AS w) AS T1 INNER JOIN iso AS I1 ON T1.id = I1.`alpha-3`) AS id_date ON W.Country = id_date.Name AND W.Date = id_date.Date;";


    conn.query(statement,function(err, rows, fields) {
        if (err) {
            console.log('Error during query select...' + err.sqlMessage);
            res.json({"failed":"getYearsForIndicator"}); res.status(500);

        } else {
            let output = {};
            // let output = {["AFG", "ALA", "ALB", "DZA", "ASM", "AND", "AGO", "AIA", "ATA", "ATG", "ARG", "ARM", "ABW", "AUS", "AUT", "AZE", "BHS", "BHR", "BGD", "BRB", "BLR", "BEL", "BLZ", "BEN", "BMU", "BTN", "BOL", "BES", "BIH", "BWA", "BVT", "BRA", "IOT", "BRN", "BGR", "BFA", "BDI", "CPV", "KHM", "CMR", "CAN", "CYM", "CAF", "TCD", "CHL", "CHN", "CXR", "CCK", "COL", "COM", "COG", "COD", "COK", "CRI", "CIV", "HRV", "CUB", "CUW", "CYP", "CZE", "DNK", "DJI", "DMA", "DOM", "ECU", "EGY", "SLV", "GNQ", "ERI", "EST", "SWZ", "ETH", "FLK", "FRO", "FJI", "FIN", "FRA", "GUF", "PYF", "ATF", "GAB", "GMB", "GEO", "DEU", "GHA", "GIB", "GRC", "GRL", "GRD", "GLP", "GUM", "GTM", "GGY", "GIN", "GNB", "GUY", "HTI", "HMD", "VAT", "HND", "HKG", "HUN", "ISL", "IND", "IDN", "IRN", "IRQ", "IRL", "IMN", "ISR", "ITA", "JAM", "JPN", "JEY", "JOR", "KAZ", "KEN", "KIR", "PRK", "KOR", "KWT", "KGZ", "LAO", "LVA", "LBN", "LSO", "LBR", "LBY", "LIE", "LTU", "LUX", "MAC", "MDG", "MWI", "MYS", "MDV", "MLI", "MLT", "MHL", "MTQ", "MRT", "MUS", "MYT", "MEX", "FSM", "MDA", "MCO", "MNG", "MNE", "MSR", "MAR", "MOZ", "MMR", "NAM", "NRU", "NPL", "NLD", "NCL", "NZL", "NIC", "NER", "NGA", "NIU", "NFK", "MKD", "MNP", "NOR", "OMN", "PAK", "PLW", "PSE", "PAN", "PNG", "PRY", "PER", "PHL", "PCN", "POL", "PRT", "PRI", "QAT", "REU", "ROU", "RUS", "RWA", "BLM", "SHN", "KNA", "LCA", "MAF", "SPM", "VCT", "WSM", "SMR", "STP", "SAU", "SEN", "SRB", "SYC", "SLE", "SGP", "SXM", "SVK", "SVN", "SLB", "SOM", "ZAF", "SGS", "SSD", "ESP", "LKA", "SDN", "SUR", "SJM", "SWE", "CHE", "SYR", "TWN", "TJK", "TZA", "THA", "TLS", "TGO", "TKL", "TON", "TTO", "TUN", "TUR", "TKM", "TCA", "TUV", "UGA", "UKR", "ARE", "GBR", "USA", "UMI", "URY", "UZB", "VUT", "VEN", "VNM", "VGB", "VIR", "WLF", "ESH", "YEM", "ZMB", "ZWE"]};

            for(let i = 0; i < rows.length; i++){
              if (!(rows[i].id in output)) {
                output[rows[i].id] = [];
              }
              output[rows[i].id].push({"date": rows[i].Date, "cases": rows[i].Confirmed});
              // if (i==0) {
              //   console.log(rows[i])
              // }

            }

            res.json(output);
        }
    });
});

app.get("/dateRange", function(req, res){
    let statement = "SELECT Min(DATE(Date)) AS First_Day ,MAX(DATE(Date)) AS Last_Day FROM world;"

    conn.query(statement,function(err, rows, fields) {
        if (err) {
            console.log('Error during query select...' + err.sqlMessage);
            res.json({"failed":"getYearsForIndicator"}); res.status(500);

        } else {
            let output = {"First_Day": rows[0].First_Day, "Last_Day": rows[0].Last_Day};

            res.json(output);
        }
    });
});

app.get("/getMax", function(req, res){
    let statement = "SELECT MAX(CAST(Confirmed AS UNSIGNED)) AS Confirmed, MAX(CAST(Confirmed_last24h AS UNSIGNED)) AS Confirmed_last24h, MAX(CAST(Deaths AS UNSIGNED)) AS Deaths, MAX(CAST(Deaths_last24h AS UNSIGNED)) AS Deaths_last24h FROM world;"

    conn.query(statement,function(err, rows, fields) {
        if (err) {
            console.log('Error during query select...' + err.sqlMessage);
            res.json({"failed":"getYearsForIndicator"}); res.status(500);

        } else {
            let output = {"Confirmed": rows[0].Confirmed, "Confirmed_last24h": rows[0].Confirmed_last24h, "Deaths": rows[0].Deaths, "Deaths_last24h": rows[0].Deaths_last24h};

            res.json(output);
        }
    });
});

// Only use static files from static folder
app.use(express.static("./static"));

app.listen(8080, function (){
    console.log("Server listening on http://localhost:8080...")
});
