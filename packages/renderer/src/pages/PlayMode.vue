<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from '@/store'

const store = useStore()
const samples = computed(() => store.samples)
</script>

<template>
  <div class="flex items-start flex-1 mt-[52px] px-4 py-3">
    <div>
      <ul>
        <li v-for="sample in samples" :key="sample.id">
          {{ sample.name }}
        </li>
      </ul>
    </div>
  </div>
</template>
