<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from '@/store'
import type { Sample } from 'root/types'

const store = useStore()
const mode = computed(() => store.ui.mode)
const activeSample = computed(() => store.ui.activeSample)

const props = defineProps<{
  sample: Sample
}>()

function selectSample() {
  console.log('SAMPLE CLICKED')
  if (activeSample.value === props.sample.id) {
    store.setActiveSample('')
  } else {
    store.setActiveSample(props.sample.id)
  }
}
</script>
<template>
  <div
    class="h-[100px] w-[200px] border rounded flex flex-col overflow-hidden mx-1 my-1"
    :class="{
      'border-red-400/50': activeSample === sample.id,
      'border-white/30': activeSample !== sample.id,
    }"
    @click="selectSample"
  >
    <div class="flex-1 px-3 pt-2">
      <h4>{{ sample.name }}</h4>
    </div>
    <div v-if="mode === 'edit'" class="flex justify-end w-full px-2 py-1">
      <button class="btn">Edit</button>
    </div>
  </div>
</template>
