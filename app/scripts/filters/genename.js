'use strict';

angular.module('cstateApp')
  .filter('geneName', function () {
     return function(items, filter) {
      if (!filter || !filter.Gene[0]){
          return items;
      }
      var result = {};
        angular.forEach( filter.Gene, function(filterVal, filterKey) {
          angular.forEach(items, function(item, key) {
              var fieldVal = key;
              angular.forEach(filterVal,function(val,key,obj){
                            if (filter.allowPartial){
                              if (fieldVal && fieldVal.toLowerCase().indexOf(obj.toLowerCase()) > -1){
                                result[fieldVal] = item;
                              }
                            }
                            else{
                             if (fieldVal && fieldVal.toLowerCase() == obj.toLowerCase()){
                                result[fieldVal] = item;
                              } 
                            };
                          });
          });
        });
        return result;
    };
});
