//global vars
var selectedCountry = "World"
var newVar = 'Confirmed_last24h';
var newVar2 = 'vaccinations_last24h';
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
var dropDownChoices2 = ["Daily Vaccinations", "Total Vaccinations", "People Vaccinated", "People Fully Vaccinated"];
var dropDownVars = ["Confirmed_last24h", "Confirmed", "Deaths_last24h", "Deaths"];
var dropDownVars2 = ["vaccinations_last24h", "total_vaccinations", "people_vaccinated", "people_fully_vaccinated"];
var selectedVar = "Daily Confirmed Cases";
var selectedVar2 = "Daily Vaccinations";
var dropDown;
var dropDown2;
//legend vars
var lowColor = '#002fff'; //'#f9f9f9';
var highColor = '#bc2a66';
var w = 140, h = 500;
var maxConfirmed, maxConfirmed_last24h, maxDeaths, maxDeaths_last24h;
var maxtotal_vaccinations, maxpeople_vaccinated, maxpeople_fully_vaccinated, maxvaccinations_last24h;
var key, legend, y, yaxis;
var ramp;
var formatLegend = d3.format('.0f');
// var ticks;
//graph vars
var graph1 = true;
var graph2 = true;
var plot; //the svg for the barchart
var plot2; //the svg for the vaccine barchart
var heightG = 220;
var widthG = 550;
var formatDateG = d3.time.format("%b-%Y");
var tipG; //tooltip for barchart
var formatDateToolTip = d3.time.format("%d-%b-%Y");
var graphData;
var maxVar, maxVar2;
var maxTotalConfirmed, maxTotalConfirmed_last24h, maxTotalDeaths, maxTotalDeaths_last24h;
var maxTotaltotal_vaccinations, maxTotalpeople_vaccinated, maxTotalpeople_fully_vaccinated, maxTotalvaccinations_last24h;

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
  .defer(d3.json, "/getMax") //max value in dataset excluding world total, used to set legend scale
  .defer(d3.json, "/getTotalMax") //max world total used to set graph legend
  // .defer(d3.json, "/getTotalByDay")
  .await(dateCallback);
}
function dateCallback(error, data, maxData, maxTotals) {

  startingValue = new Date(data['First_Day'].replace(/-/g, '\/').replace(/T.+/, ''))
  endingValue = new Date(data['Last_Day'].replace(/-/g, '\/').replace(/T.+/, ''))
  endingValue.setDate(endingValue.getDate() - 1) //for d3 scale
  maxConfirmed = maxData['Confirmed']
  maxConfirmed_last24h = maxData['Confirmed_last24h']
  maxDeaths = maxData['Deaths']
  maxDeaths_last24h = maxData['Deaths_last24h']
  maxTotalConfirmed = maxTotals['Confirmed']
  maxTotalConfirmed_last24h = maxTotals['Confirmed_last24h']
  maxTotalDeaths = maxTotals['Deaths']
  maxTotalDeaths_last24h = maxTotals['Deaths_last24h']

  maxtotal_vaccinations = maxData['total_vaccinations']
  maxTotaltotal_vaccinations = maxTotals['total_vaccinations']
  maxpeople_vaccinated = maxData['people_vaccinated']
  maxTotalpeople_vaccinated = maxTotals['people_vaccinated']
  maxpeople_fully_vaccinated = maxData['people_fully_vaccinated']
  maxTotalpeople_fully_vaccinated = maxTotals['people_fully_vaccinated']
  maxvaccinations_last24h = maxData['vaccinations_last24h']
  maxTotalvaccinations_last24h = maxTotals['vaccinations_last24h']
  // ramp = d3.scale.linear().domain([0,maxConfirmed/4,2*maxConfirmed/4,3*maxConfirmed/4,maxConfirmed]).range(["#ca0020", "#f4a582", "#f7f7f7", "#92c5de", "#0571b0"]);
  ramp = d3.scale.log().clamp(true).domain([1,maxConfirmed]).range([lowColor,highColor]).nice()
  ramp2 = d3.scale.log().clamp(true).domain([1,maxtotal_vaccinations]).range([lowColor,highColor]).nice()

  buildSlider();
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
      .attr("width", 900)
      .attr("height", height + margin.top + margin.bottom + 100);

  svg1.append("text")
    .attr("id","map_title")
    .attr("x", 150)
    .attr("y", 30)
    .style("font-size", "36px")
    .text("COVID-19 Map (" + selectedVar +")")

  // svg1.append("svg")
  //   .attr("id","svgBox")
  //   .attr("width", width + margin.left + margin.right + 100)
  //   .attr("height", 150);


  dropDown = d3.select("body")
    .append("select")
    .attr("class", "var-list")
    .attr("y", 200)
    .on('change', onchange);

  dropDown2 = d3.select("body")
    .append("select")
    .attr("class", "var-list2")
    .attr("y", 200)
    .on('change', onchange2);  

  var options = dropDown.selectAll("option")
   .data(dropDownChoices)
   .enter()
   .append("option")
    .text(function (d) {return d;});

  var options2 = dropDown2.selectAll("option")
    .data(dropDownChoices2)
    .enter()
    .append("option")
     .text(function (d) {return d;});

  function onchange() {
    graph1 = true;
    selectedVar = d3.select('select.var-list').property('value');
    newVar = dropDownVars[dropDownChoices.indexOf(selectedVar)];
    selectedCountry = 'World'
    updatePage(newVar);
    }

  function onchange2() {
    graph2 = true;
    selectedVar2 = d3.select('select.var-list2').property('value');
    newVar2 = dropDownVars2[dropDownChoices2.indexOf(selectedVar2)];
    selectedCountry = 'World'
    queue()   // queue function loads all data asynchronously
      .defer(d3.json, "/getTotalByDay") //data for the whole world
      .defer(d3.json, "/getDetails")
      .await(buildGraph);
    }
  svg = svg1.append("g")
    .attr("height", 500)
    .attr("width", 900)
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  

  ////slider code
  //brush for slider
  brush = d3.svg.brush()
    .x(x)
    .extent([startingValue, startingValue])
    // .extent([endingValue, endingValue])

  // var svgBox = d3.select("body")
  //     .append("svg")
  //       // .attr("x",-200)
  //       // .attr("y", -200)
  //       // .attr("transform", "translate(" + -100 + ","
  //       //                                 + -100 + ")")
  //       .attr("width", width + margin.left + margin.right + 100)
  //       .attr("height", 150);

  //sliderBox = svgBox
  backGroundBox = svg1
      .append("rect")
      .attr("transform", "translate(" + 0 + ","
                                        + 550 + ")")
      .attr("height", 200)
      .attr("width", sliderPosition.width + 200)
      .attr("fill", "white");

  sliderBox = svg1
      .append("g")
        .attr("class", "slider-box")
        .attr("transform", "translate(" + 100 + ","
                                        + 590 + ")")
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
      .attr("d", "M 0 -10 V 10")

  handle.append('text')
    .text(formatDate(startingValue))
    .attr("transform", "translate(" + (-18) + " ," + (- 15) + ")");

  button = d3.select("body").append("button")
    .attr("class", "play")
    .text("Play")
}

function updatePage(newVar) {
  buildLegend();
  queue()   // queue function loads all data asynchronously
    .defer(d3.json, "/getTotalByDay") //data for the whole world
    .defer(d3.json, "/getDetails")
    .await(buildGraph);
  setMap();
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

  if(newVar2=='total_vaccinations') {
    ramp2 = d3.scale.log().clamp(true).domain([1,maxtotal_vaccinations]).range([lowColor,highColor]).nice()
    maxVar2 = maxtotal_vaccinations;
  }
  else if(newVar2=='vaccinations_last24h') {
    ramp2 = d3.scale.log().clamp(true).domain([1,maxvaccinations_last24h]).range([lowColor,highColor]).nice()
    maxVar2 = maxvaccinations_last24h;
  }
  else if(newVar2=='people_fully_vaccinated') {
    ramp2 = d3.scale.log().clamp(true).domain([1,maxpeople_fully_vaccinated]).range([lowColor,highColor]).nice()
    maxVar2 = maxpeople_fully_vaccinated;
  }
  else if(newVar2=='people_vaccinated') {
    ramp2 = d3.scale.log().clamp(true).domain([1,maxpeople_vaccinated]).range([lowColor,highColor]).nice()
    maxVar2 = maxpeople_vaccinated;
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
        return Intl.NumberFormat().format(interval);
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

function buildGraph(error, totals, details) {
  graphData=totals;
  countryDetails = details;
  const population = Intl.NumberFormat().format(countryDetails[0].population);
  // var	parseDateG = d3.time.format("%Y-%m").parse;

  if(graph1){
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
  }
  if(graph2){
    if (newVar2=='total_vaccinations') {
      maxVar2 = maxTotaltotal_vaccinations;
    }
    else if (newVar2=='vaccinations_last24h') {
      maxVar2 = maxTotalvaccinations_last24h
    }
    else if (newVar2=='people_fully_vaccinated') {
      maxVar2 = maxTotalpeople_fully_vaccinated
    }
    else if (newVar2=='people_vaccinated') {
      maxVar2 = maxTotalpeople_vaccinated
    }
  }
  // console.log(newVar);
  // console.log(maxVar);
  var xG = d3.scale.ordinal().rangeRoundBands([0, widthG], .05);
  var yG = d3.scale.linear()
    .domain([0, maxVar])
    .range([heightG, 0]);

  var xG2 = d3.scale.ordinal().rangeRoundBands([0, widthG], .05);
  var yG2 = d3.scale.linear()
    .domain([0, maxVar2])
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

  var xAxisG2 = d3.svg.axis()
    .scale(xG2)
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
  
  var yAxisG2 = d3.svg.axis()
    .scale(yG2)
    .orient("left")
    .ticks(10);

  if (graph1) {
    d3.select("#bar_graph").remove();

    plot = d3.select("body")
      .append("svg")
        .attr("id","bar_graph")
        .attr("width", 700)
        .attr("height", 460)
        .attr("transform", "translate(0," + -70 + ")")
        .attr("class", "graph");
  }
  if (graph2) {
    d3.select("#bar_graph2").remove();

    plot2 = d3.select("body")
      .append("svg")
        .attr("id","bar_graph2")
        .attr("width", 700)
        .attr("height", 460)
        .attr("transform", "translate(0," + 300 + ")")
        .attr("class", "graph");
  }
  graph1 = false;
  graph2 = false;

  // console.log(graphData);
  graphData.forEach(function(d) {
    d.Date = new Date(d.Date.replace(/-/g, '\/'));
    d.Confirmed = +d.Confirmed;
    d.Confirmed_last24h = +d.Confirmed_last24h;
    d.Deaths = +d.Deaths;
    d.Deaths_last24h = +d.Deaths_last24h;
    d.total_vaccinations = +d.total_vaccinations;
    d.vaccinations_last24h = +d.vaccinations_last24h;
    d.people_fully_vaccinated = +d.people_fully_vaccinated;
    d.people_vaccinated = +d.people_vaccinated;
  });

  // xGdomain = graphData.map(function(d) {return d.Date; });
  // console.log(xGdomain[474]);
  // let lastDayG = xGdomain[xGdomain.length - 1];
  // lastDayG.setDate(lastDayG.getDate() + 1);
  // xGdomain.push(lastDayG);
  // xG.domain(xGdomain);
  xG.domain(graphData.map(function(d) {return d.Date; }));
  xG2.domain(graphData.map(function(d) {return d.Date; }));
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

  if (newVar2=='total_vaccinations') {
    yG2.domain([0, d3.max(graphData, function(d) {return d.total_vaccinations; })]);
  }
  else if (newVar2=='vaccinations_last24h') {
    yG2.domain([0, d3.max(graphData, function(d) {return d.vaccinations_last24h; })]);
  }
  else if (newVar2=='people_fully_vaccinated') {
    yG2.domain([0, d3.max(graphData, function(d) {return d.people_fully_vaccinated; })]);
  }
  else if (newVar2=='people_vaccinated') {
    yG2.domain([0, d3.max(graphData, function(d) {return d.people_vaccinated; })]);
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
  // plot2.call(tipG);

  d3.select("#graph_title").remove();
  d3.select("#graph_title2").remove();
  d3.select("#map_title").remove();

  svg1.append("text")
    .attr("id","map_title")
    .attr("x", 150)
    .attr("y", 30)
    .style("font-size", "36px")
    .text("COVID-19 Map (" + selectedVar +")")

  plot.append("text")
    .attr("id","graph_title")
    .attr("x", (widthG / 2) + 10)
    .attr("y", 15)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    // .style("text-decoration", "underline")
    .text(selectedCountry + " " + selectedVar + " (Population " + population + " )");

    //vaccine graph
    plot2.append("text")
    .attr("id","graph_title2")
    .attr("x", (widthG / 2) + 10)
    .attr("y", 15)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .text(selectedCountry + " " + selectedVar2 + " (Population " + population + " )");

  plot.append("g")
      .attr("class", "x axisG")
      .attr("transform", "translate(100," + 270 + ")")
      .call(xAxisG)
    .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", "-.55em")
      .attr("transform", "rotate(-90)");

  //vaccine graph
  plot2.append("g")
      .attr("class", "x axisG2")
      .attr("transform", "translate(100," + 270 + ")")
      .call(xAxisG2)
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

  plot2.append("g")
      .attr("class", "y axisG2")
      .style("stroke-width", "1px")
      .attr("transform", "translate(100,50)")
      .call(yAxisG2)
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

  plot2.selectAll("bar")
      .data(graphData)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("transform", "translate(100,50)")
      .attr("x", function(d) {return xG2(d.Date); })
      .attr("width", xG2.rangeBand())
      // .attr("width", 4)
      .attr("y", function(d) {
        if (newVar2=='total_vaccinations') {
          return yG2(d.total_vaccinations);
        }
        else if (newVar2=='vaccinations_last24h') {
          return yG2(d.vaccinations_last24h);
        }
        else if (newVar2=='people_fully_vaccinated') {
          return yG2(d.people_fully_vaccinated);
        }
        else if (newVar2=='people_vaccinated') {
          return yG2(d.people_vaccinated);
        }
        })
      .attr("height", function(d) {
        if (newVar2=='total_vaccinations') {
          return heightG - yG2(d.total_vaccinations);
        }
        else if (newVar2=='vaccinations_last24h') {
          return heightG - yG2(d.vaccinations_last24h);
        }
        else if (newVar2=='people_fully_vaccinated') {
          return heightG - yG2(d.people_fully_vaccinated);
        }
        else if (newVar2=='people_vaccinated') {
          return heightG - yG2(d.people_vaccinated);
        }
        });
        

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
  button.on("click", playAnimation.bind(null, 30000));

  function playAnimation(timeD){
    button
      // .transition()
      // // .delay(500*4*1000)
      // .duration(50)
      .style("opacity", 0)

    slider
      .call(brush.extent([startingValue, startingValue])) //new Date('2020-03-01'), new Date('2020-03-01')
      .call(brush.event)
    .transition()
      .ease("linear")
      // .delay(500*4)
      .duration(timeD)
      .call(brush.extent([endingValue, endingValue])) //new Date('2020-03-31'), new Date('2020-03-31')
      .call(brush.event)
    .transition()
      .call(endAnimation);
  }

  function endAnimation(){
    button
      // .transition()
      // // .delay(10500*4)
      // .duration(10000)
      // // .duration(500*4)
      .style("opacity", 1)
  }
  // playAnimation();\
  // currentAttribute = 0;
  sequenceMap();
  // playAnimation(300);
  
  
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
      // console.log(d.id);
      graph1 = true;
      graph2 = true;
      queue()   // queue function loads all data asynchronously
        .defer(d3.json, "/getTotalByDay?country_code="+d.id)
        .defer(d3.json, "/getDetails?country_code="+d.id)
        .await(buildGraph);
    })
    .transition()  //select all the countries and prepare for a transition to new values
    .duration(100)  // give it a smooth time period for the transition
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
