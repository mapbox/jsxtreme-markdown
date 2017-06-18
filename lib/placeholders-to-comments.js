'use strict';

const balancedMatch = require('balanced-match');

module.exports = (input, delimiters) => {
  const placeholders = new Map();
  const transformNextPlaceholder = str => {
    const match = balancedMatch(delimiters[0], delimiters[1], str);
    if (!match) return str;

    const matchId = `mdjsx${match.start}`;
    const placeholderContent = match.body.trim();
    placeholders.set(matchId, placeholderContent);
    const nextStr = [match.pre, `<!-- ${matchId} -->`, match.post].join('');
    return transformNextPlaceholder(nextStr);
  };

  const text = transformNextPlaceholder(input);
  return {
    placeholders,
    text
  };
};
