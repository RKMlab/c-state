'use strict';

const validateExp = function (string, fileName) {
  console.log(`Validating expression data file ${fileName}`);
  d3.tsvParseRows(string, function (d, i){
    if (d.length < 2) {
      if (i > 0 || !d[0].startsWith('#')) {
        handleError(`Less than 2 columns found at line ${i+1} in ${fileName}. Please verify the file and upload again.`);
      }
    }
    d[1] = +d[1];
    if (_.isNaN(d[1])) {
      console.log(`Expression value not a number at line ${i+1} in ${fileName}`);
    }
  })
}