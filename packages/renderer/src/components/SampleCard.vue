<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useStore } from '@/store'
import WaveSurfer from 'wavesurfer.js'
import type { Sample } from 'root/types'
import SampleEditorVue from './SampleEditor.vue'

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

  if (mode.value === 'play') {
    if (isPlaying.value) {
      player.value?.stop()
      isPlaying.value = false
    } else {
      player.value?.play()
      isPlaying.value = true
    }
  }

  if (activeSample.value === props.sample.id) {
    store.setActiveSample('')
  } else {
    store.setActiveSample(props.sample.id)
  }
}

watch(wavecontainer, (newContainer) => {
  if (newContainer) {
    player.value = WaveSurfer.create({
      container: newContainer,
      waveColor: 'violet',
      progressColor: 'purple',
      // cursorColor: '#fff',
      interact: false,
      height: 100,
      hideScrollbar: true,
      backend: 'MediaElement',
    })

    player.value.on('finish', () => {
      store.setActiveSample('')
      player.value?.stop()
    })

    player.value.load('slip-board://' + props.sample.path)

    if (props.sample.mode === 'loop') {
      // @ts-expect-error
      player.value.backend.media.loop = true
    }
  }
})
</script>
<template>
  <div
    class="h-[100px] w-[200px] border-2 rounded flex flex-col overflow-hidden mx-1 my-1 bg-white/5"
    :class="{
      'border-indigo-500/60': activeSample === sample.id,
      'border-[#1C1E20]': activeSample !== sample.id,
    }"
    @click="selectSample"
  >
    <div class="flex-1 px-3 pt-2">
      <h4>
        <template v-if="sample.mode === 'loop'">Loop: </template
        >{{ sample.name }}
      </h4>

      <div ref="wavecontainer"></div>
    </div>
    <div v-if="mode === 'edit'" class="flex justify-end w-full px-2 py-1">
      <button class="btn">Edit</button>
    </div>
  </div>
</template>
