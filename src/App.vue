<template>
  <div id="app">
    <el-row :gutter="20">
      <el-col :span="22" :offset="1">
        <el-collapse :value="['1']">
          <el-collapse-item title="Files" name="1">
            <el-row :gutter="20">
              <el-col :span="4" :offset="6">
                <el-form>
                  <el-form-item label="Select Genome">
                    <el-select v-model="selectedSpecies" @change="onGenomeSelect">
                      <el-option v-for="org in species" :key="org.name" :label="org.name" :value="org.name"></el-option>
                    </el-select>
                  </el-form-item>
                </el-form>
              </el-col>
              <el-col :span="4" :offset="2">
                <el-form>
                  <el-form-item label="Select Build">
                    <el-select :disabled="selectedSpecies === ''" v-model="selectedBuild">
                      <el-option v-for="build in buildOptions" :key="build" :label="build" :value="build"></el-option>
                    </el-select>
                  </el-form-item>
                </el-form>
              </el-col>
            </el-row>
            <transition appear name="fade">
              <el-row :gutter="20">
                <el-col :span="10" :offset="6" style="text-align: center">
                  <el-button type="primary" :disabled="showGeneView" style="width: 200px">Go to GenomeView</el-button>
                  <el-button type="primary" @click="showGeneView = true" style="width: 200px">Go to GeneView</el-button>
                </el-col>
              </el-row>
            </transition>
            <transition appear name="fade">
              <gene-file-uploader></gene-file-uploader>
            </transition>
          </el-collapse-item>
        </el-collapse>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import Species from '../static/genomes.json'
import store from './main.js'
import GeneFileUploader from './components/gene_file_uploader.vue'

const _ = require('lodash')
export default {
  components: {
    GeneFileUploader
  },
  data () {
    return {
      store: store,
      species: Species.species,
      selectedSpecies: '',
      buildOptions: [],
      selectedBuild: '',
      showGeneView: false,
      showGenomeView: false
    }
  },
  methods: {
    onGenomeSelect () {
      this.buildOptions = _.find(this.species, ['name', this.selectedSpecies]).versions
      this.selectedBuild = ''
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