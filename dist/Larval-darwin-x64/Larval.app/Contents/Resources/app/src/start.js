const electron = require('electron')

const { app, Menu, BrowserWindow } = electron

const path = require('path')
const url = require('url')
const fixPath = require('fix-path')

let mainWindow

function createWindow() {
  fixPath()

  mainWindow = new BrowserWindow({
    width: 1000,
    height: 900,
    webPreferences: { nodeIntegration: true },
    minHeight: 422,
    minWidth: 400,
    show: false,
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.loadURL(
    process.env.ELECTRON_START_URL
      || url.format({
        pathname: path.join(__dirname, '/../build/index.html'),
        protocol: 'file:',
        slashes: true,
      }),
  )

  mainWindow.webContents.openDevTools()

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

var template = [{
  label: "Larval",
  submenu: [
      { label: "About Application", selector: "orderFrontStandardAboutPanel:" },
      { type: "separator" },
      { label: "Hide", accelerator: "CmdOrCtrl+W", click: () => { app.hide() }},
      { label: "Quit", accelerator: "CmdOrCtrl+Q", click: () => { app.quit() }}
  ]}, {
  label: "Edit",
  submenu: [
      { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
      { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
      { type: "separator" },
      { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
      { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
      { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
      { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
  ]}
]

Menu.setApplicationMenu(Menu.buildFromTemplate(template))