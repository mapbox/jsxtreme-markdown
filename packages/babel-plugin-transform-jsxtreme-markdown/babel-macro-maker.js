'use strict';

module.exports = function babelMacroMaker(defaultPackageName, applyTransform) {
  return babel => {
    const t = babel.types;

    const validateUsage = path => {
      const parentTemplateExpression = path.parentPath;
      if (!t.isTaggedTemplateExpression(parentTemplateExpression)) {
        throw path.buildCodeFrameError(
          `The export from '${defaultPackageName}' must be used as a template literal tag`
        );
      }
      if (parentTemplateExpression.node.quasi.expressions.length !== 0) {
        throw parentTemplateExpression
          .get('quasi.expressions.0')
          .buildCodeFrameError(
            `Placeholders are not supported inside "${parentTemplateExpression
              .node.tag.name}" tagged template literals`
          );
      }
    };

    const checkBinding = (bindingName, path, state) => {
      path.scope
        .getBinding(bindingName)
        .referencePaths.forEach(referencePath => {
          validateUsage(referencePath);
          const parentTemplateExpression = referencePath.parentPath;
          const text = parentTemplateExpression.node.quasi.quasis
            .map(quasi => quasi.value.cooked)
            .join('');
          applyTransform(parentTemplateExpression, text, state.opts);
        });
    };

    const visitImportDeclaration = (path, state) => {
      const packageName = state.opts.packageName || defaultPackageName;
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
      const localName = firstSpecifierPath.node.local.name;
      checkBinding(localName, path, state);
      path.remove();
    };

    const visitCallExpression = (path, state) => {
      const callee = path.get('callee').node;
      if (!t.isIdentifier(callee, { name: 'require' })) return;
      const arg = path.node.arguments[0];
      const packageName = state.opts.packageName || defaultPackageName;
      if (!t.isStringLiteral(arg) || arg.value !== packageName) return;

      const parentNode = path.parent;
      if (!t.isVariableDeclarator(parentNode)) {
        throw path.buildCodeFrameError(
          `You must assign the export from ${packageName} to a new variable`
        );
      }

      const localName = parentNode.id.name;
      checkBinding(localName, path, state);
      path.parentPath.remove();
    };

    return {
      visitor: {
        CallExpression: visitCallExpression,
        ImportDeclaration: visitImportDeclaration
      }
    };
  };
};
