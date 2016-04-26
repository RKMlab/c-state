'use strict';

angular.module('cstateApp')
  .filter('pattern', function () {
    return function(items, filter) {
      if (!filter 
          || typeof filter.firstFeature === 'undefined' 
          || typeof filter.secondFeature === 'undefined'
          || typeof filter.selectedSearchType === 'undefined'
          ){
          return items;
      }
      if(filter.selectedSearchType.value != 'Overlap' 
        && (typeof filter.minDist === 'undefined'
            || typeof filter.maxDist === 'undefined')){
          return items;
        }

      var result = {};
          angular.forEach(items, function(item, key) {
              var validFeatures = _.reject(item,function(d){return (d.Feature=="-" || d.Feature == "exon"); });
              var patterns = findPatterns(item,filter,filter.selectedSearchType);
              if (patterns && patterns.length>0) { 
                item.selectedPatterns=patterns; 
                result[key] = item; 
              }; 
          });

        return result;
    };
  
    function findPatterns (gene,filter,selectedSearchType) {
      var firstFeatures = _.filter(gene,function(f){return f.Feature==filter.firstFeature;});
      var secondFeatures = _.filter(gene,function(f){return f.Feature==filter.secondFeature;});
      var patternExists = [];
      if (filter.minDist<0) filter.minDist = 0;
      if (filter.maxDist<0) filter.maxDist = 0;
      patternExists = _.filter(firstFeatures,function(firstFeature){
       var patternExistsSeconds = [];
        patternExistsSeconds= _.find(secondFeatures, function (secondFeature) {
                                  switch (filter.selectedSearchType.value){
                                          case "Downstream" : 
                                            var distance
 = firstFeature.FeatureStart - secondFeature.FeatureStop;
                                            //if (distance<0) {distance=0};
                                            if(distance >= filter.minDist*1000 && distance <= filter.maxDist*1000) { //If the distance is within the distance cutoff specified in pattern
                                                return true;
                                            };
                                            break;
                                          case "Upstream":
                                            var distance = secondFeature.FeatureStart - firstFeature.FeatureStop ;
                                            //if (distance<0) {distance=0};
                                            if(distance >= filter.minDist*1000 && distance <= filter.maxDist*1000) { //If the distance is within the distance cutoff specified in pattern
                                                return true;
                                            };
                                            break;
                                          case "Near":
                                            var distance = firstFeature.FeatureStart - secondFeature.FeatureStop;
                                            //if (distance<0) {distance=0};
                                            if(distance >= filter.minDist*1000 && distance <= filter.maxDist*1000) { //If the distance is within the distance cutoff specified in pattern
                                                return true;
                                            };
                                            var distance = secondFeature.FeatureStart - firstFeature.FeatureStop ;
                                            //if (distance<0) {distance=0};
                                            if(distance >= filter.minDist*1000 && distance <= filter.maxDist*1000) { //If the distance is within the distance cutoff specified in pattern
                                                return true;
                                            };
                                            break;
                                          case "Overlap":
                                            if (firstFeature.FeatureStop - secondFeature.FeatureStart < 0 ) {return false};
                                            if (secondFeature.FeatureStop - firstFeature.FeatureStart < 0 ) {return false};
                                            return true;
                                        };
                                  return false;
                                });               
      if (!angular.isUndefined(patternExistsSeconds)) {return patternExistsSeconds; };
      });
      if (!angular.isUndefined(patternExists)) {return patternExists;};
    };


  });
