import React, { Component } from 'react'
import SiteList from './SiteList/index.js'
import CreateNew from './CreateNew/index.js'
import '../node_modules/bulma/css/bulma.css'
import './App.css'

const electron = window.require('electron');
const remote = electron.remote;
const BrowserWindow = electron.remote.BrowserWindow;
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

  // Create New code

  toggleCreateNew = () => {
    const currCreateNewShow = this.state.createNewShow;
    this.setState({createNewShow: !currCreateNewShow});
  }

  fileSelect = (event) => {
    event.preventDefault();

    if ( !event.target.value ) {
      var path = dialog.showOpenDialog({
          properties: ['openDirectory']
      });
      if (path != undefined) {
        event.target.value = path
      }
  }
  }

  submitCreateNew = (event) => {
    event.preventDefault();

    const data = new FormData(event.target);
    var doc = yaml.safeLoad(fs.readFileSync('/Users/kevinu/Homestead/Homestead.yaml', 'utf8'));

    let url = data.get('url');
    let path = data.get('path');
    let directory = path.substr(path.lastIndexOf('/') + 1);

    let newFolder = {
        map: path,
        to: "/home/vagrant/sites/" + directory
    };

    let newSite = {
        map: url,
        to: newFolder.to
    };

    doc.folders.push(newFolder);
    doc.sites.push(newSite);

    console.log(doc)
    fs.writeFile('test.yaml', yaml.safeDump (doc, {
        'styles': {
          '!!null': 'canonical' // dump null as ~
        },
        'sortKeys': false        // sort object keys
      }), (err) => {
        if(err){
            console.log("An error ocurred creating the file "+ err.message)
        }
    });
  }

  // END Create New code

  render() {

    let showCreatenew = null;
    if (this.state.createNewShow) {
      showCreatenew = (
        <CreateNew
        close={this.toggleCreateNew}
        formSubmit={this.submitCreateNew}
        pathClick={this.fileSelect} />
      )
    }

    return (
      <div className="App">
        <SiteList 
        text={this.state.ip}
        click={this.toggleCreateNew}
        list={this.state.sites} />

        {showCreatenew}
      </div>
    );
  }
}

export default App;
