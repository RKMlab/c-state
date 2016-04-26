angular.module('cstateApp').controller('FilesCtrl', function ($scope, $q, $timeout, usSpinnerService, $rootScope) {
    'use strict';
    // $scope.awesomeThings = ['HTML5 Boilerplate', 'AngularJS', 'Karma'];
    $scope.onCstateFilesSelect = function ($files) {
        //$files: an array of files selected, each file has name, size, and type.
        if ($files.length > 0) {
            $scope.myFiles.rawText = [];
            $scope.myFiles.files = {};
            $scope.myFiles.features = {};
            $scope.myFiles.originalFiles = {};
            $scope.myFiles.width = [];
            $scope.myFiles.widthZoom = [];
            $scope.cellTypes.length = 0;
            $scope.rawGenes.length = 0;
        }
        $scope.$apply(function () {
            // $scope.cellTypes
            function getRawDataFromFile(file) {
                var defered = $q.defer();
                var reader = new FileReader();
                reader.onload = function (e) {
                    var text = e.target.result;
                    $scope.myFiles.rawText[file.name] = text;
                    defered.resolve([file.name]);
                };
                reader.readAsText(file);
                return defered.promise;
            }

            function traverseFiles(files) {
                var promises = [];
                for (var i = 0; i < files.length; i++) {
                    var promise = getRawDataFromFile(files[i]);
                    promise.then(function (fileName) {
                        console.log("completed reading " + fileName);
                    });
                    promises.push(promise);
                }
                $q.all(promises).then(processAllFiles);
                //_.map(cellTypeFiles,getRawDataFromFile(file));
            }

            function processAllFiles() {
                console.log("processing all files now");
                console.log("read files = " + $scope.myFiles.rawText.length);
                if ($scope.spinneractive) {
                    usSpinnerService.stop('spinner-1');
                }
                console.log("End loading");
                var cellTypeFiles = [];
                for (var i = $files.length - 1; i >= 0; i--) {
                    var file = $files[i];
                    var exonsFile;
                    var genesFile;
                    if (file.name.split("_")[0] == "exons") {
                        exonsFile = file;
                    }
                    if (file.name.split("_")[0] != "exons" && file.name.split("_")[0] != "genes.bed") {
                        cellTypeFiles.push(file);
                    }
                    if (file.name.split(".")[0] == "genes") {
                        genesFile = file;
                    }
                }
                var parsedExonData = [];
                if (exonsFile) {
                    var exonsText = $scope.myFiles.rawText[exonsFile.name];
                    parsedExonData = d3.tsv.parse(exonsText);
                }
                if (genesFile) {
                    var genesText = $scope.myFiles.rawText[genesFile.name];
                    var headers = ["Chromosome", "Start", "Stop", "Gene", "Length", "Orientation"].join("\t");
                    $scope.rawGenes.push(d3.tsv.parse(headers + "\n" + genesText));
                }
                for (var i = 0; i < cellTypeFiles.length; i++) {
                    var text = $scope.myFiles.rawText[cellTypeFiles[i].name];
                    if (text) {
                        var parsedData = d3.tsv.parse(text);
                        var parsedDataWithExons = parsedData.concat(parsedExonData);
                        var nestedData = d3.nest().key(function (d) {
                            return d.Gene;
                        }).map(parsedDataWithExons);
                        $scope.myFiles.features = _.without(_.union($scope.myFiles.features, _.uniq(_.pluck(parsedDataWithExons, "Feature"))), "-");
                        $scope.myFiles.features = _.sortBy($scope.myFiles.features, function (item) {
                            return item;
                        });
                        var cellTypeName = cellTypeFiles[i].name.split("_")[0];
                        $scope.myFiles.files[cellTypeName] = nestedData;
                        $scope.myFiles.originalFiles[cellTypeName] = nestedData;
                        $scope.cellTypes.push({
                            "name": cellTypeName,
                            "value": cellTypeName
                        });
                        $scope.counts.numTotalGenes = _.keys($scope.myFiles.originalFiles[cellTypeName]).length;
                        $scope.counts.numFilteredGenes = _.keys($scope.myFiles.originalFiles[cellTypeName]).length;
                        $scope.counts.genesFileName =  genesFile.name;
                        $scope.counts.exonsFileName =  exonsFile.name;
                    }
                }
                $scope.myFiles.width.push({
                    "value": 1200 / cellTypeFiles.length
                });
                $scope.myFiles.widthZoom.push({
                    "value": 1300
                });
            }
            traverseFiles($files);
            $scope.status.filesOpen = false;
            $scope.status.visualizationOpen = true;
            // $scope.$emit('UNLOAD');
        });
    };
    $rootScope.$on('us-spinner:spin', function (event, key) {
        $scope.spinneractive = true;
    });
    $rootScope.$on('us-spinner:stop', function (event, key) {
        $scope.spinneractive = false;
    });
    $scope.onCstateFilesSelectCover = function ($files) {
        // $scope.$emit('LOAD');
        console.log("Start loading");
        if (!$scope.spinneractive) {
            usSpinnerService.spin('spinner-1');
            // $scope.startcounter++;
        }
        $scope.onCstateFilesSelect($files);
    };
    $scope.onGenesFileSelect = function ($files) {
        console.log("GenesFileSelect Called!");
        if ($files.length > 0) {
            var geneFile = $files[0];
            var parseGenesFiles = function (argument) {
                $scope.myFiles.genesFile = d3.tsv.parseRows(argument);
            };
            var r = new FileReader();
            r.onload = (function (geneFile) {
                return function (e) {
                    parseGenesFiles(e.target.result);
                };
            })(geneFile);
            r.readAsText(geneFile);
        }
    };
    $scope.onGenesListFileSelect = function ($files) {
        console.log("GenesListSelect Called!");
        if ($files.length > 0) {
            var genesListFile = $files[0];
            var parseGenesListFiles = function (argument) {
                $scope.myFiles.genesListFile = d3.tsv.parseRows(argument);
            };
            var r = new FileReader();
            r.onload = (function (genesListFile) {
                return function (e) {
                    parseGenesListFiles(e.target.result);
                };
            })(genesListFile);
            r.readAsText(genesListFile);
        }
    };
    $scope.onRegionsFileSelect = function ($files) {
        console.log("RegionsFileSelect Called!");
        if ($files.length > 0) {
            var regionsFile = $files[0];
            var parseRegionsFiles = function (argument) {
                $scope.myFiles.regionsFile = d3.tsv.parseRows(argument);
            };
            var r = new FileReader();
            r.onload = (function (regionsFile) {
                return function (e) {
                    parseRegionsFiles(e.target.result);
                };
            })(regionsFile);
            r.readAsText(regionsFile);
        }
    };
    $scope.onAnnotationsFileSelect = function ($files) {
        console.log("AnnotationsFileSelect Called!");
        if ($files.length > 0) {
            var annotationsFile = $files[0];
            var parseAnnotationsFile = function (argument) {
                $scope.myFiles.annotationsFile = d3.tsv.parseRows(argument);
            };
            var r = new FileReader();
            r.onload = (function (annotationsFile) {
                return function (e) {
                    parseAnnotationsFile(e.target.result);
                };
            })(annotationsFile);
            r.readAsText(annotationsFile);
        }
    };
    $scope.onFeaturesFileSelect = function ($files) {
        function createListItem(evt, file) {
            $scope.myFiles.featuresFiles.push({
                "name": file.name.split("_")[1].split(".")[0],
                "value": d3.tsv.parseRows(evt.target.result)
            });
        }
        $scope.myFiles.featuresFiles = [];
        for (var i = 0; i < $files.length; i++) {
            var reader = new FileReader();
            reader.onloadend = (function (file) {
                return function (evt) {
                    createListItem(evt, file);
                };
            })($files[i]);
            reader.readAsText($files[i]);
        }
    };
});