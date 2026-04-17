import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { useStore } from '@/store'

// ── Carga inicial desde Supabase ──────────────────────────────────
// Se ejecuta una sola vez antes de montar la app.
// Si Supabase no responde, usa los datos locales de localStorage.
async function bootstrap() {
  await useStore.getState().loadFromSupabase()
}

bootstrap().finally(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  )
})
