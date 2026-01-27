import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './styles/main.css'

import { useThemeStore } from './stores/theme'

const pinia = createPinia()
const app = createApp(App)
app.use(pinia)

// initialize theme via the store (reads localStorage and prefers-color-scheme)
const themeStore = useThemeStore()
themeStore.init()

app.mount('#app')
