<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useStore } from '@/store'
import WaveSurfer from 'wavesurfer.js'
import { ElectronMidi } from '@/util/electronMidi'
import type { Sample } from 'root/types'

let duration = 0
const store = useStore()
const mode = computed(() => store.ui.mode)
const activeSample = computed(() => store.ui.activeSample)
const playingSample = computed(() => store.ui.playingSample)
const pendingSample = computed(() => store.ui.playingSample)
const selectedSample = computed(() => store.getSelectedSample)
const midi = new ElectronMidi({ debug: false })
const wavecontainer = ref(null)
const player = ref<WaveSurfer>()
const isPlaying = ref(false)
const percentPlayed = ref(0)
const props = defineProps<{
  sample: Sample
}>()

const durationDisplay = computed(() => {
  if (props.sample.metadata?.duration) {
    return parseInt(props.sample.metadata.duration) + 's'
  } else {
    return 'n/a'
  }
})

function playSample() {
  player.value?.play()
  isPlaying.value = true
  store.ui.playingSample = props.sample.id
}

function stopSample() {
  store.ui.playingSample = ''
  store.setActiveSample('')
  player.value?.stop()
  percentPlayed.value = 0
  isPlaying.value = false
}

function selectSample() {
  // console.log('SAMPLE CLICKED')
  if (activeSample.value === props.sample.id) {
    store.setActiveSample('')
  } else {
    store.setActiveSample(props.sample.id)
  }

  if (mode.value === 'play') {
    if (isPlaying.value) {
      stopSample()
    } else {
      if (!props.sample.metadata?.duration) {
        duration = player.value?.getDuration() as number
        if (selectedSample.value !== undefined) {
          if (selectedSample.value.metadata) {
            selectedSample.value.metadata.duration = duration
          } else {
            selectedSample.value.metadata = {
              duration: duration,
            }
          }
          store.ui.pendingSample = selectedSample.value.id
          store.updateSample(selectedSample.value)
        }
        console.log('duration missing, added: ', duration)
      }
      playSample()
    }
  }
}

function initCard(newContainer: HTMLElement) {
  player.value = WaveSurfer.create({
    container: newContainer,
    waveColor: '#6848FF',
    progressColor: '#6848FF',
    interact: false,
    height: 128,
    cursorWidth: 0,
    hideScrollbar: true,
    backend: 'MediaElement',
  })
  // console.log('player created!')
  player.value.setVolume(props.sample.volume / 100)
  player.value.load('slip-board://' + props.sample.path)

  if (props.sample.mode === 'loop') {
    // @ts-expect-error
    player.value.backend.media.loop = true
  }

  player.value.on('finish', () => {
    stopSample()
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

  if (props.sample.metadata?.midiChannel !== undefined) {
    midi.onMidiOnMessage = (msg) => {
      if (msg.note === props.sample.metadata?.midiNote) {
        selectSample()
      }
    }
  }
}

watch(wavecontainer, (newContainer) => {
  if (newContainer) {
    initCard(newContainer)
  }
})

watch(playingSample, (newValue) => {
  if (newValue !== props.sample.id) {
    player.value?.stop()
    isPlaying.value = false
  }
})

watch(props.sample, () => {
  if (player.value && wavecontainer.value) {
    console.log('recreating player')
    initCard(wavecontainer.value)
    if (pendingSample.value !== '') {
      playSample()
      store.ui.pendingSample = ''
    }
  }
})
</script>
<template>
  <div
    class="h-[128px] w-[250px] border-2 rounded flex flex-col overflow-hidden mx-1 my-1 bg-white/5 relative"
    :class="{
      'border-amber-500': activeSample === sample.id,
      'border-[#1C1E20]': activeSample !== sample.id,
    }"
    @click="selectSample"
  >
    <div
      class="absolute inset-0 bg-amber-500 -z-50"
      :style="{
        width: `${percentPlayed}%`,
      }"
    ></div>
    <div class="flex flex-1">
      <div clasS="z-40 flex flex-col flex-1 px-3 pt-2">
        <div class="flex flex-row items-center justify-between">
          <span class="text-12">
            {{ sample.name }}
          </span>
          <span class="inline" v-if="sample.mode === 'loop'">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              aria-hidden="true"
              role="img"
              class="iconify iconify--teenyicons"
              width="12"
              preserveAspectRatio="xMidYMid meet"
              viewBox="0 0 15 15"
            >
              <path
                fill="currentColor"
                fill-rule="evenodd"
                d="M13.293 3L11.146.854l.708-.708l3 3a.5.5 0 0 1 0 .708l-3 3l-.708-.708L13.293 4H3.5A2.5 2.5 0 0 0 1 6.5V8H0V6.5A3.5 3.5 0 0 1 3.5 3h9.793ZM15 7v1.5a3.5 3.5 0 0 1-3.5 3.5H1.707l2.147 2.146l-.708.708l-3-3a.5.5 0 0 1 0-.707l3-3l.708.707L1.707 11H11.5A2.5 2.5 0 0 0 14 8.5V7h1Z"
                clip-rule="evenodd"
              ></path>
            </svg>
          </span>
        </div>
        <div class="flex flex-1"></div>
        <div class="">
          <div class="flex justify-end opacity-50 text-11">
            <span>{{ durationDisplay }}</span>
          </div>
        </div>
      </div>
      <div ref="wavecontainer" class="absolute inset-0"></div>
    </div>
  </div>
</template>
