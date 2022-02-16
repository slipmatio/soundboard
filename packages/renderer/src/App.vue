<script async setup lang="ts">
import { computed } from 'vue'
import { useStore } from '@/store'
import type { Sample } from 'root/types'
import SampleEditor from '@/components/SampleEditor.vue'

const store = useStore()
store.initApp()

const uiMode = computed(() => store.ui.mode)
const headerTextColor = computed(() => store.headerTextColor)
const headerBgColor = computed(() => store.headerBgColor)
const dragMode = computed(() => store.ui.dragMode)
const sampleIsSelected = computed(() => store.ui.activeSample !== '')
const mode = computed(() => store.ui.mode)

function toggleUiMode() {
  if (uiMode.value === 'play') {
    store.ui.mode = 'edit'
  } else {
    store.ui.mode = 'play'
    store.setActiveSample('')
    store.saveStore()
  }
}

function openFilepicker() {
  window.api.send('openSamplesFilepicker')
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

window.api.receive('deletedSample', (id: string) => {
  store.deleteSample(id)
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
    class="h-[52px] w-full flex items-center os-draggable pr-[18px] flex-none fixed z-50"
    :class="{
      'justify-end': !dragMode,
      '!bg-green-600 justify-center': dragMode,
    }"
  >
    <div v-if="!dragMode" class="flex flex-row space-x-4">
      <div
        @click="openFilepicker"
        class="px-2 py-1 rounded hover:bg-white/10 text-white/50"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          aria-hidden="true"
          role="img"
          class="w-6 h-6"
          preserveAspectRatio="xMidYMid meet"
          viewBox="0 0 24 24"
        >
          <path
            d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"
            fill="currentColor"
          ></path>
        </svg>
      </div>
      <div
        @click="toggleUiMode"
        class="flex justify-end px-2 py-1 rounded hover:bg-white/10 text-white/50"
        :class="{
          'bg-white/10': uiMode === 'edit',
        }"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          aria-hidden="true"
          role="img"
          class="w-6 h-6"
          preserveAspectRatio="xMidYMid meet"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            d="M3 17v2h6v-2H3M3 5v2h10V5H3m10 16v-2h8v-2h-8v-2h-2v6h2M7 9v2H3v2h4v2h2V9H7m14 4v-2H11v2h10m-6-4h2V7h4V5h-4V3h-2v6Z"
          ></path>
        </svg>
      </div>
    </div>
    <div v-else class="w-full text-xl text-center text-white">
      Drop samples to import
    </div>
  </div>
  <SampleEditor v-if="sampleIsSelected && mode === 'edit'" />
  <router-view />
</template>
