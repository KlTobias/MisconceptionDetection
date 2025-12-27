<template>
  <div class="min-h-screen p-6">
    <div class="max-w-4xl mx-auto">
      <header class="flex items-center mb-2">
        <h1 class="text-2xl">Misconception Detector for Processing (Java)</h1>
        <ThemeToggle />
      </header>

      <div class="mb-6">
        <a href="https://tha.de/misconceptions/" class="underline">List of all Misconceptions</a>
      </div>

      <textarea v-model="code" rows="12" class="w-full p-3 border rounded entry-bg"
        placeholder="Paste code here"></textarea>

      <div class="mt-3">
        <button @click="analyze" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Analyze</button>
      </div>

      <section v-if="result" class="mt-6">
        <h2 class="text-xl font-medium mb-2">Result</h2>
        <pre class="whitespace-pre-wrap code-bg p-3 rounded">{{ result }}</pre>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ThemeToggle from './components/ThemeToggle.vue'

const code = ref('')
const result = ref('')

const analyze = async () => {
  result.value = 'Analyzing...'
  try {
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code.value, language: 'auto' })
    })
    const data = await res.json()
    result.value = JSON.stringify(data, null, 2)
  } catch (err: unknown) {
    result.value = 'Error: ' + String(err)
  }
}
</script>