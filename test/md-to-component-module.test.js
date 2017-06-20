'use strict';

const crypto = require('crypto');
const stripIndent = require('strip-indent');
const pify = require('pify');
const path = require('path');
const del = require('del');
const mkdirp = require('mkdirp');
const beautify = require('js-beautify');
const fs = require('fs');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const mdToComponentModule = require('../lib/md-to-component-module');

const prepText = text => stripIndent(text).trim();
const tmpDir = path.join(__dirname, '../tmp');

const loadOutputModule = content => {
  const filename = path.join(
    tmpDir,
    crypto.randomBytes(16).toString('hex') + '.js'
  );

  return pify(fs.writeFile)(filename, content).then(() => {
    const m = require(filename);
    return m;
  });
};

const renderComponent = (Component, props) => {
  return beautify.html(
    ReactDOMServer.renderToStaticMarkup(React.createElement(Component, props))
  );
};

describe('mdToComponentModule', () => {
  beforeAll(() => {
    return pify(mkdirp)(tmpDir);
  });

  afterAll(() => {
    return del(tmpDir);
  });

  afterEach(() => {
    return del(path.join(tmpDir, '*.*'));
  });

  test('default options', () => {
    const text = prepText(`
      ---
      title: Everything is ok
      ---

      # {# frontMatter.title #}

      And a **special** number: {# props.number #}.
    `);

    const code = mdToComponentModule(text);
    expect(code).toMatchSnapshot();
  });

  test('default options produce valid module', () => {
    const text = prepText(`
      ---
      title: Everything is ok
      ---

      # {# frontMatter.title #}

      And a **special** number: {# props.number #}.
    `);

    const code = mdToComponentModule(text);
    return loadOutputModule(code).then(Output => {
      const rendered = renderComponent(Output, {
        number: 77
      });
      expect(rendered).toMatchSnapshot();
    });
  });

  test('default options with modules in front matter', () => {
    const text = prepText(`
      ---
      title: Everything is ok
      modules:
        - "const Timer = require('./timer')"
        - "import { Watcher } from './watcher'"
      ---

      # {# frontMatter.title #}

      Some introductory text.

      {# <Watcher /> #}

      This paragraph includes a {# <Timer /> #}.
    `);

    const code = mdToComponentModule(text);
    expect(code).toMatchSnapshot();
  });

  test('options.name', () => {
    const text = prepText(`
      # Title
    `);
    const options = {
      name: 'my-special-name'
    };
    const code = mdToComponentModule(text, options);
    expect(code).toMatchSnapshot();
  });

  test('options.template', () => {
    const text = prepText(`
      ---
      title: Foo
      list:
        - one
        - two
      ---

      # {# frontMatter.title #}
    `);
    const options = {
      template: data => {
        return `${data.name}\n${JSON.stringify(data.frontMatter)}\n${data.jsx}`;
      }
    };
    const code = mdToComponentModule(text, options);
    expect(code).toMatchSnapshot();
  });

  test('mdToJsx options', () => {
    const text = prepText(`
      ---
      title: Foo
      list:
        - one
        - two
      ---

      # {{ frontMatter.title }}

      {{ <div className="foo"> }}
      The default {# delimiter #} is ignored.
      {{ </div> }}

      \`\`\`js
      var x = 3;
      \`\`\`
    `);
    const options = {
      delimiters: ['{{', '}}'],
      syntaxHighlighting: 'prism'
    };
    const code = mdToComponentModule(text, options);
    expect(code).toMatchSnapshot();
  });

  test('non-string primitives in front matter', () => {
    const text = prepText(`
      ---
      count: 7
      isHonest: false
      ---

      count: {# frontMatter.count #}

      isHonest: {# frontMatter.isHonest #}
    `);
    const code = mdToComponentModule(text);
    expect(code).toMatchSnapshot();
  });

  test('options.wrapper', () => {
    const text = prepText(`
      ---
      title: Everything is ok
      quantity: 834
      ---

      # {# frontMatter.title #}

      Some introductory text. The quantity is {# frontMatter.quantity #}

      Here is a number: {# props.number #}
    `);
    const options = {
      wrapper: path.join(__dirname, './fixtures/wrapper.js')
    };
    const code = mdToComponentModule(text, options);
    return loadOutputModule(code).then(Output => {
      const rendered = renderComponent(Output, {
        number: 77
      });
      expect(rendered).toMatchSnapshot();
    });
  });

  test('documentation example, with wrapper front matter', () => {
    const text = prepText(`
      ---
      wrapper: '../wrapper'
      modules:
        - "const Timer = require('./timer')"
        - "import { Watcher } from './watcher'"
      title: Everything is ok
      quantity: 834
      ---

      # {# frontMatter.title #}

      Some introductory text. The quantity is {# frontMatter.quantity #}

      {# <Watcher /> #}

      This paragraph includes a {# <Timer /> #}.

      This component also accepts a "foo" prop: {# props.foo #}
    `);
    const code = mdToComponentModule(text);
    expect(code).toMatchSnapshot();
  });
});
