<template>
  <div class="mainplot">
  </div>
</template>

<script>
  import { store } from '../scripts/store.js'
  import parseGeneString from '../scripts/utils/parseGeneString.js'
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
        const rootElement = this.$el
        const info = this.info
        const celltypeData = _.find(store.data, ['name', this.celltype])
        const chrom = info.chrom
        const txStart = info.txStart
        const txEnd = info.txEnd
        const binSize = store.constants.chromBinSize
        const startBin = Math.floor(txStart/binSize)
        const endBin = Math.floor(txEnd/binSize) + 1
        const margin = store.settings.geneCard.margin
        const panelWidth = store.settings.geneCard.panelWidth
        const panelHeight = store.settings.geneCard.panelHeight
        
        const chartRoot = d3.select(rootElement).append('svg')
          .attr("width", panelWidth)
          .attr("height", panelHeight)

        const xScale = d3.scaleLinear()
          .domain([0, endBin - startBin])
          .range([margin.left, panelWidth - margin.right])

        const yScale = d3.scaleBand()
          .domain(store.info.features)
          .rangeRound([margin.top, panelHeight-margin.bottom])
        
        const chart = chartRoot.append("g")

        for (let feature of store.info.features) {
          const featureString = _.find(celltypeData.features, ['name', feature]).data[chrom].substr(startBin, endBin-startBin)
          console.log(featureString, parseGeneString(featureString))
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
