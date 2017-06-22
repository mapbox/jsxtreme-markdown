'use strict';

const _ = require('lodash');
const prettier = require('prettier');
const stringifyObject = require('stringify-object');

module.exports = data => {
  let modules = '';
  if (data.modules !== undefined) {
    data.modules.forEach(m => {
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

  const frontMatterComment = data.rawFrontMatter
    ? `/*---\n${data.rawFrontMatter}\n---*/`
    : '';

  const js = `
    ${frontMatterComment}
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
