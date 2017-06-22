'use strict';

const stripIndent = require('strip-indent');
const HtmlToJsx = require('htmltojsx');
const unified = require('unified');
const remarkParse = require('remark-parse');
const remarkRehype = require('remark-rehype');
const rehypeRaw = require('rehype-raw');
const rehypeStringify = require('rehype-stringify');
const parseablePlaceholders = require('./parseable-placeholders');

// Disable parsing of indented lines as code blocks
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

  unifiedProcessor
    .use(remarkRehype, { allowDangerousHTML: true })
    .use(rehypeRaw);

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
      const blockPlaceholders = new RegExp(
        `<div data-jsxtreme-placeholder=[{"]${matchId}[}"]\\s*/>`,
        'g'
      );
      result = result.replace(blockPlaceholders, data.value);
    }
  });

  // Alter href and src attributes, which might contain placeholders
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
