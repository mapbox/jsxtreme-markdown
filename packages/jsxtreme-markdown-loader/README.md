# @mapbox/jsxtreme-markdown-loader

Webpack loader to transform Markdown with interpolated JS and JSX into React components.

Runs files through [the `toComponentModule` function of jsxtreme-markdown](https://github.com/mapbox/jsxtreme-markdown/tree/main/packages/jsxtreme-markdown#tocomponentmodule).
Please read that documentation for more information.

For more information about jsxtreme-markdown features, read [the README at the root of this monorepo](https://github.com/mapbox/jsxtreme-markdown#readme).

## Installation

```
npm install @mapbox/jsxtreme-markdown-loader
```

## Usage

Follow the instructions for using [Webpack loaders](https://webpack.js.org/concepts/loaders/).

By default, the output of this loader is precompiled with Babel.
You can bypass this step (and use your own compilation) by set the option `precompile: false`.

### options

You can pass all of [the options from `toComponentModule`](https://github.com/mapbox/jsxtreme-markdown/tree/main/packages/jsxtreme-markdown#options-1).

Additional options for the loader:

#### getWrapper

Type: `(resource: string) => string`.

A function that receives the Webpack module's `resource` as an argument, and returns the path to a `wrapper` component.
You can use this to automatically determine the wrapper component based on the Markdown file's path.
