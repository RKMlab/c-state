'use strict';

const avgprofile = Vue.component('avgprofile', {
  template: '#avgprofile-template',
  props: ['celltype', 'feature', 'filtered'],
  data: function () {
    return plotScope;
  },
  mounted: function () {
    this.plotProfile();
  },
  methods: {
    
    plotProfile: function () {
      const rootElement = this.$el;
      const chartRoot = d3.select(rootElement).append("svg")
        .attr("width", 100)
        .attr("height", 100)
      
      chartRoot.append("text")
        .attr("x", 10)
        .attr("y", 10)
        .text(this.celltype)
      
      chartRoot.append("text")
        .attr("x", 10)
        .attr("y", 25)
        .text(this.feature)
    }
  }
})