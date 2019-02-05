import React, { Component } from 'react'
import SiteList from './SiteList/index'
import CreateNew from './CreateNew/index'
import SettingsHeader from './SettingsHeader/index'
import HomesteadPath from './HomesteadPath/index'
import Vagrant from './Vagrant/index'

import '../node_modules/bulma/css/bulma.css'
import './App.css'

const electron = window.require('electron')
const remote = electron.remote
// const BrowserWindow = electron.remote.BrowserWindow;
const fs = window.require("fs")
const yaml = require('js-yaml')
const dialog = remote.dialog
const app = remote.app
const execute = window.require('child_process').exec

const linebyline = require('line-by-line')
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
    vagrantStatus: 'offline',
    vagrantConsole: []
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
    }

  }

  selectSite = (id) => {
    this.setState({selectedSite: id})
  }

  // Set Homestead Path code

  submitHomesteadPath = (event) => {
    const data = new FormData(event.target)
    let path = data.get('path')
    path = path.replace(/\/$/, "")

    settings.set('homestead_path', path)
    this.setState({homesteadPath: path})

    const currsetHomesteadPathShow = this.state.setHomesteadPathShow;
    this.setState({setHomesteadPathShow: !currsetHomesteadPathShow});
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
    const time = timestamp('YYYYMMDDHHmmss')
    const options = {
      name: 'Larval',
    };

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

    if (backupYaml) {
      execute(`cp ${this.state.homesteadPath}/Homestead.yaml ${app.getPath('documents')}/Homestead.yaml.${time}.larval.bak`, options,
        function(error, stdout, stderr) {
          if (error) throw error;
          console.log('stdout: ' + stdout);
        }
      )
    }

    fs.writeFile(`${this.state.homesteadPath}/Homestead.yaml`, yaml.safeDump(doc, {
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
      $command = `cp /etc/hosts ${app.getPath('documents')}/hosts.${time}.larval.bak && `
    } else {
      $command = ``
    }

    $command += `echo "${this.state.yaml.ip}  ${url}" >> /etc/hosts`

    sudo.exec($command, options,
      function(error, stdout, stderr) {
        if (error) throw error;
        console.log('stdout: ' + stdout);
      }
    );

    this.setState({createNewShow: false});

    this.forceUpdate()

  }

  // END Create New code

  vagrantToggle = () => {

    if (this.state.vagrantStatus === 'offline') {
      this.setState({vagrantStatus: 'processing'})

      var consoleCommand = execute(`cd ${this.state.homesteadPath} && vagrant up`)

      consoleCommand.stdout.on('data', (data) => {
        let stdout = this.state.vagrantConsole
        stdout.push(data)
        this.setState({vagrantConsole: stdout})
        let scroll = document.getElementById("vagrantConsole")
        scroll.scrollTop = scroll.scrollHeight
      })
      
      consoleCommand.stderr.on('data', (data) => {
        // console.log(`stderr: ${data}`)
        let stdout = this.state.vagrantConsole
        stdout.push(`stderr: ${data}`)
        this.setState({vagrantConsole: stdout})
        let scroll = document.getElementById("vagrantConsole")
        scroll.scrollTop = scroll.scrollHeight
      })
      
      consoleCommand.on('close', (code) => {
        let stdout = this.state.vagrantConsole
        stdout.push(`---- We did it, YAY! ----`)
        this.setState({vagrantConsole: stdout})
        this.setState({vagrantStatus: 'online'})
        let scroll = document.getElementById("vagrantConsole")
        scroll.scrollTop = scroll.scrollHeight
      })

    } else if (this.state.vagrantStatus === 'online') {
      this.setState({vagrantStatus: 'processing'})

      var consoleCommand = execute(`cd ${this.state.homesteadPath} && vagrant halt`)

      consoleCommand.stdout.on('data', (data) => {
        let stdout = this.state.vagrantConsole
        stdout.push(data)
        this.setState({vagrantConsole: stdout})
        let scroll = document.getElementById("vagrantConsole")
        scroll.scrollTop = scroll.scrollHeight
      })
      
      consoleCommand.stderr.on('data', (data) => {
        // console.log(`stderr: ${data}`)
        let stdout = this.state.vagrantConsole
        stdout.push(`stderr: ${data}`)
        let scroll = document.getElementById("vagrantConsole")
        scroll.scrollTop = scroll.scrollHeight
      })
      
      consoleCommand.on('close', (code) => {
        let stdout = this.state.vagrantConsole
        stdout.push(`---- We did it, YAY! ----`)
        this.setState({vagrantConsole: stdout})
        this.setState({vagrantStatus: 'offline'})
        let scroll = document.getElementById("vagrantConsole")
        scroll.scrollTop = scroll.scrollHeight
      })

    }
  }

  vagrantClear = () => {
    this.setState({vagrantConsole: []})
  }

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

          <div className={`column is-two-third`}>
            <SettingsHeader
              title={title}
            />

            <Vagrant
              clickToggle={this.vagrantToggle}
              clickClear={this.vagrantClear}
              status={this.state.vagrantStatus}
              console={this.state.vagrantConsole}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default App;
