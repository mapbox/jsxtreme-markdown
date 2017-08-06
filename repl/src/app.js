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
  styleSelectedText: true
});
const outputCode = CodeMirror.fromTextArea(outputEl, {
  lineNumbers: true,
  mode: 'text/jsx',
  lineWrapping: true,
  readOnly: true,
  styleSelectedText: true
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

function onInputChange() {
  const raw = inputCode.getValue();
  let jsx;
  try {
    jsx = toJsx(raw);
    outputCode.setValue(jsx);
    // This line parses JSX only so we can get parsing errors.
    babylon.parse(jsx, { plugins: ['jsx'] });
    clearError();
  } catch (error) {
    // Duck-typing babylon errors.
    if (error.loc) {
      const line = error.loc.line - 1;
      outputCode.markText(
        { line, ch: error.loc.column },
        { line, ch: error.loc.column + 1 },
        { className: 'bg-red color-white' }
      );
      outputCode.addLineClass(error.loc.line - 1, 'wrap', 'bg-red-faint');
      outputCode.addLineClass(
        error.loc.line - 1,
        'gutter',
        'bg-red-faint border-r border--red'
      );
      outputCode.scrollIntoView({ line, ch: 1 }, 24);
      error.message = `JSX syntax error: ${error.message}`;
    }
    showError(error.message);
  }
}

// Try to preserve the scroll position of the output area between changes.
let outputCodePreChangeScroll;
function onOutputBeforeChange() {
  outputCodePreChangeScroll = outputCode.getScrollInfo();
}
function onOutputChange() {
  outputCode.scrollTo(outputCodePreChangeScroll, outputCodePreChangeScroll.top);
}
