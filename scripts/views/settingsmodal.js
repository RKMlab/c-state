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
      spinner.loading = true;
      const names = [];
      for (let i = 0; i < this.scope.genes.length; i++) {
        const gene = this.scope.genes[i];
        if (!gene.show) {
          continue;
        }
        names.push(gene.name);
        gene.show = false;
      }
      _.delay(() => {
        for (let i = 0; i < this.scope.genes.length; i++) {
          const gene = this.scope.genes[i];
          if (_.includes(names, gene.name)) {
            gene.show = true;
          }
        }
      }, 500);
      _.delay(() => spinner.loading = false, 1000);
    }
  }
})