'use strict';

angular.module('cstateApp')
  .filter('marksCount', function () {
    return function(items, filter) {
      if (!filter || typeof filter.FeaturesCount === 'undefined' || typeof filter.selectedOperator === 'undefined'){
          return items;
      }  
      var result = {};
          angular.forEach(items, function(item, key) {
              var validFeatures = _.reject(item,function(d){return (d.Feature=="-" || d.Feature == "exon"); });
              switch(filter.selectedOperator.value){
                case "=": if (validFeatures.length==filter.FeaturesCount) { result[key] = item; }; break;
                case "<": if (validFeatures.length<filter.FeaturesCount) { result[key] = item; }; break;
                case "<=":if (validFeatures.length<=filter.FeaturesCount) { result[key] = item; }; break;
                case ">": if (validFeatures.length>filter.FeaturesCount) { result[key] = item; }; break;
                case ">=":if (validFeatures.length>=filter.FeaturesCount) { result[key] = item; }; break;
              };


              // if (item.length<=filter.FeaturesCount){
              //     result[key] = item;
              // }
          });

        return result;
    };
  });
