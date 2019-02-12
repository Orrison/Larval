import React, { Component } from 'react'
import SiteList from './SiteList/index'
import CreateNew from './CreateNew/index'
import SettingsHeader from './SettingsHeader/index'
import HomesteadPath from './HomesteadPath/index'
import Vagrant from './Vagrant/index'
import HomesteadSettings from './HomesteadSettings/index'
import SiteSettings from './SiteSettings/index'

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
// const spawn = window.require('child_process').spawn
const linebyline = require('line-by-line')

const sudo = require('sudo-prompt')
const timestamp = require('time-stamp')
const settings = require('electron-settings')

class App extends Component {

  state = {
    yaml: yaml.safeLoad(fs.readFileSync('/Users/kevinu/Homestead/Homestead.yaml', 'utf8')),
    homesteadPath: settings.get('homestead_path'),
    setHomesteadPathShow: false,
    homesteadSettingsShow: false,
    siteEditShow: false,
    selectedSite: null,
    vagrantStatus: 'processing',
    vagrantConsole: []
  }

  componentDidMount() {
    console.log(this.state);

    // settings.delete('homestead_path')

    // Show the window to set homesteadPath if it is not already set
    if (!this.state.homesteadPath) {
      this.setState({setHomesteadPathShow: true})
    }

    execute(`cd ${this.state.homesteadPath} && vagrant status`,
      function(error, stdout, stderr) {
        if (error) throw error;
        if (stdout.includes('running')) {
          this.setState({vagrantStatus: 'online'})
        } else {
          this.setState({vagrantStatus: 'offline'})
        }
      }.bind(this)
    )

    // let openTerminalAtPath = spawn (`open -a Terminal ${this.state.homesteadPath}`, {shell:true})
    // openTerminalAtPath.on ('error', (err) => { console.log (err); })

  }

  selectSite = (id) => {
    this.setState({selectedSite: id})
    this.siteEditOpen()
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

  siteEditOpen = () => {
    this.setState({siteEditShow: true});
  }

  siteEditOpenNew = () => {
    this.setState({selectedSite: null, siteEditShow: true});
  }
  siteEditClose = () => {
    this.setState({siteEditShow: false});
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

  submitCreateNew = (event, del = null) => {
    event.preventDefault();

    const data = new FormData(event.target);
    const doc = yaml.safeLoad(fs.readFileSync('/Users/kevinu/Homestead/Homestead.yaml', 'utf8'));

    const url = data.get('url');
    const path = data.get('path');
    const backupHost = data.get('backupHost');
    const backupYaml = data.get('backupYaml');
    var directory = null
    const time = timestamp('YYYYMMDDHHmmss')
    const options = {
      name: 'Larval',
    };
    if (path !== null) {
      directory = path.substr(path.lastIndexOf('/') + 1);
    }

    if (this.state.selectedSite === null) {
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
    } else {
      if (del === true) {
        doc.folders.splice(this.state.selectedSite, 1)
        doc.sites.splice(this.state.selectedSite, 1)
      } else {
        doc.folders[this.state.selectedSite].map = url
        doc.folders[this.state.selectedSite].to = directory

        doc.sites[this.state.selectedSite].map = url
        doc.sites[this.state.selectedSite].to = doc.folders[this.state.selectedSite].to
      }
    }

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

    if (del === true) {
      const lr = new linebyline('/etc/hosts');

      lr.on('error', function (err) {
        console.log('Hosts Delete linebyline Error: ' + err)
      })

      let site = this.state.yaml.sites[this.state.selectedSite].map
      let hostsToString = ''
      let hostsLbl = new Promise(function(resolve, reject) {
        let i = 1
        lr.on('line', function (line) {
          if (!line.includes(' ' + site)) {
            if (i !== 1) {
              hostsToString += '\n'
            }
            hostsToString += line
          }
          i++
        }.bind(this))
        lr.on('end', function () {
          resolve(hostsToString)
        })
      })
      hostsLbl.then(function(hosts) {
        console.log(hosts)
        sudo.exec(`echo '${hosts}' > /etc/hosts`, options,
          function(error, stdout, stderr) {
            if (error) throw error;
            console.log('stdout: ' + stdout)
          }
        )
      })
    } else {
      var $command = ``
      if (backupHost) {
        $command = `cp /etc/hosts ${app.getPath('documents')}/hosts.${time}.larval.bak && `
      } else {
        $command = ``
      }

      $command += `echo "${this.state.yaml.ip}  ${url}" >> /etc/hosts`

      sudo.exec($command, options,
        function(error, stdout, stderr) {
          if (error) throw error;
          console.log('stdout: ' + stdout)
        }
      )
    }

    this.setState({siteEditShow: false})

  }

  // END Create New code

  // Start HomesteadSettings

  toggleHomesteadSettings = () => {
    const currHomesteadSettingsShow = this.state.homesteadSettingsShow;
    this.setState({homesteadSettingsShow: !currHomesteadSettingsShow});
  }

  submitHomesteadSettings = (event) => {
    event.preventDefault()

    const data = new FormData(event.target)

    const ip = data.get('ip');
    const memory = data.get('memory');
    const cpus = data.get('cpus');

  }

  // END HomesteadSettings

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
        stdout.push(`---- Vagrant is now up ----`)
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
        stdout.push(`---- Vagrant is now down ----`)
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

  vagrantProvision = () => {
    this.setState({vagrantStatus: 'processing'})

    var consoleCommand = execute(`cd ${this.state.homesteadPath} && vagrant reload --provision`)

    consoleCommand.stdout.on('data', (data) => {
      let stdout = this.state.vagrantConsole
      stdout.push(data)
      this.setState({vagrantConsole: stdout})
      let scroll = document.getElementById("vagrantConsole")
      scroll.scrollTop = scroll.scrollHeight
    })
    
    consoleCommand.stderr.on('data', (data) => {
      let stdout = this.state.vagrantConsole
      stdout.push(`stderr: ${data}`)
      this.setState({vagrantConsole: stdout})
      let scroll = document.getElementById("vagrantConsole")
      scroll.scrollTop = scroll.scrollHeight
    })
    
    consoleCommand.on('close', (code) => {
      let stdout = this.state.vagrantConsole
      stdout.push(`---- Provision Process Completed ----`)
      this.setState({vagrantConsole: stdout})
      this.setState({vagrantStatus: 'online'})
      let scroll = document.getElementById("vagrantConsole")
      scroll.scrollTop = scroll.scrollHeight
    })
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

    let url = null
    let path = null
    let button = 'Create Site'
    let deleteButton = false
    if (this.state.selectedSite !== null) {
      url = this.state.yaml.sites[this.state.selectedSite].map
      path = this.state.yaml.sites[this.state.selectedSite].to
      button = 'Update Site'
      deleteButton = true
    }
    let showSiteEdit = null;
    if (this.state.siteEditShow) {
      showSiteEdit = (
        <CreateNew
          close={this.siteEditClose}
          formSubmit={this.submitCreateNew}
          pathClick={this.fileSelect}
          url={url}
          path={path}
          button={button} 
          deleteButton={deleteButton}
        />
      )
    }

    let showHomsteadSettings = null;
    if (this.state.homesteadSettingsShow) {
      showHomsteadSettings = (
        <HomesteadSettings
          close={this.toggleHomesteadSettings}
          formSubmit={this.submitCreateNew}
          ip={this.state.yaml.ip}
          memory={this.state.yaml.memory}
          cpus={this.state.yaml.cpus}
        />
      )
    }

    return (
      <div className="App">
        <div className='columns'>

          {showHomesteadPath}
          {showHomsteadSettings}
          {showSiteEdit}

          <SiteList 
            text={this.state.yaml.ip}
            click={this.siteEditOpenNew}
            listItemClick={this.selectSite}
            list={this.state.yaml.sites}
          />

          <div className={`column is-two-third`}>
            <SettingsHeader
              settingsClick={this.toggleHomesteadSettings}
            />

            <Vagrant
              clickToggle={this.vagrantToggle}
              clickClear={this.vagrantClear}
              clickProv={this.vagrantProvision}
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
