'use strict';

const _ = require('lodash');
const visit = require('unist-util-visit');
const nodeToString = require('mdast-util-to-string');
const slugger = require('github-slugger')();

let headings = [];

function getHeadings() {
  return headings;
}

function reset() {
  headings = [];
}

function init() {
  reset();
  slugger.reset();
}

function plugin() {
  return analyzer;

  function analyzer(tree) {
    init();
    visit(tree, 'heading', node => {
      const text = nodeToString(node).replace(/12345(\d+)54321/g, 'i$1');
      const slug = slugger.slug(text);
      headings.push({
        text,
        slug,
        level: node.depth
      });

      _.set(node, ['data', 'id'], slug);
      _.set(node, ['data', 'hProperties', 'id'], slug);
    });
  }
}

module.exports = {
  plugin,
  getHeadings,
  reset
};
