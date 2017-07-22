'use strict';

const _ = require('lodash');
const frontMatter = require('front-matter');
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

  const frontMatterResult = frontMatter(input);
  const jsx = toJsx(frontMatterResult.body, options);
  const templateData = {
    name: pascalCase(options.name),
    rawFrontMatter: frontMatterResult.frontmatter,
    frontMatter: frontMatterResult.attributes,
    wrapper: frontMatterResult.attributes.wrapper || options.wrapper,
    modules: _.union(options.modules, frontMatterResult.attributes.modules),
    jsx
  };

  if (options.template) return options.template(templateData);
  return defaultTemplate(templateData);
};
