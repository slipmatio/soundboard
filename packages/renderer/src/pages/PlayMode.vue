<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from '@/store'

const store = useStore()
const initialValue = computed(() => store.initialValue)
const firstStart = computed(() => store.env.firstStart)

function increase() {
  store.initialValue++
  store.saveStore()
}
</script>

<template>
  <div class="flex items-center flex-1">
    <div v-if="!firstStart">
      <p>Initial state value: {{ initialValue }}</p>

      <button class="btn" @click="increase">Increase</button>
    </div>
    <div v-else class="w-1/2 mx-auto">
      <h1>Good Hello!</h1>

      <p class="mt-4 text-xl">
        It looks like this is your first time using Slipmat Soundboard. Start by
        adding some samples to your library.
      </p>

      <button class="mt-10 btn big">
        <div class="flex flex-row items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span class="ml-2">Add sample</span>
        </div>
      </button>
    </div>
  </div>
</template>
