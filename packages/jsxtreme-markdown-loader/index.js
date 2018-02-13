'use strict';

const loaderUtils = require('loader-utils');
const cloneDeep = require('lodash.clonedeep');
const jsxtremeMarkdown = require('@mapbox/jsxtreme-markdown');

module.exports = function(source) {
  let options = loaderUtils.getOptions(this) || {};
  if (options.getWrapper) {
    options = cloneDeep(options);
    options.wrapper = options.getWrapper(this.resource);
    delete options.getWrapper;
  }
  return jsxtremeMarkdown.toComponentModule(source, options);
};
