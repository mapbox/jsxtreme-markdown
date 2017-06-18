'use strict';

const crypto = require('crypto');
const stripIndent = require('strip-indent');
const pify = require('pify');
const path = require('path');
const del = require('del');
const beautify = require('js-beautify');
const fs = require('fs');
const babel = require('babel-core');
const babelPresetEs2015 = require('babel-preset-es2015');
const babelPresetReact = require('babel-preset-react');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const mdToComponentModule = require('../lib/md-to-component-module');

const prepText = text => stripIndent(text).trim();
const tmpDir = path.join(__dirname, './tmp');

const loadOutputModule = content => {
  const compiledContent = babel.transform(content, {
    presets: [babelPresetEs2015, babelPresetReact]
  }).code;
  const filename = path.join(tmpDir, crypto.randomBytes(16).toString('hex'));
  return pify(fs.writeFile)(filename, compiledContent).then(() => {
    const module = require(filename);
    return module;
  });
};

const renderComponent = (Component, props) => {
  return beautify.html(
    ReactDOMServer.renderToStaticMarkup(React.createElement(Component, props))
  );
};

describe('mdToComponentModule', () => {
  beforeAll(() => {
    return pify(fs.mkdir)(tmpDir);
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

    return mdToComponentModule(text).then(result => {
      expect(result).toMatchSnapshot();
    });
  });

  test('default options produce valid module', () => {
    const text = prepText(`
      ---
      title: Everything is ok
      ---

      # {# frontMatter.title #}

      And a **special** number: {# props.number #}.
    `);

    return mdToComponentModule(text).then(loadOutputModule).then(Output => {
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

    return mdToComponentModule(text).then(result => {
      expect(result).toMatchSnapshot();
    });
  });

  test('options.name', () => {
    const text = prepText(`
      # Title
    `);
    const options = {
      name: 'my-special-name'
    };
    return mdToComponentModule(text, options).then(result => {
      expect(result).toMatchSnapshot();
    });
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
    return mdToComponentModule(text, options).then(result => {
      expect(result).toMatchSnapshot();
    });
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
    return mdToComponentModule(text, options).then(result => {
      expect(result).toMatchSnapshot();
    });
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
    return mdToComponentModule(text).then(result => {
      expect(result).toMatchSnapshot();
    });
  });

  test('documentation example', () => {
    const text = prepText(`
      ---
      title: Everything is ok
      quantity: 834
      modules:
        - "const Timer = require('./timer')"
        - "import { Watcher } from './watcher'"
      ---

      # {# frontMatter.title #}

      Some introductory text. The quantity is {# frontMatter.quantity #}

      {# <Watcher /> #}

      This paragraph includes a {# <Timer /> #}.

      This component also accepts a "foo" prop: {# props.foo #}
    `);
    return mdToComponentModule(text).then(result => {
      expect(result).toMatchSnapshot();
    });
  });
});
