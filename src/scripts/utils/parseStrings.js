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
  const binSize = store.constants.chromBinSize
  const start = store.settings.flankUp
  const arr = string.match(/(.)\1*/g)
  const parsed = []
  let i = start * -1
  for (let string of arr) {
    const obj = {}
    const length = string.length * binSize
    obj.value = string.charAt(0)
    obj.start = i
    obj.end = i + length
    i += length
    parsed.push(obj)
  }
  _.remove(parsed, o => { return o.value === 'a'})
  return parsed
}

export { parseGeneInfo, parseFeatureString }