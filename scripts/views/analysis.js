'use strict';

const showAnalysis = function () {
  analysisModal.showAnalysisDiv = true;
  $("#common-mask").css({
    "visibility": "visible",
    "opacity": "1"
  });
  $("#analysis-body").removeClass("fadeOut");
  $("#analysis-body").addClass("slideInLeft");
}

const hideAnalysis = function () {
  $("#common-mask").css({
    "visibility": "hidden",
    "opacity": "0"
  });
  $("#analysis-body").removeClass("slideInLeft");
  $("#analysis-body").addClass("fadeOut");
  // analysisModal.showAnalysisDiv = false;
}

const analysisModal = new Vue({
  el: '#analysis-modal',
  data: {
    showAnalysisDiv: false
  }
})