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
      type: 'nameFilter'
    }, {
      name: 'Size',
      type: 'sizeFilter'
    }, {
      name: 'Feature Counts',
      type: 'countsFilter'
    }, {
      name: 'Feature Overlaps',
      type: 'overlapFilter'
    }],
    activeFilters: [],
    genes: '',
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

    getColor: function (type) {
      return this.colors[_.findIndex(this.availableFilters, ['type', type])];
    },

    applyFilters: function () {
      this.genes = plotScope.genes;
      if (this.activeFilters.length === 0) {
        return;
      }
      spinner.loading = true;
      _.forEach(this.genes, gene => gene.show = true); // Reset all genes when applying filters again
      for (let i = 0; i < this.activeFilters.length; i++) {
        const filter = this.activeFilters[i];
        const data = this.$children[i];
        switch (filter.type) {
          case "nameFilter":
            this.applyNameFilter(data.names, data.hideGene.boolean, data.matchPartial, data.matchBeginning);
            break;

          case "sizeFilter":
            this.applySizeFilter(data.locusSelected, data.operatorSelected, data.sizeCutOff)
            break;

          case "countsFilter":
            if (data.featureCount === null || data.featureCount === "") {
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
            break;
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
        if (uplimit !== null && uplimit !== "") {
          _.forEach(match, list => {
            _.remove(list, obj => {
              return obj.FEnd < (uplimit * -1000);
            })
          })
        }
        if (downlimit !== null && downlimit !== "") {
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
            firstMatch = JSON.parse(JSON.stringify(_.filter(_.find(gene.mappedFeatures, ['value', celltype]).features, function (o) {
              return o.FName.toUpperCase() === firstFeature;
            })));
          } else {
            firstMatch = JSON.parse(JSON.stringify(gene.geneinfo.exons));
            _.forEach(firstMatch, function (o) {
              o.FStart = o.start;
              o.FEnd = o.end;
            });
          }
          if (secondFeature !== 'exon') {
            secondMatch = JSON.parse(JSON.stringify(_.filter(_.find(gene.mappedFeatures, ['value', celltype]).features, function (o) {
              return o.FName.toUpperCase() === secondFeature;
            })));
          } else {
            secondMatch = JSON.parse(JSON.stringify(gene.geneinfo.exons));
            _.forEach(secondMatch, function (o) {
              o.FStart = o.start;
              o.FEnd = o.end;
            });
          }
        // }
        // Restrict wrt TSS
        if (uplimit !== null && uplimit !== "") {
          // _.forEach(firstMatch, list => {
            _.remove(firstMatch, obj => {
              return obj.FEnd < (uplimit * -1000);
            })
          // })
        }
        if (downlimit !== null && downlimit !== "") {
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
        // let patternMatch = [];
        // for (let i = 0; i < firstMatch.length; i++) {
        //   const firstList = firstMatch[i];
        //   const secondList = secondMatch[i];
        //   switch (relation) {
        //     case "upstream":
        //       patternMatch = _.filter(firstList, function (first) {
        //         let match = 0;
        //         _.forEach(secondList, function (second) {
        //           let distance = second.FStart - first.FEnd;
        //           if (distance >= min && distance <= max) {
        //             console.log(gene.name, distance, min, max);
        //             match++;
        //             return;
        //           }
        //         })
        //         return match > 0;
        //       });
        //       break;

        //     case "downstream":
        //       patternMatch = _.filter(firstList, function (first) {
        //         let match = 0;
        //         _.forEach(secondList, function (second) {
        //           let distance = first.FStart - second.FEnd;
        //           if (distance >= min && distance <= max) {
        //             match++;
        //             return;
        //           }
        //         })
        //         return match > 0;
        //       });
        //       break;

        //     case "near":
        //       patternMatch = _.filter(firstList, function (first) {
        //         let match = 0;
        //         _.forEach(secondList, function (second) {
        //           let distance = second.FStart - first.FEnd;
        //           if (distance >= min && distance <= max) { // downstream
        //             match++;
        //             return;
        //           }
        //           distance = second.FStart - first.FEnd;
        //           if (distance >= min && distance <= max) { // upstream
        //             match++;
        //             return;
        //           }
        //         })
        //         return match > 0;
        //       });
        //       break;

        //     case "overlap":
        //       patternMatch = _.filter(firstList, function (first) {
        //         let match = 0;
        //         _.forEach(secondList, function (second) {
        //           if (first.FEnd - second.FStart < 0) {
        //             return;
        //           }
        //           if (second.FEnd - first.FStart < 0) {
        //             return;
        //           }
        //           match++;
        //         })
        //         return match > 0;
        //       })
        //       break;

        //     default:
        //       break;
        //   }
        //   console.log(patternMatch);
        //   if (patternMatch.length > 0) {
        //     break;
        //   }
        //   gene.show = false;
        // }
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
      sizeCutOff: null
    }
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
    const exon = {
      name: 'Exons',
      value: 'exon'
    }
    // this.celltypes.unshift(any);
    this.features.unshift(exon);
  }
});