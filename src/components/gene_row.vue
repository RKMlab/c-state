<template>
  <el-card>
    <div slot="header" style="text-align: center">
      <el-row :gutter="10" style="padding-top: 10px">
        <el-col :span="6">
          <div>{{ geneInfo.chrom }}:{{ geneInfo.txStart }}-{{ geneInfo.txEnd }} ({{ geneInfo.strand }})</div>
          <div>Gene Size (bp): {{ geneInfo.txSize }}</div>
        </el-col>
        <el-col :span="12">
          <div style="font-size: 1.2em; font-weight: bold">{{ gene }}</div>
        </el-col>
      </el-row>
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
import { parseGeneInfo } from '../scripts/utils/parseStrings.js'

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
    const geneString = _.find(store.info.genomeInfo, ['name', this.gene]).value
    this.geneInfo = parseGeneInfo(geneString)
  }
}
</script>
