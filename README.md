## 项目简介

**Alex Blog** 是一个基于 **Vue 3 + TypeScript + Vite** 的个人技术博客与互动工具集合站点，集成了：

- **博客系统**：从 `posts` 目录自动加载 Markdown 文章，支持摘要提取与文章详情页展示。
- **互动工具合集**：为在线教育与趣味学习场景设计的一组可视化/益智工具，例如剪纸仿真、思维导图、华容道、火柴棒挑战、九连环/九宫格链接环、3D 展馆等。
- **统一布局与导航**：使用 Ant Design Vue 布局与菜单，配合自定义星空背景组件，提供现代化、沉浸式的浏览体验。

## 主要功能模块

- **首页（`/`）**
  - 展示站点简介与引导按钮（阅读文章 / 体验工具）。
  - 展示「热门工具」卡片（如剪纸、思维导图、火柴棒挑战等），可一键跳转到对应工具详情页。
  - 展示最新文章列表，从 `posts` 目录按文件名排序并读取摘要。

- **博客模块（`/blog` 与 `/blog/:id`）**
  - 通过 `import.meta.glob('../../posts/*.md')` 动态加载 Markdown 文件。
  - 自动为每篇文章提取首段正文作为摘要，并在列表中展示标题与简介。
  - 文章详情页通过路由参数 `:id` 加载对应 Markdown 内容进行渲染。

- **工具模块（`/tools` 与 `/tools/:id`）**
  - 工具列表页罗列多个互动工具卡片，每个工具包含名称、图标、简介与主题色。
  - 当前已集成的主要工具包括（部分示例）：
    - **剪纸（PaperCut）**：基于 Canvas 与几何算法模拟纸张折叠、剪刻与展开效果，用于在线教育中的剪纸互动教学。
    - **思维导图（MindMap）**：基于 `simple-mind-map` 及其主题插件的思维导图编辑组件，支持多主题与扩展插件。
    - **华容道（HuarongRoad）**：基于 Konva.js 实现的滑块益智游戏，支持拖拽、吸附、步数记录等逻辑，用于训练逻辑思维。
    - **火柴棒挑战（MatchstickChallengeGame）**：通过拖动火柴棒修正数学等式的益智小游戏。
    - **九宫格链接环（NineLinkedRings）**：通过拖动链接环连接相同数字，完成九宫格的解谜工具。
    - **3D 展馆（3D Gallery）**：使用 Three.js 实现的 3D 作品画廊与数据可视化空间，用于学生作品沉浸式展示。
  - 每个工具在 `src/tools` 下有独立的实现（`index.vue` + 逻辑/样式文件），并通过工具详情路由进行挂载展示。

## 技术栈与依赖

- **核心框架**
  - Vue 3（基于 `<script setup>` 语法）
  - TypeScript
  - Vite 开发与构建
  - Vue Router（历史模式）
  - Pinia（`blog`、`tools` 等状态模块）

- **UI 与样式**
  - Ant Design Vue（布局、菜单、卡片、按钮、标签等）
  - Tailwind CSS（原子化样式与工具类）
  - Less（自定义主题与全局样式，如 `global.less`、`markdownTheme` 等）

- **可视化与互动**
  - Three.js：3D 展馆与空间交互。
  - Konva.js：2D 画布交互引擎（华容道、火柴棒挑战、九连环等）。
  - fabric-with-gestures：画布手势与变换支持。
  - simple-mind-map + simple-mind-map-plugin-themes：思维导图核心能力与多主题支持。
  - vue-live2d：页面 Live2D 互动角色组件。

- **其他工具库**
  - lodash / @types/lodash：通用工具函数。
  - markdown-it + markdown-it-anchor：Markdown 解析与标题锚点支持。
  - clsx、tailwind-merge：类名合并与样式管理。

## 目录结构概览（节选）

- `src/App.vue`：应用根组件，包含顶部导航栏、路由出口与页脚。
- `src/router/index.ts`：路由配置（首页、博客列表/详情、工具列表/详情）。
- `src/pages/Home.vue`：首页，集成热门工具与最新文章展示。
- `src/pages/Blog.vue`、`src/pages/Post.vue`：博客列表与文章详情页面。
- `src/pages/Tools.vue`、`src/pages/ToolDetail.vue`：工具列表与工具详情页面。
- `src/tools/*`：各互动工具的具体实现（剪纸、思维导图、华容道、九连环、3D 展馆等）。
- `posts/*.md`：博客文章的 Markdown 源文件。

## 本地开发与构建

- **安装依赖**

```bash
npm install
```

- **启动开发环境**

```bash
npm run dev
```

- **类型检查**

```bash
npm run check
```

- **代码规范检查**

```bash
npm run lint
```

- **生产构建**

```bash
npm run build
```

## 适用场景

- 个人技术博客与知识沉淀；
- 在线教育平台中的互动控件与案例演示；
- 前端可视化 / 互动小游戏 / 教学工具的综合展示与实验场。
