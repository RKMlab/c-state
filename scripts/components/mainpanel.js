'use strict';

const mainpanel = Vue.component('mainpanel', {
  template: '#mainpanel-template',
  props: ['gene', 'index'],
  data: function () {
    return plotScope;
  },
  mounted: function () {
    this.plotData();
  },
  methods: {

    openModal: function (gene) {
      console.log(`Modal for ${gene.name} clicked`);
      geneModal.$data.gene = gene;
      showGeneModal();
    },

    plotData: function () {
      const rootElement = this.$el;
      const settings = this.settings.mainPanel;
      const colors = this.settings.general.colors;
      const numCellTypes = this.info.celltypes.length;
      const numFeatures = this.info.features.length;
      const panelWidth = (screen.width - 400) / numCellTypes;
      let geneBarColor = settings.geneBarColor;
      const regionBarColor = settings.regionBarColor;
      const neighborBarColor = settings.neighborBarColor;
      const geneBarHeight = settings.geneBarHeight;
      const regionBarHeight = settings.regionBarHeight;
      const featureBarHeight = settings.featureBarHeight;
      const neighborBarHeight = settings.neighborBarHeight;
      const heightPadding = settings.VPadding;
      let widthPadding = settings.HPadding;
      if (settings.colorByExp) {
        widthPadding += 10;
      }
      let panelHeight = 20 + regionBarHeight + (heightPadding * 2) + featureBarHeight + (numFeatures * (featureBarHeight * 1.5));
      const addition = geneBarHeight > neighborBarHeight ? geneBarHeight * 2 : neighborBarHeight * 2;
      panelHeight += addition;
      const geneBarStart = addition + regionBarHeight;
      const availableHeight = panelHeight - heightPadding;
      const expRange = this.info.expRange;

      const name = this.gene.name;
      const featureNames = _.map(this.info.features, 'name');
      const cellTypeName = this.info.celltypes[this.index].name;
      const expCount = _.find(this.gene.expression, ['name', cellTypeName]).count;
      const mappedFeatures = getFilteredFeatures(_.find(this.gene.mappedFeatures, ['name', cellTypeName]).features);
      const neighbors = this.gene.geneinfo.neighbors;
      const geneStrand = this.gene.geneinfo.strand;

      const colorScale = d3.scaleOrdinal(colors);
      colorScale.domain(featureNames);

      const xScale = d3.scaleLinear()
        .domain([this.gene.geneinfo.RStart, this.gene.geneinfo.REnd])
        .range([widthPadding, panelWidth - widthPadding]);

      const yScale = d3.scaleBand()
        .domain(featureNames)
        .rangeRound([heightPadding, (availableHeight - geneBarStart) - 15])
        .paddingInner(0.5)
        .paddingOuter(0.25)

      const scoreScale = d3.scaleLinear()
        .domain([100, 1000])
        .range([0.1, 1])

      const chartRoot = d3.select(rootElement).append("svg")
        .attr("width", panelWidth)
        .attr("height", panelHeight)
        .attr("class", "svgClass")
      
      // Expression gradient

      if (settings.colorByExp && expCount !== 'NA') {
        let expColors = JSON.parse(JSON.stringify(colorbrewer[settings.expColors][9]));
        if (settings.expColReverse) {
          expColors = expColors.reverse()
        }
        if (settings.expStyle === 1) {
          const geneExpScale = d3.scaleLinear()
            .domain([expRange.five, expRange.nineFive])
            .clamp(true)
            .range([(availableHeight - geneBarStart) - 15, heightPadding])

          const defs = chartRoot.append("defs");
          const expGradient = defs.append("linearGradient")
            .attr("id", "expgradient")
            .attr("x1", "0%")
            .attr("y1", "100%")
            .attr("x2", "0%")
            .attr("y2", "0%")
          
          expGradient.selectAll("stop")
            .data(expColors)
            .enter()
            .append("stop")
            .attr("offset", function (d, i) {
              return `${(100/(expColors.length-1)) * i}%`
            })
            .attr("stop-color", function (d) {
              return d;
            })

          const gradient = chartRoot.append("rect")
            .attr("x", 2)
            .attr("y", heightPadding)
            .attr("width", 8)
            .attr("height", ((availableHeight - geneBarStart) - 15)-heightPadding)
            .attr("fill", "url(#expgradient)")
          
          gradient.append("svg:title")
            .text(`Expression in ${cellTypeName}: ${expCount}`);
          
          chartRoot.append("rect")
            .attr("x", 0)
            .attr("y", geneExpScale(expCount))
            .attr("width", 12)
            .attr("height", 5)
            .attr("fill", geneBarColor)
            .append("svg:title")
              .text(`Expression in ${cellTypeName}: ${expCount}`);
        } else {
          const geneExpScale = d3.scaleLinear()
            .domain([expRange.five, expRange.nineFive])
            .clamp(true)
            .range([expColors[0], expColors[expColors.length - 1]])
          
          geneBarColor = geneExpScale(expCount)
        }
      }

      const xAxis = d3.axisBottom(xScale)
        .ticks(5)
        .tickFormat(function (d) {
          return d / 1000;
        });

      const xAxisElement = chartRoot.append("g")
        .attr("class", "x-axis") //Assign "x axis" class
        .attr("transform", "translate(0," + availableHeight + ")")
        .call(xAxis);

      const chart = chartRoot.append("g")

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
          });

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

      if (settings.showNeighbors) {
        const neighborBars = chart.selectAll("neighbor")
          .data(neighbors)
          .enter()
          .append("g")
          .attr("transform", function (d, i) {
            const y = d.strand === geneStrand ? (availableHeight - geneBarStart) + (geneBarHeight - neighborBarHeight) : (availableHeight - geneBarStart) + geneBarHeight + regionBarHeight;
            return "translate(" + xScale(d.FStart) + ',' + y + ')';
          })

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
        
        exonBars.append("svg:title")
          .text(function (d, i) {
            return `Exon ${i + 1} of ${name}\nStart (from TSS): ${d.start}\nExon Size: ${+d.end - +d.start}bp\nExpression count: ${expCount}`;
          })

        const geneBar = chart.append("g")
          .attr("transform", "translate(" + xScale(this.gene.geneinfo.GStart) + "," + ((availableHeight - geneBarStart) + geneBarHeight) + ")");

        geneBar.append("rect")
          .attr("width", xScale(this.gene.geneinfo.GEnd) - xScale(this.gene.geneinfo.GStart))
          .attr("height", regionBarHeight)
          .style("fill", geneBarColor);
        
        geneBar.append("svg:title")
          .text(`Expression count: ${expCount}`)

      } else {
        const geneBar = chart.append("g")
          .attr("transform", "translate(" + xScale(this.gene.geneinfo.GStart) + "," + (availableHeight - geneBarStart) + ")");

        geneBar.append("rect")
          .attr("width", xScale(this.gene.geneinfo.GEnd) - xScale(this.gene.geneinfo.GStart))
          .attr("height", (geneBarHeight + regionBarHeight))
          .style("fill", geneBarColor);
        
        geneBar.append("svg:title")
          .text(`Expression count: ${expCount}`)
      }
    }
  }
})