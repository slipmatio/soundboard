import { defineStore } from 'pinia'
import type { Sample, Board } from 'root/types'

export const useStore = defineStore('main', {
  state: () => ({
    debug:
      import.meta.env.MODE === 'development' ||
      import.meta.env.VITE_PROD_DEBUG === '1',
    env: {
      firstStart: true,
      isInited: false,
    },
    boards: [] as Board[],
    samples: [] as Sample[],
    initialValue: 1,
  }),
  actions: {
    initApp() {
      return new Promise<void>((resolve) => {
        this.env.isInited = true
        console.log('main store inited')

        this.initialValue = window.api.store.get('initialValue')

        if (!window.api.store.get('notFirstStart')) {
          this.env.firstStart = true
          console.log('this is first start!')
          window.api.store.set('notFirstStart', true)
        } else {
          // this.env.firstStart = false
        }

        window.api.send('rendererReady')
        resolve()
      })
    },

    saveStore() {
      window.api.store.set('initialValue', this.initialValue)
    },
  },
})
