<template>
  <nav>
    <router-link to="/">Home </router-link>
    <span> | </span>
    <router-link to="/about">About</router-link>
  </nav>
</template>

<style scoped>
nav {
  display: flex;
  gap: 1em;
  justify-content: center;
}
</style>
