'use strict';

// Main event bus for Vue components
const events = new Vue({});

// Vue Table initilize
Vue.use(VueTables.client);

let palettes = {};
d3.json("data/colors.json", data => palettes = data);

// Vue loading spinner
const FadeLoader = VueSpinner.FadeLoader;
const RotateLoader = VueSpinner.RotateLoader;
const ClipLoader = VueSpinner.ClipLoader;
const spinner = new Vue({
  el: '#spinner',
  components :{
    ClipLoader,
    FadeLoader,
    RotateLoader
  },
  data: {
    loading: false,
    color: "black",
    size: '80px',
    margin: '2px',
    height: '100px',
    width: '100px',
    radius: '2px'
  }
})

// Main variable with plot data
const plotScope = {
  settings: {
    general: {
      colors: ["#863e10",
        "#0175ab",
        "#92ab76",
        "#73daa6",
        "#ff9ce3",
        "#a8d45c",
        "#ab0092",
        "#4e8bff",
        "#024cb5",
        "#ff925d",
        "#c87c00",
        "#de0e3b",
        "#7d2d9a",
        "#a11e05",
        "#dc006a",
        "#b7b3ff",
        "#e471f7",
        "#978a00",
        "#01c480",
        "#feb1bf"
      ],
    },
    mainPanel: {
      showExons: false,
      showNeighbors: true,
      HPadding: 10,
      VPadding: 20,
      geneBarColor: '#333333',
      regionBarColor: '#4682B4',
      neighborBarColor: '#C0C0C0',
      geneBarHeight: 10,
      regionBarHeight: 3,
      neighborBarHeight: 7,
      featureBarHeight: 10,
      featurePadding: 0.5
    },
    geneModal: {
      showExons: true,
      showNeighbors: true,
      sameColors: true,
      showIsoforms: true,
      panelHeight: 120,
      HPadding: 40,
      VPadding: 20,
      labelWidth: 120,
      geneBarColor: '#333333',
      regionBarColor: '#4682B4',
      neighborBarColor: '#C0C0C0',
      geneBarHeight: 10,
      regionBarHeight: 3,
      neighborBarHeight: 7,
      featureBarHeight: 7,
      featurePadding: 0.5
    },
    featureTracks: {
      minSize: '',
      maxSize: '',
      minScore: 0,
      maxScore: 1000
    }
  },
  info: {
    numGenes: 0
  },
  genes: []
}

// Operator values to populate dropdowns in filters
const operators = [{
  name: "=",
  value: "="
}, {
  name: "<",
  value: "<"
}, {
  name: "<=",
  value: "<="
}, {
  name: ">",
  value: ">"
}, {
  name: ">=",
  value: ">="
}];

// Call this every time View data is clicked
const resetScope = function (scope = plotScope) {
  Vue.set(scope, 'genes', []);
  Vue.set(scope, 'info', {})
}

const openGeneModal = function (name) {
  console.log(`Modal for ${name} opened`);
  geneModal.$data.gene = _.find(plotScope.genes, ['name', name]);
  geneModal.$data.showModal = true;
}

// Alert the user and throw an error with given string
const handleError = function (string) {
  alert(string);
  spinner.loading = false;
  throw new Error(string);
}

// Read a file object and return a callback once done
const readFile = function (fileobj, callback) {
  const reader = new FileReader();
  reader.onload = callback;
  reader.readAsText(fileobj);
}

const exportJSONToFile = function (obj = plotScope) {
  if (plotScope.genes.length === 0) {
    return;
  }
  const data = new Blob([JSON.stringify(obj)], {
    type: 'text/json;charset=utf-8'
  });
  saveAs(data, 'cstate_data.json');
}

const hideSideDivs = function () {
  hideFilterDiv();
  hideSettingsDiv();
  hideAnalysis();
  hideTable();
  hideGeneModal();
  hideDownloads();
}

$(document).ready(function() {
  $('.side-button button').tipsy({
    gravity: 'w',
    fade: true
  });

  // $('.my-tipsy-class').tipsy({
  //   gravity: 's',
  //   fade: true,
  // });
});

const getFilteredFeatures = function (features) {
  const settings = JSON.parse(JSON.stringify(plotScope.settings.featureTracks));
  const filtered = JSON.parse(JSON.stringify(features));
  if (settings.minSize === '') {
    settings.minSize = 0;
  }
  if (settings.maxSize === '') {
    settings.maxSize = Infinity;
  }
  _.remove(filtered, function (f) {
    const size = f.FEnd - f.FStart;
    return size < settings.minSize || size > settings.maxSize;
  })

  _.remove(filtered, function (f) {
    return f.FScore < settings.minScore || f.FScore > settings.maxScore;
  })
  return(filtered);
}

const resetModalZoom = function (gene) {
  const zoom = d3.zoom();
  const xScale = d3.scaleLinear()
    .domain([this.gene.geneinfo.RStart, this.gene.geneinfo.REnd])

  const selection = d3.selectAll(".modal-panel-row").select("svg");
  console.log(selection, d3.zoomIdentity);
  selection.transition()
    .duration(1000)
    .call(zoom.transform, d3.zoomIdentity)

}

const exampleScope = function (scope = plotScope) {
  spinner.loading = true;
  filterModal.activeFilters.splice(0);
  filterModal.appliedFilters = '';
  const num = $('#example-number').val();
  if (_.isNaN(num) || num < 1 || num > 6) {
    alert('Invalid number. Input a number between 1 and 6');
    spinner.loading = false;
    return;
  }
  const filename = `data/examples/${num}_celltypes.json`;
  d3.json(filename, data => {
    triggerView(data);
  });
  const triggerView = function (obj) {
    scope.genes.splice(0);
    _.delay(function () {
      Vue.set(scope, 'genes', obj.genes);
      Vue.set(scope, 'info', obj.info);
      Vue.set(scope, 'settings', obj.settings);
      _.forEach(scope.genes, gene => gene.show = true);
    }, 250);

    _.delay(function () {
      $("#files.panel.panel-default").removeClass("active");
      $("#files-body.panel-collapse").removeClass("in");
      $("#view.panel.panel-default").addClass("active");
      $("#view-body.panel-collapse").addClass("in");
      spinner.loading = false;
    }, 500, 'Switching accordions');
  }
}

const formatPlotScope = function (scope = plotScope) {
  const mainFileData = main_file.$data;
  if (!mainFileData.inputFile) {
    alert('No input file selected');
    return;
  }
  filterModal.activeFilters.splice(0);
  filterModal.appliedFilters = '';
  if (mainFileData.typeSelected === 'plotdata') {
    spinner.loading = true;
    readFile(mainFileData.inputFile, e => {
      const obj = JSON.parse(e.target.result);
      triggerView(obj);
    });

    const triggerView = function (obj) {
      scope.genes.splice(0);
      _.delay(function () {
        Vue.set(scope, 'genes', obj.genes);
        Vue.set(scope, 'info', obj.info);
        Vue.set(scope, 'settings', obj.settings);
        _.forEach(scope.genes, gene => gene.show = true);
      }, 250);

      _.delay(function () {
        $("#files.panel.panel-default").removeClass("active");
        $("#files-body.panel-collapse").removeClass("in");
        $("#view.panel.panel-default").addClass("active");
        $("#view-body.panel-collapse").addClass("in");
        spinner.loading = false;
      }, 500, 'Switching accordions');
    }
  }

  if (mainFileData.typeSelected === 'genes') {
    spinner.loading = true;
    resetScope();
    const featureFileData = feature_files.$data.featureFileData;
    let cellTypeCount = 0;
    scope.info.species = mainFileData.genomeSelected;
    scope.info.build = mainFileData.versionSelected;
    scope.info.mainID = mainFileData.idSelected;
    scope.info.numGenes = mainFileData.geneList.length;
    scope.info.flankUp = mainFileData.flankUp * 1000;
    scope.info.flankDown = mainFileData.flankDown * 1000;
    scope.info.celltypes = [];
    scope.info.features = [];

    for (let i = 0; i < featureFileData.length; i++) {
      const file = featureFileData[i]
      scope.info.celltypes.push(file.cellType);
      scope.info.features.push(file.feature)
    }
    scope.info.celltypes = _.sortBy(_.uniqBy(scope.info.celltypes, 'value'), 'value');
    scope.info.features = _.uniqBy(scope.info.features, 'value');

    mainFileData.geneList = _.sortBy(mainFileData.geneList, 'name');
    for (let i = 0; i < mainFileData.geneList.length; i++) {
      const gene = mainFileData.geneList[i];
      gene.geneinfo.RStart = scope.info.flankUp * -1;
      gene.geneinfo.GStart = 0;
      gene.geneinfo.GEnd = +gene.geneinfo.txSize;
      gene.geneinfo.REnd = gene.geneinfo.GEnd + scope.info.flankDown;

      gene.geneinfo.exons = [];
      const exonStarts = _.trimEnd(gene.geneinfo.exonStarts, ',').split(','); // Remove the trailing comma
      const exonEnds = _.trimEnd(gene.geneinfo.exonEnds, ',').split(','); // Remove the trailing comma
      if (exonStarts.length !== exonEnds.length) {
        console.log(`Exon Starts and Ends don't match for gene ${gene.name}`);
      }
      for (let i = 0; i < exonStarts.length; i++) {
        const exonObj = {};
        if (gene.geneinfo.strand === '+') {
          exonObj.start = exonStarts[i] - gene.geneinfo.txStart;
          exonObj.end = exonEnds[i] - gene.geneinfo.txStart;
        } else {
          exonObj.start = gene.geneinfo.txEnd - exonEnds[i];
          exonObj.end = gene.geneinfo.txEnd - exonStarts[i];
        }
        gene.geneinfo.exons.push(exonObj);
      }
      gene.geneinfo.exons = _.sortBy(gene.geneinfo.exons, ['start']);

      const neighbors = [];
      for (let i = 0; i < gene.geneinfo.neighbors.length; i++) {
        neighbors.push(JSON.parse(JSON.stringify(gene.geneinfo.neighbors[i])));
      }

      gene.geneinfo.neighbors.splice(0);
      _.each(neighbors, obj => {
        if (gene.geneinfo.strand === '+') {
          obj.FStart = (+obj.txStart - gene.geneinfo.FlankStart) + gene.geneinfo.RStart;
          obj.FEnd = (+obj.txEnd - gene.geneinfo.FlankStart) + gene.geneinfo.RStart;
        } else {
          obj.FStart = (gene.geneinfo.FlankEnd - +obj.txEnd) + gene.geneinfo.RStart;
          obj.FEnd = (gene.geneinfo.FlankEnd - +obj.txStart) + gene.geneinfo.RStart;
        }

        if (obj.FStart < gene.geneinfo.RStart) {
          obj.FStart = gene.geneinfo.RStart;
        }
        if (obj.FEnd > gene.geneinfo.REnd) {
          obj.FEnd = gene.geneinfo.REnd;
        }
        gene.geneinfo.neighbors.push(JSON.parse(JSON.stringify(obj)))
      });
      // gene = JSON.parse(JSON.stringify(gene));
      Vue.set(gene, 'mappedFeatures', []);
    }

    _.forEach(scope.info.celltypes, celltype => {
      const featureFiles = _.filter(featureFileData, data => {
        return data.cellType.value === celltype.value
      });
      let allFeatures = [];
      let processedCount = 0;
      for (let i = 0; i < featureFiles.length; i++) {
        const fileObj = featureFiles[i];
        console.log(fileObj.file.name);
        let features = [];
        readFile(fileObj.file, e => {
          console.log(fileObj.file.name)
          features = parseBED(e.target.result, fileObj.file.name, fileObj.feature.name);
          endReadHandler();
        })
        const endReadHandler = () => {
          console.log(`Finished Reading ${fileObj.file.name}`);
          processedCount++;
          allFeatures = allFeatures.concat([...features]);
          if (processedCount === featureFiles.length) {
            populateGeneScope(allFeatures, celltype);
          }
        }
      }
    });

    const populateGeneScope = (allFeatures, celltype) => {
      cellTypeCount++;
      allFeatures = _.groupBy(allFeatures, 'chrom');
      console.log(allFeatures);
      for (let i = 0; i < mainFileData.geneList.length; i++) {
        const gene = mainFileData.geneList[i];
        const FlankStart = gene.geneinfo.FlankStart;
        const FlankEnd = gene.geneinfo.FlankEnd;
        const mapped = {
          name: celltype.name,
          value: celltype.value,
        }
        const geneFeatures = _.filter(allFeatures[gene.geneinfo.chrom], feature => {
          return ((feature.start <= FlankStart && feature.end >= FlankEnd) ||
            (feature.start <= FlankEnd && feature.end >= FlankEnd) ||
            (feature.start >= FlankStart && feature.end <= FlankEnd))
        })

        if (geneFeatures.length === 0) {
          mapped.features = [{
            FStart: '-',
            FEnd: '-',
            FName: '-',
            FScore: '-'
          }]
        } else {
          mapped.features = _.map(geneFeatures, feature => {
            let FStart = 0;
            if (gene.geneinfo.strand === '+') {
              FStart = feature.start - +gene.geneinfo.txStart;
            } else {
              FStart = +gene.geneinfo.txEnd - feature.end;
            }
            let FEnd = FStart + (feature.end - feature.start)
            if (FStart < gene.geneinfo.RStart) {
              FStart = gene.geneinfo.RStart
            }
            if (FEnd > gene.geneinfo.REnd) {
              FEnd = gene.geneinfo.REnd;
            }
            return {
              FStart: FStart,
              FEnd: FEnd,
              FName: feature.name,
              FScore: feature.score,
            }
          })
        }
        gene.mappedFeatures.push(mapped);
        if (cellTypeCount == scope.info.celltypes.length) {
          scope.genes.push(gene);
          feature_files.$data.showDownloadButton = true;
          if (scope.genes.length === mainFileData.geneList.length) {
            _.delay(function () {
              spinner.loading = false;
              $("#files.panel.panel-default").removeClass("active");
              $("#files-body.panel-collapse").removeClass("in");
              $("#view.panel.panel-default").addClass("active");
              $("#view-body.panel-collapse").addClass("in");
            }, 250, 'Switching accordions');
          }
        }
      }
    }
  }
}

const screenAlert = new Vue({
  el: '#screenalert',
  data: {
    screen: {
      width: screen.width,
      height: screen.height
    }
  }
})