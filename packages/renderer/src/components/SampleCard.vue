<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useStore } from '@/store'
import WaveSurfer from 'wavesurfer.js'
import type { Sample } from 'root/types'

const store = useStore()
const mode = computed(() => store.ui.mode)
const activeSample = computed(() => store.ui.activeSample)
const playingSample = computed(() => store.ui.playingSample)
const wavecontainer = ref(null)
const player = ref<WaveSurfer>()
const isPlaying = ref(false)
const percentPlayed = ref(0)
const props = defineProps<{
  sample: Sample
}>()
let duration = 0

function selectSample() {
  // console.log('SAMPLE CLICKED')

  if (mode.value === 'play') {
    if (isPlaying.value) {
      player.value?.stop()
      isPlaying.value = false
      store.ui.playingSample = ''
      percentPlayed.value = 0
    } else {
      player.value?.play()
      isPlaying.value = true
      store.ui.playingSample = props.sample.id

      if (!props.sample.metadata?.duration) {
        duration = player.value?.getDuration() as number
        console.log('duration missing: ', duration)
      }
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
      waveColor: '#6848FF',
      progressColor: '#6848FF',
      // progressColor: '#E69138',
      // cursorColor: '#fff',
      interact: false,
      height: 128,
      cursorWidth: 0,
      hideScrollbar: true,
      backend: 'MediaElement',
    })

    player.value.on('finish', () => {
      store.setActiveSample('')
      player.value?.stop()
      percentPlayed.value = 0
      isPlaying.value = false
    })

    player.value.on('audioprocess', () => {
      let percent = player.value!.backend.getPlayedPercents() * 100
      if (percent < 0) {
        percent = 0
      }
      if (percent > 100) {
        percent = 100
      }
      percentPlayed.value = percent
    })

    player.value.load('slip-board://' + props.sample.path)

    if (props.sample.mode === 'loop') {
      // @ts-expect-error
      player.value.backend.media.loop = true
    }
  }
})

watch(playingSample, (newValue) => {
  if (newValue !== props.sample.id) {
    player.value?.stop()
    isPlaying.value = false
  }
})
</script>
<template>
  <div
    class="h-[128px] w-[250px] border-2 rounded flex flex-col overflow-hidden mx-1 my-1 bg-white/5 relative"
    :class="{
      'border-indigo-500/60': activeSample === sample.id,
      'border-[#1C1E20]': activeSample !== sample.id,
    }"
    @click="selectSample"
  >
    <div
      class="absolute inset-0 bg-orange-400 -z-50"
      :style="{
        width: `${percentPlayed}%`,
      }"
    ></div>
    <div class="flex-1">
      <div clasS="z-40 flex-1 px-3 pt-2">
        <span class="text-12">
          <template v-if="sample.mode === 'loop'">Loop: </template
          >{{ sample.name }}
        </span>
      </div>
      <div ref="wavecontainer" class="absolute inset-0"></div>
    </div>
  </div>
</template>
