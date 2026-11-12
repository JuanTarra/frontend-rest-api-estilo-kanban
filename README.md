# DevBoard Frontend

Frontend de una aplicación Kanban para organizar proyectos mediante tableros, columnas y tickets. La interfaz permite crear y eliminar tableros, administrar columnas y tickets, establecer la prioridad y mover tarjetas entre columnas.

El proyecto sigue un enfoque de **Desarrollo Basado en Especificaciones (SDD)**: los contratos de la API, las reglas de validación y la arquitectura acordada guían la implementación.

## Stack tecnológico

- **React 18** para construir la interfaz.
- **Vite** como servidor de desarrollo y herramienta de compilación.
- **React Router DOM v6** para el enrutamiento de la SPA.
- **Axios** para las solicitudes HTTP al backend.
- **React Hook Form** y **Zod** para formularios y validación.
- **`@hello-pangea/dnd`** para arrastrar y soltar tickets entre columnas.
- **CSS con Custom Properties** para el tema visual Modern SaaS, con modos claro y oscuro.

## Arquitectura

La aplicación está organizada bajo `src/`, separando la lógica de integración, las vistas y los componentes de presentación:

```text
src/
├── api/          # Servicio REST, cliente Axios y datos/operaciones mock
├── components/   # Componentes de interfaz presentacionales y reutilizables
├── hooks/        # Hooks compartidos, incluido el manejo del tema
├── pages/        # Vistas/contenedores asociados a rutas
└── routes/       # Configuración de rutas de la SPA
```

- **`api/`** centraliza el acceso a los endpoints y permite usar el backend real o el store mock.
- **`components/`** contiene componentes presentacionales que reciben datos y callbacks mediante props; no realizan solicitudes HTTP.
- **`pages/`** contiene los contenedores que administran estado, formularios, interacciones y llamadas al servicio.
- **`routes/`** configura la navegación con React Router.

## Características principales

- **Tableros Kanban:** listado, creación y eliminación de tableros; administración de columnas y tickets.
- **Prioridades:** tickets con prioridad baja, media o alta, validada antes de enviar.
- **Drag and Drop:** mover tickets entre columnas arrastrando sus tarjetas.
- **Optimistic UI:** al mover un ticket entre columnas, la interfaz actualiza su posición inmediatamente. Si el servidor rechaza el cambio, se restaura la ubicación original y se informa el error mediante un toast.
- **Backend o mocking:** se puede ejecutar contra la API real o de forma aislada con datos sintéticos en memoria.
- **Tema claro/oscuro:** si no existe una preferencia guardada, se toma el tema del sistema operativo. La selección del usuario se aplica a `<html>` y se persiste en `localStorage`.

## Requisitos previos

- Node.js y npm instalados.
- Para trabajar con datos reales, el backend disponible en la URL configurada. El backend de desarrollo del proyecto utiliza `http://localhost:3000/api`.

## Instalación y configuración

1. **Clonar el repositorio.** Reemplaza `<URL_DEL_REPOSITORIO>` por la URL GitHub correspondiente:

   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd <CARPETA_DEL_REPOSITORIO>/Client
   ```

2. **Instalar las dependencias del frontend:**

   ```bash
   npm install
   ```

3. **Configurar la variable de entorno obligatoria.** Crea un archivo llamado `.env` en la raíz de `Client/`, al mismo nivel que `package.json`. Define `VITE_API_URL` con una de estas opciones:

   **Backend real:**

   ```dotenv
   VITE_API_URL=http://localhost:3000/api
   ```

   **Mock local, sin backend:**

   ```dotenv
   VITE_API_URL=mock
   ```

   El modo `mock` utiliza un store sintético en memoria. Las mutaciones realizadas en ese modo no persisten después de recargar la página. Si se configura una URL de API real, los errores de conexión de red activan el fallback mock; los errores HTTP devueltos por el backend se conservan y se muestran como errores.

   Vite expone al cliente las variables con prefijo `VITE_`; reinicia el servidor de desarrollo después de modificar `.env`. No incluyas credenciales o secretos en variables `VITE_`, porque se incorporan al bundle del navegador.

## Ejecución

Inicia el servidor de desarrollo desde la carpeta `Client/`:

```bash
npm run dev
```

Vite mostrará en la terminal la URL local para abrir la aplicación.

Para generar los archivos de producción:

```bash
npm run build
```

El resultado se genera en `Client/dist/`.
