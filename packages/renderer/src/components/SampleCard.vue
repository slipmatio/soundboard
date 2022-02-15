<script setup lang="ts">
import type { Sample } from 'root/types'

defineProps<{
  sample: Sample
}>()
</script>
<template>
  <h3>{{ sample.name }}</h3>

  <p class="text-xs">{{ sample.path }}</p>
</template>
