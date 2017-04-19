
var fillLineChart = function(selector, valueIndicator) {

  function getVal(d) {
    if (valueIndicator === "co2") {
      return d.co2;
    } else if (valueIndicator === "elec") {
      return d.elec;
    } else if (valueIndicator === "oil") {
      return d.oil;
    }
  }

  //convert the object to an array
  var dataArray = [];
  for(var key in countryData){
    dataArray.push(countryData[key]);
  }

  var margin = {top: 30, right: 30, bottom: 30, left: 60},
  width = 360 - margin.left - margin.right,
  height = 300 - margin.top - margin.bottom;

  // Set the ranges
  var x = d3.time.scale().range([0, width]);
  var y = d3.scale.linear().range([height, 0]);


  // Define the axes
  var xAxis = d3.svg.axis().scale(x)
  .orient("bottom").ticks(5);

  var yAxis = d3.svg.axis().scale(y)
  .orient("left").ticks(6);

  // Define the line
  var beginLine = d3.svg.line()
  .x(function(d) { return x(d.year); })
  .y(function(d) { return height; });

  // Define the line
  var emissionline = d3.svg.line()
  .x(function(d) { return x(d.year); })
  .y(function(d) {return y(getVal(d)); });

  var tooltip = d3.select(selector).append("div")
  .attr("class", "tooltip")
  .style("opacity", 0)
  .html("-");

  // Adds the svg canvas
  var svg = d3.select(selector)
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform",
  "translate(" + margin.left + "," + margin.top + ")");

  x.domain(d3.extent(dataArray, function(d) { return (d.year); }));
  y.domain(d3.extent(dataArray, function(d) { return getVal(d); }));

  var dataNest = d3.nest()
  .key(function(d) { return d.country; })
  .entries(dataArray);
  var color = d3.scale.category20();  // set the colour scale

  // Loop through each country / key
  dataNest.forEach(function(d) {
    //only display line if it is a country (the dataset contains also non-country stuff)
    //this way we also keep the graph a bit cleaner
    if (d.values[0].countryShort) {
      d.values.sort(compareDates);
      function compareDates(a, b) {
        return a.year.getTime() - b.year.getTime();
      }
      svg.append("path")
      .attr("class", "line " + d.values[0].countryShort)
      .attr("id", d.values[0].countryShort)
      .style("stroke", "#ccc")
      .style("opacity", .3)
      .attr("d", beginLine(d.values))
      .on("mouseover", function() {
        d3.select(this)
        .style("opacity", '1')
        .style("stroke", "lightgreen");
        tooltip.transition()
        .duration(200)
        .style("opacity", 1);
        tooltip.html(d.key);
      })
      .on("mouseout", function(d) {
        d3.select(this).style("opacity", ".3")
        .style("stroke", "#ccc");

        tooltip.transition()
        .duration(500)
        .style("opacity", 0);
      })
      .transition()
      .delay(100)
      .duration(1000)
      .attr("d", emissionline(d.values))
    }
  });

  // Add the X Axis
  svg.append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0," + height + ")")
  .call(xAxis);

  // Add the Y Axis
  svg.append("g")
  .attr("class", "y axis")
  .call(yAxis);
}
