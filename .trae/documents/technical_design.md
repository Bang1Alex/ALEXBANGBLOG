# Technical Design Document for alex-blog

## 1. Project Structure
The project will follow the standard Vue 3 + Vite structure:
- `src/`
  - `assets/`: Global styles, images, icons.
  - `components/`: Reusable components (Navbar, Footer, Card).
  - `layouts/`: Page layouts.
  - `pages/`: Page components (Home, Blog, Post, Tools, ToolDetail).
  - `tools/`: Independent tool modules (e.g., `HuarongRoad`).
  - `router/`: Vue Router configuration.
  - `store/`: Pinia stores (`blog.ts`, `tools.ts`).
  - `styles/`: Less files (`global.less`, `variables.less`).
  - `App.vue`: Main entry component.
  - `main.ts`: Application entry point.
- `posts/`: Markdown articles.
- `vite.config.ts`: Vite configuration (Less, Aliases).

## 2. Style Configuration (Less)
Global variables defined in `src/styles/variables.less`:
- `@primary-color`: `#409EFF`
- `@bg-color`: `#f5f7fa`
- `@text-color`: `#303133`
- `@border-radius-base`: `8px`

Vite config (`vite.config.ts`) will include `additionalData` to inject variables globally.

## 3. Tool Module Architecture
Tools are independent Vue components located in `src/tools/`.
Example: `src/tools/HuarongRoad/` contains:
- `index.vue`: Main component.
- `logic.ts`: Game logic.
- `style.less`: Component-specific styles.

Tools are dynamically loaded in `ToolDetail.vue` using `<component :is="currentTool" />`.

## 4. Blog Module Architecture
- Articles are stored as Markdown files in `posts/`.
- Markdown rendering is handled by `markdown-it` + `highlight.js`.
- Routes are dynamically generated or manually mapped based on available posts.

## 5. Deployment
- Target: Vercel.
- Framework Preset: Vite.
- Build Command: `npm run build`.
