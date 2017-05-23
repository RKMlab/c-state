"use strict";

import readFile from './fileReader.js'

const d3 = require('d3')
const _ = require('lodash')

export default function (file) {
  const chunkSize = 100;
  let chromList = [];
  const chromData = {}
  const temp = d3.tsv(file, data => {
    chromList = data
    for (let c in chromList) {
      const ele = parseInt(+chromList[c].size/chunkSize + 1)
      const tempArray = [];
      for (let i = 0; i < ele; i++) {
        tempArray.push('a');
      }
      chromData[chromList[c].chrom] = tempArray.join('')
    }
    return chromData;
  })
  console.log(temp)
}