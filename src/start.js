const electron = require('electron')

const { app, BrowserWindow, ipcMain } = electron
const { autoUpdater } = require("electron-updater")

const path = require('path')
const url = require('url')
const fixPath = require('fix-path')

let mainWindow

function createWindow() {

  fixPath()

  mainWindow = new BrowserWindow({ width: 1000, height: 700, webPreferences: { nodeIntegration: true }, minHeight: 422, minWidth: 400, show: false })

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

  // mainWindow.webContents.openDevTools()

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', () => {
  createWindow()
  autoUpdater.checkForUpdatesAndNotify()
})

autoUpdater.on('update-downloaded', (info) => {
  mainWindow.webContents.send('updateReady')
})

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

ipcMain.on("quitAndInstall", (event, arg) => {
  autoUpdater.quitAndInstall()
})