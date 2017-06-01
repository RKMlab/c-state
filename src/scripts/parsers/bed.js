"use strict";

import handleError from '../utils/handleError.js'
import {
  store
} from '../store.js'


const d3 = require('d3')
const _ = require('lodash')
const LineNavigator = require('line-navigator')

const readBED = function (string, scoreCol = 5) {
  scoreCol--;
  const rows = d3.tsvParseRows(string, d => {
    return {
      chrom: d[0],
      start: +d[1],
      end: +d[2],
      score: +d[scoreCol]
    }
  })
  return rows;
}

const parseBED = function (file, scoreCol = 5, min = 100, max = 1000, callback) {
  scoreCol--;
  let template = {}
  const genome = store.info.chromSizes
  const binSize = store.constants.chromBinSize

  // Initialize template with arrays of 'a'
  const alphabet = 'bcdefghijklmnopqrstuvwxyz'.split('')
  const scale = d3.scaleQuantize()
    .domain([min, max])
    .range(alphabet)
  for (let chrom of genome) {
    if (!chrom.name || !chrom.size) {
      console.error('Invalid chromosome object in creating template')
      return;
    }
    chrom.size = parseInt(chrom.size)
    const array_size = Math.floor(chrom.size / binSize) + 1
    const obj = {
      chrom: chrom.name,
      data: []
    }
    template[chrom.name] = Array(array_size).fill('a')
  }

  // Start reading file in chunks
  const reader = new LineNavigator(file, {
    chunkSize: 1024000
  })
  const startIndex = 0
  reader.readSomeLines(startIndex, function handler(error, index, lines, isEOF, progress) {
    if (error) {
      if (!isEOF) {
        handleError('error', error, 0)
        return
      } else {
        return;
      }
    }

    for (let line of lines) {
      if (line === '') {
        continue;
      }
      const d = line.split('\t')
      const chrom = d[0]
      const start = +d[1]
      const end = +d[2]
      const value = d[scoreCol] && (!_.isNaN(d[scoreCol])) ? scale(+d[scoreCol]) : 'z'
      const startBin = Math.floor(start/binSize)
      const endBin = Math.floor(end/binSize)
      for (let i = startBin; i <= endBin; i++) {
        template[chrom][i] = value
      }
    }
    if (isEOF) {
      template = _.mapValues(template, o => {
        return o.join('')
      })
      callback(template)
      return;
    }
    reader.readSomeLines(index + lines.length, handler)
  })
}

const validateBED = function (file, scoreCol = 5, callback) {
  scoreCol--;
  let min = Infinity;
  let max = 0;
  const reader = new LineNavigator(file, {
    chunkSize: 1024000
  })
  const startIndex = 0
  reader.readSomeLines(startIndex, function handler(error, index, lines, isEOF, progress) {
    if (error) {
      if (!isEOF) {
        handleError('error', error, 0)
        return
      } else {
        return;
      }
    }
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (line === '') { // Skip empty lines
        continue;
      }
      const d = line.split('\t')
      if (d.length < 3) {
        handleError('error', `Invalid BED line at ${index + i} in ${file.name}`, 0)
        return;
      } else {
        d[1] = +d[1]
        d[2] = +d[2]
        if (_.isNaN(d[1]) || _.isNaN(d[2])) {
          console.warn(`Start or Stop columns are not numbers at line ${i}. Skipping the row`);
        }
        if (d[1] > d[2]) {
          handleError('type', `Malformed BED entry at line ${index + i} in ${file.name}`, 0)
          return;
        }
        if (d[scoreCol] && (!_.isNaN(d[scoreCol]))) {
          const score = +d[scoreCol]
          if (score < min) {
            min = score
          } else if (score > max) {
            max = score
          }
        }
      }
    }
    if (isEOF) {
      callback([min, max])
      return;
    }
    reader.readSomeLines(index + lines.length, handler)
  })
}

export {
  validateBED,
  parseBED,
  readBED
}