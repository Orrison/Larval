import React, { Component } from 'react'
 
class ConsoleInput extends Component {

    constructor(props) {
      super(props)
      this.state = {
        value: '',
      }

      this.handleChange = this.handleChange.bind(this)
    }

    handleChange = (event) => {
        this.setState({value: event.target.value})
      }

    _handleKeyPress = (e) => {
      if (e.key === 'Enter') {
        this.props.vagrantCommand(this.state.value)
        this.value = ''
        this.setState({value: ''})
      }
    }

    render() {
      return <input style={this.props.style} value={this.state.value} type="text" onKeyPress={(e) => this._handleKeyPress(e)} onChange={this.handleChange} />
    }
}

export default ConsoleInput