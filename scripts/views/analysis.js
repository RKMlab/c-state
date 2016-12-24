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

    saveAsSVG: function () {
      let header = '<?xml version="1.0" standalone="no"?>';
      header += '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';
      const geneName = $("#gene-modal h3")[0].innerText;
      const location = $("#gene-modal h4")[0].innerText;
      const names = $("#gene-modal td.celltype-name").toArray();
      const plots = $(".modal-panel-row svg").toArray();
      const legend = $("#gene-modal .legend-panel svg").toArray();
      const panelHeight = +$(plots).attr("height")+20;
      const SVGheight = 200 + (panelHeight * (plots.length+1)) + legend[0].clientHeight;
      let data = `<svg xmlns='http://www.w3.org/2000/svg' width="${screen.width}" height="${SVGheight}">`;
      data += `<text x='10' y ='30' font-family='Arial' font-size='24'>${geneName}</text>`;
      data += `<text x='10' y ='55' font-family='Arial' font-size='18'>${location}</text>`;
      data += `<svg font-family='Arial' width="${legend[0].clientWidth}" height="${legend[0].clientHeight}" y="20" x="${screen.width - (legend[0].clientWidth + 100)}">${legend[0].innerHTML}</svg>`;
      for (let i = 0; i < names.length; i++) {
        data += `<text font-family='Arial' x="10" y="${(120 + legend[0].clientHeight) + i * panelHeight }">${names[i].innerText}</text>`;
        data += `<svg width="${screen.width-200}" height="${panelHeight}" x="100" y="${150 + ((i * panelHeight)-panelHeight/2)}">${plots[i].innerHTML}</svg>`
      }
      data = header + data + "</svg>";
      const fileName = geneName + "_modal.svg";
      const outData = new Blob([data], {
        type: 'text/plain; charset=utf-8'
      });
      saveAs(outData, fileName);
      console.log(legend[0].clientHeight, legend[0].clientWidth);
    }
  }
})