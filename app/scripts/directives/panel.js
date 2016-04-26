'use strict';

angular.module('cstateApp')
    .directive('panel', function() {
        return {
            scope: {
                data: '=geneData',
                // region: '=geneRegion',
                cell: '=cell',
                width: '=width',
                ticks: '=ticks',
                zoomed: '=zoomed',
                features: '=features',
                selectedpattern: '=selectedpattern'
            },
            restrict: 'EA',
            transclude: true,
            link: function postLink(scope, element, attrs) {
                //width = 350,
                var width = 1300;
                if(!scope.zoomed) width=scope.width[0].value;
                var height = 120,
                    padding = 20,
                    availableHeight = height - padding,
                    barHeight = 0.6 * availableHeight / _.size(scope.features),
                    marksRegionHeight = scope.zoomed ? 0.75 * availableHeight : 0.85 * availableHeight; //gaurs: in the unzoomed view we don't need to show the exons so can make the features come close to the gene band

                if (barHeight>10) {barHeight=10};
                var colorScale;
                _.size(scope.features)>10?colorScale = d3.scale.category20() : colorScale = d3.scale.category10() ;
                // domain = _.uniq(_.pluck(csv,"Feature")).sort();
                colorScale.domain(scope.features);
                var formatValue = d3.format("");

                var x = d3.scale.linear()
                    .domain([scope.data[0].RegionStart,scope.data[0].RegionStop])
                    // .domain([scope.region[0].RegionStartWrtTSS, scope.region[0].RegionStopWrtTSS])
                    .range([10, width - 10]);

                var y = d3.scale.ordinal()
                    .domain(scope.features)
                    .rangeBands([0,marksRegionHeight]);

                var zoom = d3.behavior.zoom()
                    .scaleExtent([scope.data[0].RegionStart- scope.data[0].RegionStop, scope.data[0].RegionStop - scope.data[0].RegionStart])
                    .x(x)
                    .on("zoom", zoomHandler);

                var chartRoot = d3.select(element[0]).append("svg")
                    .attr("width", width)
                    .attr("height", height)
                    .attr("class", "svgClass")
                    .call(zoom);

                var chart = chartRoot.append("g");

                // var dispatch = d3.dispatch("myzoom");

                if(scope.zoomed) dispatch.on("reset_zoom_all."+scope.cell,
                    function() {
                        resetZoom();
                    });

                if(scope.zoomed) dispatch.on("zoom_all."+scope.cell,
                    function(zoomScale,zoomTranslate) {
                        zoomHandlerAll(zoomScale,zoomTranslate);
                    });

                var resetZoom = function(){
                     //zoom.x(x.domain([scope.region[0].RegionStartWrtTSS, scope.region[0].RegionStopWrtTSS]))
                     zoom.x(x.domain([scope.data[0].RegionStart, scope.data[0].RegionStop]))
                    .scale(1)
                    .translate([0, 0]);

                    chart.transition().duration(50).attr('transform', 'translate(' + zoom.translate() + ') scale(' + zoom.scale() + ')');
                    chartRoot.select("g.x-axis").call(xAxis);
                    // dispatch.on("zoom", function() {zoomHandler();});
                };

                var xAxis = d3.svg.axis()
                    .scale(x)
                    .orient("bottom")
                    .tickSize(-height, 0)
                    .tickFormat(function(d) {
                        return d3.round(d/1000,4);
                    });
                if (scope.zoomed == 0) {xAxis.ticks(5);};

                var xAxisElement = chartRoot.append("g")
                    .attr("class", "x-axis") //Assign "x axis" class
                    .attr("transform", "translate(0," + (height - padding) + ")")
                    .call(xAxis);

                var patternsBox ;

                if (scope.data.selectedPatterns && scope.zoomed == 1){
                    patternsBox = chart.selectAll("patterns")
                    .data(_.values(scope.data.selectedPatterns))
                    .enter().append("g")
                    .attr("transform", function(d, i) {
                        return "translate(" + (x(d.FeatureStart)-5) + "," + y(d.Feature) + ")";
                    });

                    patternsBox.append("rect")
                    .attr("width", function(d, i) {
                        return x(d.FeatureStop) - x(d.FeatureStart) + 10;
                    })
                    .attr("height",  barHeight +5)
                    .style("fill", "#dcdcdc")
                    // .style("stroke","black")
                }

                var bar = chart.selectAll("bar")
                    .data(
                        scope.data.filter(function(el){
                            if(el.FeatureStart == "-" || (scope.zoomed==0 && el.Feature=="exon"))
                            {return false;}
                            else
                            {return true;}}
                        )
                    )
                    .enter().append("g")
                    .attr("transform", function(d, i) {
                        return "translate(" + x(d.FeatureStart) + "," + y(d.Feature) + ")";
                    });

                if(bar){
                bar.append("rect")
                    .attr("width", function(d, i) {
                        return x(d.FeatureStop) - x(d.FeatureStart)
                    })
                    .attr("height", barHeight - 1)
                    .attr("opacity", function(d) {
                        return d.PeakIntensity && d.PeakIntensity > 1 ? d.PeakIntensity/1000 : 1;
                    })
                    .style("fill", function(d, i) {
                        return colorScale(d.Feature);
                    });

                bar.append("svg:title")
                    .text(function(d) { return d.PeakIntensity? "Intensity = "+d.PeakIntensity:"NA"; });
                };



                // function for handling zoom event triggered by self
                function zoomHandler() {
                    //zoom.scale(zoom.scale());
                    chart.attr("transform", "translate(" + d3.event.translate[0] + ",0" + ") scale(" + d3.event.scale + ",1)");
                    chartRoot.select("g.x-axis").call(xAxis);
                    dispatch.zoom_all(zoom.scale(),zoom.translate());
                }

                // function for handling zoom event triggered by some other component
                function zoomHandlerAll(zoomScale,zoomTranslate) {
                    zoom.scale(zoomScale);
                    zoom.translate(zoomTranslate);
                    chart.attr("transform", "translate(" + d3.event.translate[0] + ",0" + ") scale(" + zoomScale + ",1)");
                    // zoom.event(chartRoot);
                    chartRoot.select("g.x-axis").call(xAxis);
                }

                var regionBar = chart.append("g")
                    .attr("transform", "translate("+x(scope.data[0].RegionStart)+","+0.75*availableHeight+")");
                    // .attr("transform", "translate(" + x(scope.region[0].RegionStartWrtTSS) + "," + 0.75 * availableHeight + ")");


                regionBar.append("rect")
                .attr("width",x(scope.data[0].RegionStop) - x(scope.data[0].RegionStart))
                // .attr("width", x(scope.region[0].RegionStopWrtTSS) - x(scope.region[0].RegionStartWrtTSS))
                .attr("height", barHeight / 2)
                .style("fill", "red");

                var geneBar = chart.append("g")
                    .attr("transform", "translate(" + x(scope.data[0].GeneStart) + "," + 0.75 * availableHeight + ")");

                //if (scope.region[0].Orientation == "+") {
                geneBar.append("rect")
                    .attr("width", x(scope.data[0].GeneStop) - x(scope.data[0].GeneStart))
                    .attr("height", barHeight)
                    .style("fill", "black");
                //};


            }
        };
    });
