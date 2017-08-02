# @mapbox/babel-plugin-transform-jsxtreme-markdown

[![Build Status](https://travis-ci.org/mapbox/babel-plugin-transform-jsxtreme-markdown.svg?branch=master)](https://travis-ci.org/mapbox/babel-plugin-transform-jsxtreme-markdown)

🚧 🚧 **EXPERIMENTAL! WORK IN PROGRESS!** 🚧 🚧

Transform Markdown interpolated with JS expressions and JSX elements into pure JSX, at compile time.

Uses [jsxtreme-markdown](https://github.com/mapbox/jsxtreme-markdown) to compile the interpolated Markdown.

## Installation

```
npm install @mapbox/babel-plugin-transform-jsxtreme-markdown
```

## Usage

Transforms a special [tagged template literal](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#Tagged_template_literals).

`require` or `import` `'babel-plugin-transform-jsxtreme-markdown/md'`, or whatever you've specified as `packageName` in your Babel options.
Then use that (fake) module's value as a template literal tag, marking the template literals you'd like to be compiled at run time.

```jsx
// Input
const md = require('babel-plugin-transform-jsxtreme-markdown/md');
const foo = md`
  # Title
  This is **bold.**
  Here is a [link](/some/url).
`;

// Output
'use strict';

var foo = <div>
  <h1>Title</h1>
  <p>This is <strong>bold.</strong>
    Here is a <a href="/some/url">link</a>.</p>
</div>;
```

**Because this plugin uses [jsxtreme-markdown](https://github.com/mapbox/jsxtreme-markdown), you can also interpolate JS expressions and JSX elements within special delimiters.**
Read more about this in the jsxtreme-markdown docs.

```jsx
// Input
import md from 'babel-plugin-transform-jsxtreme-markdown/md';
const text = md`
  This is a paragraph {{<span className="foo">}} with a **markdown** span inside {{</span>}}
  {{ <div style={{ margin: 70 }}> }}
    And here is a *paragraph* inside a div.
    [Link](/some/url)
  {{ </div> }}
`;

// Output
'use strict';

var text = <div>
  <p>This is a paragraph <span className="foo"> with a <strong>markdown</strong> span inside </span></p>
  <div style={{ margin: 70 }}>
    And here is a <em>paragraph</em> inside a div.
    <a href="/some/url">Link</a>
  </div>
</div>;
```

### options

You can pass any of [the options available to `jsxtremeMarkdown.toJsx`](https://github.com/mapbox/jsxtreme-markdown#tojsx).

Additional options:

#### packageName

Type: `string`.
Default: `'babel-plugin-transform-jsxtreme-markdown/md'`.

The name of the package that you will `require` or `import` to use this thing.
