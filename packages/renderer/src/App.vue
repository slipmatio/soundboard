<template>
  <div id="title" class="w-full text-center bg-back"></div>
  <div class="px-4" v-if="isInited">
    <app-navigation />
    <router-view />
  </div>
</template>

<script async setup lang="ts">
import { computed } from 'vue'
import AppNavigation from '@/components/AppNavigation.vue'
import { useStore } from '@/store'

import type { LogItem } from 'mainpkg/types'

const store = useStore()
const isInited = computed(() => store.isInited)

window.api.receive('logMessage', (message: LogItem) => {
  console.log('message', message)
  store.loadingMessages.push(message)
})
console.log('renderer App setup')

store.initApp()
</script>
