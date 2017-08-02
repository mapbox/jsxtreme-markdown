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
const toComponentModule = require('../lib/to-component-module');

const prepText = text => stripIndent(text).trim();

// This directory needs to be within the project, so Babel will compile it and
// it has access to node_modules; but outside of Jest's roots, so the adding
// and deleting of files from it will not put Jest's watch mode in an endless
// loop. This is the reason we have Jests roots setting in package.json.
const tmpDir = path.join(__dirname, '../../../tmp');

const loadOutputModule = content => {
  const filename = path.join(
    tmpDir,
    crypto.randomBytes(16).toString('hex') + '.js'
  );

  return pify(fs.writeFile)(filename, content).then(() => {
    let m = require(filename);
    m = m.default || m;
    return m;
  });
};

const renderComponent = (Component, props) => {
  return beautify.html(
    ReactDOMServer.renderToStaticMarkup(React.createElement(Component, props))
  );
};

describe('toComponentModule', () => {
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

      # {{ frontMatter.title }}

      And a **special** number: {{ props.number }}.
    `);

    const code = toComponentModule(text);
    expect(code).toMatchSnapshot();
  });

  test('default options produce valid module', () => {
    const text = prepText(`
      ---
      title: Everything is ok
      ---

      # {{ frontMatter.title }}

      And a **special** number: {{ props.number }}.
    `);

    const code = toComponentModule(text);
    return loadOutputModule(code).then(Output => {
      const rendered = renderComponent(Output, {
        number: 77
      });
      expect(rendered).toMatchSnapshot();
    });
  });

  test('default options with prependJs in front matter', () => {
    const text = prepText(`
      ---
      title: Everything is ok
      prependJs:
        - "const Timer = require('./timer')"
        - "const Watcher = require('./watcher').Watcher"
      ---

      # {{ frontMatter.title }}

      Some introductory text.

      {{ <Watcher /> }}

      This paragraph includes a {{ <Timer /> }}.
    `);

    const code = toComponentModule(text);
    expect(code).toMatchSnapshot();
  });

  test('options.name', () => {
    const text = prepText(`
      # Title
    `);
    const options = {
      name: 'my-special-name'
    };
    const code = toComponentModule(text, options);
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

      # {{ frontMatter.title }}
    `);
    const options = {
      template: data => {
        return `${data.name}\n${JSON.stringify(data.frontMatter)}\n${data.jsx}`;
      }
    };
    const code = toComponentModule(text, options);
    expect(code).toMatchSnapshot();
  });

  test('toJsx options', () => {
    const text = prepText(`
      ---
      title: Foo
      list:
        - one
        - two
      ---

      # {# frontMatter.title #}

      {# <div className="foo"> #}
      The default {{ delimiter }} is ignored.
      {# </div> #}

      \`\`\`js
      var x = 3;
      \`\`\`
    `);
    const options = {
      delimiters: ['{#', '#}']
    };
    const code = toComponentModule(text, options);
    expect(code).toMatchSnapshot();
  });

  test('non-string primitives in front matter', () => {
    const text = prepText(`
      ---
      count: 7
      isHonest: false
      ---

      count: {{ frontMatter.count }}

      isHonest: {{ frontMatter.isHonest }}
    `);
    const code = toComponentModule(text);
    expect(code).toMatchSnapshot();
  });

  test('options.wrapper', () => {
    const text = prepText(`
      ---
      title: Everything is ok
      quantity: 834
      ---

      # {{ frontMatter.title }}

      Some introductory text. The quantity is {{ frontMatter.quantity }}

      Here is a number: {{ props.number }}
    `);
    const options = {
      wrapper: path.join(__dirname, './fixtures/wrapper.js')
    };
    const code = toComponentModule(text, options);
    return loadOutputModule(code).then(Output => {
      const rendered = renderComponent(Output, {
        number: 77
      });
      expect(rendered).toMatchSnapshot();
    });
  });

  test('options.wrapper with ES2015 default export', () => {
    const text = prepText(`
      ---
      title: Everything is ok
      quantity: 834
      ---

      # {{ frontMatter.title }}

      Some introductory text. The quantity is {{ frontMatter.quantity }}

      Here is a number: {{ props.number }}
    `);
    const options = {
      wrapper: path.join(__dirname, './fixtures/wrapper-es2015.js')
    };
    const code = toComponentModule(text, options);
    return loadOutputModule(code).then(Output => {
      const rendered = renderComponent(Output, {
        number: 77
      });
      expect(rendered).toMatchSnapshot();
    });
  });

  test('options.prependJs', () => {
    const text = prepText(`
      ---
      title: Everything is ok
      ---

      {{<Watcher />}}
    `);
    const options = {
      prependJs: ["import { Watcher } from './watcher'"]
    };
    const code = toComponentModule(text, options);
    expect(code).toMatchSnapshot();
  });

  test('documentation example, with wrapper front matter', () => {
    const text = prepText(`
      ---
      wrapper: '../wrapper'
      prependJs:
        - "import Timer from './timer'"
        - "import { Watcher } from './watcher'"
      title: Everything is ok
      quantity: 834
      ---

      # {{ frontMatter.title }}

      Some introductory text. The quantity is {{ frontMatter.quantity }}

      {{ <Watcher /> }}

      This paragraph includes a {{ <Timer /> }}.

      This component also accepts a "foo" prop: {{ props.foo }}
    `);
    const code = toComponentModule(text);
    expect(code).toMatchSnapshot();
  });

  test('options.precompile = true', () => {
    const text = prepText(`
      ---
      title: Everything is ok
      ---

      # {{ frontMatter.title }}

      Some introductory text.
    `);
    const options = {
      precompile: true
    };
    const code = toComponentModule(text, options);
    expect(code).toMatchSnapshot();
    return loadOutputModule(code).then(Output => {
      const rendered = renderComponent(Output);
      expect(rendered).toMatchSnapshot();
    });
  });
});
