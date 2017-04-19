function Streamgraph() {
  var n = 200, // number of layers
  m = 30, // number of samples per layer
  stack = d3.layout.stack().offset("wiggle");

  var dataArray = [];
  for(var key in countryData){
    dataArray.push(countryData[key]);
  }
  var dataNest = d3.nest()
  .key(function(d) { return d.country; })
  .entries(dataArray);

  var layers = [];
  dataNest.forEach(function(d) {
    a = [];
    d.values.forEach(function(d,i) {
      var damageValue = d.co2 + d.oil;
      var year = d.year;
      if (!isNaN(d.co2) && !isNaN(d.oil) && d.countryShort) {
        //for the visualisation the values are rooted to make the differences better visible.
        a.push({x: i, y: d.co2, y0: d.oil/200, country: d.country, countryShort: d.countryShort});
      }
    });
    if (a.length > 0) {
      layers.push(a);
    }
  });

  var width = 960,
  height = 400;

  var steam_x = d3.scale.linear()
  .domain([0, m - 1])
  .range([0, width]);

  var steam_y = d3.scale.linear()
  .domain([0, d3.max(layers, function(layers) {return d3.max(layers, function(d) { return d.y0 + d.y; }); })])
  .range([height, 0]);

  var area = d3.svg.area()
  .x(function(d) { return steam_x(m - d.x); })
  .y0(function(d) { return steam_y(d.y0); })
  .y1(function(d) { return steam_y(d.y0 + d.y); });

  var svg = d3.select(".steamGraphHolder").append("svg")
  .attr("width", width)
  .attr("height", height);

  svg.selectAll("path")
  .data(layers)
  .enter().append("path")
  .attr("d", area)
  .attr("class", function(d) { return "steam " + d[0].countryShort; })
  .style("fill", steamcolor(Math.random()))
  .style("opacity", '0.7')

  .style("stroke-width", 0)
  .on("mouseover", function() {
    d3.select(this).style("opacity", '1')
  })

  .on("mouseout", function() {
    d3.select(this).style("opacity", '0.3')
  });
}
