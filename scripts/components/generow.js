'use strict';

const generow = Vue.component('generow', {
  template: '#generow-template',
  props: ['gene'],
  data: function () {
    return plotScope;
  }
});