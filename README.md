# SeñaViva LSC

Plataforma web interactiva y gamificada para aprender, practicar y memorizar el vocabulario de **Lengua de Señas Colombiana (LSC)** a lo largo de **11 unidades** y **406 señas ilustradas**.

---

## Características principales

### 1. Lecciones y Diccionario Visual (`Lecciones`)
- **11 unidades temáticas** con barra de progreso individual, vista previa ilustrada y acceso a las guías PDF originales.
- **Buscador global instantáneo** por palabra, categoría o parámetro desde la barra superior.
- **Filtros por lección y estado** (`Todas`, `Por repasar`, `Aprendidas`) con modal ampliado (*lightbox*) para inspeccionar cada ilustración en detalle.

### 2. Flashcards 3D con 4 Parámetros LSC (`Flashcards`)
- Tarjetas interactivas reversibles:
  - **Frente**: ilustración responsiva de la seña, palabra y estado de dominio.
  - **Reverso**: miniatura de referencia, **4 parámetros de la LSC** (*forma de la mano*, *ubicación espacial*, *movimiento* y *expresión facial / orientación*), regla mnemotécnica y consejo gramatical de la unidad.
- Marcado rápido de progreso (`Dominada` +15 XP / `Repasar pronto` +5 XP) y atajos de teclado (`Espacio` para girar, `←` / `→` para navegar).

### 3. Reto Relámpago de 2 Minutos (`Reto Relámpago`)
- Rondas cronometradas de **120 segundos** enfocadas en identificación visual:
  - **Imagen → Palabra** (con ocultamiento de la etiqueta inferior de la ilustración antes de responder).
  - **Palabra → Imagen** en cuadrícula 2×2.
  - Preguntas de parámetros visuales y cultura sorda.
- **Modo aleatorio global (`Lecciones 1–11`)**: mezcla señas de todas las unidades en orden intercalado y oculta la unidad durante la pregunta para entrenar la memoria a largo plazo.
- Sistema de rachas/combos, registro automático de fallos para la cola de repaso y resumen visual al finalizar.

### 4. Constructor de Sintaxis LSC (`Sintaxis`)
- Ejercicios interactivos con fichas ilustradas para ordenar frases respetando la gramática propia de la LSC (ubicación temporal, orden sujeto-objeto-verbo, negación e interrogación).

### 5. Dashboard de Progreso (`Dashboard`)
- Visualización de métricas reales guardadas localmente con **Recharts**:
  - **Gráfico de líneas**: XP ganado por día con selector de ventana (**7** o **14 días**).
  - **Gráfica circular**: distribución de dominio por lección usando los colores de cada unidad e inspección interactiva.
  - Tarjetas KPI (XP total, racha diaria, dominio global, retos completados), barras de avance de las 11 lecciones y muestra visual para repaso rápido.

### 6. Comunidad y Consulta INSOR (`Comunidad`)
- **Consulta investigativa sobre LSC** mediante el endpoint `POST /api/lsc-search` con búsqueda web fundamentada (`@google/genai`) para resolver dudas sobre variaciones regionales en Colombia y cultura sorda.
- **Espacios de Google Chat** mediante inicio de sesión con Google (Firebase Auth + Google Chat API).

### 7. Accesibilidad Visual (`Contraste alto señas` y `Modo oscuro`)
- Interruptor dedicado **Contraste alto señas** en la barra superior (persistente en `localStorage`) pensado para reducir la fatiga visual en sesiones largas:
  - **En modo claro**: refuerza el contraste y nitidez de los trazos y flechas de movimiento sobre blanco limpio.
  - **En modo oscuro**: invierte las ilustraciones a líneas blancas nítidas sobre fondo negro puro (incluyendo la máscara de los retos), eliminando el deslumbramiento de los recuadros blancos.

---

## Unidades del curso

| Lección | Tema | Contenido |
| :--- | :--- | :--- |
| **1** | Pronombres y Bases | Pronombres personales, cortesía inicial y comunidad sorda |
| **2** | Familia y Aula | Posesivos, parentesco, estados civiles y términos de clase |
| **3** | Cortesía y Estados | Expresiones sociales, estados de ánimo y verbos cotidianos |
| **4** | Adjetivos y Grados | Tamaño, comparativos, superlativos y acciones de estudio |
| **5** | Interrogativos | Preguntas clave, deseo, obligación y estados |
| **6** | Negación y Afirmación | Adverbios de negación/afirmación y verbos de acción |
| **7** | Tiempo y Rutinas | Línea temporal, saludos del día y verbos modales |
| **8** | Calendario y Fechas | Meses del año, días de la semana y unidades de tiempo |
| **9** | Alimentos y Sabores | Comidas típicas colombianas, bebidas, frutas y sensaciones |
| **10** | Reino Animal | Animales domésticos, salvajes, acuáticos, aves e insectos |
| **11** | Ropa y Colores | Prendas de vestir, calzado, colores y matices visuales |

---

## Tecnologías utilizadas

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Recharts, Lucide React
- **Backend**: Node.js + Express (`server.ts`)
- **IA y Búsqueda**: `@google/genai` (Google Search Grounding en `/api/lsc-search`)
- **Autenticación e Integraciones**: Firebase Authentication (Google Sign-In + scopes de Google Chat)

---

## Estructura del proyecto

```text
├── public/
│   └── assets/
│       ├── aistudio/          # Logotipo y guías PDF de las lecciones 1–11
│       └── signs/             # 406 ilustraciones de vocabulario LSC (.jpg)
├── src/
│   ├── components/
│   │   ├── BlitzQuiz.tsx      # Modo Reto Relámpago de 2 minutos
│   │   ├── CommunityAndSearch.tsx # Consulta LSC + Google Chat
│   │   ├── Dashboard.tsx      # Gráficas de progreso con Recharts
│   │   ├── FlashcardDeck.tsx  # Tarjetas 3D y 4 parámetros LSC
│   │   ├── LessonBentoGrid.tsx# Unidades y diccionario visual
│   │   ├── Navbar.tsx         # Navegación, buscador e interruptores visuales
│   │   ├── PdfGuideModal.tsx  # Visor modal de guías PDF
│   │   └── SyntaxBuilder.tsx  # Constructor de sintaxis en glosas LSC
│   ├── data/                  # Vocabulario (L1–L11), preguntas y retos de sintaxis
│   ├── services/              # Integración Firebase Auth + Google Chat
│   ├── types/                 # Definiciones TypeScript del dominio LSC
│   ├── App.tsx                # Estado global, progreso en localStorage y temas
│   └── index.css              # Tailwind CSS v4, flip 3D y contraste alto de señas
├── server.ts                  # Servidor Express + Vite middleware + /api/lsc-search
├── .env.example               # Plantilla de variables de entorno
└── package.json
```

---

## Configuración y ejecución local

### 1. Requisitos previos
- **Node.js** 18 o superior
- **npm**

### 2. Instalar dependencias
```bash
npm install
```

### 3. Variables de entorno
Crea un archivo `.env` tomando como base `.env.example`:

```env
GEMINI_API_KEY="TU_CLAVE_DE_GEMINI"
APP_URL="http://localhost:3000"
```

> Nota: La aplicación funciona completamente en local para estudiar lecciones, flashcards, retos, sintaxis y dashboard; `GEMINI_API_KEY` solo es necesaria para la consulta web en la sección **Comunidad**.

### 4. Comandos disponibles

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor Express con Vite en modo desarrollo en el puerto `3000` |
| `npm run build` | Compila la aplicación para producción en `dist/` |
| `npm run start` | Ejecuta el servidor Express en modo producción (`server.ts`) |
| `npm run lint` | Verifica los tipos de TypeScript (`tsc --noEmit`) |
