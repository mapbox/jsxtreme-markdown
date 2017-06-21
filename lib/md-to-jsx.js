'use strict';

const stripIndent = require('strip-indent');
const HtmlToJsx = require('htmltojsx');
const unified = require('unified');
const remarkParse = require('remark-parse');
const remarkRehype = require('remark-rehype');
const rehypeRaw = require('rehype-raw');
const rehypeStringify = require('rehype-stringify');
const parseablePlaceholders = require('./parseable-placeholders');
const rehypePrism = require('./rehype-prism');

// Disable parsing of indented lines as code blocks
delete remarkParse.Parser.prototype.blockTokenizers.indentedCode;

const htmlToJsxConverter = new HtmlToJsx({ createClass: false });

const unifiedProcessor = unified()
  .use(remarkParse, { commonmark: true })
  .use(remarkRehype, { allowDangerousHTML: true })
  .use(rehypeRaw)
  .use(rehypePrism)
  .use(rehypeStringify);

module.exports = (input, options) => {
  options = Object.assign(
    {
      delimiters: ['{#', '#}']
    },
    options
  );

  // Replace placeholders with HTML comments, which MarkdownIt will ignore
  // (i.e. not let them affect the transform). The placeholder data is a Map
  // that we use later to re-insert the interpolated code.
  const commentified = parseablePlaceholders(input, options.delimiters);
  const placeholders = commentified.placeholders;
  const tidyMarkdown = stripIndent(commentified.text).trim();

  const html = unifiedProcessor.processSync(tidyMarkdown).contents;
  const jsx = htmlToJsxConverter.convert(html);

  let result = jsx;
  Object.keys(placeholders).forEach(matchId => {
    const data = placeholders[matchId];
    if (!data.isTag) {
      // Expressions
      result = result.replace(data.representation, `{${data.value}}`);
    } else if (data.isInline) {
      result = result.replace(data.representation, data.value);
    } else {
      const r = new RegExp(
        `<div data-jsxtreme-placeholder="${matchId}"\\s*/>`,
        'g'
      );

      // HTmlToJsx replaces HTML comments with JSX comments
      result = result.replace(r, data.value);
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
