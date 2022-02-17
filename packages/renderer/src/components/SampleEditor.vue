<script setup lang="ts">
import { computed, toRaw, ref } from 'vue'
import { useStore } from '@/store'
import { ElectronMidi } from '@/util/electronMidi'
import type { DecodedMidiMessage } from '@/util/electronMidi'

const store = useStore()
const mode = computed(() => store.ui.mode)
const sample = computed(() => store.getSelectedSample)
const midiData = ref<DecodedMidiMessage>()
const learningMidi = ref(false)

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

const midi = new ElectronMidi({ debug: false })
midi.onMidiOnMessage = (msg) => {
  console.log('midi on', msg)
}

function learnMidi() {
  console.log('learnMidi')
  learningMidi.value = true

  midi.learnMidiOn().then((msg) => {
    console.log('learned midi! ', msg)
    // console.log(`note ${msg.note} on for channel ${msg.channel}}`)
    if (sample.value && sample.value.metadata) {
      console.log('updated sample data')
      sample.value.metadata.midiChannel = msg.channel
      sample.value.metadata.midiNote = msg.note
      updateSample()
    }
    midiData.value = msg
    learningMidi.value = false
  })
}
</script>
<template>
  <div
    class="bg-black/20 fixed top-[52px] bottom-0 right-0 w-[300px] px-3 py-3 flex flex-col"
  >
    <div v-if="sample && mode === 'edit'" class="flex flex-col flex-1">
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
                id="mode-oneshot"
                name="oneshot"
                value="oneshot"
                type="radio"
                class="w-5 h-5 border-gray-300 text-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-700"
                v-model="sample.mode"
                @change="updateSample"
              />
              <label
                for="push-everything"
                class="block ml-3 font-medium text-12"
              >
                One shot
              </label>
            </div>
            <div class="flex items-center">
              <input
                id="mode-loop"
                name="loop"
                value="loop"
                type="radio"
                class="w-5 h-5 border-gray-300 text-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-700"
                v-model="sample.mode"
                @change="updateSample"
              />
              <label for="push-email" class="block ml-3 font-medium text-12">
                Loop
              </label>
            </div>
          </div>
        </div>

        <div class="">
          <label
            for="name"
            class="flex flex-row justify-between text-sm font-light"
          >
            Volume
            <span class="opacity-50 text-11">{{ sample.volume }} %</span>
          </label>
          <div class="mt-1">
            <input
              id="volume"
              name="volume"
              type="range"
              min="0"
              max="100"
              class="block w-full px-2 py-1 text-gray-100 border-b rounded-sm shadow-sm text-12 border-white/20 focus:outline-none focus:ring-2 bg-white/10"
              v-model="sample.volume"
              @change="updateSample"
            />
          </div>
        </div>

        <div class="">
          <label class="flex flex-row justify-between text-sm font-light">
            Shortcut
          </label>
          <div class="mt-1">
            <div v-if="sample.metadata?.midiChannel !== undefined">
              <div class="mt-1 text-sm">
                <div class="opacity-50">
                  <span>Channel: </span>
                  <span>{{ sample.metadata.midiChannel }}</span>
                </div>
                <div class="opacity-50">
                  <span>Note: </span>
                  <span>{{ sample.metadata.midiNote }}</span>
                </div>
              </div>
            </div>
            <div v-else>
              <div class="mt-1 text-sm">
                <div class="opacity-50">
                  <span>No Shortcut set</span>
                </div>
              </div>
            </div>

            <button
              class="mt-4 btn editor focus:outline-none focus:ring-2"
              @click="learnMidi"
            >
              Learn MIDI
            </button>
          </div>
        </div>

        <div class="">
          <p class="block text-sm font-light">Metadata</p>
          <div class="mt-1 text-sm">
            <div class="opacity-50">
              <span>Duration: </span>
              <span>{{ parseInt(sample.metadata?.duration) }}s</span>
            </div>
          </div>
        </div>
      </div>

      <div class="flex-1">&nbsp;</div>

      <hr class="hidden my-8 border border-white/10" />

      <button
        class="btn editor focus:outline-none focus:ring-2"
        @click="confirmDelete"
      >
        Delete sample
      </button>

      <div class="py-4">&nbsp;</div>
    </div>
    <div v-else class="flex items-center justify-center flex-1">
      <span class="opacity-50">Select a sample to edit.</span>
    </div>
  </div>
</template>
