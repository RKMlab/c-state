'use strict';

const showTable = function () {
  tableSummary.showTableDiv = true;
  $("#common-mask").css({
    "visibility": "visible",
    "opacity": "1"
  });
  $("#table-body").removeClass("flipOutY");
  $("#table-body").addClass("fadeIn");
}

const hideTable = function () {
  $("#common-mask").css({
    "visibility": "hidden",
    "opacity": "0"
  });
  $("#table-body").removeClass("fadeIn");
  $("#table-body").addClass("flipOutY");
  _.delay(() => {
    tableSummary.showTableDiv = false;
  }, 510)
}

const tableSummary = new Vue({
  el: '#table-summary',
  data: {
    showTableDiv: false,
    showFiltered: false,
  }
})