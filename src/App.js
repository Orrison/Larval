import React, { Component } from 'react'
import loadable from '@loadable/component'
import { Global, css } from '@emotion/core'
import SiteList from './SiteList'
import BoxList from './BoxList'
import SettingsHeader from './SettingsHeader'
import Vagrant from './Vagrant'
import '../node_modules/bulma/css/bulma.css'
import { homesteadYamlBackup } from './Util/HostsYamlHelpers'
import { getVagrantID } from './Util/VagrantHelpers'
import Swal from 'sweetalert2'

const { remote } = require('electron')

const CreateNew = loadable(() => import('./Modal/CreateNew'))
const HomesteadPath = loadable(() => import('./Modal/HomesteadPath'))
const HomesteadSettings = loadable(() => import('./Modal/HomesteadSettings'))

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

    // settings.delete('homestead_boxes')
    // throw new Error("Stop");

    const homesteadBoxes = settings.get('homestead_boxes')

    if (homesteadBoxes == undefined) {
      this.setState({
        setHomesteadPathShow: true,
      })
    } else {
      this.setState({
        boxes: homesteadBoxes,
      }, () => {
        this.yamlAndPathLoad(0, true)
      })
    }
  }

  selectSite = (id, open) => {
    this.setState({ selectedSite: id })
    if (open) {
      this.siteEditToggle()
    }
  }

  /**
   * Get the requested homestead path and load yaml
   * @param  {Number} boxID The array key of the box you would like to load
   */
  yamlAndPathLoad = (boxID) => {
    const homesteadBoxes = [...this.state.boxes]

    if (!homesteadBoxes) {
      this.setState({ 
        setHomesteadPathShow: true,
      })
    } else if (fs.existsSync(`${homesteadBoxes[boxID].path}/Homestead.yaml`)) {
      this.setState({
        yaml: jsYaml.safeLoad(fs.readFileSync(`${homesteadBoxes[boxID].path}/Homestead.yaml`, 'utf8')),
        homesteadPath: homesteadBoxes[boxID].path,
        vagrantStatus: 'processing',
        boxID,
      }, () => {
        const { homesteadPath } = this.state

        execute(`cd ${homesteadPath} && vagrant status`,
          (error, stdout) => {
            if (error) throw error
            if (stdout.includes('running')) {
              this.setState({ vagrantStatus: 'online' })
              getVagrantID((id) => {
                this.setState({ vagrantID: id })
              })
            } else {
              this.setState({ vagrantStatus: 'offline' })
            }
          })
      })
    } else {
      this.setState({
        setHomesteadPathShow: true,
      })
    }

    if (settings.get('should_provision') === true) {
      this.setState({ shouldProvision: true })
    }
  }

  openBoxAdd = () => {
    this.setState({setHomesteadPathShow: true})
  }

  submitHomesteadPath = (event) => {
    const { 
      setHomesteadPathShow,
    } = this.state
    const data = new FormData(event.target)

    let boxesCopy = (this.state.boxes == null) ? new Array() : [...this.state.boxes]

    let name = data.get('name')
    let path = data.get('path')
    let newBox = {
      name,
      path,
    }
    path = path.replace(/\/$/, '')
    
    // Check for duplicate named/pathed boxes
    let error = null;
    boxesCopy.forEach((box) => {
      if (box.name === name) {
        error = {
          type: 'duplicate',
          details: 'name',
        }
      } else if (box.path === path) {
        error = {
          type: 'duplicate',
          details: 'path',
        }
      }
    })

    let yamlExists = fs.existsSync(`${path}/Homestead.yaml`)
    
    if (!yamlExists) {
      error = {
        type: 'NOYAML',
      }
    }

    const currsetHomesteadPathShow = setHomesteadPathShow
    let newState = {
      setHomesteadPathShow: !currsetHomesteadPathShow
    }
    if (!error) {
      boxesCopy.push(newBox)
      settings.set('homestead_boxes', boxesCopy)
      newState.homesteadPath = path
      newState.boxes = boxesCopy
    } else {
      let swalInfo = {
        type: 'warning',
        showCancelButton: false,
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Okay',
      }
      if (error.type == 'duplicate') {
        swalInfo.title = `Duplicate ${error.details} detected`
        swalInfo.text = `You tried to add a box with the same ${error.details} as an existing box`
      } else if (error.type == 'NOYAML') {
        swalInfo.title = `No homestead.yaml detected`
        swalInfo.text = `Please install homestead in this directory before adding`
      }

      Swal.fire(swalInfo)
    }

    this.setState(newState)
  }

  boxDelete = () => {
    let boxes = [...this.state.boxes]
    
    boxes.splice(this.state.boxID, 1);

    settings.set('homestead_boxes', boxes)

    this.setState({
      boxes: boxes,
      boxID: 0,
    }, () => {
      this.yamlAndPathLoad(0)
    })
  }

  // END Set Homestead Path code

  // Create New code

  siteEditToggle = (close = null) => {
    const { siteEditShow } = this.state
    const stateChng = { siteEditShow: !siteEditShow }
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

  submitCreateNew = async (del = null) => {

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

    let update = null
    if (selectedSite !== null && del !== true && yaml.sites[selectedSite].map !== siteMap) {
      update = true
    }

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

    const hostDelete = () => {
      const lr = new Linebyline('/etc/hosts')

      lr.on('error', (err) => {
        console.log(`Hosts Delete Linebyline Error: ${err}`)
      })

      const site = yaml.sites[selectedSite].map
      let hostsToString = ''
      const hostsLbl = new Promise(((resolve, reject) => {
        let i = 1
        lr.on('line', (line) => {
          if (line !== `${yaml.ip} ${site}`) {
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
    }

    if (del === true) {
      hostDelete()
    } else {
      let $command = ''
      if (backupHost) {
        $command = `cp /etc/hosts ${app.getPath('documents')}/hosts.${time}.larval.bak && `
      } else {
        $command = ''
      }

      if (yaml != null) {
        $command += `echo "${yaml.ip} ${siteMap}" >> /etc/hosts`
      }

      const hostsAdd = new Promise(((resolve, reject) => {
        sudo.exec($command, options,
          (error) => {
            if (error) {
              throw error
            } else {
              resolve()
            }
          })
      }))
      hostsAdd.then(() => {
        if (update === true) {
          hostDelete()
        }
      })
    }

    this.setState({
      siteEditShow: false,
      selectedSite: null,
      shouldProvision: true,
      yaml: doc,
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

    const ip = data.get('ip')
    const memory = data.get('memory')
    const cpus = data.get('cpus')
    const provider = data.get('provider')

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
    const { vagrantConsole: curConsole } = this.state

    const lineBuffer = line.toString()
    const lines = lineBuffer.split('\n')

    lines.forEach((newLine) => {
      if (newLine != null) {
        curConsole.push(`${newLine}`)
      }
    })
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
          this.setState({ vagrantID: id })
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
    const { homesteadPath } = this.state

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
      boxes,
      boxID,
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

    let folderMap = null
    let folderTo = null
    let siteMap = null
    let siteTo = null
    let button = 'Create Site'
    if (selectedSite !== null) {
      folderMap = yaml.folders[selectedSite].map
      folderTo = yaml.folders[selectedSite].to
      siteMap = yaml.sites[selectedSite].map
      siteTo = yaml.sites[selectedSite].to
      button = 'Update Site'
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
          text={yaml.ip}
          click={this.siteEditToggle}
          listItemClick={this.selectSite}
          list={yaml.sites}
          sitedelete={() => this.submitCreateNew(true)}
        />
      )
    }

    let boxList = null
    if (boxes != null) {
      boxList = (
        <BoxList
          curBoxId={boxID}
          boxes={boxes}
          boxclick={this.yamlAndPathLoad}
          addClick={this.openBoxAdd}
          deleteClick={this.boxDelete}
        />
      )
    }

    return (
      <div className="App">
        <Global
          styles={css`
            .App {
              text-align: center;
              color: #fff;
            }
            label.checkbox:hover { color: #fff; }
            input[type="checkbox"] {
              margin-right: 10px;
            }
            .columns { margin: 0; }
            .column { padding: 0; }
            h1 {
              font-size: 28px;
              font-weight: 800;
              align-self: center;
              margin: 0 auto;
            }
            label.customLabel {
              color: #fff;
              font-size: 26px;
            }
            .is-one-third {
              background: #202020;
            }
          `}
        />
        <div className="columns">

          {showHomesteadPath}
          {showHomsteadSettings}
          {showSiteEdit}
          
          <div className="column is-one-third">
            {boxList}
            {siteList}
          </div>

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
