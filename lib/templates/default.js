'use strict';

const _ = require('lodash');
const prettier = require('prettier');
const stringifyObject = require('stringify-object');

module.exports = data => {
  let prepended = '';
  if (data.prependJs !== undefined) {
    data.prependJs.forEach(m => {
      prepended += `${m}\n`;
    });
  }
  if (data.wrapper) {
    prepended +=
      `let Wrapper = require('${data.wrapper}');
      Wrapper = Wrapper.default || Wrapper;
    `.trim() + '\n';
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
    ${prepended}
    const frontMatter = ${stringifyObject(
      _.omit(data.frontMatter, ['prependJs', 'wrapper'])
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
