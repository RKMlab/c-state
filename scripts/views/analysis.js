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
    showAverage: false,
    filtered: {
      boolean: false
    },
    colWise: false,
  },
  computed: {
    celltypes: function () {
      return plotScope.info.celltypes;
    },
    features: function () {
      return plotScope.info.features;
    }
  },
  methods: {
    switchCols: function () {
      this.colWise = !this.colWise;
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