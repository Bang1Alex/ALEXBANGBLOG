<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import MarkdownIt from 'markdown-it'
import anchor from 'markdown-it-anchor'
import { motion } from 'motion-v'
import { getAllPosts, type PostMeta } from '@/data/content'

type TocItem = {
  id: string
  text: string
  level: number
}

const route = useRoute()
const content = ref('')
const loading = ref(true)
const toc = ref<TocItem[]>([])
const activeHeadingId = ref('')
const postMeta = ref<PostMeta | null>(null)

const postLoaders = import.meta.glob('../../posts/*.md', { as: 'raw' }) as Record<
  string,
  () => Promise<string>
>

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
})

md.use(anchor, {
  permalink: anchor.permalink.headerLink(),
  slugify: (value) => encodeURIComponent(String(value).trim().toLowerCase().replace(/\s+/g, '-')),
})

const getBasename = (filePath: string) => {
  const parts = filePath.split(/[\\/]/)
  return (parts[parts.length - 1] ?? '').replace(/\.md$/i, '')
}

const stripFrontmatter = (markdown: string) => markdown.replace(/^\s*-{3,4}\r?\n[\s\S]*?\r?\n-{3,4}\r?\n?/, '')

const generateToc = () => {
  toc.value = []
  const headings = document.querySelectorAll('.markdown-body h1, .markdown-body h2, .markdown-body h3')
  headings.forEach((heading) => {
    const id = heading.id
    const text = heading.textContent || ''
    const level = Number(heading.tagName.slice(1))
    if (id && text) toc.value.push({ id, text, level })
  })
}

let observer: IntersectionObserver | null = null

const setupObserver = () => {
  observer?.disconnect()
  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) activeHeadingId.value = entry.target.id
    })
  }, {
    rootMargin: '-120px 0px -60% 0px',
    threshold: 0,
  })

  document
    .querySelectorAll('.markdown-body h1, .markdown-body h2, .markdown-body h3')
    .forEach((heading) => observer?.observe(heading))
}

const renderedContent = computed(() => md.render(content.value))

const loadPost = async () => {
  const rawId = route.params.id
  const slug = typeof rawId === 'string' ? decodeURIComponent(rawId) : ''
  loading.value = true

  try {
    const posts = await getAllPosts()
    postMeta.value = posts.find((post) => post.slug === slug) ?? null
    const entry = Object.entries(postLoaders).find(([filePath]) => getBasename(filePath) === slug)

    if (!entry) {
      content.value = '# Post Not Found'
      return
    }

    const markdown = await entry[1]()
    content.value = stripFrontmatter(markdown)
  } catch {
    content.value = '# Error loading post'
  } finally {
    loading.value = false
    await nextTick()
    generateToc()
    setupObserver()
  }
}

watch(() => route.params.id, () => {
  void loadPost()
}, { immediate: true })

onUnmounted(() => observer?.disconnect())

const scrollToHeading = (id: string) => {
  const element = document.getElementById(id)
  if (!element) return
  element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  activeHeadingId.value = id
}
</script>

<template>
  <div class="post-page">
    <motion.div
      class="post-shell"
      :initial="{ opacity: 0, y: 24 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.55 }"
    >
      <div class="post-main">
        <router-link to="/blog" class="back-link">返回文章列表</router-link>

        <section class="post-cover">
          <span class="post-pill">Reading View</span>
          <h1>{{ postMeta?.title || '文章详情' }}</h1>
          <div class="post-meta">
            <span>{{ postMeta?.date || 'Undated' }}</span>
            <span>{{ postMeta?.readingTime || '' }}</span>
            <span>{{ postMeta?.tags?.join(' · ') }}</span>
          </div>
        </section>

        <section class="post-content">
          <a-skeleton v-if="loading" active :paragraph="{ rows: 10 }" />
          <div v-else class="markdown-body" v-html="renderedContent"></div>
        </section>
      </div>

      <aside v-if="toc.length > 0" class="toc-panel">
        <div class="toc-box">
          <span class="post-pill">On this page</span>
          <button
            v-for="item in toc"
            :key="item.id"
            type="button"
            class="toc-item"
            :class="[ `level-${item.level}`, { active: activeHeadingId === item.id } ]"
            @click="scrollToHeading(item.id)"
          >
            {{ item.text }}
          </button>
        </div>
      </aside>
    </motion.div>

    <a-back-top :style="{ right: '24px', bottom: '24px' }" />
  </div>
</template>

<style scoped>
.post-page {
  padding-bottom: 24px;
}

.post-shell {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 260px;
  gap: 24px;
  align-items: start;
}

.post-main,
.toc-box {
  border-radius: 30px;
  background: rgba(255, 250, 244, 0.88);
  border: 1px solid rgba(123, 92, 59, 0.1);
  box-shadow: 0 22px 55px rgba(49, 34, 22, 0.08);
}

.post-main {
  padding: 22px;
}

.back-link {
  display: inline-flex;
  padding: 10px 16px;
  border-radius: 999px;
  background: rgba(29, 107, 92, 0.08);
  color: #1d6b5c;
  font-weight: 700;
}

.post-cover {
  margin-top: 18px;
  padding: 26px;
  border-radius: 26px;
  background:
    radial-gradient(circle at top right, rgba(239, 123, 69, 0.18), transparent 32%),
    linear-gradient(160deg, rgba(29, 107, 92, 0.96), rgba(25, 48, 74, 0.96));
  color: #fff8ef;
}

.post-pill {
  display: inline-block;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(255, 248, 239, 0.14);
  color: inherit;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.post-cover h1 {
  margin: 18px 0 14px;
  font-size: clamp(2rem, 3.5vw, 3.5rem);
  line-height: 1.04;
  color: inherit;
}

.post-meta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  color: rgba(255, 248, 239, 0.76);
}

.post-content {
  margin-top: 18px;
  padding: 30px;
  border-radius: 26px;
  background: rgba(255, 255, 255, 0.78);
}

.toc-panel {
  position: sticky;
  top: 96px;
}

.toc-box {
  padding: 20px;
  display: grid;
  gap: 10px;
}

.toc-item {
  width: 100%;
  padding: 10px 12px;
  border: none;
  border-left: 2px solid transparent;
  background: transparent;
  text-align: left;
  color: #705d49;
  cursor: pointer;
  border-radius: 14px;
}

.toc-item.level-2 {
  padding-left: 22px;
}

.toc-item.level-3 {
  padding-left: 34px;
}

.toc-item.active {
  background: rgba(29, 107, 92, 0.08);
  border-left-color: #1d6b5c;
  color: #1d6b5c;
  font-weight: 700;
}

@media (max-width: 1024px) {
  .post-shell {
    grid-template-columns: 1fr;
  }

  .toc-panel {
    position: static;
  }
}

@media (max-width: 640px) {
  .post-main,
  .toc-box {
    padding: 18px;
    border-radius: 24px;
  }

  .post-cover,
  .post-content {
    padding: 20px;
    border-radius: 22px;
  }
}
</style>
