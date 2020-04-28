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
    // let statement = "SELECT DISTINCT id_date.id AS id, DATE(IFNULL(W.Date,id_date.Date)) AS Date, IFNULL(W.Confirmed,0) AS Confirmed FROM world_data AS W RIGHT JOIN (SELECT I1.`country-code` AS ID, T1.Date AS Date, I1.who_name AS Name  FROM (SELECT DISTINCT i.`alpha-3` AS id, W.Date as Date FROM iso AS i, world_data AS w) AS T1 INNER JOIN iso AS I1 ON T1.id = I1.`alpha-3`) AS id_date ON W.Country = id_date.Name AND W.Date = id_date.Date;";
    // let statement = "SELECT DISTINCT id_date.id AS id, DATE(IFNULL(W.Date,id_date.Date)) AS Date, IFNULL(W.Confirmed,0) AS Confirmed FROM world_data AS W RIGHT JOIN (SELECT I1.`country-code` AS ID, T1.Date AS Date, I1.`alpha-3` AS Name FROM (SELECT DISTINCT i.`alpha-3` AS id, W.Date as Date FROM iso AS i, world_data AS w) AS T1 INNER JOIN iso AS I1 ON T1.id = I1.`alpha-3`) AS id_date ON W.iso_code = id_date.Name AND W.Date = id_date.Date;"
    let statement = "SELECT DISTINCT id_date.id AS id, DATE(IFNULL(W.Date,id_date.Date)) AS Date, IFNULL(W.Confirmed,0) AS Confirmed, IFNULL(W.Confirmed_last24h,0) AS Confirmed_last24h, IFNULL(W.Deaths,0) AS Deaths, IFNULL(W.Deaths_last24h,0) AS Deaths_last24h FROM world_data AS W RIGHT JOIN (SELECT I1.`country-code` AS ID, T1.Date AS Date, I1.`alpha-3` AS Name FROM (SELECT DISTINCT i.`alpha-3` AS id, W.Date as Date FROM iso AS i, world_data AS w) AS T1 INNER JOIN iso AS I1 ON T1.id = I1.`alpha-3`) AS id_date ON W.iso_code = id_date.Name AND W.Date = id_date.Date;"

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
    let statement = "SELECT MAX(CAST(Confirmed AS UNSIGNED)) AS Confirmed, MAX(CAST(Confirmed_last24h AS UNSIGNED)) AS Confirmed_last24h, MAX(CAST(Deaths AS UNSIGNED)) AS Deaths, MAX(CAST(Deaths_last24h AS UNSIGNED)) AS Deaths_last24h FROM world_data;"

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
    let statement = "SELECT Date, SUM(Confirmed) AS Confirmed, SUM(Confirmed_last24h) AS Confirmed_last24h, SUM(Deaths) AS Deaths, SUM(Deaths_last24h) AS Deaths_last24h FROM world_data GROUP BY Date ORDER BY Date;"

    conn.query(statement,function(err, rows, fields) {
        if (err) {
            console.log('Error during query select...' + err.sqlMessage);
            res.json({"failed":"getTotalByDay"}); res.status(500);

        } else {
          let output = [];
          // console.log(rows);
          for(let i = 0; i < rows.length; i++){
            // if (!(rows[i].Date in output)) {
            //   output[rows[i].Date] = [];
            // }
            output.push({"Date": rows[i].Date, "Confirmed": rows[i].Confirmed, "Confirmed_last24h": rows[i].Confirmed_last24h, "Deaths": rows[i].Deaths, "Deaths_last24h": rows[i].Deaths_last24h});
          }
          // console.log(output);
          res.json(output);

        }
    });
});

// Only use static files from static folder
app.use(express.static("./static"));

app.listen(8080, function (){
    console.log("Server listening on http://localhost:8080...")
});
