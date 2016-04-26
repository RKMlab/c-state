angular.module('cstateApp').controller('AccordionCtrl', function ($scope, geneNameFilter, marksCountFilter,
    marksCountWrtTSSFilter, patternFilter, FileSaver, Blob, usSpinnerService, $rootScope, $timeout, $q) {
    "use strict";
    // $scope.awesomeThings = ['HTML5 Boilerplate', 'AngularJS', 'Karma'];
    $scope.operators = [{
        name: "=",
        value: "="
    }, {
        name: "<",
        value: "<"
    }, {
        name: "<=",
        value: "<="
    }, {
        name: ">",
        value: ">"
    }, {
        name: ">=",
        value: ">="
    }];
    $scope.searchTypes = [{
        name: "Upstream",
        value: "Upstream"
    }, {
        name: "Downstream",
        value: "Downstream"
    }, {
        name: "Near",
        value: "Near"
    }, {
        name: "Overlap",
        value: "Overlap"
    }];
    $scope.filter = {
        Gene: ""
    };
    $scope.genomes = [];
    d3.tsv("genomes/genomes.list", function (d) {
        $scope.genomes = d;
        $scope.filter.selectedGenome = $scope.genomes[0];
    });
    $scope.getNames = function () {
        $scope.identifiers = $scope.filter.selectedGenome.id.split(',');
        $scope.filter.selectedIdentifier = $scope.identifiers[0];
    };
    $scope.getIdentifiers = function (genome, list) {
        $scope.identifiers = [];
        for (var i = 0; i < list.length; i = i + 1) {
            if (list[i].genome == genome.name) {
                $scope.identifiers.push(list[i]);
            }
        }
        $scope.filter.selectedIdentifier = $scope.identifiers[0];
    };
    $scope.allIdentifiers = [];
    d3.csv("genomes/identifiers.list", function (d) {
        $scope.allIdentifiers = d;
        $scope.getIdentifiers($scope.genomes[0], $scope.allIdentifiers);
    });
    $scope.cellTypes = [];
    $scope.counts = {
        panelWidth: 0,
        numTotalGenes: 0,
        numFilteredGenes: 0,
        genesFileName: "",
        exonsFileName: ""
    };
    $scope.filteredGenesKeys = {};
    //gaurs: this is set to false so that the filters and visualizations pane can stay open at the same time and the
    //effect of applying filters can be seen dynamically
    $scope.oneAtATime = false;
    $scope.status = {
        filesOpen: true,
        filtersOpen: false,
        visualizationOpen: false
    };
    $scope.filter.regionType = "RegionFlank";
    $scope.filter.FlankingSize = 20;
    $scope.rawGenes = [];
    $scope.myFiles = {
        files: {},
        features: {},
        genesFile: {},
        regionsFile: {},
        annotationsFile: {},
        featuresFiles: []
    }; //gaurs: adding this here so that the files controller can load the files here
    if (!angular.isUndefined($scope.myFiles.originalFiles)) {
        $scope.numTotalGenes = _.keys($scope.myFiles.originalFiles[0]).length;
    }
    $scope.$watch('filter.Gene', function (newVal, oldVal, scope) {
        var fileName = "",
            filteredKeys = [];
        for (fileName in $scope.myFiles.originalFiles) {
            $scope.myFiles.files[fileName] = geneNameFilter($scope.myFiles.originalFiles[fileName],
                $scope.filter);
        }
        filteredKeys = _.keys(_.values($scope.myFiles.files)[0]);
        $scope.counts.numFilteredGenes = filteredKeys ? filteredKeys.length : 0;
        $scope.filteredGenesKeys = filteredKeys;
    });
    $scope.$watch('filter.allowPartials', function (newVal, oldVal, scope) {
        var fileName = "",
            filteredKeys = [];
        for (fileName in $scope.myFiles.originalFiles) {
            $scope.myFiles.files[fileName] = geneNameFilter($scope.myFiles.originalFiles[fileName],
                $scope.filter);
        }
        filteredKeys = _.keys(_.values($scope.myFiles.files)[0]);
        $scope.counts.numFilteredGenes = filteredKeys ? filteredKeys.length : 0;
        $scope.filteredGenesKeys = filteredKeys;
    });
    $scope.$watch('filter.selectedOperator', function (newVal, oldVal, scope) {
        filterValues(marksCountFilter, $scope.filter);
    });
    $scope.$watch('filter.myCellType', function (newVal, oldVal, scope) {
        filterValues(marksCountFilter, $scope.filter);
    });
    $scope.$watch('filter.myCellType', function (newVal, oldVal, scope) {
        filterValues(marksCountWrtTSSFilter, $scope.filter);
    });
    $scope.$watch('filter.FeaturesCount', function (newVal, oldVal, scope) {
        filterValues(marksCountFilter, $scope.filter);
    });
    $scope.$watch('filter.tssFeaturesDist', function (newVal, oldVal, scope) {
        filterValues(marksCountWrtTSSFilter, $scope.filter);
    });
    $scope.$watch('filter.myCellTypeForPattern', function (newVal, oldVal, scope) {
        filterBasedOnPattern(patternFilter, $scope.filter);
    });
    $scope.$watch('filter.firstFeature', function (newVal, oldVal, scope) {
        filterBasedOnPattern(patternFilter, $scope.filter);
    });
    $scope.$watch('filter.secondFeature', function (newVal, oldVal, scope) {
        filterBasedOnPattern(patternFilter, $scope.filter);
    });
    $scope.$watch('filter.selectedSearchType', function (newVal, oldVal, scope) {
        filterBasedOnPattern(patternFilter, $scope.filter);
    });
    $scope.$watch('filter.minDist', function (newVal, oldVal, scope) {
        filterBasedOnPattern(patternFilter, $scope.filter);
    });
    $scope.$watch('filter.maxDist', function (newVal, oldVal, scope) {
        filterBasedOnPattern(patternFilter, $scope.filter);
    });
    $scope.isCellTypeSelected = function (cellTypeName) {
        if ($scope.filter.myCellType && $scope.filter.myCellType.name == cellTypeName) {
            return true;
        } else {
            return false;
        }
    };
    $scope.isCellTypeForPatternSelected = function (cellTypeName) {
        if ($scope.filter.myCellTypeForPattern && $scope.filter.myCellTypeForPattern.name == cellTypeName) {
            return true;
        } else {
            return false;
        }
    };

    function filterValues(filterFunction, filter) {
        //$scope.cellTypesMap = {G0:allG0Data,MT:allMTData,MB:allMBData,MC:allMCData};
        var selectedCellTypeName;
        if ($scope.filter.myCellType) {
            selectedCellTypeName = $scope.filter.myCellType.name;
            var selectedCellType = $scope.myFiles.originalFiles[selectedCellTypeName];
            var filteredGenes = filterFunction(selectedCellType, filter);
            var filteredKeys = _.keys(filteredGenes);
            for (var fileName in $scope.myFiles.originalFiles) {
                $scope.myFiles.files[fileName] = _.pick($scope.myFiles.originalFiles[fileName], filteredKeys);
            }
            $scope.counts.numFilteredGenes = filteredKeys.length;
            $scope.filteredGenesKeys = filteredKeys;
        }
    }

    function filterBasedOnPattern(filterFunction, filter) {
        var selectedCellTypeName;
        if ($scope.filter.myCellTypeForPattern) {
            selectedCellTypeName = $scope.filter.myCellTypeForPattern.name;
            var selectedCellType = $scope.myFiles.originalFiles[selectedCellTypeName];
            var filteredGenes = filterFunction(selectedCellType, filter);
            var filteredKeys = _.keys(filteredGenes);
            for (var fileName in $scope.myFiles.originalFiles) {
                $scope.myFiles.files[fileName] = _.pick($scope.myFiles.originalFiles[fileName], filteredKeys);
            }
            $scope.counts.numFilteredGenes = filteredKeys.length;
            $scope.filteredGenesKeys = filteredKeys;
        }
    }
    $scope.getFilteredGenes = function () {
        // return $scope.filteredGenesKeys;
        var csvArray = [];
        var filterDetails = "";
        filterDetails += "Filter Settings\r\n\r\n";
        if ($scope.filter.filterType == "Pattern") {
            filterDetails += "Filtering Based on Pattern\r\n\r\n";
            filterDetails += "Cell Type = " + $scope.filter.myCellType.name + "\r\n\r\n";
            if ($scope.filter.FeaturesCount && $scope.filter.selectedOperator) {
                filterDetails += "Marks Count " + $scope.filter.selectedOperator.name + " " + $scope.filter
                    .FeaturesCount + "\r\n\r\n";
            }
            if ($scope.filter.tssFeaturesDist) {
                filterDetails += "Distance from TSS = " + $scope.filter.tssFeaturesDist + "KB\r\n\r\n";
            }
            if ($scope.filter.firstFeature) {
                filterDetails += "First Feature = " + $scope.filter.firstFeature + "\r\n\r\n";
            }
            if ($scope.filter.selectedSearchType) {
                filterDetails += "Relation = " + $scope.filter.selectedSearchType.name + "\r\n\r\n";
            }
            if ($scope.filter.secondFeature) {
                filterDetails += "Second Feature = " + $scope.filter.secondFeature + "\r\n\r\n";
            }
            if ($scope.filter.minDist) {
                filterDetails += "Min Dist = " + $scope.filter.minDist + "KB\r\n\r\n";
            }
            if ($scope.filter.maxDist) {
                filterDetails += "Max Dist = " + $scope.filter.maxDist + "KB\r\n\r\n";
            }
            filterDetails += "Filtered " + $scope.counts.numFilteredGenes + "/" + $scope.counts.numTotalGenes +
                " Genes\r\n\r\n";
        }
        _.each($scope.filteredGenesKeys, function (element, index, list) {
            filterDetails += element + "\r\n";
        });
        var data = new Blob([filterDetails], {
            type: 'text/plain;charset=utf-8'
        });
        FileSaver.saveAs(data, 'FilteredGenes.txt');
        //return csvArray;
        //return [["abcd",'efgh',1234,5678]];
    };
    // $scope.order = [ 'b', 'a', 'c' ];
    $scope.getTab = function () {
        return "\t";
    };
    $scope.getHeader = function () {
        return ["Gene", "RegionStart", "RegionStop", "GeneStart", "GeneStop", "Feature", "FeatureStart",
            "FeatureStop", "PeakIntensity"
        ];
    };
    $scope.createCstateIntermediateFormatCover = function () {
        var sortedRows;
        var deferred = $q.defer();
        if (!$scope.spinneractive) {
            usSpinnerService.spin('spinner-1');
            console.log("spinner started"); // $scope.startcounter++;
        }
        sortedRows = $timeout(function () {
            return $scope.createCstateIntermediateFormat();
        });
        deferred.resolve(sortedRows);
        return sortedRows;
    };
    $scope.createGenesBedFile = function () {
        var genesList = $scope.myFiles.genesListFile;
        var selectedGenome = "";
        if (!genesList) {
            alert('Genes List File missing!');
            throw new Error('Genes List missing!');
        } else {
            try {
                selectedGenome = $scope.filter.selectedGenome.value;
            } catch (TypeError) {
                alert('Genome is not selected!');
                throw new Error('Genome is not selected');
            }
        }
        console.log("Loading the genome file");
        var selectedIdentifier = $scope.filter.selectedIdentifier.value;
        console.log(selectedIdentifier);
        var genomeFileName = "genomes/" + selectedGenome + ".genes.tsv";
        console.log(genomeFileName);
        // var parseGenomeFile = function (argument) {
        //   $scope.myFiles.genomeFile = d3.tsv.parseRows(genomeFileName,);
        // };
        var readGenomeFile = function (geneData, genomeFileName) {
            var genomeData;
            d3.tsv(genomeFileName, function (d) {
                genomeData = d;
                processGeneData(geneData, genomeData);
            });
        };
        var processGeneData = function (ele1, ele2) {
            var geneData = ele1;
            var genomeData = ele2;
            var finalResult = _.map(geneData, function (gene) {
                var region = _.find(genomeData, function (r) {
                    return r[selectedIdentifier].toUpperCase() == gene[0].toUpperCase();
                });
                if (region) {
                    return [region.Chromosome, region.Start, region.Stop, region.Name, region.Size,
                        region.Orientation
                    ].join('\t');
                }
            });
            console.log(finalResult);
            finalResult = finalResult.filter(Boolean);
            if (finalResult.length < geneData.length) {
                var unmapped = geneData.length - finalResult.length;
                alert(unmapped + ' out of ' + geneData.length + ' genes could not be mapped');
            }
            var finalResultText = "";
            _.each(finalResult, function (element, index, list) {
                finalResultText += element + "\r\n";
            });
            var data = new Blob([finalResultText], {
                type: 'text/plain;charset=utf-8'
            });
            FileSaver.saveAs(data, 'genes.bed');
        };
        readGenomeFile(genesList, genomeFileName);
    };
    $scope.createCstateIntermediateFormat = function () {
        // return $scope.filteredGenesKeys;
        var genesFile = $scope.myFiles.genesFile;
        if (_.isEmpty(genesFile)) {
            alert('Genes BED File missing!');
            if ($scope.spinneractive) {
                usSpinnerService.stop('spinner-1');
                console.log("Spinner Stopped");
            }
            throw new Error('Genes BED File missing!');
        }
        var regionsFile = $scope.myFiles.regionsFile;
        var annotationsFile = $scope.myFiles.annotationsFile;
        var featuresFiles = $scope.myFiles.featuresFiles;
        if (featuresFiles.length === 0) {
            alert('Features are not loaded!');
            if ($scope.spinneractive) {
                usSpinnerService.stop('spinner-1');
                console.log("Spinner Stopped");
            }
            throw new Error('Features Files missing!');
        }
        console.log('createCstateIntermediateFormat called');
        console.log($scope.myFiles.genesFile);
        console.log($scope.myFiles.regionsFile);
        console.log($scope.myFiles.featuresFiles);
        // $scope.$emit("LOAD");
        // $timeout
        var genesWithRegionDetails;
        if (!isNaN(regionsFile)) {
            genesWithRegionDetails = _.map(genesFile, function (gene) {
                var region = _.find(regionsFile, function (r) {
                    return r[3] == gene[3];
                });
                if (region) {
                    gene[6] = region[1];
                    gene[7] = region[2];
                }
                return gene; // need to re-order columns as per cstate file order
            });
        } else {
            genesWithRegionDetails = _.map(genesFile, function (gene) {
                var flankingSize = $scope.filter.FlankingSize ? $scope.filter.FlankingSize * 1000 :
                    20000;
                gene[6] = parseInt(gene[1]) - flankingSize;
                gene[7] = parseInt(gene[2]) + flankingSize;
                return gene;
            });
        }
        var mappedFeatures = [];
        _.each(featuresFiles, function (featuresFile, index, list) {
            var features = featuresFile.value;
            mappedFeatures = mappedFeatures.concat(_.map(features, function (feature) {
                var containingRegion = _.find(genesWithRegionDetails, function (gene) {
                    return ((feature[0] == gene[0]) && (feature[1] - gene[6] >=
                        0) && (gene[7] - feature[2] >= 0));
                });
                if (containingRegion) {
                    var regionStart = containingRegion[6];
                    var regionStop = containingRegion[7];
                    var geneStart = containingRegion[1];
                    var geneStop = containingRegion[2];
                    var featureStart = feature[1];
                    var featureStop = feature[2];
                    var relativeRegionStart;
                    var relativeRegionStop;
                    var relativeFeatureStart;
                    var relativeFeatureStop;
                    if (containingRegion[5] == "+") {
                        relativeFeatureStart = featureStart - geneStart;
                        relativeRegionStart = regionStart - geneStart;
                    } else {
                        relativeFeatureStart = geneStop - featureStop;
                        relativeRegionStart = geneStop - regionStop;
                    }
                    relativeFeatureStop = relativeFeatureStart + (featureStop -
                        featureStart);
                    relativeRegionStop = relativeRegionStart + (regionStop -
                        regionStart);
                    return [containingRegion[3],
                        relativeRegionStart,
                        relativeRegionStop,
                        0,
                        Math.abs(geneStop - geneStart),
                        this,
                        relativeFeatureStart,
                        relativeFeatureStop,
                        d3.round(feature[4], 2)
                    ];
                } else {
                    //           console.log(feature);
                    //           return ("");
                }
            }, featuresFile.name));
        });
        var cleanedRows = _.filter(mappedFeatures, function (feature) {
            return typeof feature != 'undefined';
        }); // skips out the blank rows
        var mappedGenes = _.uniq(_.pluck(cleanedRows, 0));
        var unmappedGenesRows = _.reject(genesWithRegionDetails, function (gene) {
            return _.contains(mappedGenes, gene[3]);
        });
        var unmappedGenesDummyRows = _.map(unmappedGenesRows, function (gene) {
            var relativeRegionStart, relativeRegionStop;
            var regionStart = gene[6];
            var regionStop = gene[7];
            var geneStart = gene[1];
            var geneStop = gene[2];
            if (gene[5] == "+") {
                relativeRegionStart = regionStart - geneStart;
            } else {
                relativeRegionStart = geneStop - regionStop;
            }
            relativeRegionStop = relativeRegionStart + (regionStop - regionStart);
            return [gene[3], relativeRegionStart, relativeRegionStop, 0, Math.abs(geneStop -
                geneStart), "-", "-", "-", 0];
        });
        cleanedRows = cleanedRows.concat(unmappedGenesDummyRows);
        var sortedRows = cleanedRows.sort(function (a, b) {
            return d3.ascending(a[0], b[0]);
        });
        if ($scope.spinneractive) {
            usSpinnerService.stop('spinner-1');
            console.log("Spinner Stoppped");
        }
        return sortedRows;
    };
    $scope.clearAllFilters = function () {
        $scope.filter.selectedOperator = null;
        $scope.filter.myCellType = "";
        $scope.filter.myCellTypeForPattern = "";
        $scope.filter.allowPartial = null;
        $scope.filter.FeaturesCount = null;
        $scope.filter.Gene = "";
        $scope.filter.tssFeaturesDist = null;
        $scope.filter.selectedPattern = null;
        $scope.filter.selectedSearchType = null;
        $scope.filter.firstFeature = null;
        $scope.filter.secondFeature = null;
        $scope.filter.minDist = null;
        $scope.filter.maxDist = null;
        //    $scope.data.selectedPatterns = null;
        var fileName = "";
        for (fileName in $scope.myFiles.originalFiles) {
            $scope.myFiles.files[fileName] = $scope.myFiles.originalFiles[fileName];
        }
        for (fileName in $scope.myFiles.files) {
            for (var gene in $scope.myFiles.files[fileName]) {
                if ($scope.myFiles.files[fileName][gene].selectedPatterns) {
                    $scope.myFiles.files[fileName][gene].selectedPatterns = null;
                }
            }
        }
        $scope.counts.numFilteredGenes = _.keys(_.values($scope.myFiles.originalFiles)[0]).length;
    };
    $scope.getPanelWidth = function () {
        return 1500 / $scope.myFiles.files.length;
    }
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
    $rootScope.$on('us-spinner:spin', function (event, key) {
        $scope.spinneractive = true;
    });
    $rootScope.$on('us-spinner:stop', function (event, key) {
        $scope.spinneractive = false;
    });
    $scope.openModal = function (gene) {
        var selectedGeneName = gene[0].Gene;
        var genesData = {};
        genesData.selectedGeneName = selectedGeneName;
        var genes = {};
        for (var i = 0; i < _.size($scope.myFiles.files) ; i = i + 1) {
            var cellType = _.keys($scope.myFiles.files)[i];
            genes[cellType] = $scope.myFiles.files[cellType][selectedGeneName];
        }
        genesData.rawGeneData = $scope.rawGenes[0] ? $scope.rawGenes[0].filter(function (d) {
            return d.Gene == selectedGeneName;
        })[0] : [];
        //genesData.rawGeneData = $scope.rawGenes[0].filter(function (d){return d.Gene==selectedGeneName;})[0];
        genesData.genes = genes;
        genesData.features = $scope.myFiles.features;
        $scope.$root.$broadcast("myEvent", {
            value: genesData
        });
    };
});