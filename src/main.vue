<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="22" :offset="1">
        <el-collapse :value="['1']">
          <el-collapse-item name="1" title="Files">
            <el-row :gutter="20">
              <el-col :span="4" :offset="6">
                <el-select v-model="store.info.selectedGenome" @change="onGenomeSelect">
                  <el-option v-for="option in species" :key="option.name" :label="option.name" :value="option.name">
                  </el-option>
                </el-select>
              </el-col>
              <el-col :span="4">
                <el-select :disabled="store.info.selectedGenome === ''" v-model="store.info.selectedVersion" @change="onVersionSelect">
                  <el-option v-for="option in versionOptions" :key="option" :label="option" :value="option">
                  </el-option>
                </el-select>
              </el-col>
              <el-col :span="4" v-if="allowUpload">
                <label class="el-button el-button--primary">Upload Files
                  <input type="file" multiple name="files" style="display: none" @change="onFeatureFileUpload">
                </label>
                <el-button type="success" :disabled="featureFiles.length === 0" @click="processFiles">Process Files</el-button>
              </el-col>
            </el-row>
          </el-collapse-item>
        </el-collapse>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="22" :offset="1">
        <el-collapse :value="['2']">
          <el-collapse-item name="2" title="View">
            <el-input v-model="searchString" style="width: 200px"></el-input>
            <el-button @click="addGene">Add Gene</el-button>
            <transition-group name="slide">
              <gene-plot :gene="gene" v-for="gene in store.genes" :key="gene"></gene-plot>
            </transition-group>
          </el-collapse-item>
        </el-collapse>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import Species from '../static/genomes.json'
import { store } from './scripts/store.js'
import readFile from './scripts/utils/fileReader.js'
import { validateBEDString, parseBEDString } from './scripts/parsers/bed.js'
import genePlot from './components/gene_plot.vue'

const d3 = require('d3')
const _ = require('lodash')

export default {
  components: {
    genePlot
  },
  data () {
    return {
      store: store,
      species: Species.species,
      versionOptions: [],
      allowUpload: false,
      allowProcess: false,
      featureFiles: [],
      searchString: ''
    }
  },
  methods: {
    onGenomeSelect () {
      this.versionOptions = _.find(this.species, ['name', this.store.info.selectedGenome]).versions
    },
    onVersionSelect () {
      const { selectedGenome, selectedVersion } = this.store.info
      d3.tsv(`/static/genomes/${selectedGenome}_${selectedVersion}.chromSizes`, data => {
        this.store.info.chromSizes = data;
        this.allowUpload = true;
      })
    },
    onFeatureFileUpload (evt) {
      this.featureFiles = evt.target.files
    },
    processFiles () {
      let names = []
      for (let file of this.featureFiles) {
        const celltype = _.trimEnd(file.name, '.').split('_')[0]
        names.push(celltype)
      }
      names = _.uniq(names)
      for (let name of names) {
        const obj = {
          name: name,
          features: []
        }
        store.data.push(obj)
      }
      let fileCount = 0
      for (let file of this.featureFiles) {
        readFile(file, e => {
          fileCount++;
          console.log(`Reading ${file.name}`)
          const arr = validateBEDString(e.target.result, 5, file.name)
          if (!arr) {
            return;
          }
          const template = parseBEDString(e.target.result, 5, file.name)
          const [celltype, feature] = file.name.split(/_|\./)
          const obj = {
            name: feature,
            data: template
          }
          _.find(store.data, ['name', celltype]).features.push(obj)
          if (fileCount === this.featureFiles.length) {
            this.getGenomeInfo()
          }
        })
      }
    },
    getGenomeInfo () {
      const {selectedGenome, selectedVersion} = store.info;
      d3.tsv(`/static/genomes/${selectedGenome}_${selectedVersion}.geneinfo.tsv`, data => {
        store.info.genomeInfo = data.splice(0, 100);
        const genes = _.uniq(_.map(store.info.genomeInfo, 'geneSymbol'))
        let i = 0;
        for (let gene of genes) {
          i++;
          _.delay(function(gene) {
            store.genes.push(gene)
          }, 50 * i, gene)
        }
      })
    },
    addGene () {
      store.genes.push(this.searchString)
    }
  }
}
</script>

<style>
.el-collapse-item__header {
  font-size: 1em;
}
</style>

