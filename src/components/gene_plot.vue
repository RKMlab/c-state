<template>
  <div class="mainplot">
    {{ gene }}
  </div>
</template>

<script>
  import { store } from '../scripts/store.js'
  const d3 = require('d3')
  const _ = require('lodash')

  export default {
    name: 'genePlot',
    props: ['gene'],
    data () {
      return {
        info: {}
      }
    },
    mounted () {
      this.info = _.sortBy(_.filter(store.info.genomeInfo, ['geneSymbol', this.gene]), 'txSize')[0]
      const chromData = store.data[0].features[0].data[this.info.chrom]
      const start = Math.floor(this.info.txStart/store.constants.chromBinSize)
      const end = Math.floor(this.info.txEnd/store.constants.chromBinSize)
      console.log(chromData.substr(start, end-start))
    }
  }
</script>
