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

const electron = require('electron')
const { remote } = electron
const fs = require('fs')
const jsYaml = require('js-yaml')

const { dialog, app } = remote
const execute = require('child_process').exec
const Linebyline = require('line-by-line')

const fixPath = require('fix-path')

const sudo = require('sudo-prompt')

const timestamp = require('time-stamp')

const settings = require('electron-settings')

class App extends Component {
  state = {
    yaml: null,
    homesteadPath: null,
    setHomesteadPathShow: false,
    setHomesteadPathMsg: '',
    homesteadSettingsShow: false,
    siteEditShow: false,
    selectedSite: null,
    vagrantStatus: 'processing',
    vagrantConsole: [],
    vagrantID: null,
    shouldProvision: false,
  }

  componentDidMount() {
    fixPath()

    let settingsHomestead = settings.get('homestead_path')

    if (!settingsHomestead) {
      this.setState({ setHomesteadPathShow: true })
    } else {

      if (fs.existsSync(`${settingsHomestead}/Homestead.yaml`)) {
        this.setState({
          yaml: jsYaml.safeLoad(fs.readFileSync(`${settingsHomestead}/Homestead.yaml`, 'utf8')),
          homesteadPath: settingsHomestead
        }, () => {
          const { homesteadPath } = this.state
  
          execute(`cd ${homesteadPath} && vagrant status`,
            (error, stdout) => {
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
      } else {
        this.setState({ 
          setHomesteadPathShow: true,
          setHomesteadPathMsg: 'The Homestead path provided is either not the Homestead folder or your Homestead.yaml is missing :('
        })
      }
    }

    if (settings.get('should_provision') ===  true) {
      this.setState({ shouldProvision: true })
    }
  }

  selectSite = (id) => {
    this.setState({ selectedSite: id })
    this.siteEditToggle()
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
    this.componentDidMount()
  }

  // END Set Homestead Path code

  // Create New code

  siteEditToggle = (close = null) => {
    const { siteEditShow } = this.state
    let stateChng = { siteEditShow: !siteEditShow }
    if (close != null) {
      stateChng.selectedSite = null
    }
    this.setState(stateChng)
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

    const folderMap = data.get('folderMap')
    const folderTo = data.get('folderTo')
    const siteMap = data.get('siteMap')
    const siteTo = data.get('siteTo')

    const backupHost = data.get('backupHost')
    const backupYaml = data.get('backupYaml')
    const time = timestamp('YYYYMMDDHHmmss')
    const options = {
      name: 'Larval',
    }
    // if (path !== null) {
    //   directory = path.substr(path.lastIndexOf('/') + 1)
    // }

    if (selectedSite === null) {
      const newFolder = {
        map: folderMap,
        to: folderTo,
      }

      const newSite = {
        map: siteMap,
        to: siteTo,
      }

      doc.folders.push(newFolder)
      doc.sites.push(newSite)
    } else if (del === true) {
      doc.folders.splice(selectedSite, 1)
      doc.sites.splice(selectedSite, 1)
    } else {
      doc.folders[selectedSite].map = folderMap
      doc.folders[selectedSite].to = folderTo

      doc.sites[selectedSite].map = siteMap
      doc.sites[selectedSite].to = siteTo
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
          (error) => {
            if (error) throw error
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
        $command += `echo "${yaml.ip}  ${siteMap}" >> /etc/hosts`
      }

      sudo.exec($command, options,
        (error) => {
          if (error) throw error
        })
    }

    this.setState({
      siteEditShow: false,
      selectedSite: null,
      shouldProvision: true,
    })
    settings.set('should_provision', true)
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
        (error) => {
          if (error) throw error
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

    this.setState({ 
      yaml: doc,
      homesteadSettingsShow: false,
      shouldProvision: true,
    })
    settings.set('should_provision', true)
  }

  // END HomesteadSettings

  vagrantConsoleAdd = (line) => {
    const curConsole = this.state.vagrantConsole

    let lineBuffer = line.toString()
    let lines = lineBuffer.split("\n")
    for (let i = 0; i <= lines.length; i++) {
        let newLine = lines[i]
        if (newLine != null) {
          curConsole.push(`${newLine}`)
        }
    }
    this.setState({ vagrantConsole: curConsole })
    const scroll = document.getElementById('vagrantConsole')
    scroll.scrollTop = scroll.scrollHeight
  }

  vagrantToggle = () => {
    const { vagrantStatus, homesteadPath } = this.state

    if (vagrantStatus === 'offline') {
      this.setState({ vagrantStatus: 'processing' })

      const vagrantUp = execute(`cd ${homesteadPath} && vagrant up`)

      vagrantUp.stdout.on('data', (data) => {
        this.vagrantConsoleAdd(data)
      })

      vagrantUp.stderr.on('data', (data) => {
        this.vagrantConsoleAdd(`vagrantUp stderr: ${data}`)
      })

      vagrantUp.on('close', (code) => {
        this.vagrantConsoleAdd('---- Vagrant is now up ----')
        this.setState({ vagrantStatus: 'online' })
        getVagrantID((id) => {
          this.setState({vagrantID: id})
        })
      })
    } else if (vagrantStatus === 'online') {
      this.setState({ vagrantStatus: 'processing' })

      const vagrantHalt = execute(`cd ${homesteadPath} && vagrant halt`)

      vagrantHalt.stdout.on('data', (data) => {
        this.vagrantConsoleAdd(data)
      })

      vagrantHalt.stderr.on('data', (data) => {
        this.vagrantConsoleAdd(`vagrantHalt stderr: ${data}`)
      })

      vagrantHalt.on('close', (code) => {
        this.vagrantConsoleAdd('---- Vagrant is now down ----')
        this.setState({ vagrantStatus: 'offline' })
      })
    }
  }

  vagrantClear = () => {
    this.setState({ vagrantConsole: [] })
  }

  vagrantProvision = () => {
    const { vagrantConsole, homesteadPath } = this.state

    this.setState({ vagrantStatus: 'processing' })

    const consoleCommand = execute(`cd ${homesteadPath} && vagrant reload --provision`)

    consoleCommand.stdout.on('data', (data) => {
      this.vagrantConsoleAdd(data)
    })

    consoleCommand.stderr.on('data', (data) => {
      this.vagrantConsoleAdd(`stderr: ${data}`)
    })

    consoleCommand.on('close', (code) => {
      this.vagrantConsoleAdd('---- Provision Process Completed ----')

      this.setState({ 
        vagrantStatus: 'online',
        shouldProvision: false,
      })
      settings.set('should_provision', false)
    })
  }

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
      shouldProvision,
    } = this.state

    let showHomesteadPath = null
    if (setHomesteadPathShow) {
      showHomesteadPath = (
        <HomesteadPath
          formSubmit={this.submitHomesteadPath}
          pathClick={this.fileSelect}
          msg={this.state.setHomesteadPathMsg}
        />
      )
    }

    let folderMap = null
    let folderTo = null
    let siteMap = null
    let siteTo = null
    let button = 'Create Site'
    let deleteButton = false
    if (selectedSite !== null) {
      folderMap = yaml.folders[selectedSite].map
      folderTo = yaml.folders[selectedSite].to
      siteMap = yaml.sites[selectedSite].map
      siteTo = yaml.sites[selectedSite].to
      button = 'Update Site'
      deleteButton = true
    }
    let showSiteEdit = null
    if (siteEditShow) {
      showSiteEdit = (
        <CreateNew
          close={this.siteEditToggle}
          formSubmit={this.submitCreateNew}
          pathClick={this.fileSelect}
          folderMap={folderMap}
          folderTo={folderTo}
          siteMap={siteMap}
          siteTo={siteTo}
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
          click={this.siteEditToggle}
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
              shouldProvision={shouldProvision}
            />
          </div>
        </div>
      </div>
    )
  }
}

export default App
