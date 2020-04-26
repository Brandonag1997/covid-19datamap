SELECT DISTINCT
id_date.id AS id,
DATE(IFNULL(W.Date,id_date.Date)) AS Date,
IFNULL(W.Confirmed,0) AS Confirmed
FROM world AS W
RIGHT JOIN (
  SELECT I1.`country-code` AS ID, T1.Date AS Date, I1.who_name AS Name
  FROM (SELECT DISTINCT i.`alpha-3` AS id, W.Date as Date FROM iso AS i, world AS w) AS T1
  INNER JOIN iso AS I1 ON T1.id = I1.`alpha-3`) AS id_date
ON W.Country = id_date.Name AND W.Date = id_date.Date
UNION
SELECT '156' AS id, DATE(Date) as Date, Confirmed
FROM china1 WHERE Location='Total';

SELECT
'0' as id,
DATE(W.Date) AS Date,
SUM(W.Confirmed) AS Confirmed
FROM world AS W
GROUP BY W.Date, id
UNION
SELECT '156' AS id, DATE(Date) as Date, Confirmed
FROM china1 WHERE Location='Total';

CREATE TEMPORARY TABLE temp_data (
iso_code TEXT,
location TEXT,
date TEXT,
total_cases NUMERIC,
new_cases NUMERIC,
total_deaths NUMERIC,
new_deaths NUMERIC,
total_cases_per_million TEXT,
new_cases_per_million TEXT,
total_deaths_per_million TEXT,
new_deaths_per_million TEXT,
total_tests TEXT,
new_tests TEXT,
total_tests_per_thousand TEXT,
new_tests_per_thousand TEXT,
tests_units TEXT);

LOAD DATA INFILE 'C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/owid-covid-data.csv'
INTO TABLE temp_data
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\n'
IGNORE 1 ROWS

COPY temp_data(iso_code,location,date,total_cases,new_cases,total_deaths,new_deaths,total_cases_per_million,new_cases_per_million,total_deaths_per_million,new_deaths_per_million,total_tests,new_tests,total_tests_per_thousand,new_tests_per_thousand,tests_units)
FROM 'C:\Users\Brand\Documents\corona\owid-covid-data.csv' DELIMITER ',' CSV HEADER;

CREATE TABLE world_data (
  iso_code CHAR(3),
  Country VARCHAR(100),
  Confirmed TEXT,
  Confirmed_last24h TEXT,
  Deaths TEXT,
  Deaths_last24h TEXT,
  Date TEXT
);

INSERT INTO world_data (iso_code,Country,Confirmed,Confirmed_last24h,Deaths,Deaths_last24h,Date)
SELECT iso_code,location,total_cases,new_cases,total_deaths,new_deaths,date
FROM temp_data;

CREATE INDEX country_code ON world_data (iso_code, Country);

SELECT DISTINCT
id_date.Name,
id_date.id AS id,
DATE(IFNULL(W.Date,id_date.Date)) AS Date,
IFNULL(W.Confirmed,0) AS Confirmed
FROM world_data AS W
RIGHT JOIN (
  SELECT I1.`country-code` AS ID, T1.Date AS Date, I1.`alpha-3` AS Name
  FROM (SELECT DISTINCT i.`alpha-3` AS id, W.Date as Date FROM iso AS i, world_data AS w) AS T1
  INNER JOIN iso AS I1 ON T1.id = I1.`alpha-3`) AS id_date
ON W.iso_code = id_date.Name AND W.Date = id_date.Date
ORDER BY id
limit 40;
