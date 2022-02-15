<template>
  <component :is="uiMode === 'play' ? PlayMode : EditMode"></component>
</template>
<script async setup lang="ts">
import { computed } from 'vue'

import PlayMode from '@/pages/PlayMode.vue'
import EditMode from '@/pages/EditMode.vue'

import { useStore } from '@/store'

const store = useStore()
const uiMode = computed(() => store.ui.mode)

// defineExpose({
//   PlayMode,
//   EditMode,
// })
</script>
