'use strict';

angular.module('cstateApp')
  .controller('ModalCtrl', function ($scope, FileSaver, Blob, $modal, $log) {
    // $scope.awesomeThings = [
    //   'HTML5 Boilerplate',
    //   'AngularJS',
    //   'Karma'
    // ];


$scope.open = function (args) {
    var modalInstance = $modal.open({
      templateUrl: 'ModalContent.html',
      controller: ModalInstanceCtrl,
      scope: $scope,
      windowClass: 'app-modal-window',
      resolve: {
        items: function () {
          return $scope.items;
        },
        gene: function(){
          $scope.selectedGeneName = args.value.selectedGeneName;
          $scope.rawGeneData = args.value.rawGeneData;
          $scope.genes = args.value.genes;
          $scope.features = args.value.features;
      	return $scope.genes;
        }
      }
    });
    modalInstance.result.then(function (selectedItem) {
      $scope.selected = selectedItem;
    }, function () {
      $log.info('Modal dismissed at: ' + new Date() );
    });
  };
  $scope.$on("myEvent", function (event, args) {
      $scope.open(args);
  });
});
// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $modal service used above.

var ModalInstanceCtrl = function ($scope, $modalInstance, items, FileSaver, Blob) {

  $scope.items = items;

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };

  $scope.saveModalasSVG = function(){
    var svgHeaderText1 = '<?xml version="1.0" standalone="no"?>';
    var svgHeaderText2 = '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';

    var title = $("h3.modal-title")[0].innerHTML;
    var Region = $("h4.regionName")[0].innerHTML;

    var legend = $("svg.svgLegendClass")[0].innerHTML;

    var genes = $("td.ng-binding").toArray();
    var plots = $("panel.modalPanel svg").toArray();
    var data = "<svg xmlns='http://www.w3.org/2000/svg' height ='"+(200+genes.length*200)+"' width = '5000' >";
    data = data +"<text x = '10' y ='30' font-family='Arial' font-size='24'>"+ title+"</text>"+ "<text x = '10' y ='55' font-family='Arial' font-size='18'>"+Region +"</text><svg x='1' y ='57' font-family='Arial' height='80'>"+ legend+"</svg>";

    console.log(genes.length);
    for(var i=0; i <genes.length; i++)
    {
        data = data + "<text font-family='Arial' x='10' y='"+(220+200*i)+"'>" + genes[i].innerText + "</text>" +"<svg height='120' width='1300' x='80' y='"+(150+200*i)+"'>"+plots[i].innerHTML+"</svg>" ;
    }
    data = svgHeaderText1 + svgHeaderText2 + data + "</svg>";
    var modalData = new Blob([data], { type: 'text/plain;charset=utf-8' });
    var outFileName = title + '_modal.svg';
    FileSaver.saveAs(modalData, outFileName);
 };
};
