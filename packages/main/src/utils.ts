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
