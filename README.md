# md-react-transformer

[![Build Status](https://travis-ci.org/mapbox/md-react-transformer.svg?branch=master)](https://travis-ci.org/mapbox/md-react-transformer)

Transform Markdown **with interpolated JS expressions and JSX elements (!)** into JSX or React component modules.

🚧 🚧 **EXPERIMENTAL! WORK IN PROGRESS!** 🚧 🚧

This module takes one string (Markdown) and converts it to another string (JSX or React component module).
That low-level focus means it can be used by a variety of higher-level modules that target specific contexts.

## API

This module exposes the following functions.

- [mdToJsx](#mdtojsx)
- [mdToComponentModule](#mdtocomponentmodule)

## mdToJsx

`mdToJsx(input: string, options?: Object): string`

Write Markdown with interpolated JS and JSX that are set off from the Markdown syntax by designated delimiters; then transform it into pure JSX.

```js
const prettier = require('prettier');
const mdReactTransformer = require('md-react-transformer');

const markdown = `
  # Title

  Here is some **markdown**. *So easy* to write.

  You can interpolate JS expressions like {# data.number #}
  or {# dogs.map(d => d.name).join(', ') #}.

  You can also interpolate JSX elements,
  whether {# <span>inline</span> #} or as a block:

  {# <div className="fancy-class">
    This is a block.
  </div> #}

  You can even break up JSX interpolation to process more or your text
  as Markdown.

  {# <div className="fancy-class"}> #}
    This is a **Markdown** paragraph inside the div.

    And this is another.
  {# </div> #}
`;

const jsx = mdReactTransformer.mdToJsx(markdown);
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

- **delimiters** `?[string, string]` - Default: `['{#', '#}']`.
  Delimiters set off interpolated JS and JSX from the Markdown text.
  Customize them by passing an array with two strings, one for the opener, one for the closer.
  For example: `['{{', '}}']`.
- **remarkPlugins**
- **rehypePlugins**

## mdToComponentModule

`mdToComponentModule(input: string, options?: Object): string`

Uses `mdToJsx`, above, to transform Markdown to JSX.
Also parses front matter.
Finally, generates a React component module that wraps this content.

A default template is provided that produces the output exemplified below. (Alternately, you can provide your own template.)

By default, **there are two special front matter properties:**
- `wrapper`: Path to a wrapper component.
  This wrapper component will receive the following props:
  - All the props passed to the component at runtime.
  - A `frontMatter` prop containing all the parsed front matter.
  - A `children` prop that is the JSX content generated from your source Markdown.
- `modules`: An array of lines of JS code that `require` or `import` modules that will be used in the interpolated JS and JSX.

```js
const mdReactTransformer = require('md-react-transformer');

const markdown = `
  ---
  title: Everything is ok
  quantity: 834
  wrapper: '../wrapper.js',
  modules:
    - "const Timer = require('./timer')"
    - "import { Watcher } from './watcher'"
  ---

  # {# frontMatter.title #}

  Some introductory text. The quantity is {# frontMatter.quantity #}

  {# <Watcher /> #}

  This paragraph includes a {# <Timer /> #}.

  This component also accepts a "foo" prop: {# props.foo #}
`;

const js = mdReactTransformer.mdToComponentModule(markdown);
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

- Any of the options for `mdToJsx`, documented above.
- **wrapper** `?string` - The path to a wrapper component.
  This value can be set of overridden document-by-document by setting `wrapper` in the front matter of the Markdown.
  See the docs about `wrapper` front matter above.
- **name** `?string` - Default: `MarkdownReact`.
  The name of the component class that will be generated.
- **template** `?Function` - An alternative template function.
  Receives as its argument a data object and must return a string.
  Data includes:
  - `wrapper`: The value of the `wrapper` option above.
  - `name`: The value of the `name` option above, converted to PascalCase.
  - `frontMatter`: The parsed front matter.
  - `jsx`: The JSX string generated from your source Markdown.
