import { contextBridge, ipcRenderer } from 'electron'
import 'v8-compile-cache'

/**
 * The "Main World" is the JavaScript context that your main renderer code runs in.
 * By default, the page you load in your renderer executes code in this world.
 *
 * @see https://www.electronjs.org/docs/api/context-bridge
 */

/**
 * After analyzing the `exposeInMainWorld` calls,
 * `packages/preload/exposedInMainWorld.d.ts` file will be generated.
 * It contains all interfaces.
 * `packages/preload/exposedInMainWorld.d.ts` file is required for TS is `renderer`
 *
 * @see https://github.com/cawa-93/dts-for-context-bridge
 */

/**
 * Expose Environment versions.
 * @example
 * console.log( window.versions )
 */
contextBridge.exposeInMainWorld('versions', process.versions)

contextBridge.exposeInMainWorld('api', {
  send: (channel: string, data?: unknown) => {
    ipcRenderer.send(channel, data)
  },
  sendSync: (channel: string, data?: unknown) => {
    ipcRenderer.sendSync(channel, data)
  },
  receive: (channel: string, func: any) => {
    ipcRenderer.on(channel, (event, ...args) => func(...args))
  },

  store: {
    get(val: any) {
      return ipcRenderer.sendSync('electron-store-get', val)
    },
    set(property: string, val: any) {
      ipcRenderer.send('electron-store-set', property, val)
    },
  },
})
