//global vars
var selectedCountry = "World"
var newVar = 'Confirmed_last24h';
var projection, path, graticule, svg, attributeArray = [], currentAttribute, playing = false;
var margin = {
  top: 150,
  right:10,
  bottom:10,
  left: 10
},
width = 820 - margin.left - margin.right,
height = 550 - margin.bottom - margin.top,
sliderPosition = {top: height - 50, left: width / 2 + 10,
                  height:40, width: width - 100},
mapTranslate = [480, 400];
formatDate = d3.time.format("%b-%d")
formatDateDB = d3.time.format("%Y-%m-%d")
var startingValue, endingValue;
parseDate = d3.time.format("%Y-%m-%d").parse
var handle, slider, sliderBox, brush, button, svg, x, xaxis
// data to be loaded in
let worldDataSaved = null;
let countryDataSaved = null;
//dropdown vars
var dropDownChoices = ["Daily Confirmed Cases", "Total Confirmed Cases", "Daily Deaths", "Total Deaths"];
// var dropDownChoices = ["Confirmed Cases", "Confirmed Cases last 24h", "Deaths", "Deaths last 24h"];
var dropDownVars = ["Confirmed_last24h", "Confirmed", "Deaths_last24h", "Deaths"];
var selectedVar = "Daily Confirmed Cases";
var dropDown;
//legend vars
var lowColor = '#002fff'; //'#f9f9f9';
var highColor = '#bc2a66';
var w = 140, h = 500;
var maxConfirmed, maxConfirmed_last24h, maxDeaths, maxDeaths_last24h;
var key, legend, y, yaxis;
var ramp;
var formatLegend = d3.format('.0f');
// var ticks;
//graph vars
var graphNum = 1;
var plot; //the svg for the barchart
var heightG = 220;
var widthG = 470;
var formatDateG = d3.time.format("%b-%Y");
var tipG; //tooltip for barchart
var formatDateToolTip = d3.time.format("%d-%b-%Y");
var graphData;
var maxVar;
var maxTotalConfirmed, maxTotalConfirmed_last24h, maxTotalDeaths, maxTotalDeaths_last24h;

//Tool tips to see data
var format = d3.format(",");

var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function(d) {
    // return "<strong>" + d.properties.name + "</strong>";
    return "<strong>Country: </strong><span class='details'>" + d.properties.name + "<br></span>" + "<strong>" + selectedVar + ": </strong><span class='details'>" + format(d.properties[attributeArray[currentAttribute]]) + "</span>";
  })


var firstDay, lastDay;
function getScaleData(){
queue()   // queue function loads all data asynchronously
  .defer(d3.json, "/dateRange") //range of dates we're working with
  .defer(d3.json, "/getMax") //max value in dataset, used to set legend scale
  .defer(d3.json, "/getTotalMax")
  // .defer(d3.json, "/getTotalByDay")
  .await(dateCallback);
}
function dateCallback(error, data, maxData, maxTotals) {
  // console.log({data});
  // console.log({maxData});
  // console.log({maxTotals});
  // console.log({totals});
  // graphData = totals;
  startingValue = new Date(data['First_Day'])
  endingValue = new Date(data['Last_Day'])
  endingValue.setDate(endingValue.getDate() + 1) //for d3 scale
  maxConfirmed = maxData['Confirmed']
  maxConfirmed_last24h = maxData['Confirmed_last24h']
  maxDeaths = maxData['Deaths']
  maxDeaths_last24h = maxData['Deaths_last24h']
  maxTotalConfirmed = maxTotals['Confirmed']
  maxTotalConfirmed_last24h = maxTotals['Confirmed_last24h']
  maxTotalDeaths = maxTotals['Deaths']
  maxTotalDeaths_last24h = maxTotals['Deaths_last24h']
  // ramp = d3.scale.linear().domain([0,maxConfirmed/4,2*maxConfirmed/4,3*maxConfirmed/4,maxConfirmed]).range(["#ca0020", "#f4a582", "#f7f7f7", "#92c5de", "#0571b0"]);
  ramp = d3.scale.log().clamp(true).domain([1,maxConfirmed]).range([lowColor,highColor]).nice()

  buildSlider();
  // buildDropDown();
  updatePage(selectedVar)
  // buildLegend();
  // buildGraph('World', selectedVar);
  // setMap();
}


function buildSlider() {
  //scale for slider
  x = d3.time.scale()
    .domain([startingValue,endingValue])
    .range([0, sliderPosition.width])//
    .clamp(true);

  svg1 = d3.select("body")
    .append("svg")
      .attr("id","map_element")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

  svg1.append("text")
    .attr("id","map_title")
    .attr("x", 150)
    .attr("y", 30)
    .style("font-size", "36px")
    .text("COVID-19 Map")

  dropDown = d3.select("body")
    .append("select")
    .attr("class", "var-list")
    .attr("y", 200)
    .on('change', onchange);

  var options = dropDown.selectAll("option")
   .data(dropDownChoices)
   .enter()
   .append("option")
    .text(function (d) {return d;});

  function onchange() {
    selectedVar = d3.select('select').property('value');
    newVar = dropDownVars[dropDownChoices.indexOf(selectedVar)];
    selectedCountry = 'World'
    updatePage(newVar);
    // console.log(selectedVar);
    // console.log(newVar);
    }

  svg = svg1.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  button = d3.select("body").append("button")
    .attr("class", "play")
    .text("Play")

  ////slider code
  //brush for slider
  brush = d3.svg.brush()
    .x(x)
    .extent([startingValue, startingValue])

  var svgBox = d3.select("body")
      .append("svg")
        .attr("width", width + margin.left + margin.right + 100)
        .attr("height", 150);

  sliderBox = svgBox
      .append("g")
        .attr("class", "slider-box")
        .attr("transform", "translate(" + 100 + ","
                                        + 40 + ")")
        .attr("height", 200)
        .attr("width", sliderPosition.width + 200)
    .call(d3.svg.axis()
      .scale(x)
      .orient("bottom")
      .tickFormat(function(d) {
        return formatDate(d);
      })
      .tickSize(0)
      .tickPadding(12)
      .tickValues([x.domain()[0], x.domain()[1]]));

  xaxis = sliderBox.append("g");

  slider = sliderBox.append("g")
      .attr("class", "slider")
      .call(brush);

  slider.selectAll(".extent,.resize")
    .remove();

  slider.select(".background")
    .attr("height", 100);

  handle = slider.append("g")
      .attr("class", "handle")

  handle.append("path")
      .attr("transform", "translate(0," + 0 + ")")
      // .attr("d", "M 0 -20 V 20")
      // .attr("transform", "translate(0," + sliderPosition.height / 2 + ")")
      .attr("d", "M 0 -10 V 10")

  handle.append('text')
    .text(formatDate(startingValue))
    .attr("transform", "translate(" + (-18) + " ," + (- 15) + ")");
    // .attr("transform", "translate(" + (-18) + " ," + (sliderPosition.height / 2 - 25) + ")");
  // dropDown = svgBox.append("g")
  //   .attr("width", 20)
  //   .attr("height", 20);

}

function buildDropDown() {
  // dropDown
  //   .append("select")
  //   .attr("class", "var-list")
  //   .attr("y", 100)
  //   .on('change', onchange);


  // var options = dropDown.selectAll("option")
  //  .data(dropDownChoices)
  //  .enter()
  //  .append("option")
  //   .text(function (d) {return d;});
  //
  // function onchange() {
  //   selectedVar = d3.select('select').property('value');
  //   newVar = dropDownVars[dropDownChoices.indexOf(selectedVar)];
  //   updatePage(newVar);
  //   // console.log(selectedVar);
  //   // console.log(newVar);
  // }
}

function updatePage(newVar) {
  buildLegend();
  queue()   // queue function loads all data asynchronously
    .defer(d3.json, "/getTotalByDay") //data for the whole world
    .await(buildGraph);
  // buildGraph('World');
  setMap();
  // console.log('reloading page');
}

//build legend using varibale specified in newVar
function buildLegend() {
  d3.select("#legend_id").remove();

  key = d3.select("body")
    .append("svg")
    .attr("id", "legend_id")
    .attr("width", w)
    .attr("height", h)
    .attr("class", "legend");

  legend = key.append("defs")
    .append("svg:linearGradient")
    .attr("id", "gradient")
    .attr("x1", "100%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "100%")
    .attr("spreadMethod", "pad");

  legend.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", highColor)
    .attr("stop-opacity", 1);

  legend.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", lowColor)
    .attr("stop-opacity", 1);

  key.append("rect")
    .attr("width", w - 100)
    .attr("height", h)
    .style("fill", "url(#gradient)")
    .attr("transform", "translate(0,10)");

  if (newVar=='Confirmed') {
    ramp = d3.scale.log().clamp(true).domain([1,maxConfirmed]).range([lowColor,highColor]).nice()
    maxVar = maxConfirmed;
  }
  else if (newVar=='Confirmed_last24h') {
    ramp = d3.scale.log().clamp(true).domain([1,maxConfirmed_last24h]).range([lowColor,highColor]).nice()
    maxVar = maxConfirmed_last24h;
  }
  else if (newVar=='Deaths') {
    ramp = d3.scale.log().clamp(true).domain([1,maxDeaths]).range([lowColor,highColor]).nice()
    maxVar = maxDeaths;
  }
  else if (newVar=='Deaths_last24h') {
    ramp = d3.scale.log().clamp(true).domain([1,maxDeaths_last24h]).range([lowColor,highColor]).nice()
    maxVar = maxDeaths_last24h;
  }

  y = d3.scale.log()
    .range([h, 0])
    .domain([1,maxVar]);

  yaxis = d3.svg.axis()
    .scale(y)
    .orient("right")
    .ticks(5)
    .tickSize(1)
    .tickFormat(function(interval, d) {
      // if ((d%10 == 6) || (d%10 == 2) || (d%10 == 0)) {
      if ((d%10 == 2)) {
        return formatLegend(interval);
      }
      else {
        return " ";
      }
    });


  key.append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(41,10)")
    .call(yaxis)
}

function buildGraph(error, totals) {
  graphData=totals;
  var	parseDateG = d3.time.format("%Y-%m").parse;

  if (newVar=='Confirmed') {
    maxVar = maxTotalConfirmed;
  }
  else if (newVar=='Confirmed_last24h') {
    maxVar = maxTotalConfirmed_last24h;
  }
  else if (newVar=='Deaths') {
    maxVar = maxTotalDeaths;
  }
  else if (newVar=='Deaths_last24h') {
    maxVar = maxTotalDeaths_last24h;
  }
  // console.log(newVar);
  // console.log(maxVar);
  var xG = d3.scale.ordinal().rangeRoundBands([0, widthG], .05);
  var yG = d3.scale.linear()
    .domain([0, maxVar])
    .range([heightG, 0]);

  var xAxisG = d3.svg.axis()
    .scale(xG)
    .orient("bottom")
    .tickFormat(function(interval, d) {
      var formatTest = d3.time.format("%d");
      if (formatTest(interval)=="01") { //only show ticks for the first of every month
        return formatDateG(interval);
      }
      else {
        return " ";
      }
    });


  var yAxisG = d3.svg.axis()
    .scale(yG)
    .orient("left")
    .ticks(10);

  if (graphNum == 1) {
    d3.select("#bar_graph").remove();

    plot = d3.select("body")
      .append("svg")
        .attr("id","bar_graph")
        .attr("width", 700)
        .attr("height", 460)
        .attr("transform", "translate(0," + 0 + ")")
        .attr("class", "graph");
  }

  // console.log(graphData);
  graphData.forEach(function(d) {
    d.Date = new Date(d.Date);
    d.Confirmed = +d.Confirmed;
    d.Confirmed_last24h = +d.Confirmed_last24h;
    d.Deaths = +d.Deaths;
    d.Deaths_last24h = +d.Deaths_last24h;
  });

  xGdomain = graphData.map(function(d) {return d.Date; });
  let lastDayG = xGdomain[xGdomain.length - 1];
  lastDayG.setDate(lastDayG.getDate() + 1);
  xGdomain.push(lastDayG);
  xG.domain(xGdomain);
  if (newVar=='Confirmed') {
    yG.domain([0, d3.max(graphData, function(d) {return d.Confirmed; })]);
  }
  else if (newVar=='Confirmed_last24h') {
    yG.domain([0, d3.max(graphData, function(d) {return d.Confirmed_last24h; })]);
  }
  else if (newVar=='Deaths') {
    yG.domain([0, d3.max(graphData, function(d) {return d.Deaths; })]);
  }
  else if (newVar=='Deaths_last24h') {
    yG.domain([0, d3.max(graphData, function(d) {return d.Deaths_last24h; })]);
  }



  tipG = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10,0])
    .html(function(d) {
      //need to find a better way to do this
      if (newVar=='Confirmed') {
        return "<span>" + formatDateToolTip(d.Date) + "<br></span>" + "<strong>" + selectedVar +":</strong> <span style='color:red'>" + d.Confirmed + "</span>";
      }
      else if (newVar=='Confirmed_last24h') {
        return "<span>" + formatDateToolTip(d.Date) + "<br></span>" + "<strong>" + selectedVar +":</strong> <span style='color:red'>" + d.Confirmed_last24h + "</span>";
      }
      else if (newVar=='Deaths') {
        return "<span>" + formatDateToolTip(d.Date) + "<br></span>" + "<strong>" + selectedVar +":</strong> <span style='color:red'>" + d.Deaths + "</span>";
      }
      else if (newVar=='Deaths_last24h') {
        return "<span>" + formatDateToolTip(d.Date) + "<br></span>" + "<strong>" + selectedVar +":</strong> <span style='color:red'>" + d.Deaths_last24h + "</span>";
      }
      else {
        return "error";
      }
    });

  plot.call(tipG);

  d3.select("#graph_title").remove();

  plot.append("text")
    .attr("id","graph_title")
    .attr("x", (widthG / 2) + 10)
    .attr("y", 15)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    // .style("text-decoration", "underline")
    .text(selectedCountry + " " + selectedVar);

  plot.append("g")
      .attr("class", "x axisG")
      .attr("transform", "translate(100," + 270 + ")")
      .call(xAxisG)
    .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", "-.55em")
      .attr("transform", "rotate(-90)");

  plot.append("g")
      .attr("class", "y axisG")
      .style("stroke-width", "1px")
      .attr("transform", "translate(100,50)")
      .call(yAxisG)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end");
      // .text("Value ($)");
  // console.log(xG.rangeBand());
  plot.selectAll("bar")
      .data(graphData)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("transform", "translate(100,50)")
      .attr("x", function(d) {return xG(d.Date); })
      .attr("width", xG.rangeBand())
      // .attr("width", 4)
      .attr("y", function(d) {
        if (newVar=='Confirmed') {
          return yG(d.Confirmed);
        }
        else if (newVar=='Confirmed_last24h') {
          return yG(d.Confirmed_last24h);
        }
        else if (newVar=='Deaths') {
          return yG(d.Deaths);
        }
        else if (newVar=='Deaths_last24h') {
          return yG(d.Deaths_last24h);
        }
        })
      .attr("height", function(d) {
        if (newVar=='Confirmed') {
          return heightG - yG(d.Confirmed);
        }
        else if (newVar=='Confirmed_last24h') {
          return heightG - yG(d.Confirmed_last24h);
        }
        else if (newVar=='Deaths') {
          return heightG - yG(d.Deaths);
        }
        else if (newVar=='Deaths_last24h') {
          return heightG - yG(d.Deaths_last24h);
        }
        })
      .on('mouseover', tipG.show)
      .on('mouseout', tipG.hide);

  // Object.entries(graphData).forEach(([key, value]) => {
  //   console.log(key + ' - ' + value) // key - value
  //
  // });

  // x.domain(data.map(function(d) {}))

}

function setMap() {
projection = d3.geo.mercator()   // define projection
  .scale(100)
  .translate([width / 2, height / 2]);

path = d3.geo.path()
    .projection(projection);

svg.append("svg")   // append a svg to hold map
  .attr("id","map")
    .attr("width", width)
    .attr("height", height);

svg.append("defs").append("path")   // add the projection path to the svg
    .datum({type: "Sphere"})
    .attr("id", "sphere")
    .attr("d", path);

svg.call(tip) //display tooltip when hovering over country
if (worldDataSaved === null) {
  loadData();  // only query database if data hasn't been loaded yet
} else {
  processData(null,worldDataSaved, countryDataSaved)
}


}

function loadData() {
queue()   // queue function loads all external data files asynchronously
  .defer(d3.json, "countries-110m.json")  // datamap geometries
  .defer(d3.json, "/countrydata") //data for each country
  .await(processData);   // once all files are loaded, call the processData function
}

function processData(error,world,countryData) {
  // console.log("OWID Data", countryData);
  // console.log({world});
  // console.log({countryData});
  worldDataSaved = world;
  countryDataSaved = countryData;
  var countries = world.objects.countries.geometries;  // path to geometries
  // console.group(countries);
  var emptyCountries = ["Somaliland","Kosovo","N. Cyprus"]  //need to remove non iso countries
  for (var i = 0; i < countries.length; i++)
  {
    if (emptyCountries.includes(countries[i].properties.name)) {
        countries.splice(i,1);
        i--;
    }
  }
  // console.log(countries);
  for (var i in countries) {    // for each geometry object
    // data_i=countryData[parseInt(countries[i].id)];
    data_i=countryData[countries[i].id];
    // console.log(parseInt(countries[i].id),countries[i]);
    for (var k in data_i) //for each day that country reported cases
    {
      if(attributeArray.indexOf(data_i[k].date.split("T")[0]) == -1) //too find max date range
      {
        attributeArray.push(data_i[k].date.split("T")[0]); //array to store all the dates
      }
      if (newVar=='Confirmed') {
        countries[i].properties[data_i[k].date.split("T")[0]] = Number(data_i[k].cases) //store the number of cases for each date in the properties of the country
      } else if (newVar=='Confirmed_last24h') {
        countries[i].properties[data_i[k].date.split("T")[0]] = Number(data_i[k].cases_last24) //store the number of cases for each date in the properties of the country
      }
      else if (newVar=='Deaths') {
        countries[i].properties[data_i[k].date.split("T")[0]] = Number(data_i[k].deaths) //store the number of cases for each date in the properties of the country
      }
      else if (newVar=='Deaths_last24h') {
        countries[i].properties[data_i[k].date.split("T")[0]] = Number(data_i[k].deaths_last24) //store the number of cases for each date in the properties of the country
      }
    }

  }
  // currentAttribute = attributeArray.indexOf(startingValue);
  // console.log(currentAttribute);
  currentAttribute = 0;
  drawMap(world);


  xaxis
    .attr("class", "x axis")
    .attr("transform", "translate(0," + 0 + ")")
    // .attr("transform", "translate(0," + (sliderPosition.height / 2) + ")")
    .call(d3.svg.axis()
      .scale(x)
      .orient("bottom")
      .tickFormat(function(d) {
        return formatDate(d);
      })
      .tickSize(0)
      .tickPadding(12)
      .tickValues(x.domain()[0], x.domain()[1]))
    .select(".domain")
    .select(function() {
      return this.parentNode.appendChild(this.cloneNode(true));
    })
    .attr("class", "halo");
    // .select(this).moveToFront();

  function brushed() {
    var value = brush.extent()[0];
    // firstDay = formatDate(parseDate(startingValue))
    if (d3.event.sourceEvent) {
      handle.select('text');
      value = x.invert(d3.mouse(this)[0]);
      brush.extent([value, value]);
    }
    currentAttribute = attributeArray.indexOf(formatDateDB(value));
    // if(currentAttribute < attributeArray.length-1) {
    //   currentAttribute +=1;  // increment the current attribute counter
    // } else {
    //   currentAttribute = 0;  // or reset it to zero
    // }
    if (currentAttribute != -1) {
      sequenceMap();
    }

    handle.attr("transform", "translate(" + x(value) + ",0)");
    handle.select('text').text(formatDate(value))
  }

  brush.on("brush", brushed);
  button.on("click", playAnimation);

  function playAnimation(){
    button.transition()
      .delay(500*4*1000)
      .duration(500*4)
      .style("opacity", 1)

    slider
      .call(brush.extent([startingValue, startingValue])) //new Date('2020-03-01'), new Date('2020-03-01')
      .call(brush.event)
    .transition()
      .ease("linear")
      // .delay(500*4)
      .duration(10000)
      .call(brush.extent([endingValue, endingValue])) //new Date('2020-03-31'), new Date('2020-03-31')
      .call(brush.event)
    .transition()
      .call(endAnimation);
  }

  function endAnimation(){
    button.transition()
      // .delay(10500*4)
      .duration(10000)
      // .duration(500*4)
      .style("opacity", 1)
  }
  // playAnimation();\
  // currentAttribute = 0;
  sequenceMap();
  // console.log(startingValue);
  // console.log(currentAttribute);
}

function drawMap(world) {

  svg.selectAll(".country")   // select country objects (which don't exist yet)
    .data(topojson.feature(world, world.objects.countries).features)  // bind data to these non-existent objects
    .enter().append("path") // prepare data to be appended to paths
    .attr("class", "country") // give them a class for styling and access later
    .attr("id", function(d) { return "code_" + d.id; }, true)  // give each a unique id for access later
    .attr("d", path); // create them using the svg path generator defined above

  d3.selectAll('.country')  // select all the countries
    .style("stroke", "#fff")
    .style("stroke-width", "1")
    .style("fill", function(d) {
      return ramp(d.properties[attributeArray[currentAttribute]])
    });
}

function sequenceMap() {
  d3.selectAll('.country')
    .on('mouseover', function(d){
      tip.show(d);
    })
    .on('mouseleave', function(d){
      tip.hide(d);
    })
    .on('click', function(d){
      selectedCountry = d.properties.name;
      // console.log(d.ID);
      queue()   // queue function loads all data asynchronously
        .defer(d3.json, "/getTotalByDay?country_code="+d.id)
        .await(buildGraph);
    })
    .transition()  //select all the countries and prepare for a transition to new values
    // .duration(500)  // give it a smooth time period for the transition
    // .attr('fill-opacity', function(d) {
    //   return getColor(d.properties[attributeArray[currentAttribute]], dataRange);  // the end color value
    // })
    .style("stroke", "#000000")
    .style("stroke-width", "1")
    .style("fill", function(d) {
      return ramp(d.properties[attributeArray[currentAttribute]])
    });

}

window.onload = getScaleData();  // load in data to scale map legend and slider
