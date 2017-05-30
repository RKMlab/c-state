"use strict";

export default function readFile (fileobj, callback) {
  const reader = new FileReader();
  reader.onload = callback;
  reader.readAsText(fileobj);
}