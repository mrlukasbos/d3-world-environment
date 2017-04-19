//here an interactive world map will be created


var map = new Datamap({
  element: document.getElementById('mapholder'),
  fills: { defaultFill: nodatacolor },
  geographyConfig: {
     highlightOnHover: false,
    popupTemplate: function(geo, data) {
      // don't show tooltip if country don't present in dataset
      if (isNaN(data.co2) && isNaN(data.elec) && isNaN(data.oil) || !data) {
        return '<div class="hoverinfo"><strong>' +
        geo.properties.name +
        '</strong><br> No data found</div>';
      }

      // tooltip content
      return '<div class="hoverinfo"><strong>' +
      geo.properties.name +
      '</strong><br>CO₂-emission: ' +
      d3.round(data.co2, 3)  + ' metric tons per capita<br>Electricity use: ' +
      d3.round(data.elec, 3) + ' kilowatt hour per capita<br>Oil use: ' +
      d3.round(data.oil, 3) + ' liters </div>';
    }
  }
});



//function to fill the world map
var fillMap = function () {
  var yearValue = document.getElementById('yearinput').value; //get the year from the slider
  d3.select('#year').text(yearValue); //set the text to indicate which year is selected
  var year = parseDate(yearValue).getTime();

  var country = JSON.parse(JSON.stringify(countryDefaults));
  for(var key in countryData){
    var values = countryData[key];

    if(values.year.getTime() == year) {
      country[values.countryShort] = values;
      if (measurementItem === "co2") {
        if (isNaN(values.co2)) {
          country[values.countryShort].fillColor = "#ccc";
        } else {
          country[values.countryShort].fillColor = co2PaletteScale(values.co2);

        }
      } else if (measurementItem === "elec") {
        if (isNaN(values.elec)) {
          country[values.countryShort].fillColor = "#ccc";

        } else {
        country[values.countryShort].fillColor = elecPaletteScale(values.elec);
      }
      } else if (measurementItem === "oil") {
        if (isNaN(values.oil)) {
          country[values.countryShort].fillColor = nodatacolor;
        } else {
        country[values.countryShort].fillColor = oilPaletteScale(values.oil);
      }
      }
    }
  }
  map.updateChoropleth(country);
}

var changeValues = function () {
  fillMap();
}


var togglePagination = function(makeActive) {
  d3.selectAll(".togglebtn").classed("active", false);
  d3.select(makeActive).classed("active", true);
}

var showCo2 = function() {
  measurementItem = "co2";
  fillMap();
  d3.select("#title").text("Amount of CO₂ emission per country in metric tons per capita");
  togglePagination("#co2button");
  updateMapLegend(measurementItem);
}

var showOil = function() {
  measurementItem = "oil";
  fillMap();
  d3.select("#title").text("Amount of oil per country in kg per capita");
  togglePagination("#oilbutton");
  updateMapLegend(measurementItem);
}

var showElectricity = function() {
  measurementItem = "elec";
  fillMap();
  d3.select("#title").text("Amount of electricity used per country in KwH per capita");
  togglePagination("#elecbutton");
  updateMapLegend(measurementItem);
}
