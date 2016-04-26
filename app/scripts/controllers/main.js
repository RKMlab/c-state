'use strict';

angular.module('cstateApp')
  .controller('AccordionCtrl', ['$scope' , function ($scope,$timeout) {
    // $scope.awesomeThings = [
    //   'HTML5 Boilerplate',
    //   'AngularJS',
    //   'Karma'
    // ];
  }]).
	controller('MainCtrl',['$scope',function($scope){
		$scope.$on('LOAD',function(){console.log("Load called");$scope.loading=true});
		$scope.$on('UNLOAD',function(){console.log("Unload called");$scope.loading=false});
	}]);

