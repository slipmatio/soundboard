<template>
  <div
    id="header"
    class="h-[52px] w-full flex justify-end items-center os-draggable pr-[18px]"
  >
    <div>Play Mode</div>
  </div>
  <router-view />
</template>

<script async setup lang="ts">
import { ref } from 'vue'
import { useStore } from '@/store'

const store = useStore()

const headerColor = ref('#eaeaeb')
const headerBgColor = ref('#333537')

console.log('renderer App setup')

store.initApp()

window.api.receive('blur', () => {
  console.log('page blurred!')
  headerColor.value = '#66696C'
  headerBgColor.value = '#25282B'
})

window.api.receive('focus', () => {
  console.log('page focused!')
  headerColor.value = '#eaeaeb'
  headerBgColor.value = '#333537'
})

window.api.receive('addSamples', async (filepaths: string[]) => {
  console.log('in main addSamples', filepaths)

  for (const filepath of filepaths) {
    store.files.push(filepath)
  }
  console.log('date: ', new Date().toUTCString())
})
</script>

<style>
#header {
  color: v-bind(headerColor);
  background-color: v-bind(headerBgColor);
}
</style>
