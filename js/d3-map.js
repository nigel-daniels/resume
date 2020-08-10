// The SVG container
var width  = 300,
    height = 172,
    active;

var color = d3.scale.ordinal().range(colorbrewer.Resume[6]);

var projection = d3.geo.mercator()
                .translate([150, 86])
                .scale(60);

var path = d3.geo.path()
    .projection(projection);

var svg = d3.select("#map").append("svg")
    .attr("width", width)
    .attr("height", height)
    .call(d3.behavior.zoom()
    .on("zoom", redraw))
    .append("g");


function redraw() {
    svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

var tooltip = d3.select("#map").append("div")
    .attr("class", "tooltip");

queue()
    .defer(d3.json, "./data/world-50m.json")
    .defer(d3.tsv, "./data/world-country-names.tsv")
    .defer(d3.json, "./data/cities.json")
    .await(ready);

function ready(error, world, names, points) {

  var countries = topojson.object(world, world.objects.countries).geometries,
      neighbors = topojson.neighbors(world, countries),
      i = -1,
      n = countries.length;

  countries.forEach(function(d) { 
    var tryit = names.filter(function(n) { return d.id == n.id; })[0];
    if (typeof tryit === "undefined"){
      d.name = "Undefined";
      console.log(d);
    } else {
      d.name = tryit.name; 
    }
  });

var country = svg.selectAll(".country").data(countries);

  country
   .enter()
    .insert("path")
    .attr("class", "country")    
      .attr("title", function(d,i) { return d.name; })
      .attr("d", path)
      .style("fill", function(d, i) { return color(d.color = d3.max(neighbors[i], function(n) { return countries[n].color; }) + 1 | 0); });

    //Show/hide tooltip
    country
      .on("mousemove", function(d,i) {
        var mouse = d3.mouse(svg.node()).map( function(d) { return parseInt(d); } );

        tooltip
          .classed("hidden", false)
          .attr("style", "left:"+(mouse[0]+25)+"px;top:"+mouse[1]+"px")
          .html(d.name)
      })
      .on("mouseout",  function(d,i) {
        tooltip.classed("hidden", true)
      });



  //render the points
  points.cities.forEach(function(d) { 
      var x = projection(d.geometry.coordinates)[0];
      var y = projection(d.geometry.coordinates)[1];

      var point = svg.append("svg:circle")
          .attr("class","map-point")
          .attr("cx", x)
          .attr("cy", y)
          .attr("r", 2)

      var name = d.properties.name;
      
      point.append('title')
      	.text(name);


  });


}