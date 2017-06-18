'use strict';

const markdownIt = require('markdown-it');
const HtmlToJsx = require('htmltojsx');
const stripIndent = require('strip-indent');
const placeholdersToComments = require('./placeholders-to-comments');
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
  const commentified = placeholdersToComments(input, options.delimiters);
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
  placeholders.forEach((code, id) => {
    const jsxComment = `{/* ${id} */}`;
    const replacementCode = /</.test(code) ? code : `{${code}}`;
    result = result.replace(jsxComment, replacementCode);
  });

  // Returning a Promise, in case future refactors, e.g. swapping
  // dependencies, necessitate an async API.
  return Promise.resolve(result);
};
