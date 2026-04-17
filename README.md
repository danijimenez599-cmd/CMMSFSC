# APEX CMMS v2.2 — React + TypeScript + Tailwind + Supabase

Sistema de Gestión de Mantenimiento (CMMS) listo para producción.

## Stack

| Capa        | Tecnología                              |
|-------------|-----------------------------------------|
| UI          | React 18 + TypeScript                   |
| Estilos     | Tailwind CSS v3                         |
| Estado      | Zustand (localStorage → migra Supabase) |
| Base de datos | Supabase (PostgreSQL)                 |
| Auth        | Supabase Auth (próximo paso)            |
| Hosting     | Vercel                                  |
| Fechas      | date-fns                                |
| Build       | Vite 5                                  |

---

## Arranque local

```bash
# 1. Instalar dependencias
npm install

# 2. Crear .env.local (copiar de .env.example y completar)
cp .env.example .env.local
# → Edita .env.local con tus credenciales de Supabase

# 3. Correr en desarrollo
npm run dev
# → http://localhost:5173

# 4. Build de producción
npm run build
```

---

## Configurar Supabase (paso a paso)

### Paso 1 — Crear proyecto

1. Ir a [app.supabase.com](https://app.supabase.com)
2. **New project** → elegir nombre y región (más cercana: US East)
3. Esperar ~2 minutos a que el proyecto esté listo

### Paso 2 — Crear las tablas

1. En tu proyecto → **SQL Editor**
2. Copiar todo el contenido de `src/lib/schema.sql`
3. Pegar y ejecutar (**Run**)
4. Verás las tablas creadas en **Table Editor**

### Paso 3 — Obtener credenciales

1. **Settings → API**
2. Copiar **Project URL** → `VITE_SUPABASE_URL`
3. Copiar **anon public key** → `VITE_SUPABASE_ANON_KEY`

### Paso 4 — Crear .env.local

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Paso 5 — Verificar conexión

```bash
npm run dev
# La app carga con datos demo desde localStorage.
# Cuando integres Supabase completamente, los datos
# vendrán de la base de datos.
```

---

## Deploy en Vercel (paso a paso)

### Opción A — Desde GitHub (recomendado)

```bash
# 1. Inicializar repo git
git init
git add .
git commit -m "APEX CMMS v2.2 — inicial"

# 2. Crear repo en github.com y conectar
git remote add origin https://github.com/tuusuario/apex-cmms.git
git push -u origin main
```

3. Ir a [vercel.com](https://vercel.com) → **New Project**
4. Importar tu repo de GitHub
5. Vite se detecta automáticamente
6. **Environment Variables** → agregar:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
7. **Deploy** → en ~2 minutos tienes la URL

### Opción B — Deploy directo

```bash
npm install -g vercel
npm run build
vercel --prod
```

### Conectar dominio propio (GoDaddy / Cloudflare)

En Vercel → Settings → Domains → agregar tu dominio.
Vercel te indica los registros DNS a configurar.

---

## Estructura del proyecto

```
src/
├── lib/
│   ├── supabase.ts        ← Cliente Supabase tipado
│   ├── database.types.ts  ← Tipos del esquema SQL
│   ├── api.ts             ← TODAS las funciones de acceso a datos
│   └── schema.sql         ← Script SQL para crear tablas en Supabase
│
├── types/index.ts         ← Tipos del dominio (Asset, WorkOrder, etc.)
├── data/defaults.ts       ← Datos demo
├── store/index.ts         ← Zustand store con toda la lógica de negocio
├── hooks/useToast.ts
│
├── components/
│   ├── ui/index.tsx       ← Badge, Button, Modal, Input...
│   ├── layout/            ← Sidebar, Topbar
│   ├── dashboard/         ← Dashboard, Indicators (KPIs)
│   ├── assets/            ← AssetTree
│   ├── preventivo/        ← PlansView
│   ├── schedule/          ← Schedule (calendario)
│   ├── workorders/        ← WorkOrders (3 col + detalle)
│   └── inventory/         ← Inventory
│
├── App.tsx
└── main.tsx
```

---

## Integrar Supabase al store (guía de migración)

El archivo `src/lib/api.ts` tiene todas las funciones listas.
Para conectar el store a Supabase, reemplaza las mutaciones locales:

### Ejemplo — Guardar activo

```typescript
// ANTES (solo localStorage)
saveAsset: (data) => set((s) => {
  db.assets = db.assets.map(a => a.id === data.id ? {...a, ...data} : a)
  return { db }
})

// DESPUÉS (Supabase + actualizar estado local)
saveAsset: async (data) => {
  const saved = await api.assets.upsert(data)   // ← escribe en Supabase
  set((s) => ({
    db: {
      ...s.db,
      assets: s.db.assets.map(a => a.id === saved.id ? saved : a)
    }
  }))
}
```

### Carga inicial de datos

En `src/main.tsx`, antes de renderizar:

```typescript
// main.tsx
import { api } from '@/lib/api'
import { useStore } from '@/store'

async function bootstrap() {
  try {
    const data = await api.loadAll()    // ← carga todo desde Supabase
    useStore.setState(s => ({
      db: { ...s.db, ...data }
    }))
  } catch (e) {
    console.warn('Supabase no disponible, usando datos locales', e)
  }
}

bootstrap().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode><App /></StrictMode>
  )
})
```

---

## Lógica de negocio destacada (store/index.ts)

| Función | Qué hace |
|---------|---------|
| `generateWO(apId)` | Genera OT preventiva, bloquea si ya existe una activa, crea snapshot de checklist |
| `updateWOStatus(COMPLETED)` | Recalcula `nextDueDate` del plan usando `dueDate` de la OT como baseline |
| `saveWO` (editar dueDate) | Two-way sync: actualiza `nextDueDate` del `assetPlan` asociado |
| `toggleWoTask` | Marca/desmarca actividad del checklist de la OT |
| `handleCompleteClicked` | Bloquea completar si hay tareas pendientes en el checklist |

---

## KPIs implementados (Indicators.tsx)

- **MTTR** — Tiempo Medio de Reparación (correctivos)
- **MTBF** — Tiempo Medio Entre Fallos
- **Disponibilidad** — MTBF / (MTBF + MTTR) × 100
- **Backlog** — OTs abiertas + asignadas + en progreso
- **Cumplimiento PM** — preventivos completados / generados × 100

Con filtros por activo (y toda su jerarquía de descendientes) y por fecha de inicio.

---

## Próximos pasos sugeridos

```
✅ Fase 1 — Ya hecho:
   - React + TS + Tailwind + Zustand
   - 7 vistas completas
   - KPIs con MTTR/MTBF/Disponibilidad
   - Checklist de OTs con bloqueo
   - Calendario semanal/mensual
   - Persistencia localStorage

⬜ Fase 2 — Supabase:
   - Ejecutar schema.sql en Supabase
   - Conectar api.ts al store
   - Login con Supabase Auth
   - Row Level Security por usuario

⬜ Fase 3 — Producción:
   - Roles (admin ve todo, técnico solo sus OTs)
   - Notificaciones por email (Supabase Edge Functions)
   - Upload de fotos a Supabase Storage
   - PWA / offline para técnicos en campo
   - Exportar OTs a PDF
```
