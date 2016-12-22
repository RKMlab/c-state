'use strict';

const featurecorrelation = Vue.component('featurecorrelation', {
  template: "<td></td>",
  props: ['celltype', 'feature', 'by', 'cellindex', 'featindex', 'colwise', 'flankup', 'flankdown'],
  data: function () {
    return {
      scope: plotScope,
      profile: []
    }
  },

  mounted: function () {
    const factor = 200;
    const delay = this.cellindex * factor + this.featindex * factor;
    _.delay(this.getProfile, delay);
  },

  methods: {
    getProfile: function () {
      const profile = this.profile;
      const scope = this.scope;
      const colwise = this.colwise;
      const binSize = 100;
      const flankUp = this.flankup * 1000;
      const flankDown = this.flankdown * 1000;
      const upBins = flankUp/binSize;
      const downBins = flankDown/binSize;
      const celltype = this.celltype;
      const feature = this.feature;
      const by = this.by;
      
      for (let i = 0; i < upBins + downBins; i++) {
        profile.push(0);
      }
      for (let i = 0; i < scope.genes.length; i++) {
        const gene = scope.genes[i];
        let featuresBy = [];
        const mapped = getFilteredFeatures(_.filter(_.find(gene.mappedFeatures, ['value', celltype.value]).features, ['FName', feature.name]));
        if (colwise) {
          featuresBy = getFilteredFeatures(_.filter(_.find(gene.mappedFeatures, ['value', celltype.value]).features, ['FName', by]));
        } else {
          featuresBy = getFilteredFeatures(_.filter(_.find(gene.mappedFeatures, ['value', by]).features, ['FName', feature.name]));
        }
        if (mapped.length === 0 || featuresBy.length === 0) {
          continue;
        }
        for (let i = 0; i < featuresBy.length; i++) {
          const f = featuresBy[i];
          const center = +f.FStart + ((+f.FEnd - +f.FStart)/2);
          let binStart = center - flankUp;
          let binEnd = 0;
          for (let i = 0; i < profile.length; i++) {
            binEnd = binStart + binSize;
            const length = _.filter(mapped, function (f) {
              if (f.FEnd < binStart) {
                return false;
              }
              if (f.FStart > binEnd) {
                return false;
              }
              return true;
            }).length;
            profile[i] += length;
            binStart = binEnd;
          }
        }
      }
      console.log(celltype.value, feature.name, by, profile);
      this.plotProfile(profile, upBins, downBins)
    },

    plotProfile: function (profile, upBins, downBins) {
      const scope = this.scope;
      // const start = this.tssup * -1000;
      const margin = {
        top: 0,
        left: 20,
        bottom: 15,
        right: 15
      };
      let availableWidth = (screen.width * 0.9 * 0.8)/scope.info.features.length;
      let availableHeight = (screen.height * 0.55)/scope.info.celltypes.length;
      if (this.colwise) {
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
    }
  }
})