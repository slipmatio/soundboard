<script async setup lang="ts">
import { computed } from 'vue'
import { useStore } from '@/store'
import type { Sample } from 'root/types'

const store = useStore()
store.initApp()

const uiMode = computed(() => store.ui.mode)
const headerTextColor = computed(() => store.headerTextColor)
const headerBgColor = computed(() => store.headerBgColor)

function toggleUiMode() {
  if (uiMode.value === 'play') {
    store.ui.mode = 'edit'
    console.log('changed uiMode to edit')
  } else {
    store.ui.mode = 'play'
    console.log('changed uiMode to play')
  }
}

window.api.receive('blur', () => {
  store.changeFocus(false)
})

window.api.receive('focus', () => {
  store.changeFocus(true)
})

window.api.receive('addedSamples', (samples: Sample[]) => {
  store.addSamples(samples)
})

console.log('Renderer setup DONE')
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
    class="h-[52px] w-full flex justify-end items-center os-draggable pr-[18px] flex-none fixed"
  >
    <div @click="toggleUiMode" class="px-3 py-1 rounded hover:bg-white/10">
      <div v-if="uiMode === 'play'">Play Mode</div>
      <div v-else>Edit Mode</div>
    </div>
  </div>
  <router-view />
</template>
