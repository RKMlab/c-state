'use strict';

const showDownloads = function () {
  downloads.showDiv = true;
  $("#common-mask").css({
    "visibility": "visible",
    "opacity": "1"
  });
  $('#download-button').css({
    "left": "898px",
    "transition": "0.5s",
    "z-index": "3000"
  })
  $("#downloads-body").removeClass("slideOutLeft");
  $("#downloads-body").addClass("slideInLeft");
  _.delay(() => {
    $('#downloads-body .download-btn').tooltip()
  }, 510)
}

const hideDownloads = function () {
  $("#common-mask").css({
    "visibility": "hidden",
    "opacity": "0"
  });
  $('#download-button').css({
    "left": "0px",
    "z-index": "0"
  })
  $("#downloads-body").removeClass("slideInLeft");
  $("#downloads-body").addClass("slideOutLeft");
  _.delay(() => {
    downloads.showDiv = false;
  }, 510);
}

const downloads = new Vue({
  el: '#downloads-panel',
  data: {
    showDiv: false,
    scope: plotScope
  },
  methods: {
    exportJSONtoFile: function () {
      if (this.scope.genes.length === 0) {
        return;
      }
      const data = new Blob([JSON.stringify(this.scope)], {
        type: 'text/json;charset=utf-8'
      });
      saveAs(data, 'cstate_data.json');
    },

    downloadPlots: function () {
      if (this.scope.genes.length === 0) {
        return;
      }
      let header = '<?xml version="1.0" standalone="no"?>';
      header += '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';
      const mainText = _.map($('#view h4 a'), function (ele) {
        return _.trimEnd(ele.innerText, '|');
      });
      mainText[0] = mainText[0].replace('View - ', '');
      const mainTitle = mainText.join(', ');
      const legend = $('#view-body svg.svgLegendClass')[0];
      const legendWidth = +$(legend).attr("width");
      const legendHeight = +$(legend).attr("height");
      const cellTypes = $('#header-table').find("th").toArray();
      const geneRows = $('#gene-table').find("tr").toArray();
      const plot = $(geneRows[0]).find("svg.svgClass")[0];
      const panelWidth = +$(plot).attr("width") * 1.1;
      const panelHeight = +$(plot).attr("height") * 1.3;
      let data = `<svg xmlns='http://www.w3.org/2000/svg' width="${screen.width}" height="${200 + legendHeight + (panelHeight * geneRows.length)}" font-family="Arial">`;
      data += `<text x='${screen.width/2 - 100}' y='20' font-size='24px' text-anchor='middle'>${mainTitle}</text>`
      data += `<svg width='${legendWidth}' height='${legendHeight}' x='100' y='50'>${legend.innerHTML}</svg>`;
      data += `<text x='${panelWidth * cellTypes.length}' y='${50 + legendHeight/2}' text-anchor='end'>Scale in KB</text>`;
      for (let i = 0; i < cellTypes.length; i++) {
        const text = cellTypes[i].innerText;
        data += `<text x='${100 + panelWidth/2 + (i * panelWidth)}' y='${100 + legendHeight}' font-size="18px" text-anchor='middle'>${text}</text>`;
      }
      for (let i = 0; i < geneRows.length; i++) {
        const row = geneRows[i];
        const rowNum = i;
        const cols = $(row).find("td").toArray();
        for (let i = 0; i < cols.length; i++) {
          const geneName = $(cols[i]).find(".panel-header")[0].innerText;
          const SVGEle = $(cols[i]).find("svg.svgClass")[0];
          data += `<text x='${100 + panelWidth/2 + (i * panelWidth)}' y='${130 + legendHeight + (rowNum * panelHeight)}' text-anchor='middle'>${geneName}</text>`;
          data += `<svg x='${100 + (i * panelWidth)}' y='${130 + legendHeight + (rowNum * panelHeight)}' width='${panelWidth}' height='${panelHeight}'>${SVGEle.innerHTML}</svg>`
        }
      }
      data = header + data + "</svg>";
      const fileName = "cstate_viewPanels.svg";
      const outData = new Blob([data], {
        type: 'text/plain; charset=utf-8'
      });
      saveAs(outData, fileName);
    },

    exportSummary: function () {
      if (this.scope.genes.length === 0) {
        return;
      }
      let data = 'C-State Data Summary\r\n\r\n';
      data += `Total genes loaded: ${this.scope.genes.length}\r\nNumber of filtered genes: ${plot.numFilteredGenes}\r\n\r\n`;
      data += 'Feature Cut-Offs\r\n';
      data += `Minimum Score: ${this.scope.settings.featureTracks.minScore}\r\n`
      data += `Maximum Score: ${this.scope.settings.featureTracks.maxScore}\r\n`
      data += `Minimum Size (bp): ${this.scope.settings.featureTracks.minSize}\r\n`
      data += `Maximum Size (bp): ${this.scope.settings.featureTracks.maxSize}\r\n\r\n`
      if (filterModal.appliedFilters > 0) {
        data += `Filter Summary\r\nNumber of applied filters: ${filterModal.appliedFilters}\r\n`;
        for (let i = 0; i < filterModal.activeFilters.length; i++) {
          const filter = filterModal.activeFilters[i];
          data += `Filter #${i+1}: ${filter.name}\r\n`;
        }
        data += '\r\n';
      }
      data += 'Names of filtered genes\r\n';
      data += _.map(_.filter(this.scope.genes, 'show'), 'name').join('\r\n');
      const fileName = "cstate_summary.txt";
      const outData = new Blob([data], {
        type: 'text/plain; charset=utf-8'
      });
      saveAs(outData, fileName);
    }
  }
})