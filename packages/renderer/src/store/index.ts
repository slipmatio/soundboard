import { defineStore } from 'pinia'
import type { LogItem } from 'mainpkg/types'

export const useStore = defineStore('main', {
  state: () => ({
    debug:
      import.meta.env.MODE === 'development' ||
      import.meta.env.VITE_PROD_DEBUG === '1',
    isInited: false,
    loadingMessages: [] as LogItem[],
  }),
  actions: {
    initApp() {
      // eslint-disable-next-line
      return new Promise<void>((resolve, reject) => {
        this.isInited = true
        console.log('store inited')
        resolve()
      })
    },
  },
})
