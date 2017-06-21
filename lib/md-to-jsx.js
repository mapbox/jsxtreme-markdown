'use strict';

const markdownIt = require('markdown-it');
const HtmlToJsx = require('htmltojsx');
const stripIndent = require('strip-indent');
const parseablePlaceholders = require('./parseable-placeholders');
const highlightPrism = require('./highlight-prism');
const highlightHighlightJs = require('./highlight-highlightjs');

const htmlToJsxConverter = new HtmlToJsx({ createClass: false });

module.exports = (input, options) => {
  options = Object.assign(
    {
      delimiters: ['{#', '#}'],
      syntaxHighlighting: 'highlightjs',
      markdownItOptions: {}
    },
    options
  );

  // Replace placeholders with HTML comments, which MarkdownIt will ignore
  // (i.e. not let them affect the transform). The placeholder data is a Map
  // that we use later to re-insert the interpolated code.
  const commentified = parseablePlaceholders(input, options.delimiters);
  const placeholders = commentified.placeholders;
  const tidyMarkdown = stripIndent(commentified.text).trim();

  // Sort of MarkdownIt options.
  const mdOptions = options.markdownItOptions;
  if (!mdOptions.highlight && options.syntaxHighlighting === 'prism') {
    mdOptions.highlight = highlightPrism;
  } else if (
    !mdOptions.highlight &&
    options.syntaxHighlighting === 'highlightjs'
  ) {
    mdOptions.highlight = highlightHighlightJs;
  }
  mdOptions.html = true;

  // Convert (interpolation-free) Markdown to HTML.
  const md = markdownIt(mdOptions);
  const html = md.render(tidyMarkdown);

  // Convert (interpolation-free) HTML to JSX.
  let jsx = htmlToJsxConverter.convert(html);
  const wasWrapped = htmlToJsxConverter.level === 1;
  if (!wasWrapped) {
    jsx = `<div>${jsx}</div>`;
  }

  // Restore interpolated code into the JSX.
  let result = jsx;
  Object.keys(placeholders).forEach(matchId => {
    const data = placeholders[matchId];
    if (!data.isTag) {
      // Expressions
      result = result.replace(data.representation, `{${data.value}}`);
    } else if (data.isInline) {
      result = result.replace(data.representation, data.value);
    } else {
      // HTmlToJsx replaces HTML comments with JSX comments
      result = result.replace(`{/*${matchId}*/}`, data.value);
    }
  });

  // Alter href and src attributes, which might contain placeholders
  result = result.replace(/(href|src)="([^"]+)"/g, (match, p1, p2) => {
    if (!/{/.test(p2)) return match;
    const p2WithPlaceholers = p2.replace(/{/g, '${');
    return `${p1}={\`${p2WithPlaceholers}\`}`;
  });

  // Returning a Promise, in case future refactors, e.g. swapping
  // dependencies, necessitate an async API.
  return result;
};
