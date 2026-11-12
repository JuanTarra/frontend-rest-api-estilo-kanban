# AGENTS.md - Frontend Guidelines & Rules

Este documento establece las reglas estrictas de arquitectura y desarrollo para la capa de cliente (Frontend) utilizando el enfoque de Desarrollo Basado en Especificaciones (SDD). Cualquier agente de IA que asista en este proyecto debe leer y respetar rigurosamente estas directrices.

## 1. Stack Tecnológico Fijo
* **Framework:** React 18+ (con Vite como bundler).
* **Enrutamiento:** React Router DOM v6+.
* **Cliente HTTP & Estado Asíncrono:** Axios (o TanStack Query según corresponda).
* **Formularios & Validaciones:** React Hook Form + Zod (o Yup).
* **Estilos & Temas:** Variables CSS (Custom Properties) obligatorias. **Prohibido hardcodear colores hexadecimales en los componentes.**

## 2. Estructura de Directorios Obligatoria
Respeta estrictamente la siguiente organización dentro de `src/`:
```text
src/
├── api/          # Funciones aisladas de llamada a los endpoints REST
├── components/   # Componentes reutilizables de UI (Button, Modal, Input, etc.)
├── features/     # Módulos por dominio (ej. boards, columns, tickets)
├── hooks/        # Custom hooks para lógica reusable (ej. useAuth, useFetch)
├── pages/        # Vistas asociadas a rutas de React Router
└── routes/       # Configuración de rutas de React Router DOM
```

## 3. Patrón de Componentes
* **Separación Estricta:** 
  * *Componentes Presentacionales ("Tontos"):* Solo reciben `props` y renderizan UI. No deben contener `useEffect` ni llamadas a la API.
  * *Contenedores / Páginas:* Manejan la lógica, las llamadas a servicios y el estado.

## 4. Formularios y Manejo de Errores
* **Validación:** Usar obligatoriamente validación en cliente con esquemas (Zod/Yup).
* **Mapeo de Errores del Servidor:** Los errores devueltos por el backend (ej. `400 Bad Request`) deben mapearse directamente a las alertas visuales de los inputs correspondientes sin recargar la página.
* **UX Feedback:** Todo formulario que ejecute una mutación (`POST`, `PATCH`, `DELETE`) debe deshabilitar su botón de envío (`disabled={isSubmitting}`) y mostrar un indicador visual (spinner) mientras la petición esté curso.

## 5. Límites Negativos (React Router)
* **NO utilices componentes `<Link>` para acciones de mutación** (crear, borrar, modificar datos). Utiliza navegación programática (`useNavigate`) únicamente **después** de que la mutación en la API haya sido exitosa.

## 6. Variables de Entorno
* El endpoint base de la API debe consumirse exclusivamente a través de variables de entorno de Vite: `import.meta.env.VITE_API_URL`.

## 7. Sistema de Temas (Light / Dark Mode)
* **Tokens Globales:** Utilizar propiedades CSS personalizadas (`--bg-primary`, `--text-primary`, `--accent-color`, etc.).
* **Persistencia:** La selección del usuario debe inyectar una clase global (ej. `dark`) en la etiqueta `<html>` o `<body>` y guardarse en `localStorage` para evitar parpadeos al recargar la página.