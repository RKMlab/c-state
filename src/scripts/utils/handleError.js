"use strict"

import {
  events
} from '../events.js'

const _ = require('lodash')

export default function handleError(type, message, duration) {
  events.$notify({
    title: _.capitalize(type),
    message: message,
    type: type,
    duration: duration,
    offset: 100
  })
  if (type === 'warning') {
    console.warn(message)
  } else if (type === 'error') {
    console.error(message)
  } else {
    console.log(`${_.capitalize(type)}: ${message}`)
  }
}