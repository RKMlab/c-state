'use strict';

const parseBED = function (string, fileName, featureName) {
  console.log(`Reading BED File ${fileName}`);
  const rows = d3.tsvParseRows(string, function (d, i) {
    let strand = '+';
    let score = 'NA';
    // if (d.length < 3) {
    //   handleError(`Less than 3 columns found at line ${i}. Please verify the file format and upload again.`);
    // }
    d[1] = +d[1];
    d[2] = +d[2];
    // if (_.isNaN(d[1]) || _.isNaN(d[2])) {
    //   console.log(`Start or Stop columns are not numbers at line ${i}. Perhaps file contains header lines?`);
    // }
    // if (d[1] > d[2]) {
    //   console.log(`Malformed BED entry at line ${i}. Skipping the row`)
    // }
    if ( d[4] && (!_.isNaN(+d[4])) ) {
      score = +d[4];
      if (+d[4] < 100 || +d[4] > 1000) {
        score = 'NA'
      }
    }

    if ( (d[5]) && (d[5] === '+' || d[5] === '-') ) {
      strand = d[5];
    }
    return {
      chrom: d[0],
      start: d[1],
      end: d[2],
      name: featureName,
      score: score,
      strand: strand
    }
  })
  return rows;
}

const validateBED = function (string, fileName) {
  console.log(`Validating BED file ${fileName}`);
  d3.tsvParseRows(string, function (d, i) {
    let strand = '+';
    let score = 0;
    if (d.length < 3) {
      if (i === 0) {
        console.log(`Invalid first line in ${fileName}. Perhaps file contains header line? Skipping the row...`)
      } else {
        handleError(`Less than 3 columns found at line ${i+1} in ${fileName}. Please verify the file format and upload again.`);
      }
    }
    d[1] = +d[1];
    d[2] = +d[2];
    if (_.isNaN(d[1]) || _.isNaN(d[2])) {
      console.log(`Start or Stop columns are not numbers at line ${i}. Perhaps file contains header lines?`);
    }
    if (d[1] > d[2]) {
      console.log(`Malformed BED entry at line ${i}. Skipping the row`)
    }
  })
}