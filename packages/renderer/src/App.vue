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

const store = useStore()
const isInited = computed(() => store.env.isInited)

console.log('renderer App setup')

store.initApp()
</script>
