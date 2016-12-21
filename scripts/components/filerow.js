'use strict';

const filerow = Vue.component('filerow', {
  template: '#filerow-template',
  props: ['file'],
  data: function () {
    return {
      cellType: {
        name: '',
        value: '',
      },
      feature: {
        name: '',
        value: ''
      },
      formatOptions: [{
        name: 'BED',
        value: 'bed'
      }, {
        name: 'Broad Peak',
        value: 'broadpeak'
      }, {
        name: 'Narrow Peak',
        value: 'narrowpeak'
      }],
      formatSelected: '',
      fileData: ''
    }
  },
  mounted: function () {
    this.parseFileName();
    events.$on('process-features', this.sendDataToParent)
  },
  destroyed: function () {
    events.$off('process-features', this.sendDataToParent)
  },
  computed: {
      getCellTypeValue () {
      },
      getFeatureValue () {
      }
  },
  methods: {
    
    parseFileName: function () {
      let name_split = this.file.name.split('.');
      const extension = name_split.pop().toLowerCase();
      if (_.includes( _.map(this.$data.formatOptions, 'value'), extension)) {
        this.$data.formatSelected = extension;
      }
      name_split = name_split[0].split('_');
      if (name_split.length > 1) {
        this.$data.cellType.name = name_split[0];
        this.$data.feature.name = name_split[1];
      }
    },

    sendDataToParent: function () {
      if (!this.cellType.name || !this.feature.name || !this.formatSelected) {
        handleError(`Please fill all details for file ${this.file.name}`);
      }
      this.cellType.value = this.cellType.name.toUpperCase();
      this.feature.value = this.feature.name.toUpperCase();
      readFile(this.file, e => {
        validateBED(e.target.result, this.file.name);
        formatSendData();
      });

      const formatSendData = () => {
        const data = _.pick(this.$data, ['cellType', 'feature', 'formatSelected']);
        data.file = this.file;
        console.log(`Sending data of ${this.file.name}`);
        this.$emit('add', data);
      }
    }
  }
})