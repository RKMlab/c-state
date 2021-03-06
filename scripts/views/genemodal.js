'use strict';

const showGeneModal = function () {
  geneModal.showModal = true;
  $("#common-mask").css({
    "visibility": "visible",
    "opacity": "1"
  });
  $("#gene-modal-body").removeClass("zoomOut");
  $("#gene-modal-body").addClass("zoomIn");
}

const hideGeneModal = function () {
  if (!tableSummary.showTableDiv) {
    $("#common-mask").css({
      "visibility": "hidden",
      "opacity": "0"
    });
  }
  $("#gene-modal-body").removeClass("zoomIn");
  $("#gene-modal-body").addClass("zoomOut");
  _.delay(() => {
    geneModal.showModal = false;
  }, 510);
}

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
    },

    saveAsSVG: function () {
      let header = '<?xml version="1.0" standalone="no"?>';
      header += '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';
      const info = $("#gene-modal .modal-header span").toArray()
      const geneName = info[0].innerText;
      const location = info[1].innerText;
      const scale = info[2].innerText;
      const names = $("#gene-modal td.celltype-name").toArray();
      const plots = $(".modal-panel-row svg").toArray();
      const legend = $("#gene-modal .legend-panel svg").toArray();
      const panelHeight = +$(plots).attr("height")+20;
      const SVGheight = 200 + (panelHeight * (plots.length+1)) + legend[0].clientHeight;
      let data = `<svg xmlns='http://www.w3.org/2000/svg' width="${screen.width}" height="${SVGheight}">`;
      data += `<text x='10' y ='30' font-family='Arial' font-size='24'>${geneName}</text>`;
      data += `<text x='10' y ='55' font-family='Arial' font-size='18'>${location}</text>`;
      data += `<text x='10' y ='80' font-family='Arial' font-size='14'>${scale}</text>`;
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
});