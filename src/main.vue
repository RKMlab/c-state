<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="22" :offset="1">
        <el-collapse :value="['1']">
          <el-collapse-item name="1" title="Files">
            <el-row :gutter="20">
              <el-col :span="4" :offset="6">
                <el-select v-model="store.info.selectedSpecies" @change="onGenomeSelect">
                  <el-option v-for="option in species" :key="option.name" :label="option.name" :value="option.name">
                  </el-option>
                </el-select>
              </el-col>
              <el-col :span="4">
                <el-select :disabled="store.info.selectedSpecies === ''" v-model="store.info.selectedBuild" @change="onVersionSelect">
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
            <div>
              <el-autocomplete v-model="searchString" :fetch-suggestions="getSuggestions" placeholder="Enter Gene..." icon="search" @select="addGene"></el-autocomplete>
            </div><br>
            <div style="max-height: 90vh; overflow-y: auto">
              <table style="text-align: center; table-layout: fixed; width: 100%; margin: auto">
                <tr>
                  <th v-for="celltype in store.info.celltypes" style="font-size: 1.2em">{{ celltype }}</th>
                </tr>
              </table>
              <div style="max-height: 80vh; overflow-y: auto">
              <transition-group name="slide">
                <gene-row :gene="gene" v-for="gene in store.genes" :key="gene"></gene-row>
              </transition-group>
              </div>
            </div>
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
import geneRow from './components/gene_row.vue'
import parseGenome from './scripts/parseGenomeInfo.js'
import { events } from './scripts/events.js'

const d3 = require('d3')
const _ = require('lodash')

export default {
  components: {
    geneRow
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
      this.versionOptions = _.find(this.species, ['name', this.store.info.selectedSpecies]).versions
    },
    onVersionSelect () {
      const { selectedSpecies, selectedBuild } = this.store.info
      d3.tsv(`/static/genomes/${selectedSpecies}_${selectedBuild}.chromSizes`, data => {
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
      store.info.celltypes = names.sort()
      for (let name of names) {
        const obj = {
          name: name,
          features: []
        }
        store.data.push(obj)
      }
      let fileCount = 0
      let features = []
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
          features.push(feature)
          const obj = {
            name: feature,
            data: template
          }
          _.find(store.data, ['name', celltype]).features.push(obj)
          if (fileCount === this.featureFiles.length) {
            store.info.features = _.uniq(features).sort()
            store.settings.geneCard.panelWidth = Math.floor(((screen.width * 0.9) - 100)/store.info.celltypes.length)
            this.getGenomeInfo()
          }
        })
      }
    },
    getGenomeInfo () {
      store.genes = []
      parseGenome(callback => {
        store.info.genomeInfo = callback;
        store.genes = store.info.sortings.alphabetical.slice(0, 100)
      })
    },
    getSuggestions (string, callback) {
      if (string.length < 2) {
        return
      }
      const list = store.info.sortings.alphabetical;
      const filtered = _.filter(list, function (gene) {
        return gene.toLowerCase().startsWith(string.toLowerCase())
      })
      const results = []
      _.map(filtered.slice(0, 10), name => { // Show only the first 10 results
        const obj = {
          value: name
        }
        results.push(obj)
      })
      callback(results)
    },
    addGene () {
      store.genes.unshift(this.searchString)
    }
  }
}
</script>

<style>
.el-collapse-item__header {
  font-size: 1em;
}
</style>

