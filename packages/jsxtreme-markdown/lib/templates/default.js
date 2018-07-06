'use strict';

const _ = require('lodash');
const stringifyObject = require('stringify-object');

module.exports = data => {
  let prepended = '';
  if (data.prependJs !== undefined) {
    data.prependJs.forEach(m => {
      prepended += `${m}\n`;
    });
  }
  if (data.wrapper) {
    prepended += `import Wrapper from '${data.wrapper}';\n`;
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
    import React from 'react';
    ${prepended}
    const frontMatter = ${stringifyObject(
      _.omit(data.frontMatter, ['prependJs', 'wrapper'])
    )};

    export default class ${data.name} extends React.PureComponent {
      render() {
        const props = this.props;
        return ${body};
      }
    }
  `;

  return js;
};
