<script setup lang="ts">
import { computed, toRaw } from 'vue'
import { useStore } from '@/store'

const store = useStore()
const mode = computed(() => store.ui.mode)
const sample = computed(() => store.getSelectedSample)

function blurField(event: Event) {
  // @ts-expect-error
  event.target.blur()
}

function updateSample() {
  if (sample.value) {
    store.updateSample(sample.value)
  }
}

function confirmDelete() {
  const obj = toRaw(sample.value)
  console.log('confirmSampleDelete', obj)
  window.api.send('confirmSampleDelete', obj)
}
</script>
<template>
  <div
    v-if="sample && mode === 'edit'"
    class="bg-black/20 fixed top-[52px] bottom-0 right-0 w-[300px] px-3 py-3 flex flex-col"
  >
    <div class="space-y-6">
      <div class="">
        <label for="name" class="block text-sm font-light">Name</label>
        <div class="mt-1">
          <input
            id="name"
            name="name"
            type="text"
            class="block w-full px-2 py-1 text-gray-100 border-b rounded-sm shadow-sm text-12 border-white/20 focus:outline-none bg-white/10"
            v-model="sample.name"
            @blur="updateSample"
            @keyup.enter="blurField"
          />
        </div>
      </div>

      <div class="">
        <label for="mode" class="block text-sm font-light">Mode</label>
        <div class="mt-1 space-y-2">
          <div class="flex items-center">
            <input
              id="push-everything"
              name="push-notifications"
              type="radio"
              class="w-5 h-5 text-indigo-600 border-gray-300 focus:ring-indigo-500"
            />
            <label for="push-everything" class="block ml-3 font-medium text-12">
              One shot
            </label>
          </div>
          <div class="flex items-center">
            <input
              id="push-email"
              name="push-notifications"
              type="radio"
              class="w-5 h-5 text-indigo-600 border-gray-300 focus:ring-indigo-500"
            />
            <label for="push-email" class="block ml-3 font-medium text-12">
              Loop
            </label>
          </div>
        </div>
      </div>
    </div>

    <div class="flex-1">&nbsp;</div>

    <hr class="hidden my-8 border border-white/10" />

    <button class="btn editor" @click="confirmDelete">Delete sample</button>

    <div class="py-4">&nbsp;</div>
  </div>
</template>
