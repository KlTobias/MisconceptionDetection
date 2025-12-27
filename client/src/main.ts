import { createApp } from 'vue'
import App from './App.vue'
import './styles/main.css'

const setInitialTheme = () => {
  const saved = localStorage.getItem('theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const isDark = saved ? saved === 'dark' : prefersDark
  document.documentElement.classList.toggle('dark', isDark)
}
setInitialTheme()

createApp(App).mount('#app')
