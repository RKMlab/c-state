'use strict';

const showAnalysis = function () {
  analysisModal.showAnalysisDiv = true;
  $("#common-mask").css({
    "visibility": "visible",
    "opacity": "1"
  });
  $("#analysis-body").removeClass("fadeOut");
  $("#analysis-body").addClass("fadeIn");
}

const hideAnalysis = function () {
  $("#common-mask").css({
    "visibility": "hidden",
    "opacity": "0"
  });
  $("#analysis-body").removeClass("fadeIn");
  $("#analysis-body").addClass("fadeOut");
  _.delay(() => {
    analysisModal.showAnalysisDiv = false;
    analysisModal.showAverage = false;
  }, 510);
}

const analysisModal = new Vue({
  el: '#analysis-modal',
  data: {
    showAnalysisDiv: false,
    showHist: true,
    showAverage: false,
    showCor: false,
    showScatter: false,
    showDiagonal: true,
    expMin: 0,
    expMax: 0,
    colorHistBy: 'none',
    corBy: '',
    corUp: 3,
    corDown: 3,
    histType: 'size',
    tssonly: false,
    tssUp: 10,
    tssDown: 10,
    filtered: {
      boolean: false
    },
    colWiseHist: false,
    colWiseAvg: false,
    colWiseCor: false
  },
  computed: {
    celltypes: function () {
      return plotScope.info.celltypes;
    },
    features: function () {
      return plotScope.info.features;
    },
  },
  methods: {
    switchHistCols: function () {
      this.colWiseHist = !this.colWiseHist;
      this.showHist = false;
      _.delay(() => {
        this.showHist = true;
      }, 250)
    },

    changeHistType: function () {
      this.showHist = false;
      _.delay(() => {
        this.showHist = true;
      }, 250)
    },

    switchAvgCols: function () {
      this.colWiseAvg = !this.colWiseAvg;
      this.showAverage = false;
      _.delay(() => {
        this.showAverage = true;
      }, 250)
    },

    showFiltered: function () {
      this.showAverage = false;
      _.delay(() => {
        this.showAverage = true;
      }, 250)
    },

    initializeExp: function () {
      this.showScatter = true;
      this.expMin = JSON.parse(JSON.stringify(plotScope.info.expRange.min));
      this.expMax = JSON.parse(JSON.stringify(plotScope.info.expRange.nineNine));
    },

    showFilteredExp: function () {
      this.showScatter = false;
      _.delay(() => {
        this.showScatter = true;
      }, 250)
    },

    changeCorType: function () {
      this.showCor = false;
      _.delay(() => {
        this.showCor = true;
      }, 250)
    },

    switchCorCols: function () {
      this.colWiseCor = !this.colWiseCor;
      this.corBy = '';
    },

    saveAsSVG: function (id) {
      let header = '<?xml version="1.0" standalone="no"?>';
      header += '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';
      const mainTitle = $("#analysis-modal li.active a")[0].innerText;
      const subTitle = '';
      const plot = $(id).find("svg").toArray()[0];
      const plotWidth = +$(plot).attr("width") * 1.1;
      const plotHeight = +$(plot).attr("height") * 1.1;
      const rows = $(id).find("table.plot-table tbody tr").toArray();
      let data = `<svg xmlns='http://www.w3.org/2000/svg' width="${screen.width}" height="${screen.height}">`;
      data += `<text x='${screen.width/2}' y ='30' font-family='Arial' text-anchor='middle' font-size='24'>${mainTitle}</text>`;
      for (let i = 0; i < rows.length; i++) {
        let cols = [];
        let rowNum = i;
        if (i === 0) {
          cols = _.map($(rows[i]).find("th").toArray(), 'innerText');
          for (let i = 0; i < cols.length; i++) {
            if (i === 0) {
              data += `<text x='${100 + i * plotWidth}' y='150' font-family='Arial' text-anchor='middle'>${cols[i]}</text>`;  
            } else {
              data += `<text x='${200 + (plotWidth/2) + (i-1) * plotWidth}' y='150' font-family='Arial' text-anchor='middle'>${cols[i]}</text>`;
            }
          }
        } else {
          cols = $(rows[i]).find("td").toArray();
          for (let i = 0; i < cols.length; i++) {
            if (i === 0) {
              const rowName = cols[i].innerText;
              data += `<text x='${100 + i * (plotWidth/2)}' y='${200 + (plotHeight/2) + (rowNum - 1) * plotHeight}' font-family='Arial' text-anchor='middle'>${rowName}</text>`;
            } else {
              const curPlot = $(cols[i]).find("svg")[0];
              data += `<svg width='${plotWidth}' height='${plotHeight}' x='${200 + (i-1) * plotWidth}' y='${200 + (rowNum-1) * plotHeight}'>${curPlot.innerHTML}</svg>`;
            }
          }
        }
      }
      data = header + data + "</svg>";
      const fileName = mainTitle.replace(/ /g, '_') + ".svg";
      const outData = new Blob([data], {
        type: 'text/plain; charset=utf-8'
      });
      saveAs(outData, fileName);
    }
  }
})