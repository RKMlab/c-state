angular.module('cstateApp').controller('ExportSVGCtrl', function ($scope, geneNameFilter, marksCountFilter,
    marksCountWrtTSSFilter, patternFilter, FileSaver, Blob, usSpinnerService, $rootScope, $timeout, $q) {
    "use strict";

    $scope.exportSelectedPanels = function () {
        console.log("going to export selected panels");
        var svgHeaderText1 = '<?xml version="1.0" standalone="no"?>';
        var svgHeaderText2 =
            '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';
        var svgArray = $("svg.svgClass").toArray();
        var columnHeadersArray = $("b.ng-binding").toArray();
        var panelHeadersArray = $(".panel-header").toArray();
        var pageWidthFactor = 500;
        var panelHeightFactor = 200;
        var rows = svgArray.length / columnHeadersArray.length;
        var legend = $("svg.svgLegendClass")[0].innerHTML;
        var legendWrapper = '<g transform = "translate(' + (columnHeadersArray.length * pageWidthFactor / 2 -
            150) + ',' + (rows * panelHeightFactor + 100) + ')">';
        legend = legendWrapper + legend + "</g>";
        var text = "<svg xmlns=\"http://www.w3.org/2000/svg\" width = \"" + columnHeadersArray.length *
            pageWidthFactor + "\" height = \"" + (rows * panelHeightFactor + 200) + "\">";
        var i = 0;
        for (i = 0; i <= columnHeadersArray.length - 1; i++) {
            var colHeader = '<text x = "' + ((pageWidthFactor * (i + 0.5)) - 25) +
                '" y="30" ext-anchor="middle">' + columnHeadersArray[i].innerHTML + '</text>';
            text = text + colHeader;
        }
        //text = text + header;
        for (i = svgArray.length - 1; i >= 0; i--) {
            var horizontalDisp = (Math.ceil((i + 1) / rows) - 1) * pageWidthFactor + 50;
            var vertDisp = (i % rows) * panelHeightFactor + 100;
            var hText = '<g transform="translate(' + horizontalDisp + ',' + vertDisp + ')">';
            var panelHeader = "<text x=\"175\" y=\"0\" text-anchor=\"middle\" fill=\"red\">" +
                panelHeadersArray[i].innerHTML + "</text>";
            var panel = '<g transform="translate(0,10)">';
            text = text + hText + panelHeader + panel + svgArray[i].innerHTML + "</g></g>";
        }
        text = svgHeaderText1 + svgHeaderText2 + text + legend + "</svg>";
        var data = new Blob([text], {
            type: 'text/plain;charset=utf-8'
        });
        FileSaver.saveAs(data, 'data.svg');
    };

});