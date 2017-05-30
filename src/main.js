// Main imports
import Vue from 'vue'
import ElementUI from 'element-ui'
import locale from 'element-ui/lib/locale/lang/en'

// Styles
import 'element-ui/lib/theme-semantic/index.css'
import './styles/main.css'
import './styles/transitions.css'

//Views
import App from './App.vue'

// Scripts
import readFile from './scripts/utils/fileReader.js'
import { getGenomeString, getGenomeString1} from './scripts/createGenomeTemplate.js'

// Parsers
import parseBED from './scripts/parsers/bed.js'

Vue.use(ElementUI, {
  locale
})
const d3 = require('d3')

const app = new Vue({
  el: '#app',
  render: h => h(App)
})

const store = {
  settings: {},
  info: {},
  genes: [],
  constants: {
    chromBinSize: 100
  }
}

// d3.text('/static/examples/H1-hESC_H3K4me3.broadPeak', text => {
//   const data = parseBED(text, 5, 'Test')
//   console.log(data)
//   d3.tsv('/static/genomes/human.hg19.genome', function (genome) {
//     console.log(getGenomeString(genome, data, store.constants.chromBinSize))
//   })
// })