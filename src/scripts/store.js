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
        left: 20,
        right: 20
      },
      panelHeight: 200,
      panelWidth: 500
    }
  },
  info: {
    selectedSpecies: '',
    selectedBuild: '',
    selectedID: 'geneSymbol',
    chromSizes: [],
    genomeInfo: [],
    genomeHeaders: [],
    celltypes: [],
    features: [],
    sortings: {
      chrOrder: [],
      alphabetical: [],
      txSize: []
    }
  },
  genes: [],
  data: []
}

export {
  store
}