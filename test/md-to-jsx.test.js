'use strict';

const stripIndent = require('strip-indent');
const prettier = require('prettier');
const Prism = require('prismjs');
const mdToJsx = require('../lib/md-to-jsx');

const prepText = text => stripIndent(text).trim();

describe('mdToJsx', () => {
  test('with simple expression', () => {
    const text = prepText(`
      # Title
      And a **special**: {# number #}, {#twice#}.
    `);

    return mdToJsx(text).then(jsx => {
      expect(prettier.format(jsx)).toMatchSnapshot();
    });
  });

  test('with nested JSX', () => {
    const text = prepText(`
      This is a paragraph {# <span className="foo">with a span inside</span> #}
      {# <div style={{ margin: 70 }}>
        And here is a div.
      </div> #}
    `);

    return mdToJsx(text).then(jsx => {
      expect(prettier.format(jsx)).toMatchSnapshot();
    });
  });

  test('with broken-up nested JSX', () => {
    const text = prepText(`
      This is a paragraph {# <span className="foo"> #} with a **markdown** span inside {# </span> #}
      {# <div style={{ margin: 70 }}> #}
        And here is a paragraph inside a div.
        [Link](/some/url)
      {# </div> #}
    `);

    return mdToJsx(text).then(jsx => {
      expect(prettier.format(jsx)).toMatchSnapshot();
    });
  });

  test('with alternative delimiters', () => {
    const text = prepText(`
      This time there's {{ adjective }} new delimiters.
      {{ <div style={{ margin: 70 }}>
        Did this work?
      </div> }}
    `);

    const options = {
      delimiters: ['{{', '}}']
    };

    return mdToJsx(text, options).then(jsx => {
      expect(prettier.format(jsx)).toMatchSnapshot();
    });
  });

  test('with MarkdownIt options', () => {
    const highlight = (code, lang) => {
      const fallback = `<pre><code>${code}</pre></code>`;
      if (!lang) return fallback;
      // lang must be http://prismjs.com/#languages-list
      const grammar = Prism.languages[lang];
      if (!grammar) return fallback;
      const highlightedCode = Prism.highlight(code, grammar);
      // Needs the wrapper class
      return `<pre><code class="language-${lang}">${highlightedCode}</code></pre>`;
    };

    const text = prepText(`
      This time there's "special" punctuation and syntax highlighting.
      \`\`\`javascript
      const obj = {
        thing: 1,
        thing: 'two'
      };
      \`\`\`
    `);

    const options = {
      delimiters: ['{{', '}}'],
      markdownItOptions: {
        typographer: true,
        highlight
      }
    };

    return mdToJsx(text, options).then(jsx => {
      expect(prettier.format(jsx)).toMatchSnapshot();
    });
  });

  test('with built-in Prism highlighting', () => {
    const text = prepText(`
      Here is a block of code
      \`\`\`javascript
      const obj = {
        thing: 1,
        thing: 'two'
      };
      \`\`\`
    `);

    const options = {
      syntaxHighlighting: 'prism'
    };

    return mdToJsx(text, options).then(jsx => {
      expect(prettier.format(jsx)).toMatchSnapshot();
    });
  });

  test('with built-in highlight.js highlighting', () => {
    const text = prepText(`
      Here is a block of code
      \`\`\`javascript
      const obj = {
        thing: 1,
        thing: 'two'
      };
      \`\`\`
    `);

    const options = {
      syntaxHighlighting: 'highlightjs'
    };

    return mdToJsx(text, options).then(jsx => {
      expect(prettier.format(jsx)).toMatchSnapshot();
    });
  });

  test('documentation example', () => {
    const text = prepText(`
      # Title
      Here is some **markdown**. So *easy* to write.
      You can interpolate JS expressions like {# data.number #}
      or {# dogs.map(d => d.name).join(', ') #}.
      You can also interpolate JSX elements,
      whether {# <span>inline</span> #} or as a block:
      {# <div className="fancy-class">
        This is a block.
      </div>#}
      You can even break up JSX interpolation to process more or your text
      as Markdown.
      {# <div className="fancy-class"> #}
        This is a **Markdown** paragraph inside the div.
        And this is another.
      {# </div> #}
    `);

    return mdToJsx(text).then(jsx => {
      expect(prettier.format(jsx)).toMatchSnapshot();
    });
  });
});
