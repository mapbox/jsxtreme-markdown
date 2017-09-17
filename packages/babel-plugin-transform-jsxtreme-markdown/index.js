'use strict';

const babylon = require('babylon');
const jsxtremeMarkdown = require('@mapbox/jsxtreme-markdown');
const babelMacroMaker = require('./babel-macro-maker');

const applyTransform = (templateExpressionPath, text, options) => {
  const jsx = jsxtremeMarkdown.toJsx(text, options);
  const ast = babylon.parseExpression(jsx, { plugins: ['jsx'] });
  templateExpressionPath.replaceWith(ast);
};

module.exports = babelMacroMaker('jsxtreme-markdown/md', applyTransform);
