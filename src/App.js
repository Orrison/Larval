import React, { Component } from 'react'
import loadable from '@loadable/component'
import { Global, css } from '@emotion/core'
import SiteList from './SiteList'
import BoxList from './BoxList'
import SettingsHeader from './SettingsHeader'
import Vagrant from './Vagrant'
import '../node_modules/bulma/css/bulma.css'
import { homesteadYamlBackup } from './Util/HostsYamlHelpers'
import { getVagrantID, getIdFromPath } from './Util/VagrantHelpers'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const SwalReact = withReactContent(Swal)

const { remote } = require('electron')

const CreateNew = loadable(() => import('./Modal/CreateNew'))
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
const convertRequire = require('ansi-to-html')
const Convert = new convertRequire()

class App extends Component {
  state = {
    yaml: null,
    homesteadPath: null,
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
      this.openBoxAdd()
    } else {
        this.setState({
          boxes: homesteadBoxes,
        }, () => {
          this.yamlAndPathLoad(0, true)

          let cb = newBoxes => {
            this.setState({
                boxes: newBoxes
            })
          }
          let boxesCopy = [...this.state.boxes]
          let count = 0
          boxesCopy.forEach((box, i, arr) => {
              getIdFromPath(box.path, id => {
                  if (id) {
                      execute(`vagrant status ${id}`,
                      (error, stdout) => {
                        if (error) throw error
                        if (stdout.includes('running')) {
                          arr[i]['status'] = 'online'
                        } else {
                          arr[i]['status'] = 'offline'
                        }
                        count++
                        if (count === arr.length) {
                          cb(arr)
                        }
                      })
                  } else {
                      arr[i]['status'] = 'offline'
                      count++
                      if (count === arr.length) {
                        cb(arr)
                      }
                  }
              })
          })
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
      this.openBoxAdd()
    } else if (fs.existsSync(`${homesteadBoxes[boxID].path}/Homestead.yaml`)) {
      homesteadBoxes[boxID].status = 'pending'
      this.setState({
        yaml: jsYaml.safeLoad(fs.readFileSync(`${homesteadBoxes[boxID].path}/Homestead.yaml`, 'utf8')),
        homesteadPath: homesteadBoxes[boxID].path,
        vagrantStatus: 'processing',
        boxes: homesteadBoxes,
        boxID,
      }, () => {
        const { homesteadPath } = this.state

        execute(`cd ${homesteadPath} && vagrant status`,
          (error, stdout) => {
            if (error) throw error
            if (stdout.includes('running')) {
              homesteadBoxes[boxID].status = 'online'
              this.setState({
                vagrantStatus: 'online',
                boxes: homesteadBoxes
              })
              getVagrantID((id) => {
                this.setState({ vagrantID: id })
              })
            } else {
              homesteadBoxes[boxID].status = 'offline'
              this.setState({
                vagrantStatus: 'offline',
                boxes: homesteadBoxes
              })
            }
          })
      })
    } else {
      this.openBoxAdd()
    }

    let provSetting = settings.get('should_provision')
    let should_prov = null;
    
    if (provSetting) {
      let should_provision = provSetting.includes(boxID);

      if (should_provision) {
        should_prov = true;
      } else {
        should_prov = false;
      }
    } else {
      should_prov = false;
    }
    this.setState({ shouldProvision: should_prov })
  }

  openBoxAdd = () => {
    SwalReact.fire({
      title: 'Set the path to your Homestead file',
      html: (
        <div>
          <p></p>
          <label>Box Name: </label>
          <input id="box-name" className="swal2-input" required></input>
          <label>Box Path:</label>
          <input id="box-path" className="swal2-input" onClick={this.fileSelect}></input>
        </div>
      ),
      focusConfirm: false,
      confirmButtonText: 'Add Box',
      preConfirm: () => {
        return {
          name: document.getElementById('box-name').value,
          path: document.getElementById('box-path').value
        }
      }
    }).then((ret) => {
      if (typeof ret.value !== 'undefined') {
        if (ret.value.name != '' && ret.value.path != '') {
          this.submitHomesteadPath(ret.value)
        } else {
          SwalReact.fire({
            type: 'warning',
            showCancelButton: false,
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Okay',
            title: 'Box not added',
            text: 'Name and/or path cannot be blank'
          })
        }
      }
    })
  }

  submitHomesteadPath = (values) => {
    let boxesCopy = (this.state.boxes == null) ? new Array() : [...this.state.boxes]

    let name = values.name
    let path = values.path
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

    let newState = {}
    if (!error) {
        const vagrantUp = execute(`cd ${path} && vagrant status`)

        vagrantUp.stdout.on('data', (data) => {
            if (data.includes('running')) {
              newBox.status = 'online'
            } else {
              newBox.status = 'offline'
            }
        })

        vagrantUp.stderr.on('data', (data) => {
            throw data
        })

        vagrantUp.on('close', (code) => {
            boxesCopy.push(newBox)
            settings.set('homestead_boxes', boxesCopy)
            newState.homesteadPath = path
            newState.boxes = boxesCopy
            this.setState(newState)
        })
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
  }

  boxDelete = () => {
    SwalReact.fire({
      type: 'warning',
      title: 'Are you sure you want to delete this box?',
      text: this.state.boxes[this.state.boxID].name,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Delete',
      confirmButtonColor: '#d11a2a',
      preConfirm: () => {
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
      const path = dialog.showOpenDialogSync({
        properties: ['openDirectory'],
      })
      if (path !== undefined) {
        event.target.value = path
      }
    }
  }

  hostDelete = () => {
    return new Promise(((resolve, reject) => {
      const {
        selectedSite,
        yaml,
      } = this.state

      const lr = new Linebyline('/etc/hosts')

      lr.on('error', (err) => {
        console.log(`Hosts Delete Linebyline Error: ${err}`)
      })

      const site = yaml.sites[selectedSite].map
      let hostsToString = ''
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
        resolve(`echo '${hostsToString}' > /etc/hosts`)
      })
    }))
  }

  hostsReload = () => {
    this.setState({
        boxes: settings.get('homestead_boxes'),
    })
  }

  submitCreateNew = async (event) => {
    event.preventDefault()

    const {
      selectedSite,
      homesteadPath,
      yaml,
      boxID,
    } = this.state

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

    let update = null
    if (selectedSite !== null && yaml.sites[selectedSite].map !== siteMap) {
      update = true
    }

    if (update) {
      doc.folders[selectedSite].map = folderMap
      doc.folders[selectedSite].to = folderTo

      doc.sites[selectedSite].map = siteMap
      doc.sites[selectedSite].to = siteTo
    } else {
      doc.folders.push({
        map: folderMap,
        to: folderTo,
      })
      doc.sites.push({
        map: siteMap,
        to: siteTo,
      })
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

    let $command = ''
    if (backupHost) {
      $command = `cp /etc/hosts ${app.getPath('documents')}/hosts.${time}.larval.bak && `
    }
    if (update) {
      $command += await this.hostDelete() + ' && '
    }
    $command += `echo "${yaml.ip} ${siteMap}" >> /etc/hosts`

    sudo.exec($command, options,
      (error) => {
        if (error) {
          throw error
        }
      })

    this.setState({
      siteEditShow: false,
      selectedSite: null,
      yaml: doc,
      shouldProvision: true,
    })

    let shouldProvision = settings.get('should_provision')
    if (shouldProvision) {
      shouldProvision.push(boxID)
    } else {
      shouldProvision = [boxID]
    }
    settings.set('should_provision', shouldProvision)
  }

  siteDelete = async () => {
    const {
      selectedSite,
      homesteadPath,
      boxID,
    } = this.state

    const doc = jsYaml.safeLoad(fs.readFileSync(`${homesteadPath}/Homestead.yaml`, 'utf8'))

    doc.folders.splice(selectedSite, 1)
    doc.sites.splice(selectedSite, 1)

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

    this.hostDelete()

    this.setState({
      selectedSite: null,
      yaml: doc,
      shouldProvision: true,
    })

    let shouldProvision = settings.get('should_provision')
    if (shouldProvision) {
      shouldProvision.push(boxID)
    } else {
      shouldProvision = [boxID]
    }
    settings.set('should_provision', shouldProvision)
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

    const {
      homesteadPath,
      boxID,
    } = this.state

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

    let shouldProvision = settings.get('should_provision')
    if (shouldProvision) {
      shouldProvision.push(boxID)
    } else {
      shouldProvision = [boxID]
    }
    settings.set('should_provision', shouldProvision)
  }

  // END HomesteadSettings

  vagrantConsoleAdd = (line) => {
    const { vagrantConsole: curConsole } = this.state

    const lineBuffer = line.toString()
    const lines = lineBuffer.split('\n')

    lines.forEach((newLine) => {
      if (newLine != null) {
        curConsole.push(`${Convert.toHtml(newLine)}`)
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

      const vagrantUp = execute(`cd ${homesteadPath} && vagrant up --color`)

      vagrantUp.stdout.on('data', (data) => {
        this.vagrantConsoleAdd(data)
      })

      vagrantUp.stderr.on('data', (data) => {
        this.vagrantConsoleAdd(`vagrantUp stderr: ${data}`)
      })

      vagrantUp.on('close', (code) => {
        this.vagrantConsoleAdd('<b><span style="color: rgb(0, 170, 0);">---- Vagrant is now up ----</span></b>')
        this.setState({ vagrantStatus: 'online' })
        getVagrantID((id) => {
          this.setState({ vagrantID: id })
        })
      })
    } else if (vagrantStatus === 'online') {
      this.setState({ vagrantStatus: 'processing' })

      const vagrantHalt = execute(`cd ${homesteadPath} && vagrant halt --color`)

      vagrantHalt.stdout.on('data', (data) => {
        this.vagrantConsoleAdd(data)
      })

      vagrantHalt.stderr.on('data', (data) => {
        this.vagrantConsoleAdd(`vagrantHalt stderr: ${data}`)
      })

      vagrantHalt.on('close', (code) => {
        this.vagrantConsoleAdd('<b><span style="color: rgb(0, 170, 0);">---- Vagrant is now down ----</span></b>')
        this.setState({ vagrantStatus: 'offline' })
      })
    }
  }

  vagrantClear = () => {
    this.setState({ vagrantConsole: [] })
  }

  vagrantProvision = () => {
    const {
      homesteadPath,
      boxID,
     } = this.state

    this.setState({ vagrantStatus: 'processing' })

    const consoleCommand = execute(`cd ${homesteadPath} && vagrant reload --provision --color`)

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

      let shouldProvision = settings.get('should_provision')
      if (shouldProvision) {
        const filtShouldProvision = shouldProvision.filter(box => box != boxID);
        settings.set('should_provision', filtShouldProvision)
      }
    })
  }

  render() {
    const {
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
          sitedelete={this.siteDelete}
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
          hostsReload={this.hostsReload}
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
