// ================================================================
// APEX CMMS — Tipos de base de datos Supabase
// Versión simplificada: solo se usa para createClient<Database>()
// Los tipos de insert/update se manejan con `as any` en api.ts
// para evitar el problema de `never` con PostgrestVersion "12".
// ================================================================

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      users:           { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      locations:       { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      assets:          { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      work_orders:     { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      wo_comments:     { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      wo_tasks:        { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      pm_plans:        { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      pm_tasks:        { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      asset_plans:     { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      inventory_items: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      part_usages:     { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
    }
    Views: {
      v_work_orders: { Row: Record<string, unknown> }
    }
    Functions: Record<string, never>
    Enums:     Record<string, never>
  }
}
