'use strict';

const HighlightJs = require('highlight.js');

module.exports = (code, lang) => {
  const fallback = `<pre><code>${code}</pre></code>`;
  let highlightedCode = '';
  if (lang !== null && HighlightJs.getLanguage(lang)) {
    try {
      highlightedCode = HighlightJs.highlight(lang, code).value;
    } catch (error) {
      return fallback;
    }
  } else {
    try {
      highlightedCode = HighlightJs.highlightAuto(code).value;
    } catch (error) {
      return fallback;
    }
  }
  return `<pre><code class="hljs">${highlightedCode}</code></pre>`;
};
