<script setup lang="ts">
import { computed, ref, watch, toRaw } from 'vue'
import { useStore } from '@/store'
import type { Sample } from 'root/types'

const store = useStore()
const mode = computed(() => store.ui.mode)
const sample = computed(() => store.getSelectedSample)

function confirmDelete() {
  const obj = toRaw(sample.value)
  console.log('confirmSampleDelete', obj)
  window.api.send('confirmSampleDelete', obj)
}
</script>
<template>
  <div
    v-if="sample && mode === 'edit'"
    class="bg-black absolute top-[52px] bottom-0 right-0 w-[280px] px-3 py-3"
  >
    <h4>{{ sample.name }}</h4>

    <p class="my-4 text-xs">{{ sample.path }}</p>

    <hr />

    <button class="btn" @click="confirmDelete">Delete sample</button>
  </div>
</template>
