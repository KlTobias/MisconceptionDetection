import { createApp } from 'vue'
import App from './App.vue'
import './styles/main.css'

const setInitialTheme = () => {
  const saved = localStorage.getItem('theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const theme = saved ? saved : (prefersDark ? 'dark' : 'light')
  // set a data attribute so we can support multiple themes in the future
  document.documentElement.setAttribute('data-theme', theme)
  // keep Tailwind 'dark:' utilities working by syncing the class
  document.documentElement.classList.toggle('dark', theme === 'dark')
}
setInitialTheme()

createApp(App).mount('#app')
