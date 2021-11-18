# @mapbox/jsxtreme-markdown

Transform **Markdown with interpolated JS expressions and JSX elements** into JSX or React component modules.

This is the low-level, core module that takes one string (Markdown) and converts it to another string (JSX or a React component module).

That low-level focus means this module can be used by a variety of higher-level modules that target specific contexts (Webpack loaders, Browserify transforms, CLIs, etc.).

## Installation

```
npm install @mapbox/jsxtreme-markdown
```

## API

### toJsx

`jsxtremeMarkdown.toJsx(input, [options])`

Transforms jsxtreme-markdown into pure JSX, returning the JSX.

The text runs through a series of steps:

1. Extract interpolations, replacing them with placeholders that will be handled properly by the Markdown parser.
2. Run the result through [remark] to parse the Markdown.
   (At this stage, you can use any [remark plugins]) you'd like)
3. Parsed Markdown is passed into [rehype] for transformation into HTML.
   (At this stage, you can use any [rehype plugins] you'd like.)
4. Transform the HTML to JSX (with [htmltojsx]).
5. Restore the interpolations.

```js
const prettier = require('prettier');
const jsxtremeMarkdown = require('@mapbox/jsxtreme-markdown');

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
console.log(prettier.format(jsx, { parser: 'babel' }));

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

#### input

Type: `string`.
**Required**.

Your xtreme Markdown.

#### options

##### delimiters

Type: `[string, string]`.
Default: `['{{', '}}']`.

Delimiters set off interpolated JS and JSX from the Markdown text.
Customize them by passing an array with two strings, one for the opener, one for the closer.
For example: `['{%', '%}']`.

**Note: Do not use delimiters which could clash with JS (`${}`) or JSX (`{}`).**

##### escapeDelimiter

Type: `string`.
Default: `'#'`.

In the rare case that you want to use your delimiters but _not_ for interpolation (e.g. you have code in the text that includes them), you can escape them by prefixing the start delimiter with this character.
The `escapeDelimiter` will be stripped from the output, but the delimiter characters will remain untouched.
For example, if you want to include the JSX `<div style={{ margin: 10 }} />` in a code block, you would need to escape the double curly brace: `<div style=#{{ margin: 10 }} />`.

##### remarkPlugins

Type: `Array<Function | [Function, any]>`.

The Markdown is parsed by [remark].
So you can use any [remark plugins] you'd like (e.g. for linting).

Each item in the array is either a remark plugin function or an array whose first item is the plugin function and second item is plugin options.
For example:

```js
{
  remarkPlugins: [
    require('remark-squeeze-paragraphs'),
    [require('remark-lint-emphasis-marker'), '*'],
    [require('remark-toc'), { heading: 'ToC', maxDepth: 2 }],
  ];
}
```

##### rehypePlugins

Type: `Array<Function | [Function, Object]>`.

Parsed Markdown is passed into [rehype], at which point it represents HTML nodes.
At this stage, you can use any [rehype plugins] you'd like (e.g. for syntax highlighting).

Each item in the array is either a remark plugin function or an array whose first item is the plugin function and second item is plugin options.
For example:

```js
{
  remarkPlugins: [
    require('rehype-picture),
    [require('rehype-prism'), { ignoreMissing: true }]
  ]
}
```

### toComponentModule

`jsxtremeMarkdown.toComponentModule(input, [options])`

Uses [`toJsx`], above, to transform Markdown to JSX.
Also parses front matter.
Returns a JS string representing a React component module that wraps this content.

The JSX is plugged into a template to produce the React component module.
A default template is provided that produces the output exemplified below.
You can also provide your own template to fit your own needs and preferences.

```js
const jsxtremeMarkdown = require('@mapbox/jsxtreme-markdown');

const markdown = `
  ---
  title: Everything is ok
  quantity: 834
  wrapper: "../wrapper.js",
  prependJs:
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
import React from "react";
import Timer from "./timer";
import { Watcher } from "./watcher";
import Wrapper from "../wrapper";

const frontMatter = {
  title: "Everything is ok",
  quantity: 834
};

export default class MarkdownReact extends React.PureComponent {
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
*/
```

#### input

Type: `string`.
**Required**.

Your xtreme Markdown.

#### options

**You can pass any of [the options for `toJsx`](#options)**, documented above.
Also the following:

##### wrapper

Type: `string`.

The path to a wrapper component.
This value can be overridden document-by-document by setting `wrapper` in the front matter of the Markdown.
The wrapper component must be exported with `module.exports` or `export default`, not a named ES2015 export.

The wrapper component will receive the following props:

- All the props passed to the component at runtime.
- `frontMatter`: The parsed front matter.
- `children`: The JSX content generated from your source Markdown.

##### prependJs

Type: `Array<string>`.

An array of lines of JS code that will be prepended to the top of the JavaScript.
The typical use-case is to `require` or `import` modules that will be used by interpolated JS and JSX.
This value can be _added to_ document-by-document by setting `prependJs` in the front matter of specific documents.

##### template

Type: `(data: Object) => string`.

An alternative template function.

Receives as its argument a data object and must return a string.
Look to [the default template](lib/templates/default.js) as an example.
The data object includes the following:

- `wrapper`: The value of [the `wrapper` option](#wrapper), above.
- `prependJs`: The value of [the `prependJs` option](#prependjs), above.
- `name`: The value of [the `name` option](#name), above, converted to PascalCase.
- `frontMatter`: The parsed front matter.
- `jsx`: The JSX string generated from your source Markdown.

##### headings

Type: `boolean`.
Default: `false`.

**The primary use case for the `headings` option is to build a table of contents in your wrapper component.**

If `true`, the following will happen:

- Every heading element in the Markdown will have an `id` attribute whose value is the element's slugified text.
- The module's `frontMatter` object will be augmented with a `headings` array.
  Each item in the array is an object with `text`, `slug`, and `level` properties.

For example:

```js
const jsxtremeMarkdown = require('@mapbox/jsxtreme-markdown');

const markdown = `
  # One

  Text.

  ## Two

  Some more text.

  ### Third-level heading

  Yet more.

  ## Two

  A section with a duplicate title.
`;

const js = jsxtremeMarkdown.toComponentModule(markdown);
console.log(js);

/*
import React from "react";

const frontMatter = {
  headings: [
    {
      text: "One",
      slug: "one",
      level: 1
    },
    {
      text: "Two",
      slug: "two",
      level: 2
    },
    {
      text: "Third-level heading",
      slug: "third-level-heading",
      level: 3
    },
    {
      text: "Two",
      slug: "two-1",
      level: 2
    }
  ]
};

export default class MarkdownReact extends React.PureComponent {
  render() {
    const props = this.props;
    return (
      <div>
        <h1 id="one">One</h1>
        <p>Text.</p>
        <h2 id="two">Two</h2>
        <p>Some more text.</p>
        <h3 id="third-level-heading">Third-level heading</h3>
        <p>Yet more.</p>
        <h2 id="two-1">Two</h2>
        <p>A section with a duplicate title.</p>
      </div>
    );
  }
}
*/
```

A couple of things to keep in mind when using this option:

- _Do not use interpolation in your heading text!_
- Slugs are generated with [github-slugger], so should match the slugging patterns found in rendered Markdown files on GitHub.

##### precompile

Type: `boolean`.
Default: `false`.

If `true`, the returned string will be compiled with Babel (using `@babel/preset-env` and `@babel/preset-react`).

##### name

Type: `string`.
Default: `MarkdownReact`.

The name of the component class that will be generated.

#### The default template

For the default template, there are two special front matter properties that Markdown documents can use:

- `wrapper`: Path to a wrapper component.
  This can be set outside the front matter with [the `wrapper` option](#wrapper), above.
  See those docs for more details.
- `prependJs`: See the [the `prependJs` option](#prependjs), above.
  In a document's front matter, this property will _add lines to_ the value of that option, for that specific module.

[`tojsx`]: #tojsx
[`tocomponentmodule`]: #tocomponentmodule
[remark]: https://github.com/wooorm/remark
[remark plugins]: https://github.com/wooorm/remark/blob/master/doc/plugins.md
[rehype]: https://github.com/wooorm/rehype
[rehype plugins]: https://github.com/wooorm/rehype/blob/master/doc/plugins.md
[htmltojsx]: https://www.npmjs.com/package/htmltojsx
[github-slugger]: https://github.com/Flet/github-slugger
