angular.module('cstateApp').controller('AccordionCtrl', function ($scope, geneNameFilter, marksCountFilter,
    marksCountWrtTSSFilter, patternFilter, FileSaver, Blob, usSpinnerService, $rootScope, $timeout, $q) {
    "use strict";
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

        genesData.genes = genes;
        genesData.features = $scope.myFiles.features;
        $scope.$root.$broadcast("myEvent", {
            value: genesData
        });
    };
});