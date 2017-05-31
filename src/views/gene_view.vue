<template>
  <div>
    <input type="file" multiple name="files[]" @change="onFileUpload">
    <div style="text-align: center">Hi</div>
  </div>
</template>

<script>
  import readFile from '../scripts/utils/fileReader.js'
  import parseBED from '../scripts/parsers/bed.js'
  import { getGenomeString } from '../scripts/createGenomeTemplate.js'

  const d3 = require('d3')
  export default {
    name: 'GeneView',
    props: ['store'],
    data () {
      return {
        files: [],
        strings: []
      }
    },
    methods: {
      onFileUpload (evt) {
        const context = this
        this.files = evt.target.files
        for (let file of this.files) {
          readFile(file, e => {
            const fileData = parseBED(e.target.result, 5, file.name)
            // console.log(fileData)
            d3.tsv('/static/genomes/human.hg19.genome', function (genome) {
              const obj = {
                name: file.name
              }
              obj.data = getGenomeString(genome, fileData, 100)
              context.strings.push(obj)
            })
          })
        }
      }
    }
  }
</script>

<style scoped>
  div {
    font-size: 1.2em;
  }
</style>
