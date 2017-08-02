'use strict';

const babylon = require('babylon');
const jsxtremeMarkdown = require('@mapbox/jsxtreme-markdown');

const DEFAULT_PACKAGE_NAME = 'jsxtreme-markdown/md';

module.exports = babel => {
  const t = babel.types;
  const bindingsByFile = new Map();

  const requireVisitor = (path, state) => {
    const arg = path.node.arguments[0];
    const packageName = state.opts.packageName || DEFAULT_PACKAGE_NAME;
    if (!t.isStringLiteral(arg) || arg.value !== packageName) return;

    const parentNode = path.parent;
    if (!t.isVariableDeclarator(parentNode)) {
      throw path.buildCodeFrameError(
        `You must assign ${packageName} to a new variable`
      );
    }

    const bindingName = parentNode.id.name;
    const file = path.hub.file;
    const fileBindings = bindingsByFile.get(file) || new Set();
    bindingsByFile.set(file, fileBindings.add(bindingName));
    path.parentPath.remove();
  };

  const importDeclarationVisitor = (path, state) => {
    const packageName = state.opts.packageName || DEFAULT_PACKAGE_NAME;
    if (
      !t.isLiteral(path.node.source) ||
      path.node.source.value !== packageName
    ) {
      return;
    }
    const firstSpecifierPath = path.get('specifiers.0');
    if (!t.isImportDefaultSpecifier(firstSpecifierPath)) {
      throw firstSpecifierPath.buildCodeFrameError(
        `Use a default import from ${packageName}`
      );
    }
    const bindingName = firstSpecifierPath.node.local.name;
    const file = path.hub.file;
    const fileBindings = bindingsByFile.get(file) || new Set();
    bindingsByFile.set(file, fileBindings.add(bindingName));
    path.remove();
  };

  const callExpressionVisitor = (path, state) => {
    const callee = path.get('callee').node;
    if (t.isIdentifier(callee, { name: 'require' })) {
      return requireVisitor(path, state);
    }
  };

  const isQualifyingTagName = path => {
    // Ensure a module binding is in scope.
    const file = path.hub.file;
    const fileBindings = bindingsByFile.get(file);
    return fileBindings && fileBindings.has(path.node.name);
  };

  const taggedTemplateExpressionVisitor = (path, state) => {
    if (!isQualifyingTagName(path.get('tag'))) return;
    if (!path.scope.hasBinding(path.node.tag.name)) return;

    const quasi = path.node.quasi;
    if (quasi.expressions.length !== 0) {
      throw path
        .get('quasi.expressions.0')
        .buildCodeFrameError(
          `Placeholders are not supported inside "${path.node.tag
            .name}" tagged template literals`
        );
    }

    const markdown = quasi.quasis.map(quasi => quasi.value.cooked).join('');
    const jsx = jsxtremeMarkdown.toJsx(markdown, state.opts);
    const parsedJsx = babylon.parseExpression(jsx, { plugins: ['jsx'] });
    path.replaceWith(parsedJsx);
  };

  return {
    visitor: {
      CallExpression: callExpressionVisitor,
      ImportDeclaration: importDeclarationVisitor,
      TaggedTemplateExpression: taggedTemplateExpressionVisitor
    }
  };
};
