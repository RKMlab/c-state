'use strict';

angular
  .module('cstateApp', [
  	'ui.bootstrap', //gaurs: added this to make the bootstrap things work
    'angularFileUpload', //gaurs: added this to make ng-file-upload available as a service
    'ngCsv',
    'ngActivityIndicator',
    'ng-drag-scroll',
    'ngFileSaver',
    'angularSpinner'
  	]);
