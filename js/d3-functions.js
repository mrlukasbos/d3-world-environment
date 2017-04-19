//main file for D3 handling

// set resetbutton to invisible
$("#resetbtn").hide();

var countryDefaults = {};
var countryData;
var measurementItem = "co2";
var parseDate = d3.time.format("%Y").parse;

var co2mincolor = "white",
    co2maxcolor = "purple",
    elecmincolor = "white",
    elecmaxcolor = "darkred",
    oilmincolor = "white",
    oilmaxcolor = "blue",
    nodatacolor = "#ccc",
    selectioncolor = "steelblue";
var steamcolor = d3.scale.linear().range(["#444", "#ccc"]);

var createPaletteScale = function(min, max, minColor, maxColor) {
  return d3.scale.linear().domain([min, max]).range([minColor, maxColor]); // greens
}

var co2PaletteScale, elecPaletteScale, oilPaletteScale;

//this function creates an id and a data-key relationship and already some initial attrubutes.
var createProperty = function(d, data) {
  var key = d.country + d.year;
  data[key] = data[key] || { country: d.country, year: parseDate(d.year), countryShort: isoAlpha3Countries[inverseisoCountries[d.country]] };
  return key;
};

//import all three .csv files asynchronously
d3.csv("co2.csv", function(error, data1) {
  d3.csv("electricity.csv", function(error, data2) {
    d3.csv("oil.csv", function(error, data3) {
      var data = {};
      var minCo2 = 0, maxCo2 = 0, minElec = 0, maxElec = 0, minOil = 0, maxOil = 0;

      /* Here each the data from each .csv sheet is taken and is given an ID, which is countryname + date
        Then the value from the first sheet will be added to that ID.
        Then in the second and third stylesheet, if the id already exists this attribute will be appended to it,
        or a new object will be created.
      */

      data1.forEach(function(d) {
        var key = createProperty(d, data);
        data[key].co2 = d.val ? +d.val : 0;
        countryDefaults[data[key].countryShort] = { "fillColor": nodatacolor };
        minCo2 = Math.min(data[key].co2, minCo2);
        maxCo2 = Math.max(data[key].co2, maxCo2);
      });
      data2.forEach(function(d) {
        var key = createProperty(d, data);
        data[key].elec = d.val ? +d.val : 0;
        countryDefaults[data[key].countryShort] = { "fillColor": nodatacolor };
        minElec = Math.min(data[key].elec, minElec);
        maxElec = Math.max(data[key].elec, maxElec);
      });
      data3.forEach(function(d) {
        var key = createProperty(d, data);
        data[key].oil = d.val ? +d.val : 0;
        countryDefaults[data[key].countryShort] = { "fillColor": nodatacolor };
        minOil = Math.min(data[key].oil, minOil);
        maxOil = Math.max(data[key].oil, maxOil);
      });

      //define the pallete scales for in the map
      co2PaletteScale = createPaletteScale(minCo2, maxCo2/4, co2mincolor, co2maxcolor); //divide by 4 because of one enormous outlier
      elecPaletteScale = createPaletteScale(minElec, maxElec, elecmincolor, elecmaxcolor);
      oilPaletteScale = createPaletteScale(minOil, maxOil, oilmincolor, oilmaxcolor);

      //make the data global
      countryData = data;
      //create the world map
      fillMap();

      //fill line charts
      fillLineChart(".linechartholder1", "co2");
      fillLineChart(".linechartholder2", "elec");
      fillLineChart(".linechartholder3", "oil");

      //create the bar chart
      fillBarChart();

      //generate the steamgraph
      Streamgraph();

      addOnclickListeners();
      resetColors();
    });
  });
});


function addOnclickListeners() {

  d3.selectAll('.datamaps-subunit').on('click', function(info) {
    updateColors(info.id);
  });
  d3.selectAll('.line').on('click', function(info) {
    updateColors(this.id);
  });
  d3.selectAll('.bar').on('click', function(info) {
    updateColors(info.countryShort);
  });
  d3.selectAll('.steam').on('click', function(info) {
    updateColors(info[0].countryShort);
  });
}

function updateColors(country) {
  showResetButton(country);
  resetColors();

  var obj = {};
  obj[country]= selectioncolor;
  map.updateChoropleth(obj);
  var countryClass = "." + country;

  d3.selectAll(".steam").style("fill", steamcolor(Math.random())).style("opacity", 0.05).on("mouseover", function() { return null; });
  d3.selectAll(countryClass).style("fill", selectioncolor).style("opacity", 1).on("mouseout", function() { return null; });
  d3.selectAll(".line").style("fill", "none").style("opacity", 0);
  d3.selectAll(".line").style("stroke", nodatacolor).style("opacity", 0);
  d3.selectAll(countryClass).style("stroke", selectioncolor).style("opacity", 1);
  d3.selectAll(".datamaps-subunit").style("stroke", "white");
  d3.selectAll(countryClass).style("background-color", selectioncolor).style("opacity", 1);
}

function resetColors() {
  d3.selectAll(".line").style("stroke", nodatacolor).style("opacity", .3);
  setLineMarkers();
  d3.selectAll(".bar").style("fill", nodatacolor).style("stroke", nodatacolor).on("mouseout", function(d) {
    d3.select(this).style("fill", nodatacolor);

  });

  d3.selectAll(".steam")
  .style("fill", steamcolor(Math.random()))
    .style("opacity", 0.3)
    .on("mouseover", function() {
      d3.select(this).style("opacity", '1');
    }).on("mouseout", function() {
      d3.select(this).style("opacity", '0.3');
    });

  map.updateChoropleth(null, {reset: true});
  showCo2();
}

function setLineMarkers() {
  d3.selectAll("#ISL").style("stroke", "red");
  d3.selectAll("#QAT").style("stroke", "orange");
  d3.selectAll("#ARE").style("stroke", "purple");
}

function showResetButton(country) {
  d3.select("#selectedCountryText").text(isoCountries[inverseisoAlphaCountries[country]]);
  $("#resetbtn").show();
}

function resetSelection() {
  $("#resetbtn").hide();
  resetColors();
}

function updateMapLegend(dataset) {
  if (dataset === "co2") {
    d3.select("#maplegendlow").style("background-color", co2mincolor);
    d3.select("#maplegendhigh").style("background-color", co2maxcolor);
  } else if (dataset === "elec") {
    d3.select("#maplegendlow").style("background-color", elecmincolor);
    d3.select("#maplegendhigh").style("background-color", elecmaxcolor);

  } else if (dataset === "oil") {
    d3.select("#maplegendlow").style("background-color", oilmincolor);
    d3.select("#maplegendhigh").style("background-color", oilmaxcolor);
  }
  d3.select("#mapnodata").style("background-color", nodatacolor);
}
