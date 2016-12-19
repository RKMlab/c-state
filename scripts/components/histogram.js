'use strict';

const featureHistogram = Vue.component('featurehistogram', {
  template: "<td></td>",
  props: ['celltype', 'feature', 'type', 'cellindex', 'featindex', 'colwise', 'tssonly', 'colorby'],
  data: function () {
    return {
      scope: plotScope,
      counts: []
    }
  },
  mounted: function () {
    const factor = 200;
    const delay = this.cellindex * factor + this.featindex * factor;
    _.delay(this.getCounts, delay);
  },
  methods: {

    getCounts: function () {
      let mapped = [];
      const scope = this.scope;
      const celltype = this.celltype;
      const feature = this.feature;
      if (!this.colwise) {
        mapped = getFilteredFeatures(_.flatten(_.map(scope.genes, function (gene) {
          return _.find(gene.mappedFeatures, ['value', celltype.value]).features;
        })));
      } else {
        mapped = getFilteredFeatures(_.flattenDeep(_.map(scope.genes, function (gene) {
          return _.map(gene.mappedFeatures, function (list) {
            return _.filter(list.features, ['FName', feature.name]);
          });
        })));
      }
      let values = [];
      if (this.type === 'score') {
        values = _.map(mapped, function (f) {
          return +f.FScore;
        });
      } else {
        values = _.map(mapped, function (f) {
          return +f.FEnd - +f.FStart;
        });
      }
      // console.log(values, d3.extent(values));
      this.plotHist(d3.extent(values));
    },

    plotHist: function (extent) {
      const scope = this.scope;
      for (let i = 0; i < scope.genes.length; i++) {
        const gene = this.scope.genes[i];
        const features = getFilteredFeatures(_.filter(_.find(gene.mappedFeatures, ['value', this.celltype.value]).features, ['FName', this.feature.name]));
        if (this.type === 'size') {
          this.counts.push(..._.map(features, function (f) {
            return +f.FEnd - +f.FStart;
          }))
        } else {
          this.counts.push(..._.map(features, 'FScore'));
        }
      }
      const data = this.counts;
      const margin = {
        top: 0,
        left: 30,
        bottom: 20,
        right: 15
      };
      let availableWidth = (screen.width * 0.9 * 0.8)/scope.info.features.length;
      let availableHeight = (screen.height * 0.55)/scope.info.celltypes.length;
      if (!this.colwise) {
        availableWidth =  (screen.width * 0.9 * 0.8)/scope.info.celltypes.length;
        availableHeight = (screen.height * 0.55)/scope.info.features.length;
      }
      let panelWidth = availableWidth - (margin.left + margin.right);
      let panelHeight = availableHeight - (margin.top + margin.bottom)

      let barColor = "steelblue"
      if (this.colorby === 'feature') {
        const colorScale = d3.scaleOrdinal(scope.settings.general.colors);
        colorScale.domain(_.map(scope.info.features, 'name'));
        barColor = colorScale(this.feature.name);
      }

      const rootElement = this.$el;
      const chartRoot = d3.select(rootElement).append("svg")
        .attr("width", availableWidth)
        .attr("height", availableHeight)
      
      const xScale = d3.scaleLinear()
        .domain(extent)
        .rangeRound([0, panelWidth])
      
      const bins = d3.histogram()
        .domain(xScale.domain())
        .thresholds(20)
        (data)

      const yScale = d3.scaleLinear()
        .domain([0, d3.max(bins, function (d) {
          return d.length;
        })])
        .range([panelHeight, 0]);
      
      const yAxis = d3.axisLeft(yScale)
        .ticks(5)
        .tickSize(0)
      
      const chart = chartRoot.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
      
      const bar = chart.selectAll(".histbar")
        .data(bins)
        .enter().append("g")
          .attr("class", "histbar")
          .attr("transform", function (d) {
            return `translate(${xScale(d.x0)}, ${yScale(d.length)})`;
          });
        
      bar.append("rect")
        .attr("x", 1)
        .attr("width", xScale(bins[0].x1) - xScale(bins[0].x0) - 1)
        .attr("height", function (d) {
          // console.log(d);
          return panelHeight - yScale(d.length)
        })
        .attr("fill", barColor);
      
      chartRoot.append("g")
        .attr("class", "y-axis histaxis")
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(yAxis)
      
      chart.append("g")
        .attr("class", "histaxis x-axis axis")
        .attr("transform", `translate(0, ${panelHeight})`)
        .call(d3.axisBottom(xScale)
          .ticks(5)
          .tickSize(0)
          .tickFormat(function (d) {
            if (+d > 10000) {
              return `${Math.round(d/1000)}K`
            } else {
              return d;
            }
          }))
    }
  }
});