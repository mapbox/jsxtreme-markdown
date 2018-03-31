'use strict';

const _ = require('lodash');
const babel = require('babel-core');
const presetEnv = require('babel-preset-env');
const presetReact = require('babel-preset-react');
const frontMatter = require('front-matter');
const pascalCase = require('pascal-case');
const toJsx = require('./to-jsx');
const remarkExtractHeadings = require('./remark-extract-headings');
const defaultTemplate = require('./templates/default');

module.exports = (input, options) => {
  options = Object.assign(
    {
      name: 'MarkdownReact',
      prependJs: [],
      precompile: false,
      headings: false,
      remarkPlugins: []
    },
    options
  );

  if (options.headings) {
    options.remarkPlugins = [remarkExtractHeadings.plugin].concat(
      options.remarkPlugins
    );
  }

  const frontMatterResult = frontMatter(input);
  const jsx = toJsx(frontMatterResult.body, options);

  const extendedFrontMatter = frontMatterResult.attributes;
  if (options.headings && !extendedFrontMatter.headings) {
    extendedFrontMatter.headings = remarkExtractHeadings.getHeadings();
  }

  const templateData = {
    name: pascalCase(options.name),
    rawFrontMatter: frontMatterResult.frontmatter,
    frontMatter: extendedFrontMatter,
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
