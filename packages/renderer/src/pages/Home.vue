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
  <h1 class="font-bold underline text-7xl">Hello world!</h1>

  <p>Initial state value: {{ initialValue }}</p>

  <button @click="increase">Increase</button>

  <p>Template version v{{ version }}</p>

  <p>
    For a guide and recipes on how to configure / customize this project,<br />
    check out the
    <a
      href="https://github.com/Uninen/electron-vite-python"
      rel="noopener"
      target="_blank"
      >velectron-vite-python documentation</a
    >.
  </p>
</template>
