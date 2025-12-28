import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Misconception } from '../../../shared/src/types'

export const ANALYZINGSTATE = {
  READY: 'READY',
  ANALYZING: 'ANALYZING',
  FINISHED: 'FINISHED'
}

export const useResponseStore = defineStore('response', () => {
  const response = ref<Misconception[] | null>(null)
  const state = ref<string>(ANALYZINGSTATE.READY)

  return { response, state }
})
