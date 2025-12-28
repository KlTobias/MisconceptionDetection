<template>
    <div class="flex flex-col">
        <h2 class="text-2xl">🔎 Detected Misconceptions</h2>
              <div class="mt-3" v-if="responseStore.state === ANALYZINGSTATE.READY">
        <button @click="analyze" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Analyze</button>
      </div>
    </div>
</template>

<script setup lang="ts">
import { ANALYZINGSTATE, useResponseStore } from '../stores/response';

const emit = defineEmits(['analyze']);
const responseStore = useResponseStore();

const analyze = () => {
  emit('analyze')
}
</script>