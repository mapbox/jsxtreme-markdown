'use strict';

const _ = require('lodash');
const grayMatter = require('gray-matter');
const prettier = require('prettier');
const pascalCase = require('pascal-case');
const stringifyObject = require('stringify-object');
const mdToJsx = require('./md-to-jsx');

const defaultTemplate = data => {
  let modules = '';
  if (data.frontMatter.modules !== undefined) {
    data.frontMatter.modules.forEach(m => {
      modules += `${m}\n`;
    });
  }
  if (data.wrapper) {
    modules += `const Wrapper = require('${data.wrapper}');\n`;
  }

  let body = data.jsx;
  if (data.wrapper) {
    body = `<Wrapper {...props} frontMatter={frontMatter}>${body}</Wrapper>`;
  }

  const js = `
    'use strict';
    const React = require('react');
    ${modules}
    const frontMatter = ${stringifyObject(
      _.omit(data.frontMatter, ['modules', 'wrapper'])
    )};

    class ${data.name} extends React.PureComponent {
      render() {
        const props = this.props;
        return ${body};
      }
    }

    module.exports = ${data.name};
  `;

  return prettier.format(js);
};

module.exports = (input, options) => {
  options = Object.assign(
    {
      name: 'MarkdownReact'
    },
    options
  );

  const matter = grayMatter(input);
  const mdToJsxOptions = _.pick(options, [
    'delimiters',
    'syntaxHighlighting',
    'markdownItOptions'
  ]);

  return mdToJsx(matter.content, mdToJsxOptions).then(jsx => {
    const templateData = {
      name: pascalCase(options.name),
      frontMatter: matter.data,
      wrapper: matter.data.wrapper || options.wrapper,
      jsx
    };

    if (options.template) return options.template(templateData);
    return defaultTemplate(templateData);
  });
};
