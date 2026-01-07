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
        <CodeEditor v-model="code" :highlightLines="highlightLines" class="w-full md:w-3/5" />
        <DetectedMisconceptions class="w-full md:w-2/5" @analyze="analyze" @highlight-lines="handleHighlightLines"/>
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
import { Misconception } from '../../shared/src/types'

const responseStore = useResponseStore()
const code = ref('')
const result = ref('')
const highlightLines = ref<number[] | null>(null)

const handleHighlightLines = (lines: number[] | null) => {
  highlightLines.value = lines && lines.length ? lines : null
}

const useMock = true // set to true to use the built-in mock

const analyze = async () => {
  if (code.value.trim() === '') {
    alert('Please enter some code to analyze.')
    return
  }

  responseStore.state = ANALYZINGSTATE.ANALYZING
  try {
    const body: any = { code: code.value }
    if (useMock) body.mock = true

    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    const data = await res.json()

    // data.misconceptions is the server response (mapped from model output)
    const mapped: Misconception[] =
      Array.isArray(data.misconceptions)
        ? data.misconceptions.map((m: any) => ({
            name: String(m.id ?? m.name ?? 'unknown'),
            lines: Array.isArray(m.lines) ? m.lines.map((n: any) => Number(n)) : [],
            explanation: String(m.explanation ?? '')
          }))
        : []

    responseStore.response = mapped
    responseStore.state = ANALYZINGSTATE.FINISHED
    console.log(responseStore.response)
  } catch (err: unknown) {
    responseStore.state = ANALYZINGSTATE.READY
    console.error(err)
  }
}

/* const analyze = async () => {
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
} */
</script>