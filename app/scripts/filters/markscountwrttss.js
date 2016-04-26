'use strict';

angular.module('cstateApp')
  .filter('marksCountWrtTSS', function () {
    return function(items, filter) {
      if (!filter || typeof filter.tssFeaturesDist === 'undefined' || typeof filter.FeaturesCount === 'undefined'){
          return items;
      }  
      var result = {};
          angular.forEach(items, function(features, key) {
              var count = 0;
              var validFeatures = _.reject(features,function(d){return (d.Feature=="-" || d.Feature == "exon"); });
              
              angular.forEach(validFeatures, function(feature){
               	if(
               		(Math.abs(feature.FeatureStart)<=filter.tssFeaturesDist*1000) ||
               		((feature.FeatureStart<=0) && (feature.FeatureStop>0))
               		)
              		count = count + 1;
              });
              switch(filter.selectedOperator.value){
                case "=": if (count==filter.FeaturesCount) { result[key] =validFeatures; }; break;
                case "<": if (count<filter.FeaturesCount) { result[key] = validFeatures; }; break;
                case "<=":if (count<=filter.FeaturesCount) { result[key] =validFeatures; }; break;
                case ">": if (count>filter.FeaturesCount) { result[key] = validFeatures; }; break;
                case ">=":if (count>=filter.FeaturesCount) { result[key] =validFeatures; }; break;
              };

              // if (count>=filter.tssFeaturesCount){
              //     result[key] = validFeatures;
              // }
          });
        return result;
    };
  });
