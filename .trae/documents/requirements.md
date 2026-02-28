# Requirements Document for alex-blog

## 1. Project Overview
**Project Name**: alex-blog
**Project Type**: Personal Blog + Vue Widget Showcase Platform
**Deployment Target**: Vercel

The project aims to build a technical personal blog that can display articles and embed interactive Vue mini-projects (widgets).

## 2. Core Features
- **Blog Display**: Render Markdown articles with syntax highlighting.
- **Embedded Tools**: Showcase interactive Vue widgets, starting with a Huarong Road game.
- **Responsive Design**: Clean and modern UI using Element Plus and custom Less styles.

## 3. Technology Stack
- **Frontend Framework**: Vue 3 (Composition API)
- **Build Tool**: Vite
- **Language**: TypeScript
- **UI Framework**: Element Plus
- **Styling**: Less (with global variables)
- **State Management**: Pinia
- **Routing**: Vue Router
- **Markdown Rendering**: markdown-it + highlight.js
- **Deployment**: Vercel

## 4. Initial Scope
- **Pages**:
  - Home
  - Blog List
  - Blog Detail (Post)
  - Tools List
  - Tool Detail
- **Tools**:
  - Huarong Road Game (independent Vue component module)
