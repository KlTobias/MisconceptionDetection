<template>
  <div class="flex flex-col">
    <h2 class="text-2xl">🔎 Detected Misconceptions</h2>

    <div class="mt-3" v-if="responseStore.state === ANALYZINGSTATE.READY">
      <button @click="analyze" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Analyze</button>
    </div>

    <div class="mt-3" v-else-if="responseStore.state === ANALYZINGSTATE.ANALYZING">
      <p>Analyzing...</p>
    </div>

    <div class="mt-3" v-else-if="responseStore.state === ANALYZINGSTATE.FINISHED">
      <div v-if="responseStore.response && responseStore.response.length">
        <Misconception
          v-for="(m, idx) in responseStore.response"
          :key="m.name + '-' + idx"
          :misconception="m"
          @highlight-lines="onHighlightLines"
        />
      </div>
      <div v-else class="text-gray-600">No misconceptions found.</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Misconception from './Misconception.vue'
import { ANALYZINGSTATE, useResponseStore } from '../stores/response';

const emit = defineEmits(['analyze', 'highlight-lines']);
const responseStore = useResponseStore();

const analyze = () => {
  emit('analyze')
}

const onHighlightLines = (lines: number[] | null) => {
  emit('highlight-lines', lines)
}
</script>