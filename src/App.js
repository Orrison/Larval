import React, { Component } from 'react'
import SiteList from './SiteList/index'
import CreateNew from './CreateNew/index'
import SettingsHeader from './SettingsHeader/index'
import HomesteadPath from './HomesteadPath/index'

import '../node_modules/bulma/css/bulma.css'
import './App.css'

const electron = window.require('electron')
const remote = electron.remote
// const BrowserWindow = electron.remote.BrowserWindow;
const fs = window.require("fs")
const yaml = require('js-yaml')
const dialog = remote.dialog
const app = electron.app
const linebyline = require('line-by-line');
const sudo = require('sudo-prompt')
const timestamp = require('time-stamp')
const settings = require('electron-settings')

class App extends Component {

  state = {
    yaml: yaml.safeLoad(fs.readFileSync('/Users/kevinu/Homestead/Homestead.yaml', 'utf8')),
    homesteadPath: settings.get('homestead_path'),
    setHomesteadPathShow: false,
    createNewShow: false,
    selectedSite: null,
  }

  componentDidMount() {
    console.log(this.state);

    // const lr = new linebyline('/etc/hosts');

    // lr.on('error', function (err) {
    //   console.log('Error: ' + err)
    // });
    
    // lr.on('line', function (line) {
    //   console.log('Line: ' + line)
    // });
    
    // lr.on('end', function () {
    //   console.log('done')
    // });

    // settings.delete('homestead_path')

    if (!this.state.homesteadPath) {
      this.setState({setHomesteadPathShow: true})
      console.log('Path is not set')
    }

    console.log(this.state.homesteadPath)
  }

  selectSite = (id) => {
    this.setState({selectedSite: id})
  }

  // Set Homestead Path code

  submitHomesteadPath = (event) => {
    const data = new FormData(event.target)
    const path = data.get('path')

    console.log(path)

    settings.set('homestead_path', path)
    this.setState({homesteadPath: path})

    const currsetHomesteadPathShow = this.state.setHomesteadPathShow;
    this.setState({setHomesteadPathShow: !currsetHomesteadPathShow});

    console.log(this.state.homesteadPath)
  }

  // END Set Homestead Path code

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
    const backupHost = data.get('backupHost');
    const backupYaml = data.get('backupYaml');
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

    var $command = ``;
    if (backupHost) {
      let time = timestamp('YYYYMMDD')
      $command = `cp /etc/hosts ${app.getPath('documents')}hosts.${time}.larval.bak && `
    } else {
      $command = ``
    }

    $command += `echo "${this.state.yaml.ip}  ${url}" >> /etc/hosts`

    var options = {
      name: 'Larval',
    };
    sudo.exec($command, options,
      function(error, stdout, stderr) {
        if (error) throw error;
        console.log('stdout: ' + stdout);
      }
    );

    this.setState({createNewShow: false});

  }

  // END Create New code

  render() {

    let showHomesteadPath = null
    if (this.state.setHomesteadPathShow) {
      showHomesteadPath = (
        <HomesteadPath 
          formSubmit={this.submitHomesteadPath}
          pathClick={this.fileSelect}
        />
      )
    }


    let showCreateNew = null;
    if (this.state.createNewShow) {
      showCreateNew = (
        <CreateNew
        close={this.toggleCreateNew}
        formSubmit={this.submitCreateNew}
        pathClick={this.fileSelect} />
      )
    }

    let title = 'Welcome Back!'
    if (this.state.selectedSite !== null) {
      title = this.state.yaml.sites[this.state.selectedSite].map
    }

    return (
      <div className="App">
        <div className='columns'>

          {showHomesteadPath}
          {showCreateNew}

          <SiteList 
            text={this.state.yaml.ip}
            click={this.toggleCreateNew}
            listItemClick={this.selectSite}
            list={this.state.yaml.sites}
          />

          <SettingsHeader
            title={title}
          />
        </div>
      </div>
    );
  }
}

export default App;
