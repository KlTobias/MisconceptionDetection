<template>
  <div class="min-h-screen p-6 bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
    <div class="max-w-4xl mx-auto">
      <header class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-semibold">Code Analyzer</h1>
        <ThemeToggle />
      </header>

      <textarea v-model="code" rows="12" class="w-full p-3 border rounded bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100" placeholder="Paste code here"></textarea>

      <div class="mt-3">
        <button @click="analyze" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Analyze</button>
      </div>

      <section v-if="result" class="mt-6">
        <h2 class="text-xl font-medium mb-2">Result</h2>
        <pre class="whitespace-pre-wrap bg-gray-100 dark:bg-gray-800 p-3 rounded">{{ result }}</pre>
      </section>
    </div>
  </div>
</template>

<script lang="ts">
import { ref } from 'vue'
import ThemeToggle from './components/ThemeToggle.vue'

export default {
  components: { ThemeToggle },
  setup() {
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
      } catch (err) {
        result.value = 'Error: ' + String(err)
      }
    }

    return { code, result, analyze }
  }
}
</script>