# babel-plugin-transform-jsxtreme-markdown changelog

Any version not listed here is just a non-disruptive update in the `@mapbox/jsxtreme-markdown` dependency.

## 3.1.0

- Update Dependencies including `jsxtreme-markdown` to 3.2.0

## 3.0.2

- Update `jsxtreme-markdown` to 3.0.2

## 3.0.1

- Update `jsxtreme-markdown` to 3.0.1

## 3.0.0

- Require Node >=18 and update dependencies.

## 2.0.0

- Require Node >=14 and update dependencies.

## 1.0.0

- Update to Babel 7, require Node >=10, and update dependencies.

## 0.5.0

- Update `@mapbox/jsxtreme-markdown` with new method for stringifying JSX.

## 0.4.3

- Update dependencies.

## 0.4.2

- Update `jsxtreme-markdown` package which fixes a bug in which `prettier` was not included in regular `dependencies`.

## 0.4.1

- Add `var React = require('react');` to the file if `React` is not in the top-level scope.
  This ensures the JSX output will work even in files that don't otherwise use React.

## 0.4.0

- Start this log.
