'use strict';

const mainpanel = Vue.component('mainpanel', {
  template: '#mainpanel-template',
  props: ['gene', 'index'],
  data: function () {
    return plotScope;
  },
  mounted: function () {
    this.plotData();
  },
  methods: {

    openModal: function (gene) {
      console.log(`Modal for ${gene.name} clicked`);
      geneModal.$data.gene = gene;
      showGeneModal();
    },

    plotData: function () {
      const rootElement = this.$el;
      const settings = this.settings.mainPanel;
      const colors = this.settings.general.colors;
      const numCellTypes = this.info.celltypes.length;
      const numFeatures = this.info.features.length;
      const panelWidth = (screen.width - 400) / numCellTypes;
      const geneBarColor = settings.geneBarColor;
      const regionBarColor = settings.regionBarColor;
      const neighborBarColor = settings.neighborBarColor;
      const geneBarHeight = settings.geneBarHeight;
      const regionBarHeight = settings.regionBarHeight;
      const featureBarHeight = settings.featureBarHeight;
      const neighborBarHeight = settings.neighborBarHeight;
      const heightPadding = settings.VPadding;
      const widthPadding = settings.HPadding;
      let panelHeight = 20 + regionBarHeight + (heightPadding * 2) + featureBarHeight + (numFeatures * (featureBarHeight * 1.5));
      const addition = geneBarHeight > neighborBarHeight ? geneBarHeight * 2 : neighborBarHeight * 2;
      panelHeight += addition;
      const geneBarStart = addition + regionBarHeight;
      const availableHeight = panelHeight - heightPadding;

      const featureNames = _.map(this.info.features, 'name');
      const cellTypeName = this.info.celltypes[this.index].name;
      const mappedFeatures = getFilteredFeatures(_.find(this.gene.mappedFeatures, ['name', cellTypeName]).features);
      const neighbors = this.gene.geneinfo.neighbors;
      const geneStrand = this.gene.geneinfo.strand;

      const colorScale = d3.scaleOrdinal(colors);
      colorScale.domain(featureNames);

      const xScale = d3.scaleLinear()
        .domain([this.gene.geneinfo.RStart, this.gene.geneinfo.REnd])
        .range([widthPadding, panelWidth - widthPadding]);

      const yScale = d3.scaleBand()
        .domain(featureNames)
        .rangeRound([heightPadding, (availableHeight - geneBarStart) - 15])
        .paddingInner(0.5)
        .paddingOuter(0.25)

      const scoreScale = d3.scaleLinear()
        .domain([100, 1000])
        .range([0.1, 1])

      const chartRoot = d3.select(rootElement).append("svg")
        .attr("width", panelWidth)
        .attr("height", panelHeight)
        .attr("class", "svgClass")

      const xAxis = d3.axisBottom(xScale)
        .ticks(5)
        .tickFormat(function (d) {
          return d / 1000;
        });

      const xAxisElement = chartRoot.append("g")
        .attr("class", "x-axis") //Assign "x axis" class
        .attr("transform", "translate(0," + availableHeight + ")")
        .call(xAxis);

      const chart = chartRoot.append("g")

      const featureBars = chart.selectAll("bar")
        .data(
          mappedFeatures.filter(function (feature) {
            return feature.FName !== "-"
          })
        )
        .enter().append("g")
        .attr("class", "featureClass")
        .attr("transform", function (d, i) {
          return "translate(" + xScale(d.FStart) + ',' + yScale(d.FName) + ")";
        });

      if (featureBars) {
        featureBars.append("rect")
          .attr("width", function (d, i) {
            return xScale(d.FEnd) - xScale(d.FStart)
          })
          .attr("height", featureBarHeight)
          .attr("opacity", function (d, i) {
            return d.FScore / 1000
          })
          .style("fill", function (d, i) {
            return colorScale(d.FName)
          });

        featureBars.append("svg:title")
          .text(function (d) {
            return `Score: ${d.FScore}\nWidth: ${d.FEnd - d.FStart}bp`;
          })
      }

      const regionBar = chart.append("g")
        .attr("transform", "translate(" + xScale(this.gene.geneinfo.RStart) + "," + ((availableHeight - geneBarStart) + geneBarHeight) + ")");

      regionBar.append("rect")
        .attr("width", xScale(this.gene.geneinfo.REnd) - xScale(this.gene.geneinfo.RStart))
        .attr("height", regionBarHeight)
        .style("fill", regionBarColor);

      if (settings.showNeighbors) {
        const neighborBars = chart.selectAll("neighbor")
          .data(neighbors)
          .enter()
          .append("g")
          .attr("transform", function (d, i) {
            const y = d.strand === geneStrand ? (availableHeight - geneBarStart) + (geneBarHeight - neighborBarHeight) : (availableHeight - geneBarStart) + geneBarHeight + regionBarHeight;
            return "translate(" + xScale(d.FStart) + ',' + y + ')';
          })

        neighborBars.append("rect")
          .attr("width", function (d, i) {
            return xScale(d.FEnd) - xScale(d.FStart);
          })
          .attr("height", neighborBarHeight)
          .style("fill", neighborBarColor)

        neighborBars.append("svg:title")
          .text(function (d) {
            return `Gene Symbol: ${d.geneSymbol}\nGene Size: ${d.txSize}bp`;
          })
      }

      if (settings.showExons) {
        const exonBars = chart.selectAll("exon")
          .data(this.gene.geneinfo.exons)
          .enter()
          .append("g")
          .attr("transform", function (d) {
            return "translate(" + xScale(d.start) + "," + (availableHeight - geneBarStart) + ")";
          });

        exonBars.append("rect")
          .attr("width", function (d) {
            return xScale(d.end) - xScale(d.start);
          })
          .attr("height", geneBarHeight)
          .style("fill", geneBarColor)

        const geneBar = chart.append("g")
          .attr("transform", "translate(" + xScale(this.gene.geneinfo.GStart) + "," + ((availableHeight - geneBarStart) + geneBarHeight) + ")");

        geneBar.append("rect")
          .attr("width", xScale(this.gene.geneinfo.GEnd) - xScale(this.gene.geneinfo.GStart))
          .attr("height", regionBarHeight)
          .style("fill", geneBarColor);

      } else {
        const geneBar = chart.append("g")
          .attr("transform", "translate(" + xScale(this.gene.geneinfo.GStart) + "," + (availableHeight - geneBarStart) + ")");

        geneBar.append("rect")
          .attr("width", xScale(this.gene.geneinfo.GEnd) - xScale(this.gene.geneinfo.GStart))
          .attr("height", (geneBarHeight + regionBarHeight))
          .style("fill", geneBarColor);
      }
    }
  }
})