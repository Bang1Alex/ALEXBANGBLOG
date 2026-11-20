import {
  AppstoreOutlined,
  DeploymentUnitOutlined,
  FireOutlined,
  MacCommandOutlined,
  MonitorOutlined,
  ScissorOutlined,
} from '@ant-design/icons-vue'

export type PostMeta = {
  slug: string
  title: string
  summary: string
  date: string
  tags: string[]
  readingTime: string
}

export type ToolMeta = {
  id: string
  name: string
  description: string
  accent: string
  icon: unknown
  status: string
}

const postLoaders = import.meta.glob('../../posts/*.md', { as: 'raw' }) as Record<
  string,
  () => Promise<string>
>

const defaultSummaries: Record<string, string> = {
  Promise简单理解: '从基础概念到常见用法，快速梳理 Promise 的状态流转、链式调用和错误处理。',
  'JavaScript 高级部分': '整理 JavaScript 进阶知识点，覆盖闭包、原型链、this、异步机制等常见重点。',
  '浅谈进程 线程 JavaScript 事件循环 (Event Loop)  垃圾回收 异步 promise async awiat,以及他们之间的关系':
    '把进程、线程、事件循环、垃圾回收与异步编程放到一条线里，帮助建立完整的运行时理解。',
  计算机网络: '面向前端视角梳理网络基础概念，帮助建立从请求到响应的整体认知。',
}

const fallbackTitles: Record<string, string> = {
  Promise简单理解: 'Promise 简单理解',
  'JavaScript 高级部分': 'JavaScript 高级部分',
  '浅谈进程 线程 JavaScript 事件循环 (Event Loop)  垃圾回收 异步 promise async awiat,以及他们之间的关系':
    '浅谈进程、线程与事件循环',
  计算机网络: '计算机网络',
  Vue中路由详解: 'Vue 中路由详解',
  批量删除node_modules: '批量删除 node_modules',
}

const fallbackTags: Record<string, string[]> = {
  Promise简单理解: ['JavaScript', 'Async'],
  'JavaScript 高级部分': ['JavaScript'],
  '浅谈进程 线程 JavaScript 事件循环 (Event Loop)  垃圾回收 异步 promise async awiat,以及他们之间的关系': [
    'JavaScript',
    'Event Loop',
  ],
  计算机网络: ['Network'],
  Vue中路由详解: ['Vue', 'Vue Router'],
  批量删除node_modules: ['Tooling', 'Node.js'],
}

export const toolCatalog: ToolMeta[] = [
  {
    id: 'PaperCut',
    name: '剪纸工具',
    description: '把传统剪纸体验搬到浏览器里，支持折叠、裁剪与图案创作，适合做课堂互动和创意实验。',
    accent: '#ff7a59',
    icon: ScissorOutlined,
    status: 'Creative Lab',
  },
  {
    id: 'MindMap',
    name: '思维导图',
    description: '围绕知识整理与结构表达构建，适合做课程备课、专题拆解和个人思考归档。',
    accent: '#f4b63d',
    icon: DeploymentUnitOutlined,
    status: 'Knowledge Tool',
  },
  {
    id: 'HuarongRoad',
    name: '华容道',
    description: '经典滑块谜题的交互化实现，用更直观的方式练习空间推理与路径规划。',
    accent: '#00a6a6',
    icon: AppstoreOutlined,
    status: 'Puzzle Game',
  },
  {
    id: 'MatchstickChallengeGame',
    name: '火柴棍挑战',
    description: '通过移动火柴棍修正算式，适合用来做趣味逻辑训练和课堂破冰小游戏。',
    accent: '#ff5d73',
    icon: FireOutlined,
    status: 'Logic Challenge',
  },
  {
    id: 'NineLinkedRings',
    name: '九连环',
    description: '把传统益智玩法做成交互演示，兼顾操作反馈、过程理解和挑战感。',
    accent: '#7757ff',
    icon: MonitorOutlined,
    status: 'Classic Puzzle',
  },
  {
    id: 'Gallery',
    name: '3D 展馆',
    description: '使用 Three.js 搭建沉浸式展示空间，让作品、课程成果和视觉内容更有舞台感。',
    accent: '#1f7aff',
    icon: MacCommandOutlined,
    status: 'Immersive Space',
  },
]

const getBasename = (filePath: string) => {
  const segments = filePath.split(/[\\/]/)
  return (segments[segments.length - 1] ?? '').replace(/\.md$/i, '')
}

const stripFrontmatter = (markdown: string) => markdown.replace(/^\s*-{3,4}\r?\n[\s\S]*?\r?\n-{3,4}\r?\n?/, '')

const stripEncodingNoise = (value: string) => value.replace(/[�]/g, '').trim()

const parseFrontmatter = (markdown: string) => {
  const matched = markdown.match(/^\s*(-{3,4})\r?\n([\s\S]*?)\r?\n\1/)
  if (!matched) return {}

  const body = matched[2]
  const read = (key: string) => body.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))?.[1]?.trim() ?? ''
  const tagsRaw = read('tags')
  const tags = tagsRaw
    ? tagsRaw
        .replace(/^\[/, '')
        .replace(/\]$/, '')
        .split(',')
        .map((tag) => tag.replace(/['"]/g, '').trim())
        .filter(Boolean)
    : []

  return {
    title: read('title'),
    summary: read('summary'),
    date: read('date'),
    tags,
  }
}

const deriveSummary = (slug: string, markdown: string) => {
  const cleaned = stripFrontmatter(markdown)
    .replace(/```[\s\S]*?```/g, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/^#+\s+/gm, '')
    .replace(/^\s*[-*]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/\r?\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const excerpt = cleaned.slice(0, 110).trim()
  const suspicious = /[�]/.test(excerpt) || excerpt.includes('鏄') || excerpt.includes('鐨')
  if (!cleaned || suspicious) {
    return defaultSummaries[slug] ?? '记录一些关于前端、工具和创作实践的思考。'
  }

  return cleaned.length > 110 ? `${excerpt}...` : excerpt
}

const deriveReadingTime = (markdown: string) => {
  const plain = stripFrontmatter(markdown)
    .replace(/```[\s\S]*?```/g, '')
    .replace(/\s+/g, '')
  const minutes = Math.max(1, Math.round(plain.length / 380))
  return `${minutes} min read`
}

export const getAllPosts = async () => {
  const entries = await Promise.all(
    Object.entries(postLoaders).map(async ([filePath, loader]) => {
      const slug = getBasename(filePath)
      const markdown = await loader()
      const meta = parseFrontmatter(markdown)
      const rawTitle = stripEncodingNoise(meta.title ?? '')
      const rawSummary = stripEncodingNoise(meta.summary ?? '')

      return {
        slug,
        title: rawTitle && !rawTitle.includes('绠') ? rawTitle : fallbackTitles[slug] || slug,
        summary: rawSummary && !rawSummary.includes('鐨') ? rawSummary : deriveSummary(slug, markdown),
        date: meta.date || '',
        tags: meta.tags?.length ? meta.tags : fallbackTags[slug] ?? [],
        readingTime: deriveReadingTime(markdown),
      } satisfies PostMeta
    }),
  )

  return entries.sort((a, b) => {
    if (!a.date && !b.date) return a.slug.localeCompare(b.slug, 'zh-Hans-CN')
    if (!a.date) return 1
    if (!b.date) return -1
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })
}

export const getFeaturedTools = () => toolCatalog.slice(0, 4)
