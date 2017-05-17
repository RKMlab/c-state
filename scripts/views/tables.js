'use strict';

const showTable = function () {
  tableSummary.showTableDiv = true;
  $("#common-mask").css({
    "visibility": "visible",
    "opacity": "1"
  });
  $("#table-body").removeClass("fadeOut");
  $("#table-body").addClass("fadeIn");
}

const hideTable = function () {
  $("#common-mask").css({
    "visibility": "hidden",
    "opacity": "0"
  });
  $("#table-body").removeClass("fadeIn");
  $("#table-body").addClass("fadeOut");
  _.delay(() => {
    tableSummary.showTableDiv = false;
  }, 400)
}

Vue.component('tablename', {
  template: `<a @click='openModal' class="table-gene-name">{{data.name}}</a>`,
  props: ['data'],
  methods: {
    openModal() {
      geneModal.$data.gene = _.find(plotScope.genes, ['name', this.data.name]);
      geneModal.$data.showModal = true;
    }
  }
})

Vue.component('tabledetails', {
  template: '#table-details-template',
  props: ['data'],
  data () {
    return {
      buttonText: 'Show',
      show: false,
      expression: [],
      mappedFeatures: []
    }
  },
  methods: {
    toggleDetails: function () {
      this.show = !this.show;
      if (this.show) {
        this.buttonText = 'Hide'
        this.expression = _.find(plotScope.genes, ['name', this.data.name]).expression
        this.mappedFeatures = _.find(plotScope.genes, ['name', this.data.name]).mappedFeatures
      } else {
        this.buttonText = 'Show'
      }
    }
  }
})

const tableSummary = new Vue({
  el: '#table-summary',
  data: {
    showTableDiv: false,
    showFiltered: false,
    columns: ['chrom', 'txStart', 'txEnd', 'name', 'txSize', 'strand', 'geneSymbol', 'exonCount', 'cdsSize', 'isoforms', 'neighbors', 'details', 'description'],
    options: {
      headings: {
        chrom: 'Chromosome',
        txStart: 'Start',
        txEnd: 'End',
        name: 'Gene Name',
        txSize: 'Gene Size (in bp)',
        strand: 'Strand',
        geneSymbol: 'Gene Symbol',
        exonCount: 'Exon Count',
        cdsSize: 'CDS Size',
        isoforms: 'Transcript Variants',
        neighbors: 'Neighboring genes',
        description: 'Description',
        details: 'Details'
      },
      templates:{
        name: 'tablename',
        details: 'tabledetails'
      },
      filterable: true,
      orderBy: {
        column: 'name',
        ascending: true
      },
      skin: 'table-condensed table-striped table-hover table-bordered',
      perPage: 500,
      perPageValues: [10, 25, 50, 100, 500, 1000, 5000],
      pagination:{
        dropdown: true
      },
      texts: {
        filter: 'Search Table for:',
        filterPlaceholder: 'Enter query',
        limit: 'Genes Per Page:'
      }
    },
  },
  computed: {
    tableData: function () {
      const rows = [];
      for (let i = 0; i < plotScope.genes.length; i++) {
        const gene = plotScope.genes[i];
        if (this.showFiltered && !gene.show) {
          continue;
        }
        const obj = {
          id: i,
          name: gene.name,
          show: gene.show,
          chrom: gene.geneinfo.chrom,
          txStart: +gene.geneinfo.txStart,
          txEnd: +gene.geneinfo.txEnd,
          txSize: +gene.geneinfo.txSize,
          strand: gene.geneinfo.strand,
          geneSymbol: gene.geneinfo.geneSymbol,
          exonCount: +gene.geneinfo.exonCount,
          cdsSize: +gene.geneinfo.cdsSize,
          isoforms: gene.geneinfo.isoforms.length,
          neighbors: gene.geneinfo.neighbors.length,
          description: gene.geneinfo.description
        };
        rows.push(JSON.parse(JSON.stringify(obj)));
      }
      return rows;
    },
    totalGenes: function () {
      return plotScope.genes.length;
    }
  },
  mounted: function () {
    this.$on('row-click', function (row) {
      console.log(row.name);
    })
  },
  methods: {
    exportToExcel: function () {
      const data = "<div>" + $(".VueTables__table")[0].outerHTML + "</div>"
      const blob = new Blob([data], {
        type: 'data:application/vnd.ms-excel'
      });
      saveAs(blob, 'cstate_table.xls');
    },

    copyNames: function () {
      const array = $(".VueTables__table").find("td .table-gene-name").toArray();
      const names = _.map(array, 'text');
      const string = names.join('\n');
      const dummy = document.createElement("textarea");
      document.body.appendChild(dummy);
      dummy.setAttribute("id", "tempid")
      document.getElementById("tempid").value = string;
      dummy.select();
      document.execCommand("copy");
      document.body.removeChild(dummy);
      alert(`${names.length} names copied to clipboard`);
    }
  }
})

const tablerow = Vue.component('tablerow', {
  template: '#table-row-template',
  props: ['gene']
});
      