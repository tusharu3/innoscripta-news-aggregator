import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@/app/App'
// Poppins (innoscripta's typeface), self-hosted: no third-party font request, works offline in Docker.
// Only the latin subset and the four weights in use are bundled.
import '@fontsource/poppins/latin-400.css'
import '@fontsource/poppins/latin-500.css'
import '@fontsource/poppins/latin-600.css'
import '@fontsource/poppins/latin-700.css'
import '@/styles/main.scss'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Core Web Vitals in the console: always in dev, in production only with `?vitals` (separate lazy chunk).
if (import.meta.env.DEV || new URLSearchParams(window.location.search).has('vitals')) {
  void import('@/app/reportWebVitals').then(({ reportWebVitals }) => reportWebVitals())
}
