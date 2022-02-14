<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from '@/store'

const store = useStore()
const version = import.meta.env.VITE_APP_VERSION
const initialValue = computed(() => store.initialValue)

function increase() {
  store.initialValue++
  store.saveStore()
}
</script>

<template>
  <div class="flex flex-1 bg-green-400">
    <p>Initial state value: {{ initialValue }}</p>

    <button @click="increase">Increase</button>
  </div>
</template>
