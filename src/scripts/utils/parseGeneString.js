"use strict"

const _ = require('lodash')
export default function (string) {
  const arr = string.match(/(.)\1*/g)
  const toPlot = []
  let i = 0
  for (let string of arr) {
    const obj = {}
    obj.value = string.charAt(0)
    obj.start = i
    obj.end = i + string.length
    i += string.length
    toPlot.push(obj)
  }
  _.remove(toPlot, o => { return o.value === 'a'})
  return toPlot
}