'use strict';

const babylon = require('babylon');
const toJsx = require('../../packages/jsxtreme-markdown/lib/to-jsx');
const CodeMirror = window.CodeMirror;

const errorEl = document.getElementById('error');
function clearError() {
  errorEl.textContent = '';
  errorEl.classList.add('none');
}
function showError(text) {
  errorEl.textContent = text;
  errorEl.classList.remove('none');
}

CodeMirror.defineMode('jsxtreme-markdown', config => {
  const markdownMode = CodeMirror.getMode(config, 'markdown');
  const jsxMode = CodeMirror.getMode(config, 'jsx');
  return CodeMirror.multiplexingMode(
    markdownMode,
    // First catch any escaped delimiters and treat them as Markdown.
    {
      open: '#{{',
      close: '}}',
      mode: markdownMode
    },
    // Then see if there are unescaped delimiters.
    {
      open: '{{',
      close: '}}',
      mode: jsxMode,
      delimStyle: 'jsxtreme-delimiter',
      innerStyle: 'jsxtreme'
    }
  );
});

const inputEl = document.createElement('textarea');
document.getElementById('input-container').appendChild(inputEl);
const outputEl = document.createElement('textarea');
outputEl.setAttribute('disabled', '');
document.getElementById('output-container').appendChild(outputEl);
const inputCode = CodeMirror.fromTextArea(inputEl, {
  lineNumbers: true,
  tabSize: 2,
  mode: 'jsxtreme-markdown',
  lineWrapping: true,
  autoCloseBrackets: true,
  extraKeys: { Enter: 'newlineAndIndentContinueMarkdownList' },
  styleSelectedText: true,
  showTrailingSpace: true
});
const outputCode = CodeMirror.fromTextArea(outputEl, {
  lineNumbers: true,
  mode: 'text/jsx',
  lineWrapping: true,
  readOnly: true,
  styleSelectedText: true,
  showTrailingSpace: true
});
inputCode.on('change', onInputChange);
inputCode.on('renderLine', onRenderLine);
outputCode.on('beforeChange', onOutputBeforeChange);
outputCode.on('change', onOutputChange);

function onRenderLine(instance, line, element) {
  // If a line contains only jsxtreme tokens, add the jsxtreme background color.
  if (element.children.length !== 1) return;
  const tokens = element.children[0].childNodes;
  for (let i = 0, l = tokens.length; i < l; i++) {
    if (
      tokens[i].nodeType !== Node.ELEMENT_NODE ||
      !/cm-jsxtreme/.test(tokens[i].className)
    ) {
      return;
    }
  }
  element.classList.add('jsxtreme-bg');
}

let erroredInputLines = [];

function onInputChange() {
  // Clear all errored lines. They will repopulate if they still exist.
  erroredInputLines.forEach(line => {
    inputCode.removeLineClass(line, 'wrap', 'bg-red-faint');
    inputCode.removeLineClass(
      line,
      'gutter',
      'bg-red-faint border-r border--red'
    );
  });
  erroredInputLines = [];
  const raw = inputCode.getValue();
  let jsx;
  try {
    jsx = toJsx(raw);
    outputCode.setValue(jsx);
    // This line parses JSX only so we can get parsing errors.
    babylon.parse(jsx, { plugins: ['jsx'] });
    clearError();
  } catch (error) {
    // Back block-level element errors.
    if (error.code === 'BADBLOCK') {
      markError(inputCode, error.position.line - 1, error.position.column);
    } else if (error.loc) {
      // Duck-typed babylon parsing errors.
      markError(outputCode, error.loc.line - 1, error.loc.column);
      error.message = `JSX syntax error: ${error.message}`;
    }
    showError(error.message);
  }
}

// Thanks http://codemirror.977696.n3.nabble.com/Scroll-to-line-td4028275.html
CodeMirror.defineExtension('centerOnLine', function(line) {
  var h = this.getScrollInfo().clientHeight;
  var coords = this.charCoords({ line: line, ch: 0 }, 'local');
  this.scrollTo(null, (coords.top + coords.bottom - h) / 2);
});

// Try to preserve the scroll position of the output area between changes.
let outputCodePreChangeScroll;
function onOutputBeforeChange() {
  outputCodePreChangeScroll = outputCode.getScrollInfo();
}
function onOutputChange() {
  outputCode.scrollTo(outputCodePreChangeScroll, outputCodePreChangeScroll.top);
}

function markError(editor, line, column) {
  editor.markText(
    { line, ch: column },
    { line, ch: column + 1 },
    { className: 'bg-red color-white' }
  );
  editor.addLineClass(line, 'wrap', 'bg-red-faint');
  editor.addLineClass(line, 'gutter', 'bg-red-faint border-r border--red');
  erroredInputLines.push(line);
  setTimeout(() => {
    // Run this after onOutputChange is done.
    editor.centerOnLine(line);
  }, 0);
}
