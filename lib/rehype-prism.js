'use strict';

const visit = require('unist-util-visit');
const toString = require('hast-util-to-string');
const Prism = require('prismjs');
const Parser5 = require('parse5/lib/parser');
const fromParse5 = require('hast-util-from-parse5');

module.exports = attacher;

const parse5 = new Parser5();

function highlight(code, lang) {
  // lang must be in http://prismjs.com/#languages-list
  const grammar = Prism.languages[lang];
  if (!grammar) return false;
  return Prism.highlight(code, grammar);
}

function attacher() {
  return transformer;

  function transformer(tree) {
    visit(tree, 'element', visitor);
  }

  function visitor(node, index, parent) {
    if (!parent || parent.tagName !== 'pre' || node.tagName !== 'code') {
      return;
    }

    let lang = language(node);
    if (lang === 'js') lang = 'javascript';

    if (lang === false) {
      return;
    }

    const highlightedCode = highlight(toString(node), lang);

    if (highlightedCode === false) {
      return;
    }

    const highlightedAst = fromParse5(parse5.parseFragment(highlightedCode));

    node.children = highlightedAst.children;
  }
}

/* Get the programming language of `node`. */
function language(node) {
  const className = node.properties.className || [];
  const length = className.length;
  let index = -1;
  let value;

  while (++index < length) {
    value = className[index];

    if (value === 'no-highlight' || value === 'nohighlight') {
      return false;
    }

    if (value.slice(0, 9) === 'language-') {
      return value.slice(9);
    }
  }

  return null;
}
