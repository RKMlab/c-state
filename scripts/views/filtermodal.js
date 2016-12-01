'use strict'

const showFilters = function () {
  filterModal.showFilterDiv = true;
  $("#filter-mask").removeClass("slideOutLeft");
  $("#filter-mask").addClass("slideInLeft");
}

const hideFilterDiv = function () {
  $("#filter-mask").removeClass("slideInLeft");
  $("#filter-mask").addClass("slideOutLeft");
}

const filterModal = new Vue({
  el: '#filter-modal',
  data: {
    showFilterDiv: false,
    availableFilters: [{
      name: 'Gene Name Filter',
      type: 'nameFilter'
    }, {
      name: 'Features Count Filter',
      type: 'countsFilter'
    }, {
      name: 'Overlaps Filter',
      type: 'overlapFilter'
    }, {
      name: 'Peak Score Filter',
      type: 'peakScoreFilter'
    }],
    activeFilters: [],
    genes: ''
  },
  computed: {
    genesLoaded: function () {
      return plotScope.info.numGenes > 0;
    }
  },
  methods: {
    addFilter: function (index) {
      this.activeFilters.push(this.availableFilters[index]);
    },

    applyFilters: function () {
      this.genes = plotScope.genes;
      spinner.loading = true;
      _.forEach(this.genes, gene => gene.show = true);
      for(let i = 0; i < this.activeFilters.length; i++) {
        const filter = this.activeFilters[i];
        const data = this.$children[i];
        switch (filter.type) {
          case "nameFilter":
            this.applyNameFilter(data.names, data.hideGene.boolean, data.allowPartialMatch);
            break;
          
          case "countsFilter":
            this.applyCountFilter(data.cellTypeSelected, data.featureSelected, data.operatorSelected, data.featureCount, data.upstreamLimit, data.downstreamLimit);
            break;
        
          default:
            break;
        }
        if (i === this.activeFilters.length - 1) {
          spinner.loading = false;
          hideFilterDiv();
        }
      }
    },

    applyNameFilter: function (names, hide, partial) {
      console.log("Applying name filter");
      for (let i = 0; i < this.genes.length; i++) {
        const gene = this.genes[i];
        const toMatch = gene.name.toUpperCase();

        if (hide) {
          if (partial) {
            _.forEach(names, function (name) {
              if (_.includes(toMatch, name)) {
                gene.show = false;
                return;
              }
            });
          } else {
            if(_.includes(names, toMatch)) {
              gene.show = false;
            }    
          }
        } else {
          if (partial) {
            _.forEach(names, function (name) {
              if (!(_.includes(toMatch, name))) {
                gene.show = false;
                return;
              }
            });
          } else {
            if(!(_.includes(names, toMatch))) {
              gene.show = false;
            }    
          }
        }
      }        
    },

    applyCountFilter: function (celltype, feature, operator, count, uplimit, downlimit) {
      console.log("Applying marks filter");
      for (let i = 0; i < this.genes.length; i++) {
        const gene = this.genes[i];
        console.log(gene);
        const match = [];
        if (celltype.value === 'any') {
          return;
        }
      }
    },

    clearFilters: function () {
      this.activeFilters.splice(0);
      spinner.loading = true;
      let counter = 0;
      for (let i = 0; i < this.genes.length; i++) {
        if (!this.genes[i].show) {
          counter++;
          _.delay(() => {
            this.genes[i].show = true;
          }, counter*5);
        }
      }
      _.delay(() => spinner.loading = false, (counter+1) * 5);
    }
  }
});

const nameFilter = Vue.component('nameFilter', {
  template: '#name-filter-template',
  data: function () {
    return {
      hideGene: {
        boolean: false
      },
      allowPartialMatch: false,
      matchBeginning: false,
      userInput: '',
    }
  },
  computed: {
    names: function () {
      return _.map(this.userInput.split(' '), function (name) {
        return name.toUpperCase();
      });
    }
  }
});

const countsFilter = Vue.component('countsFilter', {
  template: '#counts-filter-template',
  data: function () {
    return {
      celltypes: [],
      features: [],
      operators: operators,
      cellTypeSelected: 'any',
      featureSelected: 'any',
      operatorSelected: '=',
      featureCount: null,
      upstreamLimit: null,
      downstreamLimit: null
    }
  },
  mounted: function () {
    this.celltypes = JSON.parse(JSON.stringify(plotScope.info.celltypes));
    this.features = JSON.parse(JSON.stringify(plotScope.info.features));
    const any = {
        name: 'Any',
        value: 'any'
      };
    this.celltypes.unshift(any);
    this.features.unshift(any);
  }
});

const overlapFilter = Vue.component('overlapFilter', {
  template: '#overlap-filter-template',
  data: function () {
    return plotScope.info;
  }
});

const peakScoreFilter = Vue.component('peakScoreFilter', {
  template: '#peakscore-filter-template',
  data: function () {
    return plotScope.info;
  }
})
