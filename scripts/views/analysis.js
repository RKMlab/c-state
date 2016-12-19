'use strict';

const showAnalysis = function () {
  analysisModal.showAnalysisDiv = true;
  $("#common-mask").css({
    "visibility": "visible",
    "opacity": "1"
  });
  $("#analysis-body").removeClass("rotateOut");
  $("#analysis-body").addClass("rollIn");
}

const hideAnalysis = function () {
  $("#common-mask").css({
    "visibility": "hidden",
    "opacity": "0"
  });
  $("#analysis-body").removeClass("rollIn");
  $("#analysis-body").addClass("rotateOut");
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
    colorHistBy: 'none',
    histType: 'score',
    tssonly: false,
    tssUp: 3,
    tssDown: 3,
    filtered: {
      boolean: false
    },
    colWiseHist: false,
    colWiseAvg: false,
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
    }
  }
})