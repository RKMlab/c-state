"use strict"

import { store } from '../store.js'
const _ = require('lodash')

const parseGeneInfo = function (string) {
  const headers = store.info.genomeHeaders
  const cols = string.split(/\t/)
  const obj = {}
  for (let i = 0; i < headers.length; i++) {
    if (cols[i].match(/^\d+$/)) { // Cast to number if the string contains only digits
      cols[i] = +cols[i]
    }
    obj[headers[i]] = cols[i]
  }
  return obj
}

const parseFeatureString = function (string) {
  const arr = string.match(/(.)\1*/g)
  const toPlot = []
  let i = 0
  for (let string of arr) {
    const obj = {}
    obj.value = string.charAt(0)
    obj.start = i
    obj.end = i + string.length
    i += string.length
    toPlot.push(obj)
  }
  _.remove(toPlot, o => { return o.value === 'a'})
  return toPlot
}

export { parseGeneInfo, parseFeatureString }