//global vars
var currentPrimaryMetric = "Confirmed_last24h";
var currentSecondaryMetric = "vaccinations_last24h";
var projection,
  path,
  graticule,
  svg,
  attributeArray = [],
  currentAttribute,
  playing = false;
var margin = {
    top: 150,
    right: 10,
    bottom: 10,
    left: 10,
  },
  width = 820 - margin.left - margin.right,
  height = 550 - margin.bottom - margin.top,
  sliderPosition = {
    top: height - 50,
    left: width / 2 + 10,
    height: 40,
    width: width - 100,
  },
  mapTranslate = [480, 400];
const formatDate = d3.timeFormat("%b-%d-%Y");
const formatDateDB = d3.timeFormat("%Y-%m-%d");
var startingValue, endingValue;
parseDate = d3.timeParse("%Y-%m-%d");
var handle, slider, sliderBox, brush, button, svg, x, xaxis;
// data to be loaded in
let worldDataSaved = null;
let countryDataSaved = null;
//dropdown vars
var dropDownCountryChoices = [
  "World",
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Anguilla",
  "Antigua and Barbuda",
  "Argentina",
  "Armenia",
  "Aruba",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bermuda",
  "Bhutan",
  "Bolivia (Plurinational State of)",
  "Bonaire, Sint Eustatius and Saba",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei Darussalam",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cabo Verde",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Cayman Islands",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo",
  "Congo, Democratic Republic of the",
  "Cook Islands",
  "Costa Rica",
  "Côte d'Ivoire",
  "Croatia",
  "Cuba",
  "Curaçao",
  "Cyprus",
  "Czechia",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Eswatini",
  "Ethiopia",
  "Falkland Islands (Malvinas)",
  "Faroe Islands",
  "Fiji",
  "Finland",
  "France",
  "French Polynesia",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Gibraltar",
  "Greece",
  "Greenland",
  "Grenada",
  "Guatemala",
  "Guernsey",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Holy See",
  "Honduras",
  "Hong Kong",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran (Islamic Republic of)",
  "Iraq",
  "Ireland",
  "Isle of Man",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jersey",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "Korea, Republic of",
  "Kuwait",
  "Kyrgyzstan",
  "Lao People's Democratic Republic",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Macao",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Micronesia (Federated States of)",
  "Moldova, Republic of",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Montserrat",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands",
  "New Caledonia",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "North Macedonia",
  "Norway",
  "Oman",
  "Pakistan",
  "Palestine, State of",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russian Federation",
  "Rwanda",
  "Saint Helena, Ascension and Tristan da Cunha",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Vincent and the Grenadines",
  "Samoa",
  "San Marino",
  "Sao Tome and Principe",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Sint Maarten (Dutch part)",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Sweden",
  "Switzerland",
  "Syrian Arab Republic",
  "Taiwan, Province of China",
  "Tajikistan",
  "Tanzania, United Republic of",
  "Thailand",
  "Timor-Leste",
  "Togo",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Turks and Caicos Islands",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom of Great Britain and Northern Ireland",
  "United States of America",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Venezuela (Bolivarian Republic of)",
  "Viet Nam",
  "Virgin Islands (British)",
  "Wallis and Futuna",
  "Yemen",
  "Zambia",
  "Zimbabwe",
];
const metrics = {
  primary: {
    "Daily Confirmed Cases": "Confirmed_last24h",
    "Total Confirmed Cases": "Confirmed",
    "Daily Deaths": "Deaths_last24h",
    "Total Deaths": "Deaths",
  },
  secondary: {
    "Daily Vaccinations": "vaccinations_last24h",
    "Total Vaccinations": "total_vaccinations",
    "People Vaccinated": "people_vaccinated",
    "People Fully Vaccinated": "people_fully_vaccinated",
  },
};

var dropDownCountryVars = [
  "",
  "004",
  "008",
  "012",
  "020",
  "024",
  "660",
  "028",
  "032",
  "051",
  "533",
  "036",
  "040",
  "031",
  "044",
  "048",
  "050",
  "052",
  "112",
  "056",
  "084",
  "204",
  "060",
  "064",
  "068",
  "535",
  "070",
  "072",
  "076",
  "096",
  "100",
  "854",
  "108",
  "132",
  "116",
  "120",
  "124",
  "136",
  "140",
  "148",
  "152",
  "156",
  "170",
  "174",
  "178",
  "180",
  "184",
  "188",
  "384",
  "191",
  "192",
  "531",
  "196",
  "203",
  "208",
  "262",
  "212",
  "214",
  "218",
  "818",
  "222",
  "226",
  "232",
  "233",
  "748",
  "231",
  "238",
  "234",
  "242",
  "246",
  "250",
  "258",
  "266",
  "270",
  "268",
  "276",
  "288",
  "292",
  "300",
  "304",
  "308",
  "320",
  "831",
  "324",
  "624",
  "328",
  "332",
  "336",
  "340",
  "344",
  "348",
  "352",
  "356",
  "360",
  "364",
  "368",
  "372",
  "833",
  "376",
  "380",
  "388",
  "392",
  "832",
  "400",
  "398",
  "404",
  "296",
  "410",
  "414",
  "417",
  "418",
  "428",
  "422",
  "426",
  "430",
  "434",
  "438",
  "440",
  "442",
  "446",
  "450",
  "454",
  "458",
  "462",
  "466",
  "470",
  "584",
  "478",
  "480",
  "484",
  "583",
  "498",
  "492",
  "496",
  "499",
  "500",
  "504",
  "508",
  "104",
  "516",
  "520",
  "524",
  "528",
  "540",
  "554",
  "558",
  "562",
  "566",
  "807",
  "578",
  "512",
  "586",
  "275",
  "591",
  "598",
  "600",
  "604",
  "608",
  "616",
  "620",
  "634",
  "642",
  "643",
  "646",
  "654",
  "659",
  "662",
  "670",
  "882",
  "674",
  "678",
  "682",
  "686",
  "688",
  "690",
  "694",
  "702",
  "534",
  "703",
  "705",
  "090",
  "706",
  "710",
  "728",
  "724",
  "144",
  "729",
  "740",
  "752",
  "756",
  "760",
  "158",
  "762",
  "834",
  "764",
  "626",
  "768",
  "776",
  "780",
  "788",
  "792",
  "795",
  "796",
  "798",
  "800",
  "804",
  "784",
  "826",
  "840",
  "858",
  "860",
  "548",
  "862",
  "704",
  "092",
  "876",
  "887",
  "894",
  "716",
];
var selectedPrimaryMetricName = "Daily Confirmed Cases";
var selectedSecondaryMetricName = "Daily Vaccinations";
var selectedCountry = "World";
var selectedCountryISO;
var dropDown;
var dropDown2;
var dropDownCountry;
//legend vars
var lowColor = "#002fff"; //'#f9f9f9';
var highColor = "#bc2a66";
var w = 140,
  h = 500;

const maxValues = {
  country: {
    Confirmed: 0,
    Confirmed_last24h: 0,
    Deaths: 0,
    Deaths_last24h: 0,
    total_vaccinations: 0,
    people_vaccinated: 0,
    people_fully_vaccinated: 0,
    vaccinations_last24h: 0,
  },
  world: {
    Confirmed: 0,
    Confirmed_last24h: 0,
    Deaths: 0,
    Deaths_last24h: 0,
    total_vaccinations: 0,
    people_vaccinated: 0,
    people_fully_vaccinated: 0,
    vaccinations_last24h: 0,
  },
};
var key, legend, y, yaxis;
var ramp, ramp2;
var formatLegend = d3.format(".0f");
// var ticks;
//graph vars
var updatePrimaryGraph = true;
var updateSecondaryGraph = true;
var plot; //the svg for the barchart
var plot2; //the svg for the vaccine barchart
var heightG = 220;
var widthG = 950;
var formatDateG = d3.timeFormat("%b-%Y");
var tipG, tipG2; //tooltip for barchart
var formatDateToolTip = d3.timeFormat("%d-%b-%Y");
var graphData;
var maxVar, maxVar2;

//Tool tips to see data
var format = d3.format(",");

var tip = d3
  .tip()
  .attr("class", "d3-tip")
  .offset([-10, 0])
  .html(function (d) {
    return (
      "<strong>Country: </strong><span class='details'>" +
      d.properties.name +
      "<br></span>" +
      "<strong>" +
      selectedPrimaryMetricName +
      ": </strong><span class='details'>" +
      format(d.properties[attributeArray[currentAttribute]]) +
      "</span>"
    );
  });

var firstDay, lastDay;
async function getScaleData() {
  try {
    //load all data asynchronously
    const [data, maxData, maxTotals] = await Promise.all([
      d3.json("/dateRange"), //range of dates we're working with
      d3.json("/getMax"), //max value in dataset excluding world total, used to set legend scale
      d3.json("/getTotalMax"), //max world total used to set graph legend
    ]);
    dateCallback(null, data, maxData, maxTotals);
  } catch (error) {
    console.log("Error loading scale data:", error);
    dateCallback(error, null, null, null);
  }
}
function dateCallback(error, data, maxData, maxTotals) {
  startingValue = new Date(
    data["First_Day"].replace(/-/g, "\/").replace(/T.+/, ""),
  );
  endingValue = new Date(
    data["Last_Day"].replace(/-/g, "\/").replace(/T.+/, ""),
  );
  endingValue.setDate(endingValue.getDate() - 0); //for d3 scale
  maxValues.country.Confirmed = maxData["Confirmed"];
  maxValues.country.Confirmed_last24h = maxData["Confirmed_last24h"];
  maxValues.country.Deaths = maxData["Deaths"];
  maxValues.country.Deaths_last24h = maxData["Deaths_last24h"];
  maxValues.country.total_vaccinations = maxData["total_vaccinations"];
  maxValues.country.people_vaccinated = maxData["people_vaccinated"];
  maxValues.country.people_fully_vaccinated =
    maxData["people_fully_vaccinated"];
  maxValues.country.vaccinations_last24h = maxData["vaccinations_last24h"];

  maxValues.world.Confirmed = maxTotals["Confirmed"];
  maxValues.world.Confirmed_last24h = maxTotals["Confirmed_last24h"];
  maxValues.world.Deaths = maxTotals["Deaths"];
  maxValues.world.Deaths_last24h = maxTotals["Deaths_last24h"];
  maxValues.world.total_vaccinations = maxTotals["total_vaccinations"];
  maxValues.world.people_vaccinated = maxTotals["people_vaccinated"];
  maxValues.world.people_fully_vaccinated =
    maxTotals["people_fully_vaccinated"];
  maxValues.world.vaccinations_last24h = maxTotals["vaccinations_last24h"];

  ramp = d3
    .scaleLog()
    .clamp(true)
    .domain([1, maxValues.country.Confirmed])
    .range([lowColor, highColor])
    .nice();
  ramp2 = d3
    .scaleLog()
    .clamp(true)
    .domain([1, maxValues.country.total_vaccinations])
    .range([lowColor, highColor])
    .nice();

  buildSlider();
  updatePage();
  // buildLegend();
  // buildGraph('World', selectedPrimaryMetricName);
  // setMap();
}

function buildSlider() {
  //scale for slider
  x = d3
    .scaleTime()
    .domain([startingValue, endingValue])
    .range([0, sliderPosition.width]) //
    .clamp(true);

  svg1 = d3
    .select("body")
    .append("svg")
    .attr("id", "map_element")
    .attr("width", 900)
    .attr("height", height + margin.top + margin.bottom + 100);

  svg1
    .append("text")
    .attr("id", "map_title")
    .attr("x", 150)
    .attr("y", 30)
    .style("font-size", "36px")
    .text("COVID-19 Map (" + selectedPrimaryMetricName + ")");

  dropDownInfo = d3
    .select("body")
    .append("p")
    .attr("class", "title1")
    .text("Primary Graph");

  dropDown = d3
    .select("body")
    .append("select")
    .attr("class", "var-list")
    .attr("y", 200)
    .on("change", onchange);

  dropDownInfo2 = d3
    .select("body")
    .append("p")
    .attr("class", "title2")
    .text("Secondary Graph");

  dropDown2 = d3
    .select("body")
    .append("select")
    .attr("class", "var-list2")
    .attr("y", 200)
    .on("change", onchange2);

  dropDownInfo2 = d3
    .select("body")
    .append("p")
    .attr("class", "title3")
    .text("Country Choice");

  dropDownCountry = d3
    .select("body")
    .append("select")
    .attr("class", "country-search")
    .attr("y", 200)
    .on("change", onchangeCountry);

  dataSource = d3
    .select("body")
    .append("p")
    .attr("class", "owid-source")
    .html(
      `<b>Data Source: </b>` +
        `Hannah Ritchie, Esteban Ortiz-Ospina, Diana Beltekian, Edouard Mathieu, Joe Hasell, Bobbie Macdonald, Charlie Giattino, Cameron Appel, Lucas Rodés-Guirao and Max Roser (2020) - ` +
        "<br>" +
        ` "Coronavirus Pandemic (COVID-19)". Published online at OurWorldInData.org. Retrieved from: ` +
        `<a href="https://ourworldindata.org/coronavirus">'https://ourworldindata.org/coronavirus'</a>` +
        ` [Online Resource]`,
    );
  //    .href("")

  var options = dropDown
    .selectAll("option")
    .data(Object.keys(metrics.primary))
    .enter()
    .append("option")
    .text(function (d) {
      return d;
    });

  var options2 = dropDown2
    .selectAll("option")
    .data(Object.keys(metrics.secondary))
    .enter()
    .append("option")
    .text(function (d) {
      return d;
    });

  var optionsCountry = dropDownCountry
    .selectAll("option")
    .data(dropDownCountryChoices)
    .enter()
    .append("option")
    .text(function (d) {
      return d;
    });

  function onchange() {
    updatePrimaryGraph = true;
    updateSecondaryGraph = true;
    selectedPrimaryMetricName = d3.select("select.var-list").property("value");
    currentPrimaryMetric = metrics.primary[selectedPrimaryMetricName];
    selectedCountry = "World";
    updatePage();
  }

  function onchange2() {
    updateSecondaryGraph = true;
    selectedSecondaryMetricName = d3
      .select("select.var-list2")
      .property("value");
    currentSecondaryMetric = metrics.secondary[selectedSecondaryMetricName];

    getCountryData(selectedCountry, selectedCountryISO);
  }

  function onchangeCountry() {
    selectedCountry = d3.select("select.country-search").property("value");
    selectedCountryISO =
      dropDownCountryVars[dropDownCountryChoices.indexOf(selectedCountry)];
    updatePrimaryGraph = true;
    updateSecondaryGraph = true;

    getCountryData(selectedCountry, selectedCountryISO);
  }

  svg = svg1
    .append("g")
    .attr("height", 500)
    .attr("width", 900)
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  ////slider code
  const sliderContainer = d3
    .select("body")
    .append("div")
    .attr("id", "slider-container")
    .style("margin", "30px 100px");

  const slider = d3
    .sliderBottom()
    .min(startingValue)
    .max(endingValue)
    .step(1000 * 60 * 60 * 24)
    .width(sliderPosition.width)
    .tickFormat(formatDate)
    .tickValues([startingValue, endingValue])
    .default(startingValue)
    .on("onchange", (val) => {
      const formatted = formatDateDB(val);
      currentAttribute = attributeArray.indexOf(formatted);
      if (currentAttribute !== -1) {
        sequenceMap();
      }
    });

  const gSlider = sliderContainer
    .append("svg")
    .attr("width", sliderPosition.width + 100)
    .attr("height", 80)
    .append("g")
    .attr("transform", "translate(30,30)")
    .call(slider);

  button = d3
    .select("body")
    .append("button")
    .attr("class", "play")
    .text("Play");

  let isPlaying = false;
  let interval = null;
  button.on("click", () => {
    isPlaying = !isPlaying;
    button.text(isPlaying ? "Pause" : "Play");
    if (isPlaying) {
      let i = 0;

      interval = d3.interval(() => {
        //stop slider when last day with data is reached
        if (i >= attributeArray.length) {
          interval.stop();
          isPlaying = false;
          button.text("Play");
          return;
        }
        //move the slider to the next day
        const nextDate = parseDate(attributeArray[i]);
        slider.value(nextDate);
        i++;
      }, 100);
    } else {
      interval.stop();
    }
  });
}

function updatePage() {
  buildLegend();
  getCountryData("World", null);
  setMap();
}

//build legend using varibale specified in currentPrimaryMetric
function buildLegend() {
  d3.select("#legend_id").remove();

  key = d3
    .select("body")
    .append("svg")
    .attr("id", "legend_id")
    .attr("width", w)
    .attr("height", h)
    .attr("class", "legend");

  legend = key
    .append("defs")
    .append("svg:linearGradient")
    .attr("id", "gradient")
    .attr("x1", "100%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "100%")
    .attr("spreadMethod", "pad");

  legend
    .append("stop")
    .attr("offset", "0%")
    .attr("stop-color", highColor)
    .attr("stop-opacity", 1);

  legend
    .append("stop")
    .attr("offset", "100%")
    .attr("stop-color", lowColor)
    .attr("stop-opacity", 1);

  key
    .append("rect")
    .attr("width", w - 100)
    .attr("height", h)
    .style("fill", "url(#gradient)")
    .attr("transform", "translate(0,10)");

  function createRamp(maxData) {
    return d3
      .scaleLog()
      .clamp(true)
      .domain([1, maxData])
      .range([lowColor, highColor])
      .nice();
  }

  ramp = createRamp(maxValues.country[currentPrimaryMetric]);
  maxVar = maxValues.country[currentPrimaryMetric];
  ramp2 = createRamp(maxValues.country[currentSecondaryMetric]);
  maxVar2 = maxValues.country[currentSecondaryMetric];

  y = d3.scaleLog().range([h, 0]).domain([1, maxVar]);

  yaxis = d3.axisRight(y).ticks(5, "~s").tickSize(1);

  key
    .append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(41,10)")
    .call(yaxis);
}

function buildGraph(error, totals, details) {
  graphData = totals;
  countryDetails = details;
  const population = Intl.NumberFormat().format(countryDetails[0].population);
  // var	parseDateG = d3.timeParse("%Y-%m");

  var xG, yG, xAxisG, yAxisG;
  var xG2, yG2, xAxisG2, yAxisG2;
  if (updatePrimaryGraph) {
    maxVar = maxValues.world[currentPrimaryMetric];
    xG = d3.scaleBand().range([0, widthG]).padding(0.05);
    yG = d3.scaleLinear().domain([0, maxVar]).range([heightG, 0]);

    xAxisG = d3.axisBottom(xG).tickFormat(function (interval, d) {
      var formatTest = d3.timeFormat("%d");
      if (formatTest(interval) == "01") {
        //only show ticks for the first of every month
        return formatDateG(interval);
      } else {
        return " ";
      }
    });

    yAxisG = d3.axisLeft(yG).ticks(10);
  }
  if (updateSecondaryGraph) {
    if (currentSecondaryMetric == "total_vaccinations") {
      maxVar2 = maxValues.world.total_vaccinations;
    } else if (currentSecondaryMetric == "vaccinations_last24h") {
      maxVar2 = maxValues.world.vaccinations_last24h;
    } else if (currentSecondaryMetric == "people_fully_vaccinated") {
      maxVar2 = maxValues.world.people_fully_vaccinated;
    } else if (currentSecondaryMetric == "people_vaccinated") {
      maxVar2 = maxValues.world.people_vaccinated;
    }

    xG2 = d3.scaleBand().range([0, widthG]).padding(0.05);
    yG2 = d3.scaleLinear().domain([0, maxVar2]).range([heightG, 0]);

    xAxisG2 = d3.axisBottom(xG2).tickFormat(function (interval, d) {
      var formatTest = d3.timeFormat("%d");
      if (formatTest(interval) == "01") {
        //only show ticks for the first of every month
        return formatDateG(interval);
      } else {
        return " ";
      }
    });

    yAxisG2 = d3.axisLeft(yG2).ticks(10);
  }

  if (updatePrimaryGraph) {
    d3.select("#primary_bar_graph").remove();

    plot = d3
      .select("body")
      .append("svg")
      .attr("id", "primary_bar_graph")
      .attr("width", 1100)
      .attr("height", 490)
      .attr("transform", "translate(0," + -70 + ")")
      .attr("class", "graph");
  }
  if (updateSecondaryGraph) {
    d3.select("#secondary_bar_graph").remove();

    plot2 = d3
      .select("body")
      .append("svg")
      .attr("id", "secondary_bar_graph")
      .attr("width", 1100)
      .attr("height", 490)
      .attr("transform", "translate(0," + 300 + ")")
      .attr("class", "graph");
  }

  // console.log(graphData);
  graphData.forEach(function (d) {
    d.Date = new Date(d.Date.replace(/-/g, "\/"));
    d.Confirmed = +d.Confirmed;
    d.Confirmed_last24h = +d.Confirmed_last24h;
    d.Deaths = +d.Deaths;
    d.Deaths_last24h = +d.Deaths_last24h;
    d.total_vaccinations = +d.total_vaccinations;
    d.vaccinations_last24h = +d.vaccinations_last24h;
    d.people_fully_vaccinated = +d.people_fully_vaccinated;
    d.people_vaccinated = +d.people_vaccinated;
  });

  if (updatePrimaryGraph) {
    xG.domain(
      graphData.map(function (d) {
        return d.Date;
      }),
    );
    if (currentPrimaryMetric == "Confirmed") {
      //fixme remove if/elseif
      yG.domain([
        0,
        d3.max(graphData, function (d) {
          return d.Confirmed;
        }),
      ]);
    } else if (currentPrimaryMetric == "Confirmed_last24h") {
      yG.domain([
        0,
        d3.max(graphData, function (d) {
          return d.Confirmed_last24h;
        }),
      ]);
    } else if (currentPrimaryMetric == "Deaths") {
      yG.domain([
        0,
        d3.max(graphData, function (d) {
          return d.Deaths;
        }),
      ]);
    } else if (currentPrimaryMetric == "Deaths_last24h") {
      yG.domain([
        0,
        d3.max(graphData, function (d) {
          return d.Deaths_last24h;
        }),
      ]);
    }
  }

  if (updateSecondaryGraph) {
    xG2.domain(
      graphData.map(function (d) {
        return d.Date;
      }),
    );
    if (currentSecondaryMetric == "total_vaccinations") {
      yG2.domain([
        0,
        d3.max(graphData, function (d) {
          return d.total_vaccinations;
        }),
      ]);
    } else if (currentSecondaryMetric == "vaccinations_last24h") {
      yG2.domain([
        0,
        d3.max(graphData, function (d) {
          return d.vaccinations_last24h;
        }),
      ]);
    } else if (currentSecondaryMetric == "people_fully_vaccinated") {
      yG2.domain([
        0,
        d3.max(graphData, function (d) {
          return d.people_fully_vaccinated;
        }),
      ]);
    } else if (currentSecondaryMetric == "people_vaccinated") {
      yG2.domain([
        0,
        d3.max(graphData, function (d) {
          return d.people_vaccinated;
        }),
      ]);
    }
  }

  tipG = d3
    .tip()
    .attr("class", "d3-tip")
    .offset([-10, 0])
    .html(function (d) {
      //need to find a better way to do this
      if (currentPrimaryMetric == "Confirmed") {
        return (
          "<span>" +
          formatDateToolTip(d.Date) +
          "<br></span>" +
          "<strong>" +
          selectedPrimaryMetricName +
          ":</strong> <span style='color:red'>" +
          d.Confirmed +
          "</span>"
        );
      } else if (currentPrimaryMetric == "Confirmed_last24h") {
        return (
          "<span>" +
          formatDateToolTip(d.Date) +
          "<br></span>" +
          "<strong>" +
          selectedPrimaryMetricName +
          ":</strong> <span style='color:red'>" +
          d.Confirmed_last24h +
          "</span>"
        );
      } else if (currentPrimaryMetric == "Deaths") {
        return (
          "<span>" +
          formatDateToolTip(d.Date) +
          "<br></span>" +
          "<strong>" +
          selectedPrimaryMetricName +
          ":</strong> <span style='color:red'>" +
          d.Deaths +
          "</span>"
        );
      } else if (currentPrimaryMetric == "Deaths_last24h") {
        return (
          "<span>" +
          formatDateToolTip(d.Date) +
          "<br></span>" +
          "<strong>" +
          selectedPrimaryMetricName +
          ":</strong> <span style='color:red'>" +
          d.Deaths_last24h +
          "</span>"
        );
      } else {
        return "error";
      }
    });

  tipG2 = d3
    .tip()
    .attr("class", "d3-tip")
    .offset([-10, 0])
    .html(function (d) {
      //need to find a better way to do this
      if (currentSecondaryMetric == "total_vaccinations") {
        return (
          "<span>" +
          formatDateToolTip(d.Date) +
          "<br></span>" +
          "<strong>" +
          selectedSecondaryMetricName +
          ":</strong> <span style='color:red'>" +
          d.total_vaccinations +
          "</span>"
        );
      } else if (currentSecondaryMetric == "vaccinations_last24h") {
        return (
          "<span>" +
          formatDateToolTip(d.Date) +
          "<br></span>" +
          "<strong>" +
          selectedSecondaryMetricName +
          ":</strong> <span style='color:red'>" +
          d.vaccinations_last24h +
          "</span>"
        );
      } else if (currentSecondaryMetric == "people_fully_vaccinated") {
        return (
          "<span>" +
          formatDateToolTip(d.Date) +
          "<br></span>" +
          "<strong>" +
          selectedSecondaryMetricName +
          ":</strong> <span style='color:red'>" +
          d.people_fully_vaccinated +
          "</span>"
        );
      } else if (currentSecondaryMetric == "people_vaccinated") {
        return (
          "<span>" +
          formatDateToolTip(d.Date) +
          "<br></span>" +
          "<strong>" +
          selectedSecondaryMetricName +
          ":</strong> <span style='color:red'>" +
          d.people_vaccinated +
          "</span>"
        );
      } else {
        return "error";
      }
    });

  plot.call(tipG);
  plot2.call(tipG2);

  if (updatePrimaryGraph) {
    d3.select("#graph_title").remove();
    d3.select("#map_title").remove();
    svg1
      .append("text")
      .attr("id", "map_title")
      .attr("x", 150)
      .attr("y", 30)
      .style("font-size", "36px")
      .text("COVID-19 Map (" + selectedPrimaryMetricName + ")");

    plot
      .append("text")
      .attr("id", "graph_title")
      .attr("x", widthG / 2 + 10)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      // .style("text-decoration", "underline")
      .text(
        selectedCountry +
          " " +
          selectedPrimaryMetricName +
          " (Population " +
          population +
          " )",
      );

    plot
      .append("g")
      .attr("class", "x axisG")
      .attr("transform", "translate(100," + 270 + ")")
      .call(xAxisG)
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", "-.55em")
      .attr("transform", "rotate(-90)");

    plot
      .append("g")
      .attr("class", "y axisG")
      .style("stroke-width", "1px")
      .attr("transform", "translate(100,50)")
      .call(yAxisG)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end");

    plot
      .selectAll("bar")
      .data(graphData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("transform", "translate(100,50)")
      .attr("x", function (d) {
        return xG(d.Date);
      })
      .attr("width", xG.bandwidth())
      // .attr("width", 4)
      .attr("y", function (d) {
        if (currentPrimaryMetric == "Confirmed") {
          return yG(d.Confirmed);
        } else if (currentPrimaryMetric == "Confirmed_last24h") {
          return yG(d.Confirmed_last24h);
        } else if (currentPrimaryMetric == "Deaths") {
          return yG(d.Deaths);
        } else if (currentPrimaryMetric == "Deaths_last24h") {
          return yG(d.Deaths_last24h);
        }
      })
      .attr("height", function (d) {
        if (currentPrimaryMetric == "Confirmed") {
          return heightG - yG(d.Confirmed);
        } else if (currentPrimaryMetric == "Confirmed_last24h") {
          return heightG - yG(d.Confirmed_last24h);
        } else if (currentPrimaryMetric == "Deaths") {
          return heightG - yG(d.Deaths);
        } else if (currentPrimaryMetric == "Deaths_last24h") {
          return heightG - yG(d.Deaths_last24h);
        }
      })
      .on("mouseover", tipG.show)
      .on("mouseout", tipG.hide);
  }

  if (updateSecondaryGraph) {
    d3.select("#graph_title2").remove();
    //vaccine graph
    plot2
      .append("text")
      .attr("id", "graph_title2")
      .attr("x", widthG / 2 + 10)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text(
        selectedCountry +
          " " +
          selectedSecondaryMetricName +
          " (Population " +
          population +
          " )",
      );

    //vaccine graph
    plot2
      .append("g")
      .attr("class", "x axisG2")
      .attr("transform", "translate(100," + 270 + ")")
      .call(xAxisG2)
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", "-.55em")
      .attr("transform", "rotate(-90)");

    plot2
      .append("g")
      .attr("class", "y axisG2")
      .style("stroke-width", "1px")
      .attr("transform", "translate(100,50)")
      .call(yAxisG2)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end");

    plot2
      .selectAll("bar")
      .data(graphData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("transform", "translate(100,50)")
      .attr("x", function (d) {
        return xG2(d.Date);
      })
      .attr("width", xG2.bandwidth())
      // .attr("width", 4)
      .attr("y", function (d) {
        if (currentSecondaryMetric == "total_vaccinations") {
          return yG2(d.total_vaccinations);
        } else if (currentSecondaryMetric == "vaccinations_last24h") {
          return yG2(d.vaccinations_last24h);
        } else if (currentSecondaryMetric == "people_fully_vaccinated") {
          return yG2(d.people_fully_vaccinated);
        } else if (currentSecondaryMetric == "people_vaccinated") {
          return yG2(d.people_vaccinated);
        }
      })
      .attr("height", function (d) {
        if (currentSecondaryMetric == "total_vaccinations") {
          return heightG - yG2(d.total_vaccinations);
        } else if (currentSecondaryMetric == "vaccinations_last24h") {
          return heightG - yG2(d.vaccinations_last24h);
        } else if (currentSecondaryMetric == "people_fully_vaccinated") {
          return heightG - yG2(d.people_fully_vaccinated);
        } else if (currentSecondaryMetric == "people_vaccinated") {
          return heightG - yG2(d.people_vaccinated);
        }
      })
      .on("mouseover", tipG2.show)
      .on("mouseout", tipG2.hide);
  }
  updatePrimaryGraph = false;
  updateSecondaryGraph = false;
}

function setMap() {
  projection = d3
    .geoMercator() // define projection
    .scale(100)
    .translate([width / 2, height / 2]);

  path = d3.geoPath().projection(projection);

  svg
    .append("svg") // append a svg to hold map
    .attr("id", "map")
    .attr("width", width)
    .attr("height", height);

  svg
    .append("defs")
    .append("path") // add the projection path to the svg
    .datum({ type: "Sphere" })
    .attr("id", "sphere")
    .attr("d", path);

  svg.call(tip); //display tooltip when hovering over country
  if (worldDataSaved === null) {
    loadData(); // only query database if data hasn't been loaded yet
  } else {
    processData(null, worldDataSaved, countryDataSaved);
  }
}

async function loadData() {
  try {
    //loads all external data files asynchronously
    const [world, countryData] = await Promise.all([
      d3.json("countries-110m.json"), // datamap geometries
      d3.json("/countrydata"), //data for each country
    ]);
    processData(null, world, countryData);
  } catch (error) {
    console.log("Error loading external data:", error);
    processData(error, null, null);
  }
}

function processData(error, world, countryData) {
  worldDataSaved = world;
  countryDataSaved = countryData;
  var countries = world.objects.countries.geometries; // path to geometries
  var emptyCountries = ["Somaliland", "Kosovo", "N. Cyprus"]; //need to remove non iso countries
  for (var i = 0; i < countries.length; i++) {
    if (emptyCountries.includes(countries[i].properties.name)) {
      countries.splice(i, 1);
      i--;
    }
  }

  for (var i in countries) {
    // for each geometry object
    data_i = countryData[countries[i].id];
    for (var k in data_i) {
      //for each day that country reported cases
      if (attributeArray.indexOf(data_i[k].date.split("T")[0]) == -1) {
        //too find max date range
        attributeArray.push(data_i[k].date.split("T")[0]); //array to store all the dates
      }
      if (currentPrimaryMetric == "Confirmed") {
        countries[i].properties[data_i[k].date.split("T")[0]] = Number(
          data_i[k].cases,
        ); //store the number of cases for each date in the properties of the country
      } else if (currentPrimaryMetric == "Confirmed_last24h") {
        countries[i].properties[data_i[k].date.split("T")[0]] = Number(
          data_i[k].cases_last24,
        ); //store the number of cases for each date in the properties of the country
      } else if (currentPrimaryMetric == "Deaths") {
        countries[i].properties[data_i[k].date.split("T")[0]] = Number(
          data_i[k].deaths,
        ); //store the number of cases for each date in the properties of the country
      } else if (currentPrimaryMetric == "Deaths_last24h") {
        countries[i].properties[data_i[k].date.split("T")[0]] = Number(
          data_i[k].deaths_last24,
        ); //store the number of cases for each date in the properties of the country
      }
    }
  }
  currentAttribute = 0;
  drawMap(world);

  sequenceMap();
}

function drawMap(world) {
  svg
    .selectAll(".country") // select country objects (which don't exist yet)
    .data(topojson.feature(world, world.objects.countries).features) // bind data to these non-existent objects
    .enter()
    .append("path") // prepare data to be appended to paths
    .attr("class", "country") // give them a class for styling and access later
    .attr(
      "id",
      function (d) {
        return "code_" + d.id;
      },
      true,
    ) // give each a unique id for access later
    .attr("d", path); // create them using the svg path generator defined above

  d3.selectAll(".country") // select all the countries
    .style("stroke", "#fff")
    .style("stroke-width", "1")
    .style("fill", function (d) {
      return ramp(d.properties[attributeArray[currentAttribute]]);
    });
}

function sequenceMap() {
  d3.selectAll(".country")
    .on("mouseover", function (d) {
      tip.show(d);
    })
    .on("mouseleave", function (d) {
      tip.hide(d);
    })
    .on("click", function (d) {
      selectedCountry = d.properties.name;
      selectedCountryISO = d.id;
      updatePrimaryGraph = true;
      updateSecondaryGraph = true;
      getCountryData(selectedCountry, selectedCountryISO);
    })
    .transition() //select all the countries and prepare for a transition to new values
    .duration(100) // give it a smooth time period for the transition
    // .attr('fill-opacity', function(d) {
    //   return getColor(d.properties[attributeArray[currentAttribute]], dataRange);  // the end color value
    // })
    .style("stroke", "#000000")
    .style("stroke-width", "1")
    .style("fill", function (d) {
      return ramp(d.properties[attributeArray[currentAttribute]]);
    });
}

async function getCountryData(selectedCountry, selectedCountryISO) {
  try {
    if (selectedCountry == "World") {
      //fixme api call strings later
      const [totals, details] = await Promise.all([
        d3.json("/getTotalByDay"),
        d3.json("/getDetails"),
      ]);
      buildGraph(null, totals, details);
    } else {
      const [totals, details] = await Promise.all([
        d3.json("/getTotalByDay?country_code=" + selectedCountryISO),
        d3.json("/getDetails?country_code=" + selectedCountryISO),
      ]);
      buildGraph(null, totals, details);
    }
  } catch (error) {
    console.log("Error getting country data:", error);
    buildGraph(error, null, null);
  }
}

window.onload = getScaleData(); // load in data to scale map legend and slider
