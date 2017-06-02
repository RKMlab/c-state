// Main imports
import Vue from 'vue'
import ElementUI from 'element-ui'
import locale from 'element-ui/lib/locale/lang/en'

// Styles
import 'element-ui/lib/theme-semantic/index.css'
import './styles/main.css'
import './styles/transitions.css'

// Views
import Main from './main.vue'

Vue.use(ElementUI, {
  locale
})
const d3 = require('d3')

const main = new Vue({
  el: '#main',
  render: h => h(Main)
})