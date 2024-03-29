import { app, BrowserWindow, ipcMain, dialog, protocol } from 'electron'
import { join } from 'path'
import { mkdir, unlink } from 'fs/promises'
import { URL } from 'url'
// import devalue from '@nuxt/devalue'
import Store from 'electron-store'
import 'v8-compile-cache'
import pkg from '../../../package.json'
import type { Sample } from 'root/types'

import {
  enforceApplicationFolder,
  pathAvailable,
  filepathsToSamples,
} from './utils'
import './security'

// import settings from 'electron-settings'

// See https://www.electronjs.org/docs/latest/tutorial/offscreen-rendering
app.disableHardwareAcceleration()

let rendererReady = false
let mainWindow: BrowserWindow

const isSingleInstance = app.requestSingleInstanceLock()
const userDataPath = app.getPath('userData')
const samplePath = join(userDataPath, 'samples')
const isDevelopment = import.meta.env.MODE === 'development'
const openDevtools = isDevelopment
// const openDevtools = true
const mainPageUrl =
  isDevelopment && import.meta.env.VITE_DEV_SERVER_URL !== undefined
    ? import.meta.env.VITE_DEV_SERVER_URL
    : new URL('../renderer/dist/index.html', 'file://' + __dirname).toString()
const protocolName = 'slip-board'
const supportedFileFormats = ['aiff', 'aac', 'flac', 'mp3', 'm4a', 'wav'] // https://www.npmjs.com/package/music-metadata
const store = new Store({
  name: 'pinia',
})

pathAvailable(samplePath).then((available) => {
  if (available) {
    mkdir(samplePath).then(() => {
      console.log('Created sample folder')
    })
  }
})

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'slip-board',
    privileges: { secure: true, standard: true, supportFetchAPI: true },
  },
])

if (!isSingleInstance) {
  app.quit()
  process.exit(0)
}

if (isDevelopment) {
  app
    .whenReady()
    .then(() => import('electron-devtools-installer'))
    .then(({ default: installExtension, VUEJS3_DEVTOOLS }) =>
      installExtension(VUEJS3_DEVTOOLS, {
        loadExtensionOptions: {
          allowFileAccess: true,
        },
      })
    )
    .catch((e) => console.error('Failed to install Vue devtools extension:', e))
}

ipcMain.on('electron-store-get', async (event, val) => {
  event.returnValue = store.get(val)
})
ipcMain.on('electron-store-set', async (event, key, val) => {
  console.log('store set: ', val)
  console.log('store set: ', typeof val)
  store.set(key, val)
})

ipcMain.on('rendererReady', () => {
  console.log('renderer is ready!')
  rendererReady = true
})

ipcMain.on('openSamplesFilepicker', () => {
  console.log('main -> openSamplesFilepicker')
  // Opening file dialog more than once hangs without this
  // https://github.com/electron/electron/issues/20533
  const interval = setInterval(() => {
    /* nothing */
  }, 50)

  dialog
    .showOpenDialog({
      filters: [{ name: 'Samples', extensions: supportedFileFormats }],
      properties: ['openFile', 'multiSelections'],
    })
    .then((result) => {
      clearInterval(interval)
      filepathsToSamples(samplePath, result.filePaths).then((samples) => {
        console.log('got samples: ', samples)
        mainWindow.webContents.send('addedSamples', samples)
      })
    })
    .catch((err) => {
      console.error('main -> openSamplesFilepicker CATCH', err)
      // return reject(err)
    })
})

ipcMain.on('processDroppedSamples', (event, fileList: string[]) => {
  console.log('processing dropped samples')

  filepathsToSamples(samplePath, fileList).then((samples) => {
    console.log('got samples: ', samples)
    mainWindow.webContents.send('addedSamples', samples)
  })
})

ipcMain.on('confirmSampleDelete', (event, sample: Sample) => {
  console.log('confirmSampleDelete payload: ', sample)

  const answer = dialog.showMessageBoxSync({
    message: 'Are you sure?',
    type: 'warning',
    detail: 'This action cannot be undone.',
    buttons: ['Yes', 'No'],
  })

  if (answer === 0) {
    console.log('deleting sample: ', sample)
    mainWindow.webContents.send('deletedSample', sample.id)
    unlink(sample.path).then(() => {
      console.log('succesfully deleted sample')
    })
  }
})

function initMain() {
  return new Promise<void>((resolve) => {
    protocol.registerFileProtocol(protocolName, (request, callback) => {
      const url = request.url.replace(`${protocolName}://`, '')
      try {
        return callback(decodeURIComponent(url))
      } catch (error) {
        console.error(error)
      }
    })

    resolve()
  })
}

const createWindow = async () => {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 700,
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

  if (openDevtools) {
    mainWindow.webContents.openDevTools()
  }

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

app.setAboutPanelOptions({
  applicationName: 'Slipmat Soundboard',
  applicationVersion: pkg.version + ' ' + app.getVersion(),
  copyright: 'Copyright © 2022 Ville Säävuori',
  credits:
    'Thank you to the awesome Slipmat.io community - keep the music playing!',
  authors: ['Ville Säävuori'],
  website: 'https://slipmat.io',
})
// // Auto - updates
// if (import.meta.env.PROD) {
//   app
//     .whenReady()
//     .then(() => import('electron-updater'))
//     .then(({ autoUpdater }) => autoUpdater.checkForUpdatesAndNotify())
//     .catch((e) => console.error('Failed check updates:', e))
// }
