import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { join, basename } from 'path'
import { mkdir, copyFile } from 'fs/promises'
import { URL } from 'url'
import { createHash } from 'crypto'
// import devalue from '@nuxt/devalue'
import Store from 'electron-store'
import 'v8-compile-cache'

import {
  enforceApplicationFolder,
  pathAvailable,
  findUniqueFilename,
} from './utils'
import { Sample } from 'root/types'
import './security'

// import settings from 'electron-settings'

// See https://www.electronjs.org/docs/latest/tutorial/offscreen-rendering
app.disableHardwareAcceleration()

const store = new Store({
  name: 'pinia',
  // serialize: devalue,
})
const isSingleInstance = app.requestSingleInstanceLock()
const userDataPath = app.getPath('userData')
const samplePath = join(userDataPath, 'samples')
console.log('userDataPath', userDataPath)
pathAvailable(samplePath).then((available) => {
  if (available) {
    mkdir(samplePath).then(() => {
      console.log('Created sample folder')
    })
  }
})

const isDevelopment = import.meta.env.MODE === 'development'
const openDevtools = isDevelopment
// const openDevtools = true

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
      filters: [{ name: 'Samples', extensions: ['mp3', 'wav', 'aac'] }],
      properties: ['openFile', 'multiSelections'],
    })
    .then((result) => {
      const samples: Sample[] = []

      clearInterval(interval)
      // console.log('main -> openSamplesFilepicker THEN', result.filePaths)
      if (result.filePaths.length > 0) {
        for (const originalPath of result.filePaths) {
          const filename = basename(originalPath)
          const sampleFilePath = join(samplePath, filename)
          findUniqueFilename(sampleFilePath).then((unique: string) => {
            console.log('found unique: ', unique)
            copyFile(originalPath, unique).then(() => {
              console.log('copied FROM ', originalPath)
              console.log('copied TO ', unique)

              samples.push({
                id: 'foo',
                name: filename,
                path: unique,
                mode: 'oneshot',
              })
            })
          })
        }

        console.log('sending samples')
        mainWindow.webContents.send('addSamples', samples)
      }
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

// Auto-updates
// if (import.meta.env.PROD) {
//   app
//     .whenReady()
//     .then(() => import('electron-updater'))
//     .then(({ autoUpdater }) => autoUpdater.checkForUpdatesAndNotify())
//     .catch((e) => console.error('Failed check updates:', e))
// }
