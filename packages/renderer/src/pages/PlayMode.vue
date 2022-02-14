<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from '@/store'

const store = useStore()
const initialValue = computed(() => store.initialValue)

function increase() {
  store.initialValue++
  store.saveStore()
}
</script>

<template>
  <div class="flex flex-1">
    <div>
      <p>Initial state value: {{ initialValue }}</p>

      <button class="btn" @click="increase">Increase</button>
    </div>
  </div>
</template>
