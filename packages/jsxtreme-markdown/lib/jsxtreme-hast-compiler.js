'use strict';

const hastToJsx = require('@mapbox/hast-util-to-jsx');

module.exports = function jsxtremeHastCompiler(options) {
  const placeholders = options.placeholders;

  this.Compiler = compiler;

  function compiler(ast) {
    const jsxWithPlaceholders = hastToJsx(ast);

    let result = jsxWithPlaceholders;

    Object.keys(placeholders).forEach(matchId => {
      const data = placeholders[matchId];
      if (!data.isTag) {
        // Expressions.
        result = result.replace(data.representation, `{${data.value}}`);
      } else if (data.isInline) {
        // Inline-level JSX elements.
        result = result.replace(data.representation, data.value);
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

    return result;
  }
};
