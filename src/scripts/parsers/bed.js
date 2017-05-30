"use strict";

import handleError from '../utils/handleError.js'

const d3 = require('d3')
const _ = require('lodash')

export default function parseBED(string, scoreCol = 5, file = 'NA') {
  scoreCol--;
  let rows = d3.tsvParseRows(string, function (d, i) {
    if (d.length < 3) {
      if (i === 0) {
        console.warn(`Invalid first line in ${file}. Could be a header. Skipping the row`)
      } else {
        handleError('error', `Invalid BED line at ${i} at ${file}`, 0)
        return;
      }
    } else {
      let score = 'NA';
      d[1] = +d[1]
      d[2] = +d[2]
      if (_.isNaN(d[1]) || _.isNaN(d[2])) {
        console.warn(`Start or Stop columns are not numbers at line ${i}. Skipping the row`);
      }
      if (d[1] > d[2]) {
        console.warn(`Malformed BED entry at line ${i}. Skipping the row`)
      }
      if (d[scoreCol] && (!_.isNaN(d[scoreCol]))) {
        score = +d[scoreCol]
      }
      return {
        chrom: d[0],
        start: d[1],
        end: d[2],
        score: score
      }
    }
  })
  // rows = _.groupBy(rows, 'chrom')
  // for (let row in rows) {
  //   _.sortBy(row, 'start')
  // }
  return rows;
}