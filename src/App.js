import React, { Component } from 'react'
import SiteList from './SiteList/index.js'
import CreateNew from './CreateNew/index.js'
import '../node_modules/bulma/css/bulma.css'
import './App.css'

const electron = window.require('electron');
const remote = electron.remote;
const BrowserWindow = electron.remote.BrowserWindow;
window.$ = window.jQuery = window.require('jquery');
const fs = window.require("fs");
const yaml = require('js-yaml');
const dialog = remote.dialog;
const app = electron.app

class App extends Component {

  state = yaml.safeLoad(fs.readFileSync('/Users/kevinu/Homestead/Homestead.yaml', 'utf8'));

  componentDidMount() {
    this.setState({createNewShow: false});
    console.log(this.state);
  }

  toggleCreateNew = () => {
    const currCreateNewShow = this.state.createNewShow;
    this.setState({createNewShow: !currCreateNewShow});
  }

  render() {

    let showCreatenew = null;
    if (this.state.createNewShow) {
      showCreatenew = (
        <CreateNew
        close={this.toggleCreateNew} />
      )
    }

    return (
      <div className="App">
        <SiteList 
        text={this.state.ip}
        click={this.toggleCreateNew} />

        {showCreatenew}
      </div>
    );
  }
}

export default App;
