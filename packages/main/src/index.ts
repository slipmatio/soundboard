import { app, BrowserWindow } from 'electron'
import { join } from 'path'
import { URL } from 'url'
import { enforceApplicationFolder } from './utils'
// import 'v8-compile-cache'
import './security'

// import settings from 'electron-settings'

// See https://www.electronjs.org/docs/latest/tutorial/offscreen-rendering
app.disableHardwareAcceleration()

const isSingleInstance = app.requestSingleInstanceLock()
const isDevelopment = import.meta.env.MODE === 'development'

// const prodDebug = import.meta.env.VITE_PROD_DEBUG === '1'
let mainWindow: BrowserWindow | null = null
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

const createWindow = async () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false, // Use 'ready-to-show' event to show window
    titleBarStyle: 'hidden',
    webPreferences: {
      webviewTag: false,
      nativeWindowOpen: true,
      preload: join(__dirname, '../../preload/dist/index.cjs'),
    },
  })

  /**
   * If you install `show: true` then it can cause issues when trying to close the window.
   * Use `show: false` and listener events `ready-to-show` to fix these issues.
   *
   * @see https://github.com/electron/electron/issues/25012
   */
  mainWindow.on('ready-to-show', async () => {
    mainWindow?.show()
    if (isDevelopment) {
      mainWindow?.webContents.openDevTools()
    }
  })

  await mainWindow.loadURL(mainPageUrl)
}

app
  .whenReady()
  .then(enforceApplicationFolder)
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
