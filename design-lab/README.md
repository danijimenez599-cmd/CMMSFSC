# Laboratorio de Rediseño (Design Lab)

Este directorio es un espacio seguro para experimentar con el rediseño de la aplicación sin afectar la lógica de negocio ni la base de datos real.

## Estructura
- `RedesignApp.tsx`: Una versión simplificada del cascarón de la aplicación (Sidebar + Header + Content).
- `Components.tsx`: Copia de los componentes UI principales (`Button`, `Card`, `Modal`, etc.) para que puedas modificarlos aquí.
- `MockData.ts`: Datos de prueba para rellenar la interfaz.

## Cómo usarlo
Para ver tus cambios en el navegador mientras trabajas en este rediseño:

1. Abre `src/main.tsx`.
2. Comenta la importación de `App`:
   ```tsx
   // import App from './App';
   ```
3. Importa `RedesignApp` desde esta carpeta:
   ```tsx
   import App from '../design-lab/RedesignApp';
   ```
4. El servidor de desarrollo (Vite) recargará la página con tu nuevo diseño.

## Reglas de Oro
- **No importes nada de `src/store` o `src/modules`**: Este laboratorio debe ser puramente visual. Usa `MockData.ts` para todo.
- **Siéntete libre de romper cosas**: Todo lo que está en esta carpeta es una copia.
