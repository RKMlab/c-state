'use strict';

const modalpanel = Vue.component('modalpanel', {
  name: 'modalpanel',
  template: '#modalpanel-template',
  props: ['gene', 'index'],
  data: function () {
    return {
      settings: plotScope.settings,
      info: plotScope.info
    }
  },
  computed: {
    cellTypeName: function () {
      return this.info.celltypes[this.index].name;
    }
  },
  mounted: function () {
    this.plotData();
  },
  destroyed: function () {
    events.$off('reset_zoom');
    events.$off('zoom_all');
  },
  methods: {
    plotData: function () {
      const rootElement = this.$el;
      const settings = this.settings.geneModal;
      const colors = this.settings.general.colors;
      const modalWidth = screen.width * 0.9;
      const numFeatures = this.info.features.length;
      const widthPadding = settings.HPadding;
      const heightPadding = settings.VPadding;
      const labelWidth = settings.labelWidth;
      const panelWidth = modalWidth - (labelWidth + (widthPadding * 2));
      const geneBarHeight = settings.geneBarHeight;
      const regionBarHeight = settings.regionBarHeight;
      const featureBarHeight = settings.featureBarHeight;
      const neighborBarHeight = settings.neighborBarHeight;
      const panelHeight = 50 + (heightPadding * 2) + featureBarHeight + (numFeatures * (featureBarHeight * 1.5));
      const availableHeight = panelHeight - heightPadding;
      const featurePadding = settings.featurePadding;
      const geneBarStart = 35;

      const featureNames = _.map(this.info.features, 'name');
      const cellTypeName = this.info.celltypes[this.index].name;
      const mappedFeatures = getFilteredFeatures(_.find(this.gene.mappedFeatures, ['name', cellTypeName]).features);
      // getFilteredFeatures(mappedFeatures);
      const neighbors = this.gene.geneinfo.neighbors;
      const geneStrand = this.gene.geneinfo.strand;
      const delay = (this.info.flankUp + this.info.flankDown) / 1000 * (this.index + 1);

      let geneBarColor = settings.geneBarColor;
      let regionBarColor = settings.regionBarColor;
      let neighborBarColor = settings.neighborBarColor;

      if (settings.sameColors) {
        geneBarColor = this.settings.mainPanel.geneBarColor;
        regionBarColor = this.settings.mainPanel.regionBarColor;
        neighborBarColor = this.settings.mainPanel.neighborBarColor;
      }

      const colorScale = d3.scaleOrdinal(colors);
      colorScale.domain(featureNames);

      const xScale = d3.scaleLinear()
        .domain([this.gene.geneinfo.RStart, this.gene.geneinfo.REnd])
        .range([widthPadding, panelWidth - widthPadding]);

      const yScale = d3.scaleBand()
        .domain(featureNames)
        .rangeRound([heightPadding, availableHeight - 50])
        .paddingInner(featurePadding)
        .paddingOuter(0.25)

      const chartRoot = d3.select(rootElement).select('.modal-panel-row').append("svg")
        .attr("width", panelWidth)
        .attr("height", panelHeight)
        .attr("class", "svgClass")

      const xAxis = d3.axisBottom(xScale)
        .ticks(5)
        .tickSize(0)
        .tickFormat(function (d) {
          return d / 1000;
        });

      const xAxisElement = chartRoot.append("g")
        .attr("class", "modalaxis x-axis") //Assign "x axis" class
        .attr("transform", "translate(0," + availableHeight + ")")
        .call(xAxis);

      const chart = chartRoot.append("g")
        .attr("class", "modalSVGClass")

      const featureBars = chart.selectAll("bar")
        .data(
          mappedFeatures.filter(function (feature) {
            return feature.FName !== "-"
          })
        )
        .enter().append("g")
        .attr("class", "featureClass")
        .attr("transform", function (d, i) {
          return "translate(" + xScale(d.FStart) + ',' + yScale(d.FName) + ")";
        });

      if (featureBars) {
        _.delay(function () {
          featureBars.append("rect")
            .attr("width", function (d, i) {
              return xScale(d.FEnd) - xScale(d.FStart)
            })
            .attr("height", featureBarHeight)
            .attr("opacity", function (d, i) {
              return d.FScore / 1000
            })
            .style("fill", function (d, i) {
              return colorScale(d.FName)
            })
        }, delay);

        featureBars.append("svg:title")
          .text(function (d) {
            return `Score: ${d.FScore}\nWidth: ${d.FEnd - d.FStart}bp`;
          })
      }

      const regionBar = chart.append("g")
        .attr("transform", "translate(" + xScale(this.gene.geneinfo.RStart) + "," + ((availableHeight - geneBarStart) + geneBarHeight) + ")");

      regionBar.append("rect")
        .attr("width", xScale(this.gene.geneinfo.REnd) - xScale(this.gene.geneinfo.RStart))
        .attr("height", regionBarHeight)
        .style("fill", regionBarColor);

      const neighborBars = chart.selectAll("neighbor")
        .data(neighbors)
        .enter()
        .append("g")
        .attr("transform", function (d, i) {
          const y = d.strand === geneStrand ? (availableHeight - geneBarStart) + (geneBarHeight - neighborBarHeight) : (availableHeight - geneBarStart) + geneBarHeight + regionBarHeight;
          return "translate(" + xScale(d.FStart) + ',' + y + ')';
        })

      if (settings.showNeighbors) {
        neighborBars.append("rect")
          .attr("width", function (d, i) {
            return xScale(d.FEnd) - xScale(d.FStart);
          })
          .attr("height", neighborBarHeight)
          .style("fill", neighborBarColor)

        neighborBars.append("svg:title")
          .text(function (d) {
            return `Gene Symbol: ${d.geneSymbol}\nGene Size: ${d.txSize}bp`;
          })
      }

      if (settings.showExons) {
        const exonBars = chart.selectAll("exon")
          .data(this.gene.geneinfo.exons)
          .enter()
          .append("g")
          .attr("transform", function (d) {
            return "translate(" + xScale(d.start) + "," + (availableHeight - geneBarStart) + ")";
          });

        exonBars.append("rect")
          .attr("width", function (d) {
            return xScale(d.end) - xScale(d.start);
          })
          .attr("height", geneBarHeight)
          .style("fill", geneBarColor)

        const geneBar = chart.append("g")
          .attr("transform", "translate(" + xScale(this.gene.geneinfo.GStart) + "," + ((availableHeight - geneBarStart) + geneBarHeight) + ")");

        geneBar.append("rect")
          .attr("width", xScale(this.gene.geneinfo.GEnd) - xScale(this.gene.geneinfo.GStart))
          .attr("height", regionBarHeight)
          .style("fill", geneBarColor);

      } else {
        const geneBar = chart.append("g")
          .attr("transform", "translate(" + xScale(this.gene.geneinfo.GStart) + "," + (availableHeight - geneBarStart) + ")");

        geneBar.append("rect")
          .attr("width", xScale(this.gene.geneinfo.GEnd) - xScale(this.gene.geneinfo.GStart))
          .attr("height", (geneBarHeight + regionBarHeight))
          .style("fill", geneBarColor);
      }

      const zoom = d3.zoom()
        .scaleExtent([1, (this.gene.geneinfo.REnd - this.gene.geneinfo.RStart) / 10])
        .translateExtent([
          [0, 0],
          [panelWidth, 0]
        ])
        .on("zoom", zoomHandler)

      function zoomHandler() {
        chart.attr("transform", "translate(" + d3.event.transform.x + ",0" + ") scale(" + d3.event.transform.k + ",1)");
        xAxisElement.call(xAxis.scale(d3.event.transform.rescaleX(xScale)));
        events.$emit('zoom_all', d3.event.transform)
      }

      function zoomHandlerAll(zoomTransform) {
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'zoom') {
          return;
        }
        chart.attr("transform", "translate(" + zoomTransform.x + ",0" + ") scale(" + zoomTransform.k + ",1)");
        xAxisElement.call(xAxis.scale(zoomTransform.rescaleX(xScale)));
      }

      const index = this.index;
      const reset_zoom = () => {
        // _.defer( () => {
        chartRoot.transition()
          // d3.selectAll(".modal-body").select("svg").transition()
          .duration(200)
          .delay(index * 250)
          .call(zoom.transform, d3.zoomIdentity);
        // })
      }

      events.$on('reset_zoom', reset_zoom);
      events.$on('zoom_all', function (transform) {
        zoomHandlerAll(transform)
      })

      chartRoot.call(zoom)
        // .on("dblclick.zoom", null)
        // .on("click.zoom", null)
        // .on("dragstart.zoom", null)
        // .on("mousedown.zoom", null);
    }
  }
})