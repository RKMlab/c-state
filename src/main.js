import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-semantic/index.css'
import locale from 'element-ui/lib/locale/lang/en'
import App from './App.vue'
import genomeParse from './scripts/genomeParser.js'
import './styles/main.css'
import './styles/transitions.css'

Vue.use(ElementUI, { locale })

new Vue({
  el: '#app',
  render: h => h(App)
})

const store = {
  settings: {},
  info: {},
  genes: []
}