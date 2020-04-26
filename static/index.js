//globals
var projection, path, graticule, svg, attributeArray = [], currentAttribute, playing = false;
var margin = {
  top: 150,
  right:10,
  bottom:10,
  left: 10
},
width = 960 - margin.left - margin.right + 1000,
height = 550 - margin.bottom - margin.top,
sliderPosition = {top: height - 50, left: width / 2 + 10,
                  height:40, width: width - 100},
mapTranslate = [480, 400];
formatDate = d3.time.format("%b-%d")
formatDateDB = d3.time.format("%Y-%m-%d")
var startingValue, endingValue;
parseDate = d3.time.format("%Y-%m-%d").parse
var handle, slider, sliderBox, brush, button, svg, x, xaxis
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
var plot;
//Tool tips to see data
var format = d3.format(",");

var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function(d) {
    return "<strong>" + d.properties.name + "</strong>";
    // return "<strong>Country: </strong><span class='details'>" + d.properties.name + "<br></span>" + "<strong>Confirmed Cases: </strong><span class='details'>" + format(d.properties[attributeArray[currentAttribute]]) + "</span>";
  })


var firstDay, lastDay;
function getScaleData(){
queue()   // queue function loads all data asynchronously
  .defer(d3.json, "/dateRange") //range of dates we're working with
  .defer(d3.json, "/getMax") //max value in dataset, used to set legend scale
  .defer(d3.json, "/getTotalByDay")
  .await(dateCallback);
}
function dateCallback(error, data, maxData, totals) {
  startingValue = new Date(data['First_Day'])
  endingValue = new Date(data['Last_Day'])
  maxConfirmed = maxData['Confirmed']
  maxConfirmed_last24h = maxData['Confirmed_last24h']
  maxDeaths = maxData['Deaths']
  maxDeaths_last24h = maxData['Deaths_last24h']
  // ramp = d3.scale.linear().domain([0,maxConfirmed/4,2*maxConfirmed/4,3*maxConfirmed/4,maxConfirmed]).range(["#ca0020", "#f4a582", "#f7f7f7", "#92c5de", "#0571b0"]);
  ramp = d3.scale.log().clamp(true).domain([1,maxConfirmed]).range([lowColor,highColor]).nice()
  buildSlider();
  buildLegend();
  buildGraph(totals,'World');
  setMap();
}


function buildSlider() {
  //scale for slider
  x = d3.time.scale()
    .domain([startingValue,endingValue])
    .range([0, sliderPosition.width])//
    .clamp(true);

  svg = d3.select("body").append("svg")
      .attr("width", width + margin.left + margin.right + 100)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  button = d3.select("body").append("button")
    .attr("class", "play")
    .text("Start")

  ////slider code
  //brush for slider
  brush = d3.svg.brush()
    .x(x)
    .extent([startingValue, startingValue])

  sliderBox = d3.select("body")
      .append("svg")
        .attr("width", width + margin.left + margin.right + 100)
        .attr("height", 150)
      .append("g")
  // sliderBox = svg.append("g")
        .attr("class", "slider-box")
        .attr("transform", "translate(" + 100 + ","
                                        + 40 + ")")
      // .attr("height", sliderPosition.height)
        .attr("height", 200)
        .attr("width", sliderPosition.width + 200)
        // .selectAll(".tick line")
        // .attr("transform", "translate(15,0)")
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

}

function buildLegend() {
  key = d3.select("body")
    .append("svg")
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

  y = d3.scale.log()
    .range([h, 0])
    .domain([1,maxConfirmed]);

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

function buildGraph(graphData, name)
{

    // console.log("building graph using " + data);
  var	parseDateG = d3.time.format("%Y-%m").parse;

  var xG = d3.scale.ordinal().rangeRoundBands([0, width], .05);
  var yG = d3.scale.linear().range([height, 0]);

  var xAxisG = d3.svg.axis()
    .scale(xG)
    .orient("bottom");
    // .tickFormat(d3.format("d"));

  var yAxisG = d3.svg.axis()
    .scale(yG)
    .orient("left")
    .ticks(10);

  plot = d3.select("body")
    .append("svg")
    .attr("width", 1800)
    .attr("height", 600)
    .attr("class", "graph");


  // console.log(graphData);
  graphData.forEach(function(d) {
    d.Date = d.Date;
    d.Confirmed = +d.Confirmed;
  });

  xG.domain(graphData.map(function(d) {return d.Date; }));
  yG.domain([0, d3.max(graphData, function(d) {return d.Confirmed; })]);

  plot.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(150," + 400 + ")")
      .call(xAxisG)
    .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", "-.55em")
      .attr("transform", "rotate(-90)");

  plot.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(150,0)")
      .call(yAxisG)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end");
      // .text("Value ($)");

  plot.selectAll("bar")
      .data(graphData)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("transform", "translate(300,0)")
      .attr("x", function(d) {return xG(d.Date); })
      .attr("width", xG.rangeBand())
      .attr("y", function(d) { return yG(d.Confirmed);})
      .attr("height", function(d) { return height - yG(d.Confirmed); });

  // Object.entries(graphData).forEach(([key, value]) => {
  //   console.log(key + ' - ' + value) // key - value
  //
  // });

  // x.domain(data.map(function(d) {}))

}

function setMap() {
  // svg = d3.select("body").append("svg")
  //     .attr("width", width + margin.left + margin.right + 100)
  //     .attr("height", height + margin.top + margin.bottom + 100)
  //   .append("g")
  //     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// width = 960, height = 580;  // map width and height, matches

projection = d3.geo.mercator()   // define our projection with parameters
  .scale(100)
  .translate([width / 2, height / 2]);

path = d3.geo.path()  // create path generator function
    .projection(projection);  // add our define projection to it

graticule = d3.geo.graticule(); // create a graticule

svg.append("svg")   // append a svg to our html div to hold our map
    .attr("width", width)
    .attr("height", height);

svg.append("defs").append("path")   // prepare some svg for outer container of svg elements
    .datum({type: "Sphere"})
    .attr("id", "sphere")
    .attr("d", path);

// svg.append("use")   // use that svg to style with css
//     .attr("class", "stroke")
//     .attr("xlink:href", "#sphere");
//
// svg.append("path")    // use path generator to draw a graticule
//     .datum(graticule)
//     .attr("class", "graticule")
//     .attr("d", path);
svg.call(tip)
loadData();  // let's load our data next

}

function loadData() {
queue()   // queue function loads all external data files asynchronously
  .defer(d3.json, "countries-110m.json")  // datamap geometries
  .defer(d3.json, "/countrydata") //data for each country
  .await(processData);   // once all files are loaded, call the processData function
}

function processData(error,world,countryData) {
  // console.log("WHO Data", countryData);


  var countries = world.objects.countries.geometries;  // path to geometries

  var emptyCountries = ["Somaliland","Kosovo","N. Cyprus"]  //need to remove non iso countries
  for (var i = 0; i < countries.length; i++)
  {
    if (emptyCountries.includes(countries[i].properties.name)) {
        countries.splice(i,1);
        i--;
    }
  }
  for (var i in countries) {    // for each geometry object
    data_i=countryData[parseInt(countries[i].id)];

    for (var k in data_i) //for each day that country reported cases
    {
      if(attributeArray.indexOf(data_i[k].date.split("T")[0]) == -1) //too find max date range
      {
        attributeArray.push(data_i[k].date.split("T")[0]); //array to store all the dates
      }
      countries[i].properties[data_i[k].date.split("T")[0]] = Number(data_i[k].cases) //store the number of cases for each date in the properties of the country
    }

  }
  currentAttribute = attributeArray.indexOf(startingValue);

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

  playAnimation();
}

function drawMap(world) {

  svg.selectAll(".country")   // select country objects (which don't exist yet)
    .data(topojson.feature(world, world.objects.countries).features)  // bind data to these non-existent objects
    .enter().append("path") // prepare data to be appended to paths
    .attr("class", "country") // give them a class for styling and access later
    .attr("id", function(d) { return "code_" + d.id; }, true)  // give each a unique id for access later
    .attr("d", path); // create them using the svg path generator defined above

  // var dataRange = getDataRange(); // get the min/max values from the current year's range of data values
  d3.selectAll('.country')  // select all the countries
  // .attr('fill-opacity', function(d) {
  //     return getColor(d.properties[attributeArray[currentAttribute]], dataRange);
  // });
    .style("stroke", "#fff")
    .style("stroke-width", "1")
    .style("fill", function(d) {
      // console.log(ramp(d.properties[attributeArray[currentAttribute]]));
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
