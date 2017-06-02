<template>
  <el-card>
    <div slot="header" style="text-align: center">
      <h3>{{ gene }}</h3>
    </div>
    <table style="text-align: center; table-layout: fixed; width: 100%; margin: auto">
      <tr>
        <td v-for="celltype in store.info.celltypes" v-if="geneInfo" style="border-left: 1px solid #dcdcdc; border-right: 1px solid #dcdcdc">
          <gene-plot :gene="gene" :celltype="celltype" :info="geneInfo"></gene-plot>
        </td>
      </tr>
    </table>
  </el-card>
</template>

<script>
import genePlot from './gene_plot.vue'
import { store } from '../scripts/store.js'

export default {
  name: 'geneRow',
  data () {
    return {
      geneInfo: '',
      store: store  
    }
  },
  props: ['gene'],
  components: {
    genePlot
  },
  mounted () {
    this.geneInfo = _.sortBy(_.filter(store.info.genomeInfo, ['geneSymbol', this.gene]), 'txSize')[0]
  }
}
</script>
