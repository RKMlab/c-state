'use strict';

angular.module('cstateApp')
  .directive('legend', function () {
    return {
    		scope: {
               features: '=features',
               status: '=status'
            },
            restrict: 'EA',
            transclude: false,
            link: function postLink(scope, element, attrs) {


            scope.$watch('features', function(){
            	var width = 1450,
            	height = 40;
            	if (scope.features  && _.size(scope.features)>0) {
	            	var colorScale;
	            	 _.size(scope.features)>10?colorScale = d3.scale.category20() : colorScale = d3.scale.category10() ;
	            	colorScale.domain(scope.features);

	            	//if legend already has a SVG node, first remove it
	            	d3.select(element[0]).select("svg").remove();
	            	// add legend
	            	var legend = d3.select(element[0]).append("svg")
	            	  .attr("height", height)
	            	  .attr("width", width)
	            	  .attr("class","svgLegendClass")
	            	  .append("g")
	            	  .attr('transform', 'translate(0,10)');

	            	legend.selectAll('rect')
	            	  .data(colorScale.domain())
	            	  .enter()
	            	  .append("rect")
	            	  .attr("x", function(d, i){ return i * 100 + 80;})
	            	  .attr("y",20)
	            	  .attr("width", 10)
	            	  .attr("height", 10)
	            	  .style("fill", function(d) {
	            	      var color = colorScale(d);
	            	      return color;
	            	    });

	            	legend.selectAll('text')
	            	  .data(colorScale.domain())
	            	  .enter()
	            	  .append("text")
	            	  .attr("x", function(d, i){return i * 100 + 92;})
	            	  .attr("y",30)
	            	  .attr("fill",function(d,i) {return colorScale(d);})
	            	  .text(function(d) {
	            	    var text = d;
	            	    return text;
	            	  }).style("font-size","small");

					legend.append("rect")
	            	  .attr("x", 80)
	            	  .attr("y", 0)
	            	  .attr("width", 10)
	            	  .attr("height", 10)
	            	  .style("fill", "black");

					legend.append("text")
  	            	  .text("Gene Body")
  	            	  .attr("x",92)
  	            	  .attr("y",10)
  	            	  .style("font-size","small");

  					legend.append("rect")
  	            	  .attr("x", 180)
  	            	  .attr("y", 0)
  	            	  .attr("width", 10)
  	            	  .attr("height", 10)
  	            	  .style("fill", "#666666");

				    legend.append("text")
	            	  .text("Gene Flanks")
	            	  .attr("x", 192)
	            	  .attr("y",10)
					  .attr("fill", "#666666")
	            	  .style("font-size","small");

				    legend.append("text")
	            	  .text("Scale in KB")
	            	  .attr("x",1350)
	            	  .attr("y",20)
					  .attr("font-weight", "")
	            	  .style("font-size","small");



	            	legend.append("text")
	            	  .text("Legend")
	            	  .attr("x",10)
	            	  .attr("y",20)
					  .style("font-weight", "bold")
	            	  .style("font-size","small");

	            	console.log('multi',scope.features);}
            	});


            }
        };
  });
