'use strict';

const avgprofile = Vue.component('avgprofile', {
  template: '#avgprofile-template',
  props: ['celltype', 'feature', 'filtered', 'cellindex', 'featindex', 'colwise', 'tssonly'],
  data: function () {
    return {
      scope: plotScope,
      profile: [],
      show: true
    }
  },
  mounted: function () {
    const factor = (this.scope.info.flankUp + this.scope.info.flankDown)/200;
    const delay = (this.cellindex+1)*factor + (this.featindex * factor)
    _.delay(this.getFullProfile, delay);
  },
  methods: {

    getFullProfile: function () {
      const profile = this.profile;
      const scope = this.scope;
      const binSize = 100;
      const upBins = scope.info.flankUp/binSize;
      const downBins = scope.info.flankDown/binSize;
      const geneSizes = _.map(scope.genes, 'geneinfo.txSize');
      const medianSize = geneSizes[Math.floor(geneSizes.length/2)];
      const geneBins = Math.round(medianSize/binSize) + 1;
      // const geneBins = 200
      // const upBins = 100
      // const downBins = 100


      for (let i = 0; i < upBins+geneBins+downBins; i++) {
        profile.push(0);
      }
      for (let i = 0; i < scope.genes.length; i++) {
        const gene = scope.genes[i];
        if (this.filtered && !gene.show) {
          continue;
        }
        const geneBinSize = Math.round(gene.geneinfo.txSize/geneBins);
        const features = getFilteredFeatures(_.filter(_.find(gene.mappedFeatures, ['value', this.celltype.value]).features, ['FName', this.feature.name]));
        let binStart = scope.info.flankUp * -1;
        let binEnd = 0;
        for (let i = 0; i < profile.length; i++) {
          const currentBinSize = i < upBins || i > upBins + geneBins ? binSize : geneBinSize;
          binEnd = binStart + currentBinSize;
          if (i === upBins+geneBins) {
            binEnd = +gene.geneinfo.txSize;
          }
          const length = _.filter(features, function (f) {
            if (f.FEnd < binStart) {
              return false;
            }
            if (f.FStart > binEnd) {
              return false;
            }
            return true;
          }).length;
          profile[i] += length;
          // if (this.feature.name === "H3K27me3") {
          //   console.log(this.celltype.name, gene.name, binStart, binEnd, currentBinSize, length);
          // }
          binStart = binEnd;
        }
      }
      this.plotProfile(profile, upBins, geneBins);
    },
    
    plotProfile: function (profile, upBins, geneBins) {
      const scope = this.scope;
      const margin = {
        top: 0,
        left: 20,
        bottom: 15,
        right: 0
      };
      let availableWidth = (screen.width * 0.9 * 0.8)/scope.info.features.length;
      let availableHeight = (screen.height * 0.55)/scope.info.celltypes.length;
      if (!this.colwise) {
        availableWidth =  (screen.width * 0.9 * 0.8)/scope.info.celltypes.length;
        availableHeight = (screen.height * 0.55)/scope.info.features.length;
      }
      let panelWidth = availableWidth - (margin.left + margin.right);
      let panelHeight = availableHeight - (margin.top + margin.bottom)

      const colorScale = d3.scaleOrdinal(scope.settings.general.colors);
      colorScale.domain(_.map(scope.info.features, 'name'));
      const lineColor = colorScale(this.feature.name);

      const rootElement = this.$el;
      const chartRoot = d3.select(rootElement).append("svg")
        .attr("width", availableWidth)
        .attr("height", availableHeight)
      
      const xScale = d3.scaleLinear()
        .domain([0, profile.length])
        .range([0, panelWidth])
      
      const yScale = d3.scaleLinear()
        .domain([0, d3.max(profile)*1.1])
        .range([panelHeight-margin.bottom, 0])
      
      const xAxis = d3.axisBottom(xScale)
        .ticks(5)
        .tickSize(0)
        .tickFormat(function(d) {
          return;
        })
      
      const yAxis = d3.axisLeft(yScale)
        .ticks(5)
        .tickSize(0)
      
      const line = d3.line()
        // .curve(d3.curveBasis)
        .x(function (d, i) {
          return xScale(i);
        })
        .y(function (d) {
          return yScale(d);
        })
      
      const chart = chartRoot.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

      chart.append("g")
        .attr("class", "x-axis analysis-axis")
        .attr("transform", `translate(0, ${panelHeight-margin.bottom})`)
        .call(xAxis)
      
      chartRoot.append("g")
        .attr("class", "y-axis analysis-axis")
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(yAxis)
      
      chart.append("path")
        .datum(profile)
        .attr("class", "avgprofile-line")
        .attr("d", line)
        .attr("fill", "none")
        .attr("stroke", lineColor)
        .attr("stroke-width", "1.5px")
      
      // Axis Labels
      chart.append("text")
        .text("TSS")
        .attr("x", xScale(upBins))
        .attr("y", panelHeight)
        .attr("text-anchor", "middle")
        .style("font-size", "10px")
      
      chart.append("line")
        .attr("x1", xScale(upBins))
        .attr("y1", panelHeight-margin.bottom)
        .attr("x2", xScale(upBins))
        .attr("y2", 0)
        .attr("stroke", "#999999")
      
      chart.append("text")
        .text("TES")
        .attr("x", xScale(upBins+geneBins))
        .attr("y", panelHeight)
        .attr("text-anchor", "middle")
        .style("font-size", "10px")
      
      chart.append("line")
        .attr("x1", xScale(upBins+geneBins))
        .attr("y1", panelHeight-margin.bottom)
        .attr("x2", xScale(upBins+geneBins))
        .attr("y2", 0)
        .attr("stroke", "#999999")
    }
  }
})