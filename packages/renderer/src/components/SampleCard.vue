<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from '@/store'
import type { Sample } from 'root/types'

const store = useStore()
const mode = computed(() => store.ui.mode)

defineProps<{
  sample: Sample
}>()
</script>
<template>
  <div
    class="h-[100px] w-[200px] border border-white/30 rounded flex flex-col overflow-hidden mx-1 my-1"
  >
    <div class="flex-1 px-3 pt-2">
      <h4>{{ sample.name }}</h4>
    </div>
    <div v-if="mode === 'edit'" class="flex justify-end w-full px-2 py-1">
      <button class="btn">Edit</button>
    </div>
  </div>
</template>
