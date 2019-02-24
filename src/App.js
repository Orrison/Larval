import React, { Component } from 'react'
import SiteList from './SiteList/index'
import CreateNew from './CreateNew/index'
import SettingsHeader from './SettingsHeader/index'
import HomesteadPath from './HomesteadPath/index'
import Vagrant from './Vagrant/index'
import HomesteadSettings from './HomesteadSettings/index'

import '../node_modules/bulma/css/bulma.css'
import './App.css'

import { homesteadYamlBackup } from './Util/HostsYamlHelpers'
import { getVagrantID } from './Util/VagrantHelpers'

import LogRocket from 'logrocket';
LogRocket.init('znliqd/larval')

const electron = window.require('electron')
const { remote } = electron
// const BrowserWindow = electron.remote.BrowserWindow;
const fs = window.require('fs')
const jsYaml = require('js-yaml')

const { dialog } = remote
const { app } = remote
const execute = window.require('child_process').exec
// const spawn = window.require('child_process').spawn
const Linebyline = require('line-by-line')
const fixPath = window.require('fix-path')

const sudo = require('sudo-prompt')
const timestamp = require('time-stamp')
const settings = require('electron-settings')

class App extends Component {
  state = {
    yaml: null,
    homesteadPath: null,
    setHomesteadPathShow: false,
    homesteadSettingsShow: false,
    siteEditShow: false,
    selectedSite: null,
    vagrantStatus: 'processing',
    vagrantConsole: [],
    vagrantID: null,
  }

  componentDidMount() {
    fixPath()

    // settings.delete('homestead_path')

    if (settings.get('homestead_path') === undefined) {
      this.setState({ setHomesteadPathShow: true })
    } else {
      this.setState({
        yaml: jsYaml.safeLoad(fs.readFileSync(`${settings.get('homestead_path')}/Homestead.yaml`, 'utf8')),
        homesteadPath: settings.get('homestead_path')
      }, () => {
        const { homesteadPath } = this.state

        execute(`cd ${homesteadPath} && vagrant status`,
          (error, stdout, stderr) => {
            if (error) throw error
            if (stdout.includes('running')) {
              this.setState({ vagrantStatus: 'online' })
              getVagrantID((id) => {
                this.setState({vagrantID: id})
              })
            } else {
              this.setState({ vagrantStatus: 'offline' })
            }
          })
      })
    }
  }

  selectSite = (id) => {
    this.setState({ selectedSite: id })
    this.siteEditOpen()
  }

  // Set Homestead Path code

  submitHomesteadPath = (event) => {
    const { setHomesteadPathShow } = this.state
    const data = new FormData(event.target)
    let path = data.get('path')
    path = path.replace(/\/$/, '')

    settings.set('homestead_path', path)
    this.setState({ homesteadPath: path })

    const currsetHomesteadPathShow = setHomesteadPathShow
    this.setState({ setHomesteadPathShow: !currsetHomesteadPathShow })
  }

  // END Set Homestead Path code

  // Create New code

  siteEditOpen = () => {
    this.setState({ siteEditShow: true })
  }

  siteEditOpenNew = () => {
    this.setState({ selectedSite: null, siteEditShow: true })
  }

  siteEditClose = () => {
    this.setState({ siteEditShow: false })
  }

  fileSelect = (event) => {
    event.preventDefault()

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
    event.preventDefault()

    const { selectedSite, homesteadPath, yaml } = this.state

    const data = new FormData(event.target)
    const doc = jsYaml.safeLoad(fs.readFileSync(`${homesteadPath}/Homestead.yaml`, 'utf8'))

    const url = data.get('url')
    const path = data.get('path')
    const backupHost = data.get('backupHost')
    const backupYaml = data.get('backupYaml')
    let directory = null
    const time = timestamp('YYYYMMDDHHmmss')
    const options = {
      name: 'Larval',
    }
    if (path !== null) {
      directory = path.substr(path.lastIndexOf('/') + 1)
    }

    if (selectedSite === null) {
      const newFolder = {
        map: path,
        to: `/home/vagrant/sites/${directory}`,
      }

      const newSite = {
        map: url,
        to: newFolder.to,
      }

      doc.folders.push(newFolder)
      doc.sites.push(newSite)
    } else if (del === true) {
      doc.folders.splice(selectedSite, 1)
      doc.sites.splice(selectedSite, 1)
    } else {
      doc.folders[selectedSite].map = url
      doc.folders[selectedSite].to = directory

      doc.sites[selectedSite].map = url
      doc.sites[selectedSite].to = doc.folders[selectedSite].to
    }

    if (backupYaml) {
      homesteadYamlBackup(homesteadPath)
    }

    fs.writeFile(`${homesteadPath}/Homestead.yaml`, jsYaml.safeDump(doc, {
      styles: {
        '!!null': 'canonical', // dump null as ~
      },
      sortKeys: false, // sort object keys
    }), (err) => {
      if (err) {
        console.log(`An error ocurred creating the file ${err.message}`)
      }
    })

    this.setState({yaml: doc})

    if (del === true) {
      const lr = new Linebyline('/etc/hosts')

      lr.on('error', (err) => {
        console.log(`Hosts Delete Linebyline Error: ${err}`)
      })

      const site = yaml.sites[selectedSite].map
      let hostsToString = ''
      const hostsLbl = new Promise(((resolve, reject) => {
        let i = 1
        lr.on('line', (line) => {
          if (!line.includes(` ${site}`)) {
            if (i !== 1) {
              hostsToString += '\n'
            }
            hostsToString += line
          }
          i += 1
        })
        lr.on('end', () => {
          resolve(hostsToString)
        })
      }))
      hostsLbl.then((hosts) => {
        sudo.exec(`echo '${hosts}' > /etc/hosts`, options,
          (error, stdout, stderr) => {
            if (error) throw error
            console.log(`stdout: ${stdout}`)
          })
      })
    } else {
      let $command = ''
      if (backupHost) {
        $command = `cp /etc/hosts ${app.getPath('documents')}/hosts.${time}.larval.bak && `
      } else {
        $command = ''
      }

      if (yaml != null) {
        $command += `echo "${yaml.ip}  ${url}" >> /etc/hosts`
      }

      sudo.exec($command, options,
        (error, stdout, stderr) => {
          if (error) throw error
          console.log(`stdout:  ${stdout}`)
        })
    }

    this.setState({ siteEditShow: false })
  }

  // END Create New code

  // Start HomesteadSettings

  toggleHomesteadSettings = () => {
    const { homesteadSettingsShow } = this.state
    const currHomesteadSettingsShow = homesteadSettingsShow
    this.setState({ homesteadSettingsShow: !currHomesteadSettingsShow })
  }

  submitHomesteadSettings = (event) => {
    event.preventDefault()
    
    const { homesteadPath } = this.state

    const data = new FormData(event.target)
    const doc = jsYaml.safeLoad(fs.readFileSync(`${homesteadPath}/Homestead.yaml`, 'utf8'))

    const ip = data.get('ip');
    const memory = data.get('memory');
    const cpus = data.get('cpus');
    const provider = data.get('provider');

    const backupYaml = data.get('backupYaml')
    const time = timestamp('YYYYMMDDHHmmss')
    const options = {
      name: 'Larval',
    }

    doc.ip = ip
    doc.memory = memory
    doc.cpus = cpus
    doc.provider = provider

    if (backupYaml) {
      execute(`cp ${homesteadPath}/Homestead.yaml ${app.getPath('documents')}/Homestead.yaml.${time}.larval.bak`, options,
        (error, stdout, stderr) => {
          if (error) throw error
          console.log(`stdout: ${stdout}`)
        })
    }

    fs.writeFile(`${homesteadPath}/Homestead.yaml`, jsYaml.safeDump(doc, {
      styles: {
        '!!null': 'canonical', // dump null as ~
      },
      sortKeys: false, // sort object keys
    }), (err) => {
      if (err) {
        console.log(`An error ocurred creating the file ${err.message}`)
      }
    })

    this.setState({yaml: doc})

    this.setState({homesteadSettingsShow: false})

  }

  // END HomesteadSettings

  vagrantToggle = () => {
    const { vagrantStatus, homesteadPath, vagrantConsole } = this.state

    if (vagrantStatus === 'offline') {
      this.setState({ vagrantStatus: 'processing' })

      const vagrantUp = execute(`cd ${homesteadPath} && vagrant up`)

      vagrantUp.stdout.on('data', (data) => {
        const stdout = vagrantConsole
        stdout.push(data)
        this.setState({ vagrantConsole: stdout })
        const scroll = document.getElementById('vagrantConsole')
        scroll.scrollTop = scroll.scrollHeight
      })

      vagrantUp.stderr.on('data', (data) => {
        // console.log(`stderr: ${data}`)
        const stdout = vagrantConsole
        stdout.push(`stderr: ${data}`)
        this.setState({ vagrantConsole: stdout })
        const scroll = document.getElementById('vagrantConsole')
        scroll.scrollTop = scroll.scrollHeight
      })

      vagrantUp.on('close', (code) => {
        const stdout = vagrantConsole
        stdout.push('---- Vagrant is now up ----')
        this.setState({ vagrantConsole: stdout })
        this.setState({ vagrantStatus: 'online' })
        getVagrantID((id) => {
          this.setState({vagrantID: id})
        })
        const scroll = document.getElementById('vagrantConsole')
        scroll.scrollTop = scroll.scrollHeight
      })
    } else if (vagrantStatus === 'online') {
      this.setState({ vagrantStatus: 'processing' })

      const vagrantHalt = execute(`cd ${homesteadPath} && vagrant halt`)

      vagrantHalt.stdout.on('data', (data) => {
        const stdout = vagrantConsole
        stdout.push(data)
        this.setState({ vagrantConsole: stdout })
        const scroll = document.getElementById('vagrantConsole')
        scroll.scrollTop = scroll.scrollHeight
      })

      vagrantHalt.stderr.on('data', (data) => {
        // console.log(`stderr: ${data}`)
        const stdout = vagrantConsole
        stdout.push(`stderr: ${data}`)
        const scroll = document.getElementById('vagrantConsole')
        scroll.scrollTop = scroll.scrollHeight
      })

      vagrantHalt.on('close', (code) => {
        const stdout = vagrantConsole
        stdout.push('---- Vagrant is now down ----')
        this.setState({ vagrantConsole: stdout })
        this.setState({ vagrantStatus: 'offline' })
        const scroll = document.getElementById('vagrantConsole')
        scroll.scrollTop = scroll.scrollHeight
      })
    }
  }

  vagrantConsoleAdd = (line) => {
    const curConsole = this.state.vagrantConsole
    curConsole.push(`${line}`)
    this.setState({ vagrantConsole: curConsole })
    const scroll = document.getElementById('vagrantConsole')
    scroll.scrollTop = scroll.scrollHeight
  }

  // vagrantCommand = (cmd) => {
  //   this.vagrantConsoleAdd(cmd)

  //   this.state.vagrantSSH.stdin.setEncoding('utf-8')

  //   this.state.vagrantSSH.stdin.write(`${cmd}\n`)
  // }

  vagrantClear = () => {
    this.setState({ vagrantConsole: [] })
  }

  vagrantProvision = () => {
    const { vagrantConsole, homesteadPath } = this.state

    this.setState({ vagrantStatus: 'processing' })

    const consoleCommand = execute(`cd ${homesteadPath} && vagrant reload --provision`)

    consoleCommand.stdout.on('data', (data) => {
      const stdout = vagrantConsole
      stdout.push(data)
      this.setState({ vagrantConsole: stdout })
      const scroll = document.getElementById('vagrantConsole')
      scroll.scrollTop = scroll.scrollHeight
    })

    consoleCommand.stderr.on('data', (data) => {
      const stdout = vagrantConsole
      stdout.push(`stderr: ${data}`)
      this.setState({ vagrantConsole: stdout })
      const scroll = document.getElementById('vagrantConsole')
      scroll.scrollTop = scroll.scrollHeight
    })

    consoleCommand.on('close', (code) => {
      const stdout = vagrantConsole
      stdout.push('---- Provision Process Completed ----')
      this.setState({ vagrantConsole: stdout })
      this.setState({ vagrantStatus: 'online' })
      const scroll = document.getElementById('vagrantConsole')
      scroll.scrollTop = scroll.scrollHeight
    })
  }

  // sshToggle = (id) => {
  //   const { vagrantSSH } = this.state
  //   if ( vagrantSSH === null ){
  //     this.setState({vagrantSSH: spawn(`vagrant ssh ${id}`, {shell:true})}, () => {

  //       this.state.vagrantSSH.stdout.on('data', function (data) {

  //         let lineBuffer = data.toString()

  //         var lines = lineBuffer.split("\n")

  //         for (var i = 0; i < lines.length - 1; i++) {

  //             var line = lines[i]

  //             this.vagrantConsoleAdd(line)
  //         }
  //       }.bind(this))
  
  //       this.state.vagrantSSH.stderr.on('data', function (data) {
  //         this.vagrantConsoleAdd(`stderr: ${data}`)
  //       }.bind(this))
        
  //       // this.state.vagrantSSH.on('exit', function (code) {
  //       //   // console.log('child process exited with code ' + code)
  //       // }.bind(this))
  //     })
  //   } else {
  //     this.setState({vagrantSSH: null})
  //   }
  // }

  render() {

    const {
      setHomesteadPathShow,
      selectedSite,
      yaml,
      siteEditShow,
      homesteadSettingsShow,
      vagrantConsole,
      vagrantStatus,
      vagrantID,
    } = this.state

    let showHomesteadPath = null
    if (setHomesteadPathShow) {
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
    if (selectedSite !== null) {
      url = yaml.sites[selectedSite].map
      path = yaml.sites[selectedSite].to
      button = 'Update Site'
      deleteButton = true
    }
    let showSiteEdit = null
    if (siteEditShow) {
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

    let showHomsteadSettings = null
    if (homesteadSettingsShow) {
      showHomsteadSettings = (
        <HomesteadSettings
          close={this.toggleHomesteadSettings}
          formSubmit={this.submitHomesteadSettings}
          ip={yaml.ip}
          memory={yaml.memory}
          cpus={yaml.cpus}
          provider={yaml.provider}
        />
      )
    }

    let siteList = null
    if (yaml != null) {
      siteList = (
        <SiteList
          text={this.state.yaml.ip}
          click={this.siteEditOpenNew}
          listItemClick={this.selectSite}
          list={this.state.yaml.sites}
        />
      )
    }

    return (
      <div className="App">
        <div className="columns">

          {showHomesteadPath}
          {showHomsteadSettings}
          {showSiteEdit}

          {siteList}

          <div className="column is-two-third">
            <SettingsHeader
              settingsClick={this.toggleHomesteadSettings}
            />

            <Vagrant
              clickToggle={this.vagrantToggle}
              clickClear={this.vagrantClear}
              clickProv={this.vagrantProvision}
              status={vagrantStatus}
              vConsole={vagrantConsole}
              vagrantId={vagrantID}
              SshToggle={this.sshToggle}
              vagrantCommand={this.vagrantCommand}
            />
          </div>
        </div>
      </div>
    )
  }
}

export default App
