"use strict"

const d3 = require('d3')

const getGenomeString1 = function(genome, data, binSize=100) {
  const template = []
  const min = 100
  const max = 1000
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
    obj.data = Array(array_size).fill('a')
    const chromData = data[chrom.name]
    if (!chromData) {
      continue;
    }
    for (let feature of chromData) {
      if (feature.score < min) {
        continue;
      } else {
        const startBin = Math.floor(feature.start/binSize)
        const endBin = Math.floor(feature.end/binSize)
        const value = scale(feature.score)
        for (let i = startBin; i <= endBin; i++) {
          obj.data[i] = value
        }
      }
    }
    obj.data = obj.data.join('')
    template.push(obj)
  }
  return template
}

const getGenomeString = function (genome, data, binSize = 100) {
  let template = {}
  const min = 100
  const max = 1000
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
    // obj.data = 
    template[chrom.name] = Array(array_size).fill('a')
  }
  for (let feature of data) {
    const chrom = template[feature.chrom]
    if (feature.score < min) {
      continue;
    } else {
      const startBin = Math.floor(feature.start/binSize)
      const endBin = Math.floor(feature.end/binSize)
      const value = scale(feature.score)
      for (let i = startBin; i <= endBin; i++) {
        chrom[i] = value
      }
    }
  }
  template = _.mapValues(template, o => {
    return o.join('')
  })
  return template
} 

export { getGenomeString, getGenomeString1 }