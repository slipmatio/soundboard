<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useStore } from '@/store'
import WaveSurfer from 'wavesurfer.js'
import type { Sample } from 'root/types'

const store = useStore()
const mode = computed(() => store.ui.mode)
const activeSample = computed(() => store.ui.activeSample)
const wavecontainer = ref(null)
const player = ref<WaveSurfer>()
const isPlaying = ref(false)

const props = defineProps<{
  sample: Sample
}>()

function selectSample() {
  console.log('SAMPLE CLICKED')
  if (isPlaying.value) {
    player.value?.stop()
    isPlaying.value = false
  } else {
    player.value?.play()
    isPlaying.value = true
  }
  if (activeSample.value === props.sample.id) {
    store.setActiveSample('')
  } else {
    store.setActiveSample(props.sample.id)
  }
}

watch(wavecontainer, (newContainer, oldContainer) => {
  if (newContainer) {
    player.value = WaveSurfer.create({
      container: newContainer,
      waveColor: 'violet',
      progressColor: 'purple',
      cursorColor: '#fff',
      // barWidth: 2,
      // barHeight: 1,
      // barGap: 1,
      interact: false,
      height: 100,
      hideScrollbar: true,
      // responsive: true,
    })

    player.value.load('slip-board://' + props.sample.path)
    // player.value.load('file://' + props.sample.path)
  }
})
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

      <div ref="wavecontainer"></div>
    </div>
    <div v-if="mode === 'edit'" class="flex justify-end w-full px-2 py-1">
      <button class="btn">Edit</button>
    </div>
  </div>
</template>
