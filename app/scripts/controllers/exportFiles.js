angular.module('cstateApp').controller('ExportFilesCtrl', function ($scope, geneNameFilter, marksCountFilter,
    marksCountWrtTSSFilter, patternFilter, FileSaver, Blob, usSpinnerService, $rootScope, $timeout, $q) {
    "use strict";

    $scope.getFilteredGenes = function () {
        // return $scope.filteredGenesKeys;
        var csvArray = [];
        var filterDetails = "";
        filterDetails += "Filter Settings\r\n\r\n";
        if ($scope.filter.filterType == "Pattern") {
            filterDetails += "Filtering Based on Pattern\r\n\r\n";
            filterDetails += "Cell Type = " + $scope.filter.myCellTypeForPattern.name + "\r\n\r\n";
            
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
        } else if ($scope.filter.filterType == "Marks") {
            filterDetails += "Filtering Based on Features\r\n\r\n";
            filterDetails += "Cell Type = " + $scope.filter.myCellType.name + "\r\n\r\n";
            if ($scope.filter.FeaturesCount && $scope.filter.selectedOperator) {
                filterDetails += "Features Count " + $scope.filter.selectedOperator.name + " " + $scope.filter
                    .FeaturesCount + "\r\n\r\n";
            }
            if ($scope.filter.tssFeaturesDist) {
                filterDetails += "Distance from TSS = " + $scope.filter.tssFeaturesDist + "KB\r\n\r\n";
            }
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

});