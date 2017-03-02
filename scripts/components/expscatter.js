'use strict';

const expscatter = Vue.component('expscatter', {
  template: "<td></td>",
  props: ['xcell', 'ycell', 'diagonal', 'filtered', 'xindex', 'yindex', 'axismin', 'axismax'],
  data: function () {
    return {
      scope: plotScope,
    }
  },
  mounted: function () {
    this.getExpData();
  },
  methods: {
    getExpData: function () {
      const data = [];
      const scope = this.scope;

      for (let i = 0; i < scope.genes.length; i++) {
        const gene = scope.genes[i];
        if (this.filtered && !gene.show) {
          continue;
        }
        const geneData = {
          x: 0,
          y: 0
        }
        geneData.x = _.find(gene.expression, ['value', this.xcell.value]).count
        geneData.y = _.find(gene.expression, ['value', this.ycell.value]).count
        data.push(geneData)
      }
      this.plotExpData(data)
    },

    plotExpData: function (data) {
      const scope = this.scope;
      const margin = {
        top: 0,
        left: 20,
        bottom: 15,
        right: 15
      };
      let availableWidth = (screen.width * 0.9 * 0.8)/scope.info.celltypes.length;
      let availableHeight = (screen.height * 0.55)/scope.info.celltypes.length;
      let panelWidth = availableWidth - (margin.left + margin.right);
      let panelHeight = availableHeight - (margin.top + margin.bottom)

      const rootElement = this.$el;
      const chartRoot = d3.select(rootElement).append("svg")
        .attr("width", availableWidth)
        .attr("height", availableHeight)
      
      const xValue = function (d) {
        return d.x;
      };

      const yValue = function (d) {
        return d.y
      };

      const xScale = d3.scaleLinear()
        .domain([this.axismin, this.axismax + 1])
        .range([2, panelWidth])
      
      const yScale = d3.scaleLinear()
        .domain([this.axismin, this.axismax + 1])
        .range([panelHeight-(margin.bottom+2), 0])

      const xAxis = d3.axisBottom(xScale)
        .ticks(5)
        .tickSize(0)
      
      const yAxis = d3.axisLeft(yScale)
        .ticks(5)
        .tickSize(0)
      
      const chart = chartRoot.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
      
      chartRoot.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(${margin.left}, ${panelHeight-margin.bottom})`)
        .call(xAxis)

      chartRoot.append("g")
        .attr("class", "y-axis")
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(yAxis)
      
      chart.selectAll(".dot")
        .data(data)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("r", 2)
        .attr("cx", function (d) {
          return xScale(d.x)
        })
        .attr("cy", function (d) {
          return yScale(d.y)
        })
        .style("fill", "#1F77B4")
      
      if (this.diagonal) {
        chart.append("line")
          .attr("x1", 0)
          .attr("y1", panelHeight-margin.bottom)
          .attr("x2", panelWidth)
          .attr("y2", 0)
          .attr("stroke", "#999999")
      }
    }
  }
})