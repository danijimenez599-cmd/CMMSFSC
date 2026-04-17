import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL  as string
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    '❌ Faltan variables VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.\n' +
    'Crea un archivo .env.local basado en .env.example'
  )
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    persistSession:    true,
    autoRefreshToken:  true,
    detectSessionInUrl: true,
  },
})

// ── Helper: obtener usuario actual de Supabase ──────────────────
export async function getCurrentSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}
