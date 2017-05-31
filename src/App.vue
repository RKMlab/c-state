<template>
  <div id="app">
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
                <el-select v-model="store.info.selectedVersion" @change="onVersionSelect">
                  <el-option v-for="option in versionOptions" :key="option" :label="option" :value="option">
                  </el-option>
                </el-select>
              </el-col>
              <el-col :span="4" v-if="showFileUpload">
                <label class="el-button el-button--primary">Upload Files
                  <input type="file" multiple name="files" style="display: none" @change="onFeatureFileUpload">
                </label>
                <el-button :disabled="!showProcessButton" type="success" @click="processFiles">Process Files</el-button>
              </el-col>
            </el-row>
          </el-collapse-item>
        </el-collapse>
        <el-collapse :value="['1']">
          <el-collapse-item name="1" title="View">
            <el-input v-model="name" style="width: 200px"></el-input>
            <el-button @click="addGene">Add Gene</el-button>
            <gene-plot v-for="gene in store.genes" :gene="gene" :key="gene.name"></gene-plot>
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
  import { getGenomeString } from './scripts/createGenomeTemplate.js'
  import { validateBED, parseBED } from './scripts/parsers/bed.js'
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
        files: '',
        validated: [],
        strings: [],
        name: '',
        versionOptions: [],
        showFileUpload: false
      }
    },
    computed: {
      showProcessButton () {
        if (this.files.length === 0) {
          return false;
        }
        return this.validated.length === this.files.length
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
          this.showFileUpload = true;
        })
      },
      onFeatureFileUpload (evt) {
        this.files = evt.target.files
        const genome = this.store.info.chromSizes
        for (let file of this.files) {
          validateBED(file, 5, response => {
            const [min, max] = response;
            const obj = {
              name: file.name,
              min: min,
              max: max,
              file: file
            }
            this.validated.push(obj)
          })
        }
      },
      processFiles () {
        const { selectedGenome, selectedVersion } = this.store.info
        d3.tsv(`/static/genomes/${selectedGenome}_${selectedVersion}.geneinfo.tsv`, data => {
          this.store.info.genomeInfo = data;
          console.log(this.store.info.genomeInfo)
          let i = 0
          const context = this
          let file = context.validated[i]
          parseBED(file.file, 5, file.min, file.max, function callback(response) {
            const obj = {
              name: file.name,
              data: response
            }
            console.log(`Finished reading ${file.name}`)
            context.store.data.push(obj)
            i++;
            if (i === context.validated.length) {
              const gene = {
                name: 'ACE'
              }
              store.genes.push(gene)
              return;
            }
            file = context.validated[i]
            parseBED(file.file, 5, file.min, file.max, callback)
          })
        })
      },
      addGene () {
        const gene = {
          name: this.name
        }
        store.genes.push(gene)
      }
    }
  }
</script>

<style>
  body {
    font-family: 'Oxygen', Helvetica, sans-serif;
  }
  
  .el-collapse-item__header {
    font-size: 1em
  }
</style>