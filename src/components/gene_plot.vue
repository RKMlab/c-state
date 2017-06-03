<template>
  <div class="mainplot">
  </div>
</template>

<script>
  import { store } from '../scripts/store.js'
  import { parseFeatureString } from '../scripts/utils/parseStrings.js'
  const d3 = require('d3')
  const _ = require('lodash')

  export default {
    name: 'genePlot',
    props: ['gene', 'celltype', 'info'],
    mounted () {
      this.plotData()
    },
    methods: {
      plotData () {
        const flankUp = store.settings.flankUp
        const flankDown = store.settings.flankDown
        const rootElement = this.$el
        const info = this.info
        const celltypeData = _.find(store.data, ['name', this.celltype])
        const chrom = info.chrom
        const txStart = +info.txStart
        const txEnd = +info.txEnd
        const binSize = store.constants.chromBinSize
        const startBin = txStart - flankUp > 0 ? Math.floor((txStart-flankUp)/binSize) : 0
        const endBin = Math.floor((txEnd+flankDown)/binSize) + 1
        const margin = store.settings.geneCard.margin
        const panelWidth = store.settings.geneCard.panelWidth
        const panelHeight = store.settings.geneCard.panelHeight
        
        const chartRoot = d3.select(rootElement).append('svg')
          .attr("width", panelWidth)
          .attr("height", panelHeight)

        const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
          .domain(store.info.features)

        const xScale = d3.scaleLinear()
          .domain([0, endBin - startBin])
          .range([margin.left, panelWidth - margin.right])

        const yScale = d3.scaleBand()
          .domain(store.info.features)
          .rangeRound([margin.top, panelHeight-margin.bottom])
        
        const chart = chartRoot.append("g")

        for (let feature of store.info.features) {
          const featureString = _.find(celltypeData.features, ['name', feature]).data[chrom].substr(startBin, endBin-startBin)
          const toPlot = parseFeatureString(featureString)
          if (toPlot.length === 0) {
            continue
          } else {
            const featureBars = chart.selectAll("bar")
              .data(toPlot)
              .enter().append("g")
                .attr('transform', function (d) {
                  return `translate(${xScale(d.start)}, ${yScale(feature)})`
                });
            
            if (featureBars) {
              featureBars.append("rect")
                .attr("width", function (d) {
                  return xScale(d.end) - xScale(d.start)
                })
                .attr("height", 10)
                .attr("fill", colorScale(feature))
            }
          }
        }

      }
    }
  }
</script>

<style>
div.mainplot {
  text-align: center
}
</style>
