import { toRaw } from 'vue'
import { defineStore } from 'pinia'
import type { Sample, Board, UiMode } from 'root/types'
import { find, filter } from 'rambda'

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
      activeSample: '',
    },
    boards: [] as Board[],
    samples: [] as Sample[],
    files: [] as string[],
  }),
  actions: {
    initApp() {
      return new Promise<void>((resolve) => {
        const boards = window.api.store.get('boards') as undefined | Board[]
        const samples = window.api.store.get('samples') as undefined | Sample[]

        if (!boards || boards.length === 0) {
          this.ui.firstStart = true
          this.ui.mode = 'edit'
          console.log('this is first start!')
          this.boards.push({
            id: 'default',
            name: 'Default',
            sampleIds: [],
          })
          this.saveStore()
        } else if (boards[0].sampleIds.length === 0) {
          console.log('this is not first start but there are no samples')
          this.ui.firstStart = true
          this.ui.mode = 'edit'
          this.boards.push(...boards)
        } else {
          console.log('this is not first start!')
          this.ui.firstStart = false
          this.boards.push(...boards)
          if (samples && samples.length > 0) {
            this.samples.push(...samples)
          }
        }

        this.isInited = true
        window.api.send('rendererReady')
        resolve()
      })
    },

    saveStore() {
      const boards = toRaw(this.boards)
      const samples = toRaw(this.samples)
      console.log('saving boards: ', boards)
      console.log('saving samples: ', samples)
      window.api.store.set('boards', boards)
      window.api.store.set('samples', samples)
    },

    changeFocus(inFocus: boolean) {
      this.ui.inFocus = inFocus
    },

    addSamples(samples: Sample[]) {
      this.samples.push(...samples)
      for (const sample of samples) {
        const board = this.boards[0]
        if (board) {
          board.sampleIds.push(sample.id)
        }
      }
      this.saveStore()
    },

    setActiveSample(id: string) {
      this.ui.activeSample = id
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

    getSamplesForBoard(state) {
      return (id: string) => {
        const predicate = (board: Board) => board.id === id
        const board = find(predicate, state.boards)
        if (!board) {
          return []
        }
        const samplePredicate = (sample: Sample) =>
          board.sampleIds.includes(sample.id)
        return filter(samplePredicate, state.samples)
      }
    },
  },
})
