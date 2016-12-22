'use strict';

const myLegend = Vue.component('my-legend', {
  template: '#legend-template',
  props: {
    loc: {
      type: String,
      default: 'mainpanel',
      required: true
    }
  },
  data: function () {
    return {
      settings: '',
      info: '',
    }
  },
  mounted: function () {
    if (this.loc === 'mainpanel') {
      this.settings = plotScope.settings.mainPanel;
    }
    if (this.loc === 'geneModal') {
      this.settings = plotScope.settings.geneModal;
      if (this.settings.sameColors) {
        this.settings = plotScope.settings.mainPanel;
      }
    }
    this.info = plotScope.info;
    const rootElement = this.$el;
    const colors = plotScope.settings.general.colors;
    const features = this.info.features;
    const numFeatures = features.length;
    const featurePerRow = 5;
    const panelWidth = 100 + (featurePerRow * 150);
    const VPadding = 5;
    const panelHeight = (VPadding * 3) + 10 + ((Math.floor(numFeatures/featurePerRow) + 1) * (10 + VPadding));

    const geneBarColor = this.settings.geneBarColor;
    const regionBarColor = this.settings.regionBarColor;
    const neighborBarColor = this.settings.neighborBarColor;
    const featureNames = _.map(features, 'name');
    const colorScale = d3.scaleOrdinal(colors);
    colorScale.domain(featureNames);

    d3.select(rootElement).select("svg").remove() // Remove previous legend if any
    const chartRoot = d3.select(rootElement).append("svg")
      .attr("width", panelWidth)
      .attr("height", panelHeight)
      .attr("class", "svgLegendClass")
    
    const chart = chartRoot.append("g")
      .attr("transform", `translate(5,${VPadding})`)
    

    chart.selectAll("rect")
      .data(featureNames)
      .enter()
      .append("rect")
      .attr("x", function (d, i) {
        const offset = i % featurePerRow;
        return offset * 150 + 80;
      })
      .attr("y", function (d, i) {
        const offset = Math.floor(i/featurePerRow) + 1;
        return (offset * (10 + VPadding));
      })
      .attr("width", 20)
      .attr("height", 10)
      .style("fill", function (d) {
        return colorScale(d);
      })
    
    chart.selectAll("text")
      .data(colorScale.domain())
      .enter()
      .append("text")
      .attr("x", function (d, i) {
        const offset = i % featurePerRow
        return offset * 150 + 102;
      })
      .attr("y", function (d, i) {
        const offset = Math.floor(i/featurePerRow) + 1;
        return (offset * (10 + VPadding)) + 10;
      })
      .attr("fill", function (d) {
        return colorScale(d)
      })
      .text(function (d) {
        return d
      })
      .style("font-size", "12px");

    chart.append("text")
      .text("Legend:")
      .attr("x", 5)
      .attr("y", panelHeight/2-VPadding)
      .style("font-weight", "bold")
    
    // For Gene Body
    chart.append("rect")
      .attr("x", 80)
      .attr("y", VPadding * 2 - 10)
      .attr("width", 20)
      .attr("height", 10)
      .attr("fill", geneBarColor)
    
    chart.append("text")
      .text("Target Gene")
      .attr("x", 102)
      .attr("y", VPadding * 2)
      .attr("fill", geneBarColor)
      .style("font-size", "12px")
    
    // Region Bar
    chart.append("rect")
      .attr("x", 230)
      .attr("y", VPadding * 2 - 10)
      .attr("width", 20)
      .attr("height",10)
      .attr("fill",regionBarColor)
    
    chart.append("text")
      .text("Region Bar")
      .attr("x", 252)
      .attr("y", VPadding * 2)
      .attr("fill", regionBarColor)
      .style("font-size", "12px")

    // Neighbors
    chart.append("rect")
      .attr("x", 380)
      .attr("y", VPadding * 2 - 10)
      .attr("width", 20)
      .attr("height", 10)
      .attr("fill", neighborBarColor)
    
    chart.append("text")
      .text("Neighboring Genes")
      .attr("x", 402)
      .attr("y", VPadding * 2)
      .attr("fill", neighborBarColor)
      .style("font-size", "12px")
  }
})