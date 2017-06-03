"use strict"

import { store } from './store'
const d3 = require('d3')

export default function (callback) {
  const { selectedSpecies, selectedBuild } = store.info
  d3.text(`/static/genomes/${selectedSpecies}_${selectedBuild}.geneinfo.tsv`, function (text) {
    let info = []
    const lines = text.split(/\r|\n|\r\n/)
    store.info.genomeHeaders = lines[0].split(/\t/)
    const indexOfID = _.indexOf(store.info.genomeHeaders, store.info.selectedID)
    const indexOfTxSize = _.indexOf(store.info.genomeHeaders, 'txSize')
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(/\t/)
      const obj = {
        name: cols[indexOfID],
        value: lines[i],
        txSize: +cols[indexOfTxSize]
      }
      info.push(obj)
    }
    store.info.sortings.chrOrder = _.map(_.uniqBy(info, 'name'), 'name')
    info = _.map(_.groupBy(info, 'name'), o => {
      return _.maxBy(o, 'txSize')
    })
    store.info.sortings.alphabetical = _.map(_.sortBy(info, 'name'), 'name')
    store.info.sortings.txSize = _.map(_.sortBy(info, 'txSize'), 'name')
    callback(info)
  })
}
