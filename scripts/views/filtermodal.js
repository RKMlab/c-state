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
            this.applyNameFilter(data.names, data.hideGene.boolean, data.matchPartial, data.matchBeginning);
            break;
          
          case "countsFilter":
            if (data.featureCount === null) {
              alert('Feature Count cannot be left empty');
              spinner.loading = false;
              return;
            } 
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

    applyNameFilter: function (names, hide, matchPartial, matchBeginning) {
      console.log("Applying name filter");
      for (let i = 0; i < this.genes.length; i++) {
        const gene = this.genes[i];
        const toMatch = gene.name.toUpperCase();

        if (hide) {
          if (matchPartial) {
            _.forEach(names, function (name) {
              if (_.includes(toMatch, name)) {
                gene.show = false;
                return;
              }
            });
          } else if (matchBeginning) {
            _.forEach(names, name => {
              if (_.startsWith(toMatch, name)) {
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
          if (matchPartial) {
            let anyMatch = false;
            _.forEach(names, function (name) {
              if (_.includes(toMatch, name)) {
                anyMatch = true;
                return;
              }
            });
            if (!anyMatch) {
              gene.show = false;
            }
          } else if (matchBeginning) {
            let anyMatch = false;
            _.forEach(names, name => {
              if (_.startsWith(toMatch, name)) {
                anyMatch = true;
                return;
              }
            });
            if (!anyMatch) {
              gene.show = false;
            }
          }
          else {
            if(!(_.includes(names, toMatch))) {
              gene.show = false;
            }    
          }
        }
      }        
    },

    applyCountFilter: function (celltype, feature, operator, count, uplimit, downlimit) {
      console.log("Applying marks filter");
      console.log(celltype, feature, operator, count, uplimit, downlimit);
      for (let i = 0; i < this.genes.length; i++) {
        const gene = this.genes[i];
        if (!gene.show) { // If this was filtered by a previous filter
          continue;
        }
        const match = [];
        // Filter features belonging to celltype
        if (celltype === 'any') {
          _.forEach(gene.mappedFeatures, list => {
            match.push(JSON.parse(JSON.stringify(list.features)));
          });
        } else {
          match.push(JSON.parse(JSON.stringify(_.find(gene.mappedFeatures, ['value', celltype]).features)));
        }
        // Filter features by feature name
        if (feature !== 'all') {
          _.forEach(match, list => {
            _.remove(list, obj => {
              return obj.FName.toUpperCase() !== feature;
            });
          });
        }
        // Restrict wrt TSS
        if (uplimit !== null) {
          _.forEach(match, list => {
            _.remove(list, obj => {
              return obj.FEnd < (uplimit * -1000);
            })
          })
        }
        if (downlimit !== null) {
          _.forEach(match, list => {
            _.remove(list, obj => {
              return obj.FStart > (downlimit * 1000);
            })
          })
        }
        switch (operator) {
          case "=": gene.show = _.includes(_.map(match, o => { return  o.length; }), count); break;
          case "<": gene.show = _.min(_.map(match, o => { return o.length; })) < count; break;
          case "<=": gene.show = _.min(_.map(match, o => { return o.length; })) <= count; break;
          case ">": gene.show = _.max(_.map(match, o => { return o.length; })) > count; break;
          case ">=": gene.show = _.max(_.map(match, o => { return o.length; })) >= count; break;
          default:
            alert('Unknown operator in feature count filter'); // This should never happen
            break;
        }
        console.log(match);
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
      matchPartial: false,
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
      featureSelected: 'all',
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
    const all = {
      name: 'All',
      value: 'all'
    };
    this.celltypes.unshift(any);
    this.features.unshift(all);
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
