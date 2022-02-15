<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from '@/store'
import SampleCard from '@/components/SampleCard.vue'

const store = useStore()
const samples = computed(() => store.samples)
</script>

<template>
  <div class="flex items-start flex-1 mt-[52px] px-4 py-3">
    <div class="flex flex-wrap">
      <SampleCard :sample="sample" v-for="sample in samples" :key="sample.id" />
    </div>
  </div>
</template>
