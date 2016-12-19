'use strict';

// Vue for the first fle that is uploaded
const main_file = new Vue({
  el: '#main-file',
  data: {
    inputFile: '',
    typeOptions: [{
      name: 'List of Genes',
      value: 'genes'
    }, {
      name: 'Previous Plot Data',
      value: 'plotdata'
    }, ],
    typeSelected: '',
    genomes: '',
    genomeSelected: '',
    versionOptions: [],
    versionSelected: '',
    genomeData: [],
    idOptions: [],
    idSelected: '',
    // Flank Up and Down are in KB, so should be multipled by 1000 later
    flankUp: 20,
    flankDown: 20,
    geneList: [],
    geneData: []
  },
  mounted: function () {
    events.$on('process-genes', this.getGeneInfo);
    d3.json("data/genomes.json", data => this.$data.genomes = data)
  },
  destroyed: function () {
    events.$off('process-genes', this.getGeneInfo);
  },
  methods: {

    onFileUpload: function (evt) {
      this.inputFile = evt.target.files[0];
    },

    onTypeSelect: function () {
      if (this.$data.typeSelected === 'genes') {
        feature_files.$data.showFeatureButton = true;
      }
      if (this.$data.typeSelected === 'plotdata') {
        feature_files.$data.showDiv = true;
        feature_files.$data.showFeatureButton = false;
        feature_files.$data.showPlotButton = true;
      }
    },

    onGenomeSelect: function () {
      const species = this.$data.genomeSelected;
      const genomes = this.$data.genomes;
      this.$data.versionOptions = _.map(_.filter(genomes.species, function (obj) {
        return obj.name === species;
      }), "versions")[0]; // Taking the first element because _.map returns array even with one element
    },

    onVersionSelect: function () {
      const version = this.$data.versionSelected;
      const idFile = `data/genomes/${version}.identifiers.json`;
      d3.json(idFile, data => this.$data.idOptions = data);
    },

    onIDSelect: function () {
      // this.getGeneInfo();
      feature_files.$data.showDiv = true;
    },

    getGeneInfo: function () {
      this.geneList = [];
      let genomeData = '';
      let unmappedCount = 0;
      let geneList = ''
      const version = this.versionSelected;
      readFile(this.inputFile, e => {
        geneList = e.target.result.split(/\r?\n/).sort();
        console.log(geneList);
        readGenome();
      })

      const readGenome = () => {
        const genomeFile = `data/genomes/${version}.geneinfo.tsv`;
        d3.tsv(genomeFile, data => {
          genomeData = _.groupBy(data, 'chrom');
          extractInfo(geneList);
          // extractInfo();
        });
      }

      const extractInfo = (geneList) => {
        const allMappedGenes = [];
        _.forEach(genomeData, chrom => {
          for (let i = 0; i < chrom.length; i++) {
            const gene = chrom[i];
            if (_.includes(geneList, gene[this.idSelected])) {
              allMappedGenes.push(JSON.parse(JSON.stringify(gene))); // JSON parse so that the pushed object is a deep copy and not copied by reference
            }
          }
        });

        for (let i = 0; i < geneList.length; i++) {
          const gene = geneList[i];
          const geneObj = {};
          geneObj.name = gene;
          geneObj.show = true;
          const mappedGenes = _.filter(allMappedGenes, [this.idSelected, gene]) ;
          if (mappedGenes.length === 0) {
            unmappedCount++;
            continue;
          }
          if (mappedGenes.length === 1) {
            geneObj.geneinfo = mappedGenes[0];
          } else {
            geneObj.geneinfo = _.maxBy(mappedGenes, gene => {
              return +gene.txSize;
            });
          }
          
          geneObj.geneinfo.isoforms = _.reject(mappedGenes, ['uniqueID', geneObj.geneinfo.uniqueID])
          geneObj.geneinfo.FlankStart = geneObj.geneinfo.strand === '+' ? +geneObj.geneinfo.txStart - (this.flankUp * 1000) : +geneObj.geneinfo.txStart - (this.flankDown * 1000);
          geneObj.geneinfo.FlankEnd = geneObj.geneinfo.strand === '+' ? +geneObj.geneinfo.txEnd + (this.flankDown * 1000) : +geneObj.geneinfo.txEnd + (this.flankUp * 1000);
          geneObj.geneinfo.neighbors = _.filter(genomeData[geneObj.geneinfo.chrom], row => {
            return ( (row.geneSymbol !== geneObj.geneinfo.geneSymbol) && (
              (+row.txStart <= geneObj.geneinfo.FlankStart && +row.txEnd >= geneObj.geneinfo.FlankStart) || // 5' overlap
              (+row.txStart <= geneObj.geneinfo.FlankEnd && +row.txEnd >= geneObj.geneinfo.FlankEnd) || // 3' overlap
              (+row.txStart >= geneObj.geneinfo.FlankStart && +row.txEnd <= geneObj.geneinfo.FlankEnd) // complete overlap
            ))
          })
          geneObj.geneinfo.neighbors = _.uniqBy(_.sortBy(geneObj.geneinfo.neighbors, [function (o) {
            return +o.txSize;
          }]).reverse(), 'geneSymbol');
          this.geneList.push(geneObj);
        }

        if (unmappedCount > 0) {
          alert(`${unmappedCount} out of ${geneList.length} genes could not be mapped`);
        }
        events.$emit('process-features');
      }
    }
  }
})


// Vue that deals with all feature file uploads
const feature_files = new Vue({
  el: '#feature-files',
  data: {
    showDiv: false,
    showFeatureButton: false,
    showPlotButton: false,
    showDownloadButton: false,
    inputFiles: [],
    featureFileData: []
  },
  methods: {
    
    onFileUpload: function (evt) {
      _.each(evt.target.files, file => {
        this.inputFiles.push(file)
      })
    },

    getFileData: function () {
      this.featureFileData = [];
      this.showPlotButton = false;
      events.$emit('process-genes');
    },

    addData: function (data) {
      this.featureFileData.push(data)
      if (this.featureFileData.length === this.inputFiles.length) {
        console.log("Received all file data");
        this.showPlotButton = true;
      }
    }
    
  }
})

const plot = new Vue({
  el: '#view',
  data: plotScope,
  computed: {
    numFilteredGenes: function () {
      return _.filter(plotScope.genes, 'show').length;
    },
    activeFilters: function () {
      return filterModal.activeFilters.length;
    }
  }
})