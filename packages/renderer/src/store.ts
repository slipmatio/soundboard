import { toRaw } from 'vue'
import { defineStore } from 'pinia'
import type { Sample, Board, UiMode } from 'root/types'

export const useStore = defineStore('main', {
  state: () => ({
    debug:
      import.meta.env.MODE === 'development' ||
      import.meta.env.VITE_PROD_DEBUG === '1',
    isInited: false,
    ui: {
      firstStart: true,
      mode: 'play' as UiMode,
      inFocus: true,
    },
    boards: [] as Board[],
    samples: [] as Sample[],
    files: [] as string[],
  }),
  actions: {
    initApp() {
      return new Promise<void>((resolve) => {
        const boards = window.api.store.get('boards') as undefined | Board[]

        if (!boards || boards.length === 0) {
          this.ui.firstStart = true
          this.ui.mode = 'edit'
          console.log('this is first start!')
          this.boards.push({
            id: 'default',
            name: 'Default',
            samples: [],
          })
          this.saveStore()
        } else if (boards[0].samples.length === 0) {
          console.log('this is not first start but there are no samples')
          this.ui.firstStart = true
          this.ui.mode = 'edit'
        } else {
          console.log('this is not first start!')
          this.ui.firstStart = false
        }

        this.isInited = true
        window.api.send('rendererReady')
        resolve()
      })
    },

    saveStore() {
      const boards = toRaw(this.boards)
      // console.log('in saveStore typeof this: ', typeof this.boards)
      // console.log('in saveStore typeof raw: ', typeof boards)
      // console.log('in saveStore actual data: ', boards)
      // console.log('in saveStore actual data is proxy: ', isProxy(boards))
      window.api.store.set('boards', boards)
    },

    changeFocus(inFocus: boolean) {
      this.ui.inFocus = inFocus
    },
  },
  getters: {
    headerBgColor(state) {
      if (state.ui.inFocus) {
        if (state.ui.mode === 'play') {
          return '#333537'
        } else {
          return '#6A3832'
        }
      } else {
        return '#25282B'
      }
    },
    headerTextColor(state) {
      if (state.ui.inFocus) {
        return '#eaeaeb'
      } else {
        return '#66696C'
      }
    },
  },
})
