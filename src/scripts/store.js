"use strict"

const store = {
  constants: {
    chromBinSize: 100
  },
  settings: {
    flankUp: 20000,
    flankDown: 20000,
    geneCard: {
      margin: {
        top: 10,
        bottom: 30,
        left: 40,
        right: 20
      },
      panelHeight: 200,
      panelWidth: 500
    }
  },
  info: {
    selectedGenome: '',
    selectedVersion: '',
    chromSizes: [],
    genomeInfo: [],
    celltypes: [],
    features: []
  },
  genes: [],
  data: []
}

export {
  store
}