<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useStore } from '@/store'
import SampleCard from '@/components/SampleCard.vue'

const store = useStore()
const samples = computed(() => store.samples)
const firstStart = computed(() => store.ui.firstStart)
const mode = computed(() => store.ui.mode)
const dragMode = computed(() => store.ui.dragMode)
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
    class="flex flex-1 mt-[52px] px-4 py-3"
    :class="{
      'items-center': firstStart,
      'items-start': !firstStart,
      'mr-[260px]': sampleIsSelected && mode === 'edit',
      'border-4 border-green-500 bg-green-500/10': dragMode,
    }"
  >
    <div v-if="!firstStart" class="flex flex-wrap">
      <SampleCard :sample="sample" v-for="sample in samples" :key="sample.id" />
    </div>
    <div
      v-else
      class="w-7/12 mx-auto"
      :class="{
        'border-2 border-[#1C1E20]': !dragMode,
        'border-0': dragMode,
      }"
    >
      <h1>Good Hello!</h1>

      <p class="mt-4 text-xl">
        It looks like this is your first time using Slipmat Soundboard. Start by
        importing some samples to your library.
      </p>

      <p class="mt-4 text-md">
        Samples need to be MP3, WAV, or AAC files. They will be copied into
        Soundboard user folder.
      </p>

      <div class="flex flex-row items-center justify-center mt-10">
        <div class="text-lg">Drag and drop files here</div>

        <div class="px-10 opacity-50">or</div>

        <button
          class="btn big focus:outline-none focus:ring-2 focus:ring-indigo-600"
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
  </div>
</template>
