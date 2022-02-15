<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from '@/store'

const store = useStore()
const initialValue = computed(() => store.initialValue)
const firstStart = computed(() => store.ui.firstStart)
const files = computed(() => store.files)

function increase() {
  store.initialValue++
  // store.saveStore()
}

function openFilepicker() {
  window.api.send('openSamplesFilepicker')
}
</script>

<template>
  <div class="flex items-center flex-1 mt-[52px]">
    <div v-if="!firstStart">
      <p>Initial state value: {{ initialValue }}</p>

      <button class="btn" @click="increase">Increase</button>
    </div>
    <div v-else class="w-1/2 mx-auto">
      <h1>Good Hello!</h1>

      <p class="mt-4 text-xl">
        It looks like this is your first time using Slipmat Soundboard. Start by
        importing some samples to your library.
      </p>

      <p class="mt-4 text-md">
        Samples need to be MP3, WAV, or AAC files. They will be copied into
        Soundboard user folder.
      </p>

      <button class="mt-10 btn big" @click="openFilepicker">
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
          <span class="ml-2">Import samples</span>
        </div>
      </button>

      <h3 class="mt-8">Files ({{ files.length }})</h3>
      <ul>
        <li v-for="file in files" :key="file">{{ file }}</li>
      </ul>
    </div>
  </div>
</template>
