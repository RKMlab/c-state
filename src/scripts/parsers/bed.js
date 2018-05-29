"use strict"

import handleError from '../utils/handleError'
import { store } from '../store'
import { getGenomeString } from '../getGenomeString'

const d3 = require('d3')
// const _ = require('lodash')

const validateBEDString = function (string, scoreCol = 5, name = 'NA') {
  scoreCol--; // To deal with 0 based index
  let min = Infinity
  let max = 0
  let error = false
  d3.tsvParseRows(string, function (d, i){
    if (error) {
      return;
    }
    if (d.length < 3) {
      handleError('error', `Invalid BED line at ${i} in ${name}. Less than 3 columns found.`, 0)
      error = true;
      return;
    } else {
      d[1] = +d[1]
      d[2] = +d[2]
      if (_.isNaN(d[1]) || _.isNaN(d[2])) {
        console.warn(`Start or Stop columns are not numbers at line ${i}. Skipping the row`);
      }
      if (d[1] > d[2]) {
        handleError('error', `Malformed BED entry at line ${i} in ${name}. Start is greater than end.`, 0)
        error = true;
        return;
      }
      if (d[scoreCol] && (!_.isNaN(d[scoreCol]))) {
        const score = +d[scoreCol]
        if (score < min) {
          min = score
        } 
        if (score > max) {
          max = score
        }
      }
    }
  })
  if (error) {
    return undefined;
  }
  return [min, max]
}

const parseBEDString = function (string, scoreCol = 5, name = 'NA'){
  scoreCol--;
  const rows = d3.tsvParseRows(string, function (d, i) {
    return {
      chrom: d[0],
      start: +d[1],
      end: +d[2],
      score: +d[scoreCol]
    }
  })
  console.log(rows)
  const template = getGenomeString(store.info.chromSizes, rows, store.constants.chromBinSize)
  return template;
}
export { validateBEDString, parseBEDString }