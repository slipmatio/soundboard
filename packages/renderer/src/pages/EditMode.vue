<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useStore } from '@/store'
import SampleCard from '@/components/SampleCard.vue'

const store = useStore()
const samples = computed(() => store.samples)
const firstStart = computed(() => store.ui.firstStart)
const sampleIsSelected = computed(() => store.ui.activeSample !== '')
const filepicker = ref(null)

function openFilepicker() {
  window.api.send('openSamplesFilepicker')
  // @ts-expect-error
  filepicker.value?.blur()
}

onMounted(() => {
  // @ts-expect-error
  filepicker.value?.blur()
  // @ts-expect-error
  document.activeElement?.blur()
})
</script>

<template>
  <div
    v-if="sampleIsSelected"
    class="absolute top-[52px] bottom-0 right-0 bg-green-500 w-[280px]"
  >
    <h2>Hello</h2>
  </div>
  <div
    class="flex flex-1 mt-[52px] px-4 py-3"
    :class="{
      'items-center': firstStart,
      'items-start': !firstStart,
      'mr-[260px]': sampleIsSelected,
    }"
  >
    <div v-if="!firstStart" class="flex flex-wrap">
      <SampleCard :sample="sample" v-for="sample in samples" :key="sample.id" />
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

      <button
        class="mt-10 btn big focus:outline-none focus:ring-2 focus:ring-red-600"
        @click="openFilepicker"
        ref="filepicker"
      >
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
    </div>
  </div>
</template>
