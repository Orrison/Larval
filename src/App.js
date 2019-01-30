import React, { Component } from 'react'
import SiteList from './SiteList/index.js'
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

  openCreateNew = () => {
    this.setState({createNew: true});
    const currCreateNewShow = this.state.createNewShow;
    this.setState({createNewShow: !currCreateNewShow});
  }

  render() {

    this.state.createNewShow = false

    return (
      <div className="App">
        <SiteList 
        text={this.state.ip}
        click={this.openCreateNew} />
      </div>
    );
  }
}

export default App;
