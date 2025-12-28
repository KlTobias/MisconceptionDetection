<template>
  <div class="flex flex-col">
    <h2 class="text-2xl">💻 Code Editor</h2>
    <div ref="editorEl" class="w-full h-64 border rounded overflow-hidden" aria-label="Code editor" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as monaco from 'monaco-editor'
import { useThemeStore } from '../stores/theme'

const props = defineProps<{ modelValue?: string, highlightLines?: number[] | null }>()
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

  // apply initial highlights if provided
  if (props.highlightLines && props.highlightLines.length && editor) {
    applyHighlights(props.highlightLines)
  }
})

let currentDecorations: string[] = []

function applyHighlights(lines: number[] | null) {
  if (!editor) return
  if (!lines || !lines.length) {
    currentDecorations = editor.deltaDecorations(currentDecorations, [])
    return
  }

  const ranges = lines.map((ln) => ({
    range: new monaco.Range(ln, 1, ln, 1),
    options: { isWholeLine: true, className: 'md-line-highlight' }
  }))

  currentDecorations = editor.deltaDecorations(currentDecorations, ranges)
  // reveal first highlighted line for convenience
  try {
    editor.revealLineInCenter(lines[0])
  } catch (e) {
    // ignore
  }
}

watch(
  () => props.modelValue,
  (v) => {
    if (!editor) return
    const cur = editor.getValue()
    if (v !== cur) editor.setValue(v ?? '')
  }
)

watch(
  () => props.highlightLines,
  (v) => {
    if (!editor) return
    applyHighlights(v ?? null)
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
  // clear decorations
  try {
    editor?.deltaDecorations(currentDecorations, [])
  } catch (e) {
    // ignore
  }
  editor?.dispose()
})
</script>

<style scoped>
/* minimal styling left to tailwind classes in template */
</style>
