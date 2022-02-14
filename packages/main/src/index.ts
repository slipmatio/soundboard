import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { URL } from 'url'
// import devalue from '@nuxt/devalue'
import Store from 'electron-store'
import 'v8-compile-cache'

import { enforceApplicationFolder } from './utils'
import './security'

// import settings from 'electron-settings'

// See https://www.electronjs.org/docs/latest/tutorial/offscreen-rendering
app.disableHardwareAcceleration()

const store = new Store({
  name: 'pinia',
  // serialize: devalue,
})
const isSingleInstance = app.requestSingleInstanceLock()
const isDevelopment = import.meta.env.MODE === 'development'
console.log('userData dir: ', app.getPath('userData'))

// const prodDebug = import.meta.env.VITE_PROD_DEBUG === '1'
let rendererReady = false
let mainWindow: BrowserWindow
const mainPageUrl =
  isDevelopment && import.meta.env.VITE_DEV_SERVER_URL !== undefined
    ? import.meta.env.VITE_DEV_SERVER_URL
    : new URL('../renderer/dist/index.html', 'file://' + __dirname).toString()

if (!isSingleInstance) {
  app.quit()
  process.exit(0)
}

// if (isDevelopment) {
//   app
//     .whenReady()
//     .then(() => import('electron-devtools-installer'))
//     .then(({ default: installExtension, VUEJS3_DEVTOOLS }) =>
//       installExtension(VUEJS3_DEVTOOLS, {
//         loadExtensionOptions: {
//           allowFileAccess: true,
//         },
//       })
//     )
//     .catch((e) => console.error('Failed to install Vue devtools extension:', e))
// }

ipcMain.on('electron-store-get', async (event, val) => {
  event.returnValue = store.get(val)
})
ipcMain.on('electron-store-set', async (event, key, val) => {
  store.set(key, val)
})

ipcMain.on('rendererReady', () => {
  console.log('renderer is ready!')
  rendererReady = true
})

ipcMain.on('openSamplesFilepicker', () => {
  console.log('main -> openSamplesFilepicker')

  dialog
    .showOpenDialog({
      filters: [{ name: 'Samples', extensions: ['mp3', 'wav', 'aac'] }],
      properties: ['openFile', 'multiSelections'],
    })
    .then((result) => {
      console.log('main -> openSamplesFilepicker THEN', result.filePaths)
      mainWindow.webContents.send('addSamples', result.filePaths)
    })
    .catch((err) => {
      console.error('main -> openSamplesFilepicker CATCH', err)
      // return reject(err)
    })
})

function initMain() {
  return new Promise<void>((resolve) => {
    resolve()
  })
}

const createWindow = async () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false, // Use 'ready-to-show' event to show window
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 18, y: 18 },
    webPreferences: {
      webviewTag: false,
      nativeWindowOpen: true,
      preload: join(__dirname, '../../preload/dist/index.cjs'),
    },
  })
  mainWindow.setBackgroundColor('#1C1E20')

  mainWindow.on('focus', () => {
    mainWindow.webContents.send('focus')
  })

  mainWindow.on('blur', () => {
    mainWindow.webContents.send('blur')
  })

  /**
   * If you install `show: true` then it can cause issues when trying to close the window.
   * Use `show: false` and listener events `ready-to-show` to fix these issues.
   *
   * @see https://github.com/electron/electron/issues/25012
   */
  mainWindow.on('ready-to-show', async () => {
    if (rendererReady) {
      mainWindow.show()
    }
  })

  await mainWindow.loadURL(mainPageUrl)
  // if (isDevelopment) {
  //   mainWindow.webContents.openDevTools()
  // }
}

app
  .whenReady()
  .then(enforceApplicationFolder)
  .then(initMain)
  .then(createWindow)
  .catch((e) => {
    console.error('Failed create window:', e)
  })

app.on('second-instance', () => {
  // Someone tried to run a second instance, we should focus our window.
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore()
    }
    mainWindow.focus()
  }
})

app.on('window-all-closed', () => {
  // Close the app when all windows close, even on macOS
  app.quit()
})

// Auto-updates
// if (import.meta.env.PROD) {
//   app
//     .whenReady()
//     .then(() => import('electron-updater'))
//     .then(({ autoUpdater }) => autoUpdater.checkForUpdatesAndNotify())
//     .catch((e) => console.error('Failed check updates:', e))
// }
