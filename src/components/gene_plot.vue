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
        const geneBarHeight = store.settings.geneCard.geneBarHeight
        const regionBarHeight = store.settings.geneCard.regionBarHeight
        const featureBarHeight = store.settings.geneCard.featureBarHeight
        const geneBarColor = store.settings.geneCard.geneBarColor
        const regionBarColor = store.settings.geneCard.regionBarColor
        const availableHeight = panelHeight - margin.bottom
        const addition = geneBarHeight * 2;
        const geneBarStart = addition + regionBarHeight;
        const featureMaxY = (panelHeight - margin.bottom) - (geneBarHeight * 2 + regionBarHeight)
        
        const chartRoot = d3.select(rootElement).append('svg')
          .attr("width", panelWidth)
          .attr("height", panelHeight)

        const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
          .domain(store.info.features)

        const xScale = d3.scaleLinear()
          .domain([flankUp * -1, txSize + flankDown])
          .range([margin.left, panelWidth - margin.right])
          .clamp(true)

        const yScale = d3.scaleBand()
          .domain(store.info.features)
          .rangeRound([margin.top, featureMaxY])
          .paddingOuter(0.5)
          .paddingInner(0.5)

        const opacityScale = d3.scaleQuantize()
          .domain([0.1, 1])
          .range(alphabet)
        
        const chart = chartRoot.append("g")

        for (let feature of store.info.features) {
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
                  return opacityScale.invertExtent(d.value)[1]
                })
            }
          }
        }

        const regionBar = chart.append("g")
          .attr("transform", `translate(${margin.left}, ${(availableHeight - geneBarStart) + geneBarHeight})`)
        
        regionBar.append("rect")
          .attr("width", panelWidth - margin.left - margin.right)
          .attr("height", regionBarHeight)
          .style("fill", regionBarColor)

        if (store.settings.geneCard.showExons) {
          const exons = []
          const exonStarts = _.trimEnd(info.exonStarts, ',').split(',')
          const exonEnds = _.trimEnd(info.exonEnds, ',').split(',')
          if (exonStarts.length !== exonEnds.length) {
            console.log(`Exon Starts and Ends don't match for gene ${gene.name}`);
          }
          for (let i = 0; i < exonStarts.length; i++) {
            const obj = {};
            if (strand === '+') {
              obj.start = exonStarts[i] - txStart;
              obj.end = exonEnds[i] - txStart;
            } else {
              obj.start = txEnd - exonEnds[i];
              obj.end = txEnd - exonStarts[i];
            }
            exons.push(obj);
          }
          const exonBars = chart.selectAll("exon")
            .data(exons)
            .enter()
            .append("g")
            .attr("transform", function (d) {
              return `translate(${xScale(d.start)},${(availableHeight - geneBarStart)})`;
            });

          exonBars.append("rect")
            .attr("width", function (d) {
              return xScale(d.end) - xScale(d.start);
            })
            .attr("height", geneBarHeight)
            .style("fill", geneBarColor)
          
          const geneBar = chart.append("g")
            .attr('transform', `translate(${xScale(0)}, ${(availableHeight - geneBarStart) + geneBarHeight})`)
          
          geneBar.append("rect")
            .attr("width", xScale(info.txSize) - xScale(0))
            .attr("height", regionBarHeight)
            .style("fill", geneBarColor)

        } else {
          const geneBar = chart.append("g")
            .attr('transform', `translate(${xScale(0)}, ${availableHeight - geneBarStart})`)
          
          geneBar.append("rect")
            .attr("width", xScale(info.txSize) - xScale(0))
            .attr("height", (geneBarHeight + regionBarHeight))
            .style("fill", geneBarColor)
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
