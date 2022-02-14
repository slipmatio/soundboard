<template>
  <h1 class="text-7xl font-bold underline">Hello world!</h1>

  <p>Template version v{{ version }}</p>

  <p>
    For a guide and recipes on how to configure / customize this project,<br />
    check out the
    <a
      href="https://github.com/Uninen/electron-vite-python"
      rel="noopener"
      target="_blank"
      >velectron-vite-python documentation</a
    >.
  </p>
</template>

<script setup lang="ts">
const version = import.meta.env.VITE_APP_VERSION
</script>
