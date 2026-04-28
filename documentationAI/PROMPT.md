# Instrucciones de Contexto para Agentes de IA

Si eres un LLM / Agente de IA trabajando en este repositorio, **debes seguir este flujo de trabajo obligatoriamente** para minimizar el uso de tokens, maximizar tu precisión y mantener la integridad del sistema:

### 1. Punto de Entrada Obligatorio
Antes de inspeccionar el código fuente o hacer cualquier suposición, **debes leer el archivo `00_TRUNK.md`**.
El TRUNK contiene:
- Las reglas de integridad críticas de la base de datos (Soft deletes, Snapshots, Restricciones).
- La arquitectura general del estado (Zustand).
- El índice de los módulos del sistema.

### 2. Navegación por Módulos
En lugar de escanear directorios aleatoriamente, utiliza el Índice del TRUNK para identificar qué módulo(s) necesitas tocar para la tarea del usuario.
Ve al directorio `modules/` dentro de la documentación y lee el archivo markdown correspondiente a ese módulo (ej. `modules/ASSETS.md` o `modules/WORK_ORDERS.md`).

### 3. Inspección Dirigida
El documento del módulo te indicará exactamente qué archivos TypeScript/React conforman ese módulo y cómo interactúan con el Store y la Base de Datos.
Usa esta información para leer **solo** los archivos fuente estrictamente necesarios.

### Resumen del Flujo de la IA:
`PROMPT.md` (Estás aquí) -> `00_TRUNK.md` -> `modules/EL_MODULO_RELEVANTE.md` -> `src/modules/...` (Código Fuente)

---
**¿Por qué este enfoque?**
Este sistema es un software industrial complejo (CMMS). Ignorar la documentación resultará en código que viola las reglas de negocio (ej. borrado en cascada en lugar de soft-delete, romper auditorías, modificar OTs cerradas, etc.). El conocimiento está modularizado para que cargues en tu contexto únicamente lo que necesitas.
