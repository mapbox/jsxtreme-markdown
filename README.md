# jsxtreme-markdown

[![Build Status](https://travis-ci.org/mapbox/jsxtreme-markdown.svg?branch=master)](https://travis-ci.org/mapbox/jsxtreme-markdown)

🚧 🚧 **EXPERIMENTAL! WORK IN PROGRESS!** 🚧 🚧

Transform Markdown **with interpolated JS expressions and JSX elements (!)** into JSX or React component modules.

**It's Xtreme!** Like xtreme sports with Red Bull, but with Markdown and React and inside at your computer.

This module takes one string (Markdown) and converts it to another string (JSX or React component module).
That low-level focus means it can be used by a variety of higher-level modules that target specific contexts (Webpack loaders, Browserify transforms, CLIs, etc.).

## How does this differ from regular Markdonw?

Unlike regular Markdown:

- The end goal is to produce JSX.
- You can interpolate JS expression and JSX elements between designated delimiters.

These possibilities are illustrated in the examples below.

## API

This module exposes the following functions.

- [toJsx](#tojsx)
- [toComponentModule](#tocomponentmodule)

## toJsx

`toJsx(input: string, options?: Object): string`

Transform jsxtreme-markdown into pure JSX.

```js
const prettier = require('prettier');
const jsxtremeMarkdown = require('jsxtreme-markdown');

const markdown = `
  # Title

  Here is some **markdown**. *So easy* to write.

  You can interpolate JS expressions like {{ data.number }}
  or {{ dogs.map(d => d.name).join(', ') }}.

  You can also interpolate JSX elements,
  whether {{ <span>inline</span> }} or as a block:

  {{ <div className="fancy-class">
    This is a block.
  </div> }}

  You can even break up JSX interpolation to process more or your text
  as Markdown.

  {{ <div className="fancy-class"}> }}
    This is a **Markdown** paragraph inside the div.

    And this is another.
  {{ </div> }}
`;

const jsx = jsxtremeMarkdown.toJsx(markdown);
console.log(prettier.format(jsx));

/*
<div>
  <h1>Title</h1>
  <p>Here is some <strong>markdown</strong>. So <em>easy</em> to write.</p>
  <p>
    You can interpolate JS expressions like {data.number}
    or {dogs.map(d => d.name).join(", ")}.
  </p>
  <p>
    You can also interpolate JSX elements,
    whether <span>inline</span> or as a block:
  </p>
  <div className="fancy-class">
    This is a block.
  </div>
  <p>
    You can even break up JSX interpolation to process more or your text
    as Markdown.
  </p>
  <div className="fancy-class">
    <p>This is a <strong>Markdown</strong> paragraph inside the div.</p>
    <p>And this is another.</p>
  </div>
</div>;
*/
```

Within the Markdown, JS expressions and JSX elements can be interpolated between designated delimiters.
JS expressions are transformed into curly-brace delimited `{expressions}` within the JSX output.
JSX elements are passed directly through.

**Options** (none required)

- **delimiters** `?[string, string]` - Default: `['{{', '}}']`.
  Delimiters set off interpolated JS and JSX from the Markdown text.
  Customize them by passing an array with two strings, one for the opener, one for the closer.
  For example: `['{%', '%}']`.
- **escapeDelimiter** `?string` - Default: `#`.
  In the rare case that you want to use your delimiters but *not* for interpolation (e.g. you have code in the text that includes them), you can escape them by prefixing the start delimiter with this character.
  The `escapeDelimiter` will be stripped from the output, but the delimiter characters will remain untouched.
  For example, if I wanted to show the JSX `<div style={{ margin: 10 }} />`, I would need to escape the double curly brace: `<div style=#{{ margin: 10 }} />`.
- **remarkPlugins** `Function | Array<Function> | void` - The Markdown is parsed by [remark](https://github.com/wooorm/remark).
  You can use any [remark plugins]([remark plugins](https://github.com/wooorm/remark/blob/master/doc/plugins.md)) you'd like (e.g. linting).
- **rehypePlugins** `Function | Array<Function> | void` - Parsed Markdown is passed into [rehype](https://github.com/wooorm/remark), at which point it represents HTML nodes.
  At this stage, you can use any [rehype plugins](https://github.com/wooorm/rehype/blob/master/doc/plugins.md) you'd like (e.g. syntax highlighting).

### How does this work?

The text runs through a series of steps:

1. Extract interpolations, replacing them with placeholders that will be handled properly by the Markdown parser.
2. Run the result through [remark](https://github.com/wooorm/remark) to parse the Markdown.
  (At this stage, you can use any [remark plugins](https://github.com/wooorm/remark/blob/master/doc/plugins.md)) you'd like)
3. Parsed Markdown is passed into [rehype](https://github.com/wooorm/remark) for transformation into HTML.
  (At this stage, you can use any [rehype plugins](https://github.com/wooorm/rehype/blob/master/doc/plugins.md) you'd like.)
4. Transform the HTML to JSX (with [htmltojsx](https://www.npmjs.com/package/htmltojsx)).
5. Restore the interpolations.

## toComponentModule

`toComponentModule(input: string, options?: Object): string`

Uses [`toJsx`](#tojsx), above, to transform Markdown to JSX.
Also parses front matter.
Finally, generates a React component module that wraps this content.

A default template is provided that produces the output exemplified below.
**You can provide your own template to fit your own needs and preferences.**

For the default template, there are two special front matter properties:
- `wrapper`: Path to a wrapper component.
  This can be set outside the front matter with the `wrapper` option.
  This wrapper component will receive the following props:
  - All the props passed to the component at runtime.
  - A `frontMatter` prop containing all the parsed front matter.
  - A `children` prop that is the JSX content generated from your source Markdown.
- `modules`: An array of lines of JS code that `require` or `import` modules that will be used in the interpolated JS and JSX.
  This can be set outside the front matter with the `modules` option.


```js
const jsxtremeMarkdown = require('jsxtreme-markdown');

const markdown = `
  ---
  title: Everything is ok
  quantity: 834
  wrapper: "../wrapper.js",
  modules:
    - "const Timer = require('./timer')"
    - "import { Watcher } from './watcher'"
  ---

  # {{ frontMatter.title }}

  Some introductory text. The quantity is {{ frontMatter.quantity }}

  {{ <Watcher /> }}

  This paragraph includes a {{ <Timer /> }}.

  This component also accepts a "foo" prop: {{ props.foo }}
`;

const js = jsxtremeMarkdown.toComponentModule(markdown);
console.log(js);

/*
"use strict";
const React = require("react");
const Timer = require("./timer");
import { Watcher } from "./watcher";
const Wrapper = require("../wrapper");

const frontMatter = {
  title: "Everything is ok",
  quantity: 834
};

class MarkdownReact extends React.PureComponent {
  render() {
    const props = this.props;
    return (
      <Wrapper {...props} frontMatter={frontMatter}>
        <div>
          <h1>{frontMatter.title}</h1>
          <p>Some introductory text. The quantity is {frontMatter.quantity}</p>
          <Watcher />
          <p>This paragraph includes a <Timer />.</p>
          <p>This component also accepts a "foo" prop: {props.foo}</p>
        </div>
      </Wrapper>
    );
  }
}

module.exports = MarkdownReact;
*/
```

**Options** (none required)

- Any of the options for [`toJsx`](#tojsx), documented above.
- **wrapper** `?string` - The path to a wrapper component.
  This value can be overridden document-by-document by setting `wrapper` in the front matter of the Markdown.
  See the docs about `wrapper` front matter above.
- **modules** `?Array<string>` -  An array of lines of JS code that `require` or `import` modules that will be used in the interpolated JS and JSX.
  This value can be overridden document-by-document by setting `modules` in the front matter of the Markdown.
- **name** `?string` - Default: `MarkdownReact`.
  The name of the component class that will be generated.
- **template** `?Function` - An alternative template function.
  Look to [the default template](lib/templates/default.js) as an example.
  Receives as its argument a data object and must return a string.
  Data includes:
  - `wrapper`: The value of the `wrapper` option above.
  - `modules`: The value of the `modules` option above.
  - `name`: The value of the `name` option above, converted to PascalCase.
  - `frontMatter`: The parsed front matter.
  - `jsx`: The JSX string generated from your source Markdown.
