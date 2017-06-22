'use strict';

const _ = require('lodash');
const fm = require('front-matter');
const pascalCase = require('pascal-case');
const toJsx = require('./to-jsx');
const defaultTemplate = require('./templates/default');

module.exports = (input, options) => {
  options = Object.assign(
    {
      name: 'MarkdownReact',
      modules: []
    },
    options
  );

  const fmContent = fm(input);
  const jsx = toJsx(fmContent.body, options);
  const templateData = {
    name: pascalCase(options.name),
    rawFrontMatter: fmContent.frontmatter,
    frontMatter: fmContent.attributes,
    wrapper: fmContent.attributes.wrapper || options.wrapper,
    modules: _.union(options.modules, fmContent.attributes.modules),
    jsx
  };

  if (options.template) return options.template(templateData);
  return defaultTemplate(templateData);
};
