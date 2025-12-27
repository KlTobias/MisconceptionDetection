<template>
  <button @click="toggle" :aria-pressed="isDark" class="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700" :title="isDark ? 'Switch to light' : 'Switch to dark'">
    <span v-if="isDark">🌙</span>
    <span v-else>☀️</span>
  </button>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const isDark = ref(false)

const sync = () => {
  isDark.value = document.documentElement.classList.contains('dark')
}

const toggle = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

onMounted(() => {
  sync()
})
</script>
