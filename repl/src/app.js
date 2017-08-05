import React from 'react';
import ReactDOM from 'react-dom';
import CodeMirror from 'react-codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/markdown/markdown';
import toJsx from '../../packages/jsxtreme-markdown/lib/to-jsx';

const inputCodeMirrorOptions = {
  lineNumbers: true,
  mode: 'markdown'
};

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      input: '',
      output: ''
    };
    this.onInputChange = this.onInputChange.bind(this);
  }

  onInputChange(nextCode) {
    const nextOutput = toJsx(nextCode);
    this.setState({ input: nextCode, output: nextOutput });
  }

  render() {
    return (
      <div className="viewport-full flex-parent flex-parent--column">
        <div className="flex-child flex-child--grow w-full grid grid--gut24 flex-parent--stretch-cross">
          <div className="col col--12 col--6-mm">
            <CodeMirror
              value={this.state.input}
              onChange={this.onInputChange}
              options={inputCodeMirrorOptions}
              autoFocus={true}
              className="h-full"
            />
          </div>
          <div className="col col--12 col--6-mm">
            {this.state.output}
          </div>
        </div>
      </div>
    );
  }
}

const container = document.getElementById('app');
ReactDOM.render(<App />, container);
