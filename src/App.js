import React, { Component } from 'react'
import SiteList from './SiteList/index.js'
import '../node_modules/bulma/css/bulma.css'
import './App.css'

const electron = window.require('electron');
const remote = electron.remote;
const BrowserWindow = electron.remote.BrowserWindow;
window.$ = window.jQuery = require('jquery');
const fs = require("fs");
const yaml = require('js-yaml');
const dialog = electron.remote.dialog;

class App extends Component {
  render() {
    return (
      <div className="App">
        <SiteList />
      </div>
    );
  }
}

export default App;
