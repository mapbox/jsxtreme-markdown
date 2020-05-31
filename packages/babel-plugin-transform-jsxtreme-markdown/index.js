'use strict';

const babel = require('@babel/parser');
const jsxtremeMarkdown = require('@mapbox/jsxtreme-markdown');
const templateTagMacro = require('./template-tag-macro');

const applyTransform = (templateExpressionPath, text, options) => {
  const jsx = jsxtremeMarkdown.toJsx(text, options);
  const ast = babel.parseExpression(jsx, { plugins: ['jsx'] });
  templateExpressionPath.replaceWith(ast);
};

module.exports = templateTagMacro(
  '@mapbox/babel-plugin-transform-jsxtreme-markdown/md',
  applyTransform
);
