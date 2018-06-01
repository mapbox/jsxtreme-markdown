'use strict';

const loaderUtils = require('loader-utils');
const cloneDeep = require('lodash.clonedeep');
const jsxtremeMarkdown = require('@mapbox/jsxtreme-markdown');

const defaultOptions = {
  precompile: true
};

module.exports = function(source) {
  let options = loaderUtils.getOptions(this) || {};
  options = Object.assign(defaultOptions, options);
  if (options.getWrapper) {
    options = cloneDeep(options);
    options.wrapper = options.getWrapper(this.resource);
    delete options.getWrapper;
  }
  return jsxtremeMarkdown.toComponentModule(source, options);
};
