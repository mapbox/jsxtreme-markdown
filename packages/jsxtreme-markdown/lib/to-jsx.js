'use strict';

const stripIndent = require('strip-indent');
const HtmlToJsx = require('htmltojsx');
const unified = require('unified');
const remarkParse = require('remark-parse');
const remarkRehype = require('remark-rehype');
const rehypeRaw = require('rehype-raw');
const rehypeStringify = require('rehype-stringify');
const tableCellStyle = require('@mapbox/hast-util-table-cell-style');
const parseablePlaceholders = require('./parseable-placeholders');

// Disable parsing of indented lines as code blocks. Indentation can be a little
// weird, because users might indent lines within interpolated tags, but the
// Markdown parser doesn't know about those tags. As a result, the Markdown
// parser should not trust indentation to indicate a code block.
delete remarkParse.Parser.prototype.blockTokenizers.indentedCode;

const htmlToJsxConverter = new HtmlToJsx({ createClass: false });

module.exports = (input, options) => {
  options = Object.assign(
    {
      delimiters: ['{{', '}}'],
      escapeDelimiter: '#'
    },
    options
  );

  let unifiedProcessor = unified().use(remarkParse, { commonmark: true });

  if (options.remarkPlugins) {
    options.remarkPlugins.forEach(plugin => {
      if (Array.isArray(plugin)) {
        unifiedProcessor.use(plugin[0], plugin[1]);
      } else {
        unifiedProcessor.use(plugin);
      }
    });
  }

  // HTML comments qualify as "dangerous HTML" for rehype, because remark
  // passes them in as raw elements. That's why we need that option and need to
  // use rehype-raw.
  unifiedProcessor
    .use(remarkRehype, { allowDangerousHTML: true })
    .use(rehypeRaw)
    .use(() => tableCellStyle);

  if (options.rehypePlugins) {
    options.rehypePlugins.forEach(plugin => {
      if (Array.isArray(plugin)) {
        unifiedProcessor.use(plugin[0], plugin[1]);
      } else {
        unifiedProcessor.use(plugin);
      }
    });
  }

  unifiedProcessor.use(rehypeStringify);

  const commentified = parseablePlaceholders(
    input,
    options.delimiters,
    options.escapeDelimiter
  );
  const placeholders = commentified.placeholders;
  const tidyMarkdown = stripIndent(commentified.text).trim();
  const html = unifiedProcessor.processSync(tidyMarkdown).contents;
  let jsx = htmlToJsxConverter.convert(html);
  const firstNewlineIndex = jsx.indexOf('\n');
  jsx =
    jsx.slice(0, firstNewlineIndex) + stripIndent(jsx.slice(firstNewlineIndex));

  let result = jsx;
  Object.keys(placeholders).forEach(matchId => {
    const data = placeholders[matchId];
    const representationRegExp = new RegExp(data.representation, 'g');
    if (!data.isTag) {
      // Expressions.
      result = result.replace(representationRegExp, `{${data.value}}`);
    } else if (data.isInline) {
      // Inline-level JSX elements.
      result = result.replace(representationRegExp, data.value);
    } else {
      // Block-level JSX elements.
      const blockPlaceholders = new RegExp(
        `<div data-jsxtreme-placeholder=[{"]${matchId}[}"]\\s*/>`,
        'g'
      );
      result = result.replace(blockPlaceholders, data.value);
    }
  });

  // Alter href and src attributes, which might contain placeholders.
  result = result.replace(
    /(href|src)=(?:"([^"]+)"|{(.*)})/g,
    (match, p1, p2, p3) => {
      const rawUrl = p2 || p3;
      if (!/{/.test(rawUrl)) return match;
      let urlWithPlaceholders = rawUrl.replace(/{/g, '${');
      return `${p1}={\`${urlWithPlaceholders}\`}`;
    }
  );

  // Returning a Promise, in case future refactors, e.g. swapping
  // dependencies, necessitate an async API.
  return result;
};
