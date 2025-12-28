<template>
    <div @click="toggle" role="button" :aria-expanded="expanded"
        class="flex p-3 rounded mb-3 flex-col cursor-pointer bg-[rgb(var(--entry))] hover:bg-[rgb(var(--tertiary))]">


        <div class="flex justify-between items-center mb-2">
            <h3 class="font-semibold text-lg">{{ misconception.name }}</h3>
            <a :href="misconceptionUrl" target="_blank" rel="noopener noreferrer" class="ml-2 text-[rgb(var(--secondary))]
           hover:text-[rgb(var(--primary))]
           transition-colors" aria-label="Open misconception in new tab">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M18 13v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 3h6m0 0v6m0-6L10 14" />
                </svg>
            </a>
        </div>
        <p style="color: rgb(var(--secondary))">lines: {{ misconception.lines.join(', ') }}</p>


        <transition name="fade">
            <p v-if="expanded" style="color: rgb(var(--primary))">{{ misconception.explanation }}</p>
        </transition>

        <div class="flex justify-end">
            <button @click.stop="toggle" class="ml-3 text-lg items-end">
                <span v-if="expanded"><svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 self-end" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                    </svg>
                </span>
                <span v-else><svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>

                </span>
            </button>
        </div>

    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Misconception as MisconceptionType } from '../../../shared/src/types'

const props = defineProps<{ misconception: MisconceptionType }>()
const emit = defineEmits<{ (e: 'highlight-lines', lines: number[] | null): void }>()

const expanded = ref(false)
const toggle = () => {
    expanded.value = !expanded.value
    emit('highlight-lines', expanded.value ? props.misconception.lines : null)
}

const misconceptionUrl = computed(() =>
  `https://tha.de/misconceptions/misconceptions/${props.misconception.name
    .toLowerCase()
    .replace(/_/g, '-')}.html`
)
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 150ms ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
