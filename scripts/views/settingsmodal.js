'use strict';

const showSettings = function () {
  settingsModal.showSettingsDiv = true;
  $("#common-mask").css({"visibility":"visible", "opacity":"1"});
  $("#settings-body").removeClass("slideOutLeft");
  $("#settings-body").addClass("slideInLeft");
}

const hideSettingsDiv = function () {
  $("#common-mask").css({"visibility":"hidden", "opacity":"0"});
  $("#settings-body").removeClass("slideInLeft");
  $("#settings-body").addClass("slideOutLeft");
}

const settingsModal = new Vue({
  el: '#settings-modal',
  data: {
    showSettingsDiv: false,
    genes: '',
    scope: plotScope
  },

  methods: {
    applySettings: function () {
      // console.log(this.genes)
      spinner.loading = true;
      _.forEach(this.scope.genes, gene => {
        gene.show = false;
      });
      _.delay(() => {
        _.forEach(this.scope.genes, gene => gene.show = true)
      }, 500);
      // for (let i = 0; i < this.genes.length; i++) {
      //   _.delay(() => {
      //     this.genes[i].show = true;
      //   }, i*5);
      // }
      _.delay(() => spinner.loading = false, 1000);
    }
  }
})