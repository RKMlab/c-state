'use strict';

const showAnalysis = function () {
  analysisModal.showAnalysisDiv = true;
  $("#common-mask").css({
    "visibility": "visible",
    "opacity": "1"
  });
  $("#analysis-body").removeClass("rotateOut");
  $("#analysis-body").addClass("rotateInDownLeft");
}

const hideAnalysis = function () {
  $("#common-mask").css({
    "visibility": "hidden",
    "opacity": "0"
  });
  $("#analysis-body").removeClass("rotateInDownLeft");
  $("#analysis-body").addClass("rotateOut");
  // analysisModal.showAnalysisDiv = false;
}

const analysisModal = new Vue({
  el: '#analysis-modal',
  data: {
    showAnalysisDiv: false
  }
})