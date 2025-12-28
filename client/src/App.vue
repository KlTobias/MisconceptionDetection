<template>
  <div class="min-h-screen p-6">
    <div class="max-w-5xl mx-auto">
      <header class="flex items-center mb-2">
        <h1 class="text-2xl">Misconception Detector for Processing (Java)</h1>
        <ThemeToggle />
      </header>

      <div class="mb-6">
        <a href="https://tha.de/misconceptions/" class="underline">List of all Misconceptions</a>
      </div>

      <div class="flex gap-8 flex-col md:flex-row">
        <CodeEditor v-model="code" class="w-full md:w-3/5" />
        <DetectedMisconceptions class="w-full md:w-2/5" @analyze="analyze"/>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ThemeToggle from './components/ThemeToggle.vue'
import CodeEditor from './components/CodeEditor.vue'
import DetectedMisconceptions from './components/DetectedMisconceptions.vue'
import { ANALYZINGSTATE, useResponseStore } from './stores/response' 

const responseStore = useResponseStore()
const code = ref('')
const result = ref('')

const analyze = async () => {
  if (code.value.trim() === '') {
    alert('Please enter some code to analyze.')
    return
  }
  console.log('Analyzing code:', code.value)
result.value = 'Analyzing...'
  responseStore.state = ANALYZINGSTATE.ANALYZING
  try {
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code.value })
    })
    const data = await res.json()
    result.value = JSON.stringify(data, null, 2)
    responseStore.state = ANALYZINGSTATE.FINISHED
  } catch (err: unknown) {
    result.value = 'Error: ' + String(err)
    responseStore.state = ANALYZINGSTATE.READY
  }
}
</script>