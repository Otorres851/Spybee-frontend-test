<img width="1536" height="1024" alt="Image" src="https://github.com/user-attachments/assets/1a84285c-3132-40b2-ab80-e3854dd59eae" />

# 🐝 Spybee Incident Management Platform

Sistema de gestión de incidencias para proyectos de construcción desarrollado como prueba técnica para el cargo de **Frontend Developer en Spybee**.

La aplicación permite crear incidencias georreferenciadas sobre un mapa interactivo, gestionar su información y visualizar métricas operativas mediante dashboards dinámicos en tiempo real.

---

## 🌐 Demo

### Aplicación desplegada

👉 https://spybee-frontend-test-five.vercel.app/login

### Repositorio

👉 https://github.com/Otorres851/spybee-frontend-test

---

## ✨ Características

### Gestión de incidencias

- Creación de incidencias sobre mapa interactivo.
- Geolocalización mediante Mapbox GL.
- Visualización de incidencias en tiempo real.
- Marcadores dinámicos.
- Validación completa de formularios.
- Adjuntos con vista previa.
- Soporte para múltiples imágenes (máximo 5).
- Gestión de prioridades y estados.
- Persistencia local de incidencias.

### Dashboard

- Dashboard basado en `incidents.mock.json`.
- Indicadores principales (KPIs).
- Tendencia de incidencias creadas y cerradas.
- Distribución por prioridad.
- Distribución por estado.
- Calendario de actividad.
- Filtros avanzados.
- Actualización dinámica de gráficos.

### Experiencia de usuario

- Diseño responsive.
- Dark Mode / Light Mode.
- Internacionalización Español / Inglés.
- Skeleton Loading States.
- Estados vacíos y de error.
- Componentes reutilizables.

### Mapa

- Mapbox GL.
- Heatmap geográfico.
- Navegación interactiva.
- Comparación BIM.
- Últimas ubicaciones visitadas.
- Modo 2D / 3D.
- Controles interactivos.

---

## 🛠 Tecnologías Utilizadas

- React
- Next.js
- TypeScript
- Zustand
- SCSS Modules (estilos principales)
- Tailwind CSS (utilidades y sistema de diseño)
- Mapbox GL
- i18next
- react-i18next
- Jest

---

## 🧪 Testing

Se incluye una prueba unitaria de ejemplo utilizando Jest para validar lógica de negocio relacionada con el cálculo de KPIs de incidencias.

Tecnologías:

- Jest

Ejecutar pruebas:

```bash
pnpm test
```

---

## 🚀 Instalación Local

```bash
git clone https://github.com/Otorres851/spybee-frontend-test.git
cd spybee-frontend-test
```

Instalar dependencias:

```bash
pnpm install
```

Ejecutar entorno de desarrollo:

```bash
pnpm dev
```

Aplicación disponible en:

```txt
http://localhost:3000
```

---

## 📦 Scripts

```bash
pnpm dev
pnpm lint
pnpm build
pnpm start
pnpm test
```

---

## 🔐 Variables de Entorno

Crear un archivo `.env.local`:

```env
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
NEXT_PUBLIC_INCIDENTS_MOCK_URL=your_incidents_mock_url
```

| Variable                       | Descripción                         |
| ------------------------------ | ----------------------------------- |
| NEXT_PUBLIC_MAPBOX_TOKEN       | Token público de Mapbox GL          |
| NEXT_PUBLIC_INCIDENTS_MOCK_URL | URL del archivo incidents.mock.json |

### .env.example

```env
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
NEXT_PUBLIC_INCIDENTS_MOCK_URL=your_incidents_mock_url
```

---

## 🌍 Internacionalización

Idiomas soportados:

- 🇪🇸 Español
- 🇺🇸 English

---

## 📱 Responsive Design

Optimizado para:

- Mobile
- Tablet
- Desktop

---

## ♿ Accesibilidad

- HTML semántico.
- Navegación mediante teclado.
- Etiquetas ARIA.
- Estados visibles de foco.
- Contraste adecuado.

---

## 📁 Estructura del Proyecto

```txt
src
├── api
├── assets
├── components
├── context
├── data
├── hooks
├── i18n
├── services
├── stores
├── styles
├── types
└── utils
```

---

## 🚀 Funcionalidades Extra Implementadas

- Dark / Light Mode.
- Internacionalización ES / EN.
- Skeleton Loading States.
- Login Mock Authentication.
- Dashboard interactivo.
- Comparación BIM.
- Heatmap.
- Últimas ubicaciones visitadas.
- Persistencia de filtros.
- Arquitectura basada en servicios.

---

## ✅ Validación

```bash
pnpm lint
pnpm build
pnpm test
```

---

## 📄 Licencia

Proyecto desarrollado exclusivamente con fines de evaluación técnica para Spybee.
