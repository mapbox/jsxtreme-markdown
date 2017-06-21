'use strict';

const blockElements = require('block-elements');
const balancedMatch = require('balanced-match');
const lineColumn = require('line-column');
const babelCodeFrame = require('babel-code-frame');

const blockElementsSet = new Set(blockElements);

const endsWithNewline = input => {
  return /^\s*$/.test(input) || /\r?\n\s*$/.test(input);
};

const startsWithNewline = input => {
  return /^\s*$/.test(input) || /^\r?\n/.test(input);
};

const getTagName = input => {
  const tagNameMatch = /^<\/?([a-zA-Z0-9-]+)/.exec(input);
  return tagNameMatch[1];
};

module.exports = (input, delimiters) => {
  const placeholders = {};
  const transformNextPlaceholder = (str, offset) => {
    const match = balancedMatch(delimiters[0], delimiters[1], str);
    if (!match) return str;

    const matchId = `mdjsx${match.start}`;
    const value = match.body.trim();

    // Distinguish between expressions and elements,
    // and inline- and block-level elements.
    const isTag = /^</.test(value);
    let isInline = !isTag;
    if (isTag) {
      const lineBefore = endsWithNewline(match.pre);
      const lineAfter = startsWithNewline(match.post);
      isInline = !lineBefore || !lineAfter;
      if (isInline) {
        const tagName = getTagName(value);
        if (blockElementsSet.has(tagName)) {
          const errorIndex = !lineBefore
            ? match.start + offset
            : match.end + offset;
          const position = lineColumn(input, errorIndex);
          const place = babelCodeFrame(input, position.line, position.col);
          const message = `<${tagName}> is a block-level element.
Interpolated tags for block-element JSX elements
should be separated from surrounding Markdown by newlines.\n\n${place}`;
          throw new Error(message);
        }
      }
    }

    const representation = isInline
      ? `$$$${matchId}$$$`
      : `\n<div data-jsxtreme-placeholder="${matchId}"></div>\n`;

    placeholders[matchId] = {
      value,
      representation,
      isTag,
      isInline
    };
    const nextStr = [match.pre, representation, match.post].join('');
    return transformNextPlaceholder(nextStr, input.length - nextStr.length);
  };

  const text = transformNextPlaceholder(input, 0);
  return {
    placeholders,
    text
  };
};
