# @mapbox/jsxtreme-markdown-loader

[![Build Status](https://travis-ci.org/mapbox/jsxtreme-markdown-loader.svg?branch=master)](https://travis-ci.org/mapbox/jsxtreme-markdown-loader)

🚧 🚧 **EXPERIMENTAL! WORK IN PROGRESS!** 🚧 🚧

Webpack loader to transform Markdown with interpolated JS and JSX into React components.

Runs files through the `toComponentModule` function of [jsxtreme-markdown](https://github.com/mapbox/jsxtreme-markdown).
Please read the [jsxtreme-markdown](https://github.com/mapbox/jsxtreme-markdown) documentation for more information.

## Installation

```
npm install @mapbox/jsxtreme-markdown-loader
```

## Usage

Follow the instructions for using [Webpack loaders](https://webpack.js.org/concepts/loaders/).

⚠️  **The output of the default template includes JSX and ES2015 (`class`), so you should chain this loader with the [`babel-loader`](https://github.com/babel/babel-loader).**

### options

You can pass all of [the options from `toComponentModule`](https://github.com/mapbox/jsxtreme-markdown#tocomponentmodule).

Additional options for the loader:

#### getWrapper

Type: `(resource: string) => string`.

A function that receives the Webpack module's `resource` as an argument, and returns the path to a `wrapper` component.
