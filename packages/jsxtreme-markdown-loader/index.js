'use strict';

const loaderUtils = require('loader-utils');
const jsxtremeMarkdown = require('@mapbox/jsxtreme-markdown');

module.exports = function(source) {
  const options = loaderUtils.getOptions(this) || {};
  if (options.getWrapper) {
    options.wrapper = options.getWrapper(this.resource);
    delete options.getWrapper;
  }
  return jsxtremeMarkdown.toComponentModule(source, options);
};
