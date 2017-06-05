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
        // Gene variables
        const flankUp = store.settings.flankUp
        const flankDown = store.settings.flankDown
        const rootElement = this.$el
        const info = this.info
        const celltypeData = _.find(store.data, ['name', this.celltype])
        const chrom = info.chrom
        const chromSize = _.find(store.info.chromSizes, ['name', chrom]).size
        const txStart = info.txStart
        const txEnd = info.txEnd
        const strand = info.strand
        const txSize = info.txSize
        const binSize = store.constants.chromBinSize
        const alphabet = 'bcdefghijklmnopqrstuvwxyz'.split('')

        // Get appropriate chromosome positions
        let regionStart = 0
        let regionEnd = 0
        let startBin = 0
        let endBin = 0
        if (strand === '+') {
          regionStart = txStart - flankUp < 0 ? 0 : txStart - flankUp
          regionEnd = txEnd + flankDown > chromSize ? chromSize : txEnd + flankDown
          startBin = Math.floor(regionStart/binSize)
          endBin = Math.floor(regionEnd/binSize) + 1
        } else {
          regionStart = txEnd + flankDown > chromSize ? chromSize : txEnd + flankDown
          regionEnd = txStart - flankUp < 0 ? 0 : txStart - flankUp
          startBin = Math.floor(regionEnd/binSize)
          endBin = Math.floor(regionStart/binSize) + 1
        }

        // Plot variables
        const margin = store.settings.geneCard.margin
        const panelWidth = store.settings.geneCard.panelWidth
        const panelHeight = store.settings.geneCard.panelHeight
        
        const chartRoot = d3.select(rootElement).append('svg')
          .attr("width", panelWidth)
          .attr("height", panelHeight)

        const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
          .domain(store.info.features)

        const xScale = d3.scaleLinear()
          .domain([flankUp * -1, txSize + flankDown])
          .range([margin.left, panelWidth - margin.right])

        const yScale = d3.scaleBand()
          .domain(store.info.features)
          .rangeRound([margin.top, panelHeight-margin.bottom])
          .paddingOuter(0.25)
          .paddingInner(0.5)

        const opacityScale = d3.scaleQuantize()
          .domain([0.1, 1])
          .range(alphabet)
        
        const chart = chartRoot.append("g")

        for (let feature of store.info.features) {
          // console.log(this.gene, this.celltype, feature, this.info.chrom, this.info.txStart, this.info.txEnd, startBin, endBin)
          let featureString = _.find(celltypeData.features, ['name', feature]).data[chrom].substr(startBin, endBin-startBin)
          if (strand === '-') {
            featureString = featureString.split('').reverse().join('')
          }
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
                .attr("opacity", function (d) {
                  return opacityScale.invertExtent(d.value)[0]
                })
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
