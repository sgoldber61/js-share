import React, { Component } from 'react';
import CodeMirror from 'react-codemirror';
import 'codemirror/lib/codemirror.css';
import js from 'codemirror/mode/javascript/javascript';


class CM extends Component {
  constructor(props) {
    super(props)
    this.state = {
      code: 'placeholder'
    }
    this.udpatedCode = this.updateCode.bind(this);
  }

  updateCode(newCode) {
    this.setState({
      code: newCode,
    })
  }

  render() {
    let options = { lineNumbers: true, mode: 'javascript' }

    return (
      <CodeMirror
        value={this.state.code}
        onChange={this.udpateCode}
        options={options}
        language='javascript'
      />
    )
  }

}

export default CM;