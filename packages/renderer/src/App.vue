<script async setup lang="ts">
import { computed } from 'vue'
import { useStore } from '@/store'
import type { Sample } from 'root/types'

const store = useStore()
store.initApp()

const uiMode = computed(() => store.ui.mode)
const headerTextColor = computed(() => store.headerTextColor)
const headerBgColor = computed(() => store.headerBgColor)
const dragMode = computed(() => store.ui.dragMode)

function toggleUiMode() {
  if (uiMode.value === 'play') {
    store.ui.mode = 'edit'
  } else {
    store.ui.mode = 'play'
  }
}

document.addEventListener('drop', (event) => {
  event.preventDefault()
  event.stopPropagation()
  store.ui.dragMode = false
  const filePaths: string[] = []
  // @ts-expect-error
  for (const f of event.dataTransfer.files) {
    // Using the path attribute to get absolute file path
    // @ts-expect-error
    filePaths.push(f.path)
    // @ts-expect-error
    console.log('File Path of dragged files: ', f.path)
  }
  window.api.send('processDroppedSamples', filePaths)
})

document.addEventListener('dragover', (e) => {
  e.preventDefault()
  e.stopPropagation()
})

document.addEventListener('dragenter', () => {
  store.ui.dragMode = true
  console.log('File is in the Drop Space')
})

document.addEventListener('dragleave', () => {
  store.ui.dragMode = false
  console.log('File has left the Drop Space')
})

window.api.receive('blur', () => {
  store.changeFocus(false)
})

window.api.receive('focus', () => {
  store.changeFocus(true)
})

window.api.receive('addedSamples', (samples: Sample[]) => {
  store.addSamples(samples)
})
</script>

<style>
#header {
  color: v-bind(headerTextColor);
  background-color: v-bind(headerBgColor);
}
</style>

<template>
  <div
    id="header"
    class="h-[52px] w-full flex items-center os-draggable pr-[18px] flex-none fixed"
    :class="{
      'justify-end': !dragMode,
      '!bg-green-600 justify-center': dragMode,
    }"
  >
    <div
      v-if="!dragMode"
      @click="toggleUiMode"
      class="flex justify-end px-3 py-1 rounded hover:bg-white/10"
    >
      <div v-if="uiMode === 'play'">Play Mode</div>
      <div v-else>Edit Mode</div>
    </div>
    <div v-else class="w-full text-xl text-center text-white">
      Drop samples to import
    </div>
  </div>
  <router-view />
</template>
