import { join, dirname, extname, basename } from 'path'
import { stat } from 'fs/promises'
import { app, dialog } from 'electron'
import type { BrowserWindow } from 'electron'
import { is } from 'electron-util'

const isDevelopment = import.meta.env.MODE === 'development'
const isTestRun = app.commandLine.getSwitchValue('testrun')

export function fadeWindowOut(_window: BrowserWindow) {
  let opacity = _window.getOpacity()
  const step = 0.1
  const interval = setInterval(() => {
    if (opacity <= 0) {
      clearInterval(interval)
      _window.close()
    }
    _window.setOpacity(opacity)
    opacity -= step
  }, 600 * step)
  return interval
}

export function enforceApplicationFolder() {
  return new Promise<void>((resolve, reject) => {
    if (isTestRun || isDevelopment || !is.macos) {
      console.log('Skipping enforceApplicationFolder')
      return resolve()
    }

    if (app.isInApplicationsFolder()) {
      return resolve()
    } else {
      const appName = 'name' in app ? app.name : app.getName()

      const clicked = dialog.showMessageBoxSync({
        type: 'error',
        message: 'Move to Applications folder?',
        detail: `${appName} must live in the Applications folder to be able to run correctly.`,
        buttons: ['Move to Applications folder', `Quit ${appName}`],
        defaultId: 0,
        cancelId: 1,
      })

      if (clicked === 1) {
        app.quit()
        return reject()
      } else {
        app.moveToApplicationsFolder({
          conflictHandler: (conflict) => {
            if (conflict === 'existsAndRunning') {
              // Can't replace the active version of the app
              dialog.showMessageBoxSync({
                type: 'error',
                message: `Another version of ${app.getName()} is currently running. Quit it, then launch this version of the app again.`,
                buttons: ['OK'],
              })
            }
            return true
          },
        })
        reject(new Error('Application not in Applications folder'))
      }
    }
  })
}

export async function pathAvailable(path: string) {
  return !(await stat(path).catch(() => false))
}

type fileDict = {
  dir: string
  ext: string
  base: string
  increment: number
}

export function findUniqueFilename(filepath: string) {
  const file: fileDict = {
    dir: dirname(filepath),
    ext: extname(filepath),
    base: basename(filepath, extname(filepath)),
    increment: 0,
  }

  return new Promise<string>(function (resolve) {
    findIncrementalUniqueFilename(file, (filename: string) => {
      resolve(filename)
    })
  })
}

function findIncrementalUniqueFilename(
  fdict: fileDict,
  callback: (filename: string) => void
) {
  let append = ''

  if (fdict.increment > 0) {
    append = '_' + fdict.increment
  }

  console.log('old filename: ', join(fdict.dir, fdict.base + fdict.ext))
  const newFilename = join(fdict.dir, fdict.base + append + fdict.ext)
  pathAvailable(newFilename).then((available) => {
    if (!available) {
      console.log('not available: ', newFilename)
      setImmediate(function () {
        fdict.increment += 1
        return findIncrementalUniqueFilename(fdict, callback)
      })
    } else {
      console.log('is available: ', newFilename)
      return callback(newFilename)
    }
  })
}
