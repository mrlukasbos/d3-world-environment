var fillBarChart = function() {
  // The data.
  var co2means = [];
  var dataArray = [];
  for (var key in countryData) {
    dataArray.push(countryData[key]);
  }

  var dataNest = d3.nest()
  .key(function(d) { return d.country; })
  .entries(dataArray);

  dataNest.forEach(function(d) {
    var countryname = d.key;
    var co2values = [];
    d.values.forEach(function(d) {
      co2values.push(d.co2);
    });
    if (d.values[0].countryShort) {
      co2means.push({country: d.key, mean: d3.mean(co2values), countryShort: d.values[0].countryShort});
    }
  });

  co2means.sort(function(a, b) {
    var a = a.mean;
    var b = b.mean;
    return b - a;
  });

  // The scaling function.
  var bar_x = d3.scale.linear()
  .domain([0,55])
  .range([0, 100]);

  var co2means10 = co2means.slice(0, 10);

  var min_co2 = 0, max_co2 = 0;
  co2means10.forEach(function(d) {
    min_co2 = Math.min(d.mean, min_co2);
    max_co2 = Math.max(d.mean, max_co2);
  });

  var margin = {top: 20, right: 20, bottom: 30, left: 40},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

  var x = d3.scale.ordinal()
      .rangeRoundBands([0, width], .1);

  var y = d3.scale.linear()
      .range([height, 0]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient('bottom');

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient('left')
      .ticks(10);

  var svg = d3.select('.barchartholder').append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
    .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  co2means10.forEach(function(d) {

    x.domain(co2means10.map(function(d) { return d.country; }));
    y.domain([0, max_co2]);

    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis);

    svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis)
      .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 6)
        .attr('dy', '.71em')
        .style('text-anchor', 'end')
        .text('Average Co2 emission (metr. Tons/cap)');

    svg.selectAll('.bar')
        .data(co2means10)
      .enter().append('rect')
        .attr('class', function(d) { return 'bar ' + d.countryShort; })

        .attr('x', function(d) { return x(d.country); })
        .attr('width', x.rangeBand())
        .style('fill', '#ccc')
         .on('mouseover', function() {
           d3.select(this).style('fill', 'steelblue');
         }).on('mouseout', function() {
           d3.select(this).style('fill', '#ccc');
         })
         .attr('y', function(d) {
         return y(d.mean); })
         .attr('height', function(d) { return height - y(d.mean); });
  });
};
