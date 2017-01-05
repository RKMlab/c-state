'use strict';

const expfilerow = Vue.component('expfilerow', {
  template: '#expfilerow-template',
  props: ['file'],
  data: function () {
    return {
      cellType: {
        name: '',
        value: ''
      },
    }
  },
  mounted: function () {
    this.parseFileName();
    events.$on('process-features', this.sendExpData)
  },
  destroyed: function () {
    events.$off('process-features', this.sendExpData)
  },
  methods: {

    parseFileName: function () {
      let nameSplit = this.file.name.split('.');
      this.$data.cellType.name = nameSplit[0];
    },

    sendExpData: function () {
      if (!this.cellType.name) {
        handleError(`Please fill the celltype name for file ${this.file.name}`);
      }
      this.cellType.value = this.cellType.name.toUpperCase();
      readFile(this.file, e => {
        validateExp(e.target.result, this.file.name);
        formatSendData();
      });

      const formatSendData = () => {
        const data = _.pick(this.$data, ['cellType']);
        data.file = this.file;
        console.log(`Sending data of ${this.file.name}`);
        this.$emit('expadd', data)
      }
    }
  }
})