'use strict';

const babel = require('babel-core');
const babelEs2015 = require('babel-preset-es2015');
const plugin = require('../lib/babel-plugin');

const transform = code => {
  return babel.transform(code, {
    presets: [babelEs2015],
    plugins: [plugin]
  }).code;
};

test('basic usage', () => {
  const code = `
    const md = require('md-react-transformer/md');
    const foo = md\`
      # Title
      This is **bold.**
      Here is a [link](/some/url).
    \`;
  `;
  expect(transform(code)).toMatchSnapshot();
});

test('import instead of require', () => {
  const code = `
    import md from 'md-react-transformer/md';
    const foo = md\`
      # Title
      This is **bold.**
      Here is a [link](/some/url).
    \`;
  `;
  expect(transform(code)).toMatchSnapshot();
});

test('require in nested scope', () => {
  const code = `
    function x() {
      if (true) {
        const md = require('md-react-transformer/md');
        const foo = md\`
          # Title
          This is **bold.**
          Here is a [link](/some/url).
        \`;
      }
    }
  `;
  expect(transform(code)).toMatchSnapshot();
});

test('alternate variable name, with broken-up nested JSX', () => {
  const code = `
    const markit = require('md-react-transformer/md');
    const text = markit\`This is a paragraph {# <span className="foo"> #} with a **markdown** span inside {# </span> #}
    {# <div style={{ margin: 70 }}> #}
      And here is a *paragraph* inside a div.
      [Link](/some/url)
    {# </div> #}\`
  `;
  expect(transform(code)).toMatchSnapshot();
});

test.only('fails with placeholders in template literals', () => {
  const code = `
    const md = require('md-react-transformer/md');
    const foo = md\`
      # Title
      This is **bold.** $\{number}
      Here is a [link](/some/url).
    \`;
  `;
  expect(() => transform(code)).toThrow('Placeholders are not supported');
});

test('does nothing when moduel is not in scope', () => {
  const code = `
    function x() {
      const md = require('md-react-transformer/md');
    }
    const foo = md\`
      # Title
      This is **bold.**
      Here is a [link](/some/url).
    \`;
  `;
  expect(transform(code)).toMatchSnapshot();
});
