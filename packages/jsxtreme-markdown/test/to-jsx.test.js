'use strict';

const prettier = require('prettier');
const toJsx = require('../lib/to-jsx');

describe('toJsx', () => {
  test('with simple expression', () => {
    const text = `
      # Title
      And a **special**: {{ number }}, {{twice}}.
    `;

    const jsx = toJsx(text);
    expect(prettier.format(jsx)).toMatchSnapshot();
  });

  test('expression inside a link url', () => {
    const text = `
      Go to [the place](/the/place/)

      Go to [the place]({{ thePlaceUrl }})

      Go to [the place](/the/{{ placeUrl }})

      Go to [the place]({{ theUrl }}/place)
    `;

    const jsx = toJsx(text);
    expect(prettier.format(jsx)).toMatchSnapshot();
  });

  test('expression inside a src url', () => {
    const text = `
      ![The image](/the/img.jpg)

      ![The image]({{ theImgUrl }}.jpg)

      ![The image](/the/{{ imgUrl }})

      ![The image]({{ theUrl }}/img.jpg)
    `;

    const jsx = toJsx(text);
    expect(prettier.format(jsx)).toMatchSnapshot();
  });

  test('with nested JSX', () => {
    const text = `
      This is a paragraph {{<span className="foo">with a span inside</span>}}

      {{ <div style={{ margin: 70 }}>
        And here is a div.
      </div> }}
    `;

    const jsx = toJsx(text);
    expect(prettier.format(jsx)).toMatchSnapshot();
  });

  test('with broken-up nested JSX', () => {
    const text = `
      This is a paragraph {{ <span className="foo"> }}with a **markdown** span inside{{ </span> }}

      {{ <div style={{ margin: 70 }}> }}
        And here is a paragraph inside a div.
        [Link](/some/url)
      {{ </div> }}
    `;

    const jsx = toJsx(text);
    expect(prettier.format(jsx)).toMatchSnapshot();
  });

  test('with alternative delimiters', () => {
    const text = `
      This time there's {{ adjective }} new delimiters.
      {{ <div style={{ margin: 70 }}>
        Did this work?
      </div> }}
    `;

    const options = {
      delimiters: ['{{', '}}']
    };

    const jsx = toJsx(text, options);
    expect(prettier.format(jsx)).toMatchSnapshot();
  });

  test('syntax highlighting clashing with delimiters', () => {
    const text = `
      I'm thinking of a {{color}}

      \`\`\`javascript
      <div style=#{{ color: pink }}>{{ color }}</div>
      \`\`\`
    `;
    const jsx = toJsx(text);
    expect(prettier.format(jsx)).toMatchSnapshot();
  });

  test('documentation example', () => {
    const text = `
      # Title
      Here is some **markdown**. So *easy* to write.
      You can interpolate JS expressions like {{ data.number }}
      or {{ dogs.map(d => d.name).join(', ') }}.
      You can also interpolate JSX elements,
      whether {{ <span>inline</span> }} or as a block:
      {{ <div className="fancy-class">
        This is a block.
      </div> }}

      You can even break up JSX interpolation to process more or your text
      as Markdown.

      {{ <div className="fancy-class"> }}
        This is a **Markdown** paragraph inside the div.
        And this is another.
      {{ </div> }}
    `;

    const jsx = toJsx(text);
    expect(prettier.format(jsx)).toMatchSnapshot();
  });

  test('error on block-level element within paragraph', () => {
    const text = `
      Text {{ <ul><li>block</li></ul> }}

      More text.
    `;
    expect(() => toJsx(text)).toThrow('block-level element');
  });

  test('error on block-level element starting paragraph', () => {
    const text = `
      {{ <ul><li>block</li></ul> }} text.
    `;
    expect(() => toJsx(text)).toThrow('block-level element');
  });

  test('table with alignment gets text-align inline styles', () => {
    const text = `
      | Left-aligned | Center-aligned | Right-aligned |
      | :---         |     :---:      |          ---: |
      | git status   | git status     | git status    |
      | git diff     | git diff       | git diff      |
    `;
    const jsx = toJsx(text);
    expect(prettier.format(jsx)).toMatchSnapshot();
  });
});
