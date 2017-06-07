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
        bottom: 10,
        left: 20,
        right: 20
      },
      panelHeight: 150,
      panelWidth: 500,
      geneBarHeight: 10,
      regionBarHeight: 5,
      featureBarHeight: 10,
      geneBarColor: '#111111',
      regionBarColor: '#4682B4',
      showExons: true
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