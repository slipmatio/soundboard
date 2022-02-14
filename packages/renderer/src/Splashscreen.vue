<template>
  <Transition>
    <div v-if="isVisible" clasS="absolute inset-0">
      <div class="flex items-center justify-center h-full bg-black">
        <img
          src="/assets/slipmat_logo.png"
          class="w-[380px] h-[380px] -mt-[100px]"
        />
      </div>
      <LoadingScreen
        :messages="messages"
        class="absolute inset-x-0 bottom-0 px-2 mt-4 overflow-y-scroll h-[80px] xsmall mb-4 mx-4 text-gray-100"
      />
      <h2
        class="absolute inset-x-0 bottom-[100px] text-center text-xs font-semibold text-gray-100"
      >
        Loading...
      </h2>
    </div>
  </Transition>
</template>

<script async setup lang="ts">
import { ref } from 'vue'
import LoadingScreen from './components/LoadingScreen.vue'
import type { LogItem } from 'mainpkg/types'

const messages = ref<LogItem[]>([])
const isVisible = ref(true)

window.api.receive('logMessage', (message: LogItem) => {
  console.log('message', message)
  messages.value.push(message)
})

window.api.receive('initDone', async (done: boolean) => {
  console.log('initDone', done)
  // isVisible.value = false
})
</script>

<style>
::-webkit-scrollbar {
  display: none;
}

* {
  -webkit-user-select: none;
  -webkit-app-region: drag;
}

.xsmall {
  font-size: 10px !important;
}

.v-enter-active,
.v-leave-active {
  transition: opacity 0.4s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
