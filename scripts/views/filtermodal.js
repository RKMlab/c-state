'use strict'

const showFilters = function () {
  filterModal.showFilterDiv = true;
  $("#common-mask").css({
    "visibility": "visible",
    "opacity": "1"
  });
  $("#filter-mask").removeClass("slideOutLeft");
  $("#filter-mask").addClass("slideInLeft");
}

const hideFilterDiv = function () {
  $("#common-mask").css({
    "visibility": "hidden",
    "opacity": "0"
  });
  $("#filter-mask").removeClass("slideInLeft");
  $("#filter-mask").addClass("slideOutLeft");
}

const filterModal = new Vue({
  el: '#filter-modal',
  data: {
    showFilterDiv: false,
    colors: ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"],
    availableFilters: [{
      name: 'Name',
      type: 'nameFilter',
      title: 'Show or hide genes based on their name'
    }, {
      name: 'Size',
      type: 'sizeFilter',
      title: 'Display genes or regions matching the selected size cutoff'
    }, {
      name: 'Expression',
      type: 'expressionFilter',
      title: 'Display genes with a specific expression level'
    }, {
      name: 'Chromosome',
      type: 'chromFilter',
      title: 'Show or hide genes belonging to a given chromosome'
    }, {
      name: 'Neighbor Counts',
      type: 'neighborCountFilter',
      title: 'Display genes with specified number of neighboring genes'
    }, {
      name: 'Feature Counts',
      type: 'countsFilter',
      title: 'Find and display genes with specified number of occurences of selected features'
    }, {
      name: 'Feature Overlaps',
      type: 'overlapFilter',
      title: 'Find and display genes with specified epigenetic patterns'
    }],
    activeFilters: [],
    appliedFilters: '',
    genes: '',
  },
  computed: {
    genesLoaded: function () {
      return plotScope.info.numGenes > 0;
    }
  },
  methods: {
    addFilter: function (index) {
      const filter = JSON.parse(JSON.stringify(this.availableFilters[index]));
      this.activeFilters.push(filter);
      for (let i = 0; i < this.activeFilters.length; i++) {
        this.activeFilters[i].id = i;
      }
    },

    getColor: function (type) {
      return this.colors[_.findIndex(this.availableFilters, ['type', type])];
    },

    applyFilters: function () {
      this.genes = plotScope.genes;
      this.appliedFilters = '';
      if (this.activeFilters.length === 0) {
        alert('No filter selected');
        return;
      }
      spinner.loading = true;
      _.forEach(this.genes, gene => gene.show = true); // Reset all genes when applying filters again
      for (let i = 0; i < this.activeFilters.length; i++) {
        const filter = this.activeFilters[i];
        const data = this.$children[i];
        switch (filter.type) {
          case "nameFilter":
            if (data.userInput === '') {
              alert('Gene name cannot be left blank');
              spinner.loading = false;
              return;
            }
            this.applyNameFilter(data.names, data.hideGene.boolean, data.matchPartial, data.matchBeginning);
            break;

          case "sizeFilter":
            if (data.operatorSelected === '' || data.sizeCutOff === '') {
              alert('Invalid operator or size');
              spinner.loading = false;
              return;
            }
            this.applySizeFilter(data.locusSelected, data.operatorSelected, data.sizeCutOff)
            break;
          
          case "chromFilter":
            if (data.chromSelected === '') {
              alert('No Chromosome chosen');
              spinner.loading = false;
              return;
            }
            this.applyChromFilter(data.chromSelected, data.hideChrom.boolean, data.start, data.end)
            break;

          case "countsFilter":
            if (data.featureCount === "") {
              alert('Feature Count cannot be left empty');
              spinner.loading = false;
              return;
            }
            if (data.featureCount < 0 || _.isNaN(data.featureCount)) {
              alert('Invalid feature count. Input a number greater than or equal to 0');
              spinner.loading = false;
              return;
            }
            this.applyCountFilter(data.cellTypeSelected, data.featureSelected, data.operatorSelected, data.featureCount, data.upstreamLimit, data.downstreamLimit);
            break;

          case "overlapFilter":
            if (!data.firstFeatureSelected || !data.secondFeatureSelected) {
              alert('First and Second features must be selected');
              spinner.loading = false;
              return;
            }
            this.applyOverlapFilter(data.cellTypeSelected, data.firstFeatureSelected, data.secondFeatureSelected, data.relationSelected, data.minDistance, data.maxDistance, data.upstreamLimit, data.downstreamLimit);
            break;
          
          case "neighborCountFilter":
            if (data.operatorSelected === '' || data.countCutOff === '') {
              alert('Invalid operator or neighbor count');
              spinner.loading = false;
              return;
            }
            this.applyNeighborCountFilter(data.operatorSelected, data.countCutOff, data.ignoreOverlap);
            break;
          
          case "expressionFilter":
            if (!data.cellTypeSelected) {
              alert('Select a celltype in expression filter');
              spinner.loading = false;
              return;
            }
            this.applyExpressionFilter(data.cellTypeSelected, data.minCutOff, data.maxCutOff, data.ignoreNA);
            break;
            
          default:
            break;
        }
        if (i === this.activeFilters.length - 1) {
          spinner.loading = false;
          this.appliedFilters = this.activeFilters.length;
          hideFilterDiv();
        }
      }
    },

    applyNameFilter: function (names, hide, matchPartial, matchBeginning) {
      console.log("Applying name filter");
      for (let i = 0; i < this.genes.length; i++) {
        const gene = this.genes[i];
        if (!gene.show) { // Not required for this filter because of matching logic, still put as a precaution and to marginally improve speed
          continue;
        }
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
            if (_.includes(names, toMatch)) {
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
          } else {
            if (!(_.includes(names, toMatch))) {
              gene.show = false;
            }
          }
        }
      }
    },

    applySizeFilter: function (locus, operator, cutoff) {
      console.log("Apply size filter");
      cutoff = cutoff * 1000;
      for (let i = 0; i < this.genes.length; i++) {
        const gene = this.genes[i];
        if (!gene.show) { // If filtered by a previous filter
          continue;
        }
        const toCheck = locus === 'gene' ? gene.geneinfo.txSize : gene.geneinfo.REnd + Math.abs(gene.geneinfo.RStart);
        switch (operator) {
          case "=":
            gene.show = toCheck === cutoff;
            break;
          case "<":
            gene.show = toCheck < cutoff;
            break;
          case "<=":
            gene.show = toCheck <= cutoff;
            break;
          case ">":
            gene.show = toCheck > cutoff;
            break;
          case ">=":
            gene.show = toCheck >= cutoff;
            break;
          default:
            alert('Unknown operator in size filter'); // This should never happen
            return;
        }
      }
    },

    applyChromFilter: function (chrom, hide, start, end) {
      console.log("Apply chrom filter");
      if (start === '') {
        start = 0;
      }
      if (end === '') {
        end = Infinity;
      }
      for (let i = 0; i < this.genes.length; i++) {
        const gene = this.genes[i];
        if (!gene.show) {
          continue;
        }
        if (hide) {
          if (gene.geneinfo.chrom === chrom && gene.geneinfo.txEnd >= start && gene.geneinfo.txStart <= end) {
            gene.show = false;
          }
        } else {
          if (!(gene.geneinfo.chrom === chrom && gene.geneinfo.txEnd >= start && gene.geneinfo.txStart <= end)) {
            gene.show = false;
          }
        }
      }
    },

    applyCountFilter: function (celltype, feature, operator, count, uplimit, downlimit) {
      console.log("Applying marks filter");
      for (let i = 0; i < this.genes.length; i++) {
        const gene = this.genes[i];
        if (!gene.show) { // If this was filtered by a previous filter
          continue;
        }
        const match = [];
        // Filter features belonging to celltype
        if (celltype === 'any') {
          _.forEach(gene.mappedFeatures, list => {
            match.push(getFilteredFeatures(list.features));
            // match.push(JSON.parse(JSON.stringify(list.features)));
          });
        } else {
          match.push(getFilteredFeatures(_.find(gene.mappedFeatures, ['value', celltype]).features));
          // match.push(JSON.parse(JSON.stringify(_.find(gene.mappedFeatures, ['value', celltype]).features)));
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
        if (uplimit !== "") {
          _.forEach(match, list => {
            _.remove(list, obj => {
              return obj.FEnd < (uplimit * -1000);
            })
          })
        }
        if (downlimit !== "") {
          _.forEach(match, list => {
            _.remove(list, obj => {
              return obj.FStart > (downlimit * 1000);
            })
          })
        }
        switch (operator) {
          case "=":
            gene.show = _.includes(_.map(match, o => {
              return o.length;
            }), count);
            break;
          case "<":
            gene.show = _.min(_.map(match, o => {
              return o.length;
            })) < count;
            break;
          case "<=":
            gene.show = _.min(_.map(match, o => {
              return o.length;
            })) <= count;
            break;
          case ">":
            gene.show = _.max(_.map(match, o => {
              return o.length;
            })) > count;
            break;
          case ">=":
            gene.show = _.max(_.map(match, o => {
              return o.length;
            })) >= count;
            break;
          default:
            alert('Unknown operator in feature count filter'); // This should never happen
            break;
        }
      }
    },

    applyOverlapFilter: function (celltype, firstFeature, secondFeature, relation, minDistance, maxDistance, uplimit, downlimit) {
      console.log("Applying overlap filter");
      for (let i = 0; i < this.genes.length; i++) {
        const gene = this.genes[i];
        if (!gene.show) { // If filtered by a previous filter
          continue;
        }
        let firstMatch = '' ;
        let secondMatch = '';
        // if (celltype === 'any') {
        //   if (firstFeature !== 'exon') {
        //     _.forEach(gene.mappedFeatures, list => {
        //       firstMatch.push(JSON.parse(JSON.stringify(_.filter(list.features, function (o) {
        //         return o.FName.toUpperCase() === firstFeature;
        //       }))));
        //     });
        //   } else {
        //     firstMatch.push(JSON.parse(JSON.stringify(gene.geneinfo.exons)));
        //   }

        //   if (secondFeature !== 'exon') {
        //     _.forEach(gene.mappedFeatures, list => {
        //       secondMatch.push(JSON.parse(JSON.stringify(_.filter(list.features, function (o) {
        //         return o.FName.toUpperCase() === secondFeature;
        //       }))));
        //     });
        //   } else {
        //     secondMatch.push(JSON.parse(JSON.stringify(gene.geneinfo.exons)));
        //   }
        // } else {
          if (firstFeature !== 'exon') {
            firstMatch = getFilteredFeatures(_.filter(_.find(gene.mappedFeatures, ['value', celltype]).features, function (o) {
              return o.FName.toUpperCase() === firstFeature;
            }));
            // firstMatch = JSON.parse(JSON.stringify(_.filter(_.find(gene.mappedFeatures, ['value', celltype]).features, function (o) {
            //   return o.FName.toUpperCase() === firstFeature;
            // })));
          } else {
            firstMatch = JSON.parse(JSON.stringify(gene.geneinfo.exons));
            _.forEach(firstMatch, function (o) {
              o.FStart = o.start;
              o.FEnd = o.end;
            });
          }
          if (secondFeature !== 'exon') {
            secondMatch = getFilteredFeatures(_.filter(_.find(gene.mappedFeatures, ['value', celltype]).features, function (o) {
              return o.FName.toUpperCase() === secondFeature;
            }));
            // secondMatch = JSON.parse(JSON.stringify(_.filter(_.find(gene.mappedFeatures, ['value', celltype]).features, function (o) {
            //   return o.FName.toUpperCase() === secondFeature;
            // })));
          } else {
            secondMatch = JSON.parse(JSON.stringify(gene.geneinfo.exons));
            _.forEach(secondMatch, function (o) {
              o.FStart = o.start;
              o.FEnd = o.end;
            });
          }
        // }
        // Restrict wrt TSS
        if (uplimit !== "") {
          // _.forEach(firstMatch, list => {
            _.remove(firstMatch, obj => {
              return obj.FEnd < (uplimit * -1000);
            })
          // })
        }
        if (downlimit !== "") {
          // _.forEach(firstMatch, list => {
            _.remove(firstMatch, obj => {
              return obj.FStart > (downlimit * 1000);
            })
          // })
        }

        // console.log(firstMatch, secondMatch);
        // If match contains no elements, then return false for that gene
        if (firstMatch.length === 0 || secondMatch.length === 0) {
          gene.show = false;
          continue;
        }
        // if (!_.some(_.map(firstMatch, o => {
        //     return o.length;
        //   })) || !_.some(_.map(secondMatch, o => {
        //     return o.length;
        //   }))) {
        //   gene.show = false;
        //   continue;
        // }

        const min = minDistance * 1000;
        const max = maxDistance * 1000;
        switch (relation) {
          case "upstream":
            gene.show = _.some(firstMatch, function (first) {
              let count = 0;
              _.forEach(secondMatch, function (second) {
                const distance = second.FStart - first.FEnd;
                if (distance >= min && distance <= max) {
                  count++;
                  return;
                }
              })
              return count > 0;
            })
            break;
          
          case "downstream":
            gene.show = _.some(firstMatch, function (first) {
              let count = 0;
              _.forEach(secondMatch, function (second) {
                const distance = first.FStart - second.FEnd;
                if (distance >= min && distance <= max) {
                  count++;
                  return;
                }
              })
              return count > 0;
            })
            break;
          
          case "near":
            gene.show = _.some(firstMatch, function (first) {
              let count = 0;
              _.forEach(secondMatch, function (second) {
                let distance = second.FStart - first.FEnd;
                if (distance >= min && distance <= max) {
                  count++;
                  return;
                }
                distance = first.FStart - second.FEnd;
                if (distance >= min && distance <= max) {
                  count++;
                  return;
                }
              })
              return count > 0;
            })
            break;
          
          case "overlap":
            gene.show = _.some(firstMatch, function (first) {
              let count = 0;
              _.forEach(secondMatch, function (second) {
                if (first.FEnd - second.FStart < 0) {
                  return;
                }
                if (second.FEnd - first.FStart < 0) {
                  return;
                }
                count++;
              })
              return count > 0;
            })
            break;
        
          default:
            break;
        }
      }
    },

    applyNeighborCountFilter: function (operator, cutoff, ignoreOverlap) {
      console.log("Applying neighbor counts filter");
      for (let i = 0; i < this.genes.length; i++) {
        const gene = this.genes[i];
        if (!gene.show) {
          continue;
        }
        let match = 0;
        if (ignoreOverlap) {
          match = _.filter(gene.geneinfo.neighbors, neighbor => {
            if (+neighbor.txEnd <= +gene.geneinfo.txStart) {
              return true;
            }
            if (+neighbor.txStart >= +gene.geneinfo.txEnd) {
              return true;
            }
            return false;
          }).length;
        } else {
          match = gene.geneinfo.neighbors.length;
        }
        switch (operator) {
          case "=":
            gene.show = match === cutoff;
            break;
          case "<":
            gene.show = match < cutoff;
            break;
          case "<=":
            gene.show = match <= cutoff;
            break;
          case ">":
            gene.show = match > cutoff;
            break;
          case ">=":
            gene.show = match >= cutoff;
            break;
          default:
            alert('Unknown operator in size filter'); // This should never happen
            break;
        }
      }
    },

    applyExpressionFilter: function (celltype, min, max, ignoreNA) {
      console.log("Applying gene expression filter");
      if (min === '') {
        min = 0;
      }
      if (max === '') {
        max = Infinity;
      }
      for (let i = 0; i < this.genes.length; i++) {
        const gene = this.genes[i];
        if (!gene.show) {
          continue;
        }
        const count = _.find(gene.expression, ['value', celltype]).count;
        if (count === 'NA') {
          if (ignoreNA) {
            continue;
          } else {
            gene.show = false;
            continue;
          }
        }
        if (!(count >= min && count <= max)) {
          gene.show = false;
        }
      }
    },

    clearFilters: function () {
      this.activeFilters.splice(0);
      this.appliedFilters = ''
      spinner.loading = true;
      let counter = 0;
      for (let i = 0; i < this.genes.length; i++) {
        if (!this.genes[i].show) {
          counter++;
          _.delay(() => {
            this.genes[i].show = true;
          }, counter * 5);
        }
      }
      _.delay(() => spinner.loading = false, (counter + 1) * 5);
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

const sizeFilter = Vue.component('sizeFilter', {
  template: '#size-filter-template',
  data: function () {
    return {
      loci: [{
        name: 'Genes',
        value: 'gene'
      }, {
        name: 'Regions',
        value: 'region'
      }],
      locusSelected: 'gene',
      operators: operators,
      operatorSelected: '',
      sizeCutOff: ''
    }
  }
})

const chromFilter = Vue.component('chromFilter', {
  template: '#chrom-filter-template',
  data: function () {
    return {
      hideChrom: {
        boolean: false
      },
      chromOptions: [],
      chromSelected: '',
      start: '',
      end: ''
    }
  },
  mounted: function () {
    this.chromOptions = _.uniq(_.map(plotScope.genes, 'geneinfo.chrom')).sort();
  }
})

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
      featureCount: '',
      upstreamLimit: '',
      downstreamLimit: ''
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
    return {
      celltypes: [],
      features: [],
      operators: operators,
      cellTypeSelected: '',
      firstFeatureSelected: '',
      secondFeatureSelected: '',
      relations: [{
        name: 'Upstream To',
        value: 'upstream'
      }, {
        name: 'Downstream To',
        value: 'downstream'
      }, {
        name: 'Near',
        value: 'near'
      }, {
        name: 'Overlapping',
        value: 'overlap'
      }],
      relationSelected: 'upstream',
      minDistance: 0,
      maxDistance: Infinity,
      upstreamLimit: '',
      downstreamLimit: ''
    }
  },
  mounted: function () {
    this.celltypes = JSON.parse(JSON.stringify(plotScope.info.celltypes));
    this.features = JSON.parse(JSON.stringify(plotScope.info.features));
    const any = {
      name: 'Any',
      value: 'any'
    };
    const exon = {
      name: 'Exons',
      value: 'exon'
    }
    // this.celltypes.unshift(any);
    this.features.unshift(exon);
  }
});

const neighborCountFilter = Vue.component('neighborCountFilter', {
  template: '#neighbor-count-filter-template',
  data: function () {
    return {
      operators: operators,
      operatorSelected: '',
      countCutOff: '',
      ignoreOverlap: true
    }
  }
})

const expressionFilter = Vue.component('expressionFilter', {
  template: '#expression-filter-template',
  data: function () {
    return {
      celltypes: [],
      cellTypeSelected: '',
      minCutOff: '',
      maxCutOff: '',
      ignoreNA: true
    }
  },
  mounted: function () {
    this.celltypes = JSON.parse(JSON.stringify(plotScope.info.celltypes));
  }
})