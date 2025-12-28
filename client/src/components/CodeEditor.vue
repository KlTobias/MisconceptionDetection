<template>
  <h2 class="text-2xl">💻 Code Editor</h2>
  <div ref="editorEl" class="w-full h-64 border rounded overflow-hidden" aria-label="Code editor" />
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as monaco from 'monaco-editor'
import { useThemeStore } from '../stores/theme'

const props = defineProps<{ modelValue?: string }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>()

const editorEl = ref<HTMLDivElement | null>(null)
let editor: monaco.editor.IStandaloneCodeEditor | null = null

const themeStore = useThemeStore()

onMounted(() => {
  const initial = props.modelValue ?? ''
  const isDark = themeStore.theme === 'dark'

  editor = monaco.editor.create(editorEl.value!, {
    value: initial,
    language: 'java',
    theme: isDark ? 'vs-dark' : 'vs',
    lineNumbers: 'on',
    minimap: { enabled: false },
    automaticLayout: true,
  })

  editor.onDidChangeModelContent(() => {
    emit('update:modelValue', editor!.getValue())
  })
})

watch(
  () => props.modelValue,
  (v) => {
    if (!editor) return
    const cur = editor.getValue()
    if (v !== cur) editor.setValue(v ?? '')
  }
)

// react to theme changes from the store
watch(
  () => themeStore.theme,
  (t) => {
    monaco.editor.setTheme(t === 'dark' ? 'vs-dark' : 'vs')
  }
)

onBeforeUnmount(() => {
  editor?.dispose()
})
</script>

<style scoped>
/* minimal styling left to tailwind classes in template */
</style>
