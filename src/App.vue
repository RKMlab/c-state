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
          </el-collapse-item>
        </el-collapse>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import Species from '../static/genomes.json'

const _ = require('lodash')
export default {
  data () {
    return {
      species: Species.species,
      selectedSpecies: '',
      buildOptions: [],
      selectedBuild: ''
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
</style>