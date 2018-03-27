'use strict';

const _ = require('lodash');
const babel = require('babel-core');
const presetEnv = require('babel-preset-env');
const presetReact = require('babel-preset-react');
const frontMatter = require('front-matter');
const pascalCase = require('pascal-case');
const toJsx = require('./to-jsx');
const defaultTemplate = require('./templates/default');

module.exports = (input, options) => {
  options = Object.assign(
    {
      name: 'MarkdownReact',
      prependJs: [],
      precompile: false
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
    prependJs: _.union(
      options.prependJs,
      frontMatterResult.attributes.prependJs
    ),
    jsx
  };

  if (options.template) return options.template(templateData);
  const code = defaultTemplate(templateData);
  if (!options.precompile) return code;
  return babel.transform(code, { presets: [presetEnv, presetReact] }).code;
};
