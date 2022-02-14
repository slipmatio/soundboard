<script setup lang="ts">
const appVersion = import.meta.env.VITE_APP_VERSION
const versions = window.versions
</script>
<template>
  <h2>Template v{{ appVersion }}</h2>

  <h2 id="versions">Dependencies</h2>
  <div>
    <ul aria-labelledby="versions">
      <li v-for="(version, lib) in versions" :key="lib">
        <strong>{{ lib }}</strong
        >: v{{ version }}
      </li>
    </ul>
  </div>
</template>
