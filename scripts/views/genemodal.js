'use strict';

const geneModal = new Vue({
  el: '#gene-modal',
  data: {
    showModal: false,
    gene: '',
    dispatch: '',
    settings: plotScope.settings
  },
  computed: {
    numCellTypes: function() {
      return this.gene.mappedFeatures.length;
    }
  },
  methods: {
    
    onZoom: function () {
      console.log("hi")
      const modalWidth = screen.width * 0.8;
      const widthPadding = this.settings.modalpanel_width_padding;
      const labelWidth = this.settings.modalpanel_label_width;
      const panelWidth = modalWidth - (labelWidth + (widthPadding * 2));

      const modalZoom = d3.zoom()
        .scaleExtent([1, (this.gene.geneinfo.REnd - this.gene.geneinfo.RStart)/5])
        .on("zoom", zoomHandler)
      
      const xScale = d3.scaleLinear()
        .domain([this.gene.geneinfo.RStart, this.gene.geneinfo.REnd])
        .range([widthPadding, panelWidth - widthPadding]);
        
      const chartRoot = d3.select("#gene-modal")
        .selectAll("svg")

      const charts = d3.select("#gene-modal")
        .selectAll("svg")
        .select(".modalSVGClass")
      
      const axisScale = d3.axisBottom(xScale)
        .ticks(5)
        .tickFormat(function (d) {
          return d / 1000;
        });

      const axes = d3.select("#gene-modal")
        .selectAll("svg")
        .select(".modalaxis")

      function zoomHandler () {
        charts.attr("transform", "translate(" + d3.event.transform.x + ",0" + ") scale(" + d3.event.transform.k + ",1)");
        axes.call(axisScale.scale(d3.event.transform.rescaleX(xScale)));
      }
      chartRoot.call(modalZoom);

    },

    closeModal: function () {
      this.showModal = false;
      this.gene = ''
      console.log("Modal closed")
    }
  }
});