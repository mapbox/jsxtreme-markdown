# babel-plugin-transform-jsxtreme-markdown changelog

Any version not listed here is just a non-disruptive update in the `@mapbox/jsxtreme-markdown` dependency.

## 0.4.3

- Update dependencies.

## 0.4.2

- Update `jsxtreme-markdown` package which fixes a bug in which `prettier` was not included in regular `dependencies`.

## 0.4.1

- Add `var React = require('react');` to the file if `React` is not in the top-level scope.
  This ensures the JSX output will work even in files that don't otherwise use React.

## 0.4.0

- Start this log.
