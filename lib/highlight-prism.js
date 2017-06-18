'use strict';

const Prism = require('prismjs');

module.exports = (code, lang) => {
  const fallback = `<pre><code>${code}</pre></code>`;
  if (!lang) return fallback;
  // lang must be http://prismjs.com/#languages-list
  const grammar = Prism.languages[lang];
  if (!grammar) return fallback;
  const highlightedCode = Prism.highlight(code, grammar);
  // Needs the wrapper class
  return `<pre><code class="language-${lang}">${highlightedCode}</code></pre>`;
};
