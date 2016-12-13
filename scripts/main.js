'use strict';

// Main event bus for Vue components
const events = new Vue({});

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
    ui: {
      colors: ["#cc4c58", "#73d54b", "#693dc0", "#cd4fc9", "#64c986", "#bf4988", "#c3d182", "#7673c9", "#c78c3a", "#472d5e", "#d04e28", "#80ccc3", "#612d26", "#6e99bc", "#5c7533", "#d2a6cf", "#384d40", "#caa789", "#9b6b72", "#ced13c"]
    },
    mainPanel: {
      showExons: false,
      showNeighbors: true,
      HPadding: 10,
      VPadding: 20,
      geneBarColor: '#111111',
      regionBarColor: '#999999',
      neighborBarColor: '#888888',
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
      geneBarColor: '#111111',
      regionBarColor: '#999999',
      neighborBarColor: '#888888',
      geneBarHeight: 10,
      regionBarHeight: 3,
      neighborBarHeight: 7,
      featureBarHeight: 10,
      featurePadding: 0.5
    },
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

// Alert the user and throw an error with given string
const handleError = function (string) {
  alert(string);
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
}

$('.side-button button').tipsy({
  gravity: 'w',
  fade: true
});

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
const formatPlotScope = function (scope = plotScope) {
  const mainFileData = main_file.$data;
  if (!mainFileData.inputFile) {
    alert('No input file selected');
    return;
  }
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
      }, 250);

      _.delay(function () {
        $("#files.panel.panel-default").removeClass("active");
        $("#files-body.panel-collapse").removeClass("in");
        $("#view.panel.panel-default").addClass("active");
        $("#view-body.panel-collapse").addClass("in");
        spinner.loading = false;
      }, 250, 'Switching accordions');
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