import React, { Component } from 'react'
import SiteList from './SiteList/index'
import CreateNew from './CreateNew/index'
import '../node_modules/bulma/css/bulma.css'
import './App.css'

const electron = window.require('electron')
const remote = electron.remote
// const BrowserWindow = electron.remote.BrowserWindow;
const fs = window.require("fs");
const yaml = require('js-yaml');
const dialog = remote.dialog;
const app = electron.app
const linebyline = require('line-by-line');
const sudo = require('sudo-prompt')
const timestamp = require('time-stamp')

class App extends Component {

  state = {
    yaml: yaml.safeLoad(fs.readFileSync('/Users/kevinu/Homestead/Homestead.yaml', 'utf8')),
    createNewShow: false
  }

  componentDidMount() {
    console.log(this.state);

    const lr = new linebyline('/etc/hosts');

    lr.on('error', function (err) {
      console.log('Error: ' + err)
    });
    
    lr.on('line', function (line) {
      console.log('Line: ' + line)
    });
    
    lr.on('end', function () {
      console.log('done')
    });
  }

  // Create New code

  toggleCreateNew = () => {
    const currCreateNewShow = this.state.createNewShow;
    this.setState({createNewShow: !currCreateNewShow});
  }

  fileSelect = (event) => {
    event.preventDefault();

    if (!event.target.value) {
      const path = dialog.showOpenDialog({
          properties: ['openDirectory'],
      })
      if (path !== undefined) {
        event.target.value = path
      }
  }
  }

  submitCreateNew = (event) => {
    event.preventDefault();

    const data = new FormData(event.target);
    const doc = yaml.safeLoad(fs.readFileSync('/Users/kevinu/Homestead/Homestead.yaml', 'utf8'));

    const url = data.get('url');
    const path = data.get('path');
    const directory = path.substr(path.lastIndexOf('/') + 1);

    const newFolder = {
        map: path,
        to: `/home/vagrant/sites/${directory}`,
    };

    const newSite = {
        map: url,
        to: newFolder.to,
    }

    doc.folders.push(newFolder)
    doc.sites.push(newSite)

    console.log(doc)
    fs.writeFile('test.yaml', yaml.safeDump(doc, {
        'styles': {
          '!!null': 'canonical' // dump null as ~
        },
        'sortKeys': false        // sort object keys
      }), (err) => {
        if(err){
            console.log("An error ocurred creating the file "+ err.message)
        }
    });

    var options = {
      name: 'Larval',
    };
    let time = timestamp('YYYYMMDD')
    sudo.exec(`cp /etc/hosts /etc/hosts.${time}.larval.bak && echo "${this.state.yaml.ip}  ${url}" >> /etc/hosts`, options,
      function(error, stdout, stderr) {
        if (error) throw error;
        console.log('stdout: ' + stdout);
      }
    );

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
        text={this.state.yaml.ip}
        click={this.toggleCreateNew}
        list={this.state.yaml.sites} />

        {showCreatenew}
      </div>
    );
  }
}

export default App;
