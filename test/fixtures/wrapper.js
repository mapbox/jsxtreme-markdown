/* eslint-disable */
'use strict';

const React = require('react');

class Wrapper extends React.PureComponent {
  render() {
    return (
      <div>
        <div>
          This is the wrapper. Here are its props:
        </div>
        <div>{this.props.number}</div>
        <div>{this.props.frontMatter.title}</div>
        <div>{this.props.frontMatter.quantity}</div>
        {this.props.children}
      </div>
    );
  }
}

module.exports = Wrapper;
