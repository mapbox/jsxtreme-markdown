# jsxtreme-markdown changelog

## 2.0.0

- Require Node >=14 and update dependencies.

## 1.0.0

- Update to Babel 7, require Node >=10, and update dependencies.

## 0.9.3

- [Fix] `toJsx` no longer errors when you pass it an empty string.

## 0.9.2

- [Fix] Don't use Prettier to format component module templates. They won't be as pretty for debugging, but it's worth it to remove the production dependency on Prettier.

## 0.9.1

- [Fix] `strip-indent` is a real dependency, not a devDepedency.

## 0.9.0

- Behind-the-scenes switch from `htmltojsx` to `@mapbox/hast-util-to-jsx`.

## 0.8.0

- Add `headings` option to `toComponentModule`.
- Transform `align` property on table cells to inline `text-align` styles using [hast-util-table-cell-style](https://github.com/mapbox/hast-util-table-cell-style).

## 0.7.4

- Update dependencies.

## 0.7.3

- Move `prettier` from `devDependencies` to regular `dependencies`.

## 0.7.2

- No real changes: first Lerna release.

## 0.7.1

- [Fix] Move Babel modules from `devDependencies` to `dependencies`.

## 0.7.0

- [Breaking change] Use ES2015 module syntax in default template.
- [Breaking change] Rename `modules` option to `prependJs`.

## 0.6.0

- Start this log.
