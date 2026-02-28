<script setup lang="ts">
import { ref, computed, watch, nextTick, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import MarkdownIt from 'markdown-it'
import anchor from 'markdown-it-anchor'

const route = useRoute()
const content = ref('')
const loading = ref(true)

// TOC data
type TocItem = {
  id: string
  text: string
  level: number
}
const toc = ref<TocItem[]>([])
const activeHeadingId = ref('')

const postLoaders = import.meta.glob('../../posts/*.md', { as: 'raw' }) as Record<
  string,
  () => Promise<string>
>

const getBasename = (filePath: string) => {
  const parts = filePath.split(/[\\/]/)
  const fileName = parts[parts.length - 1] ?? ''
  return fileName.replace(/\.md$/i, '')
}

// Initialize MarkdownIt with anchor plugin
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
})

  md.use(anchor, {
    permalink: anchor.permalink.headerLink(),
    slugify: (s) => encodeURIComponent(String(s).trim().toLowerCase().replace(/\s+/g, '-')),
    callback: (token, { slug, title }) => {
      // console.log('Anchor generated:', slug, title)
    }
  })

// Generate TOC from rendered HTML elements
const generateToc = () => {
  toc.value = []
  const headings = document.querySelectorAll('.markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4')
  headings.forEach((heading) => {
    const id = heading.id
    const text = heading.textContent || ''
    const level = parseInt(heading.tagName.substring(1))
    if (id && text) {
      toc.value.push({ id, text, level })
    }
  })
}

// Intersection Observer for active heading
let observer: IntersectionObserver | null = null

const setupObserver = () => {
  if (observer) observer.disconnect()
  
  const options = {
    root: null, // viewport
    rootMargin: '-100px 0px -60% 0px', // Highlight when heading is near top
    threshold: 0
  }
  
  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        activeHeadingId.value = entry.target.id
      }
    })
  }, options)
  
  const headings = document.querySelectorAll('.markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4')
  headings.forEach((heading) => observer?.observe(heading))
}

const loadPost = async () => {
  const idRaw = route.params.id
  const id = typeof idRaw === 'string' ? decodeURIComponent(idRaw) : ''
  loading.value = true
  
  try {
    const entry = Object.entries(postLoaders).find(([filePath]) => getBasename(filePath) === id)
    if (!entry) {
      content.value = '# Post Not Found'
      return
    }

    content.value = await entry[1]()
  } catch {
    content.value = '# Error loading post'
  } finally {
    loading.value = false
    // Wait for DOM update then generate TOC and setup observer
    nextTick(() => {
      // Small delay to ensure markdown-body is fully rendered and reflowed
      setTimeout(() => {
        generateToc()
        setupObserver()
      }, 100)
    })
  }
}

watch(
  () => route.params.id,
  () => {
    void loadPost()
  },
  { immediate: true }
)

onUnmounted(() => {
  if (observer) observer.disconnect()
})

const renderedContent = computed(() => {
  return md.render(content.value)
})

const scrollToHeading = (id: string) => {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
    activeHeadingId.value = id
  }
}
</script>

<template>
  <div class="post-page">
    <div class="post-layout">
      <!-- Main Content -->
      <div class="post-container">
        <el-skeleton v-if="loading" :rows="5" animated />
        <div v-else class="markdown-body" v-html="renderedContent"></div>
        <div class="back-link">
          <router-link to="/blog">← Back to Blog</router-link>
        </div>
      </div>
      
      <!-- TOC Sidebar -->
      <aside class="toc-sidebar" v-if="toc.length > 0">
        <div class="toc-container">
          <h3>目录</h3>
          <ul>
            <li 
              v-for="item in toc" 
              :key="item.id" 
              :class="['toc-item', `toc-level-${item.level}`, { active: activeHeadingId === item.id }]"
              @click.prevent="scrollToHeading(item.id)"
            >
              <a :href="`#${item.id}`">{{ item.text }}</a>
            </li>
          </ul>
        </div>
      </aside>
    </div>
    
    <!-- Back to Top -->
    <el-backtop :right="40" :bottom="40" />
  </div>
</template>

<style lang="less" scoped>
.post-page {
  position: relative;
}

.post-layout {
  display: flex;
  justify-content: center;
  gap: 40px;
  align-items: flex-start;
  max-width: 1200px;
  margin: 0 auto;
}

.post-container {
  flex: 1;
  max-width: 800px; // Restore max-width but let it be flexible
  min-width: 0; // Prevent flex item overflow
  
  .markdown-body {
    background-color: #fff;
    padding: 30px;
    border-radius: @border-radius-base;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }
  
  .back-link {
    margin-top: 20px;
    
    a {
      color: @primary-color;
      &:hover { text-decoration: underline; }
    }
  }
}

.toc-sidebar {
  width: 250px;
  flex-shrink: 0;
  display: none; // Hidden on small screens
  position: sticky;
  top: 80px; // Header height + padding
  
  @media (min-width: 1100px) {
    display: block;
  }
  
  .toc-container {
    background: #fff;
    padding: 20px;
    border-radius: @border-radius-base;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    max-height: calc(100vh - 100px);
    overflow-y: auto;
    
    h3 {
      font-size: 1.1rem;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 1px solid #eee;
    }
    
    ul {
      list-style: none;
      padding: 0;
      margin: 0;
      
      li {
        margin-bottom: 8px;
        line-height: 1.4;
        cursor: pointer;
        
        a {
          color: #606266;
          text-decoration: none;
          display: block;
          transition: all 0.2s;
          font-size: 0.9rem;
          
          &:hover {
            color: @primary-color;
          }
        }
        
        &.active a {
          color: @primary-color;
          font-weight: bold;
          border-left: 3px solid @primary-color;
          padding-left: 8px;
          margin-left: -11px; // Compensate border
        }
        
        &.toc-level-1 { padding-left: 0; font-weight: bold; }
        &.toc-level-2 { padding-left: 0; }
        &.toc-level-3 { padding-left: 15px; font-size: 0.85rem; }
        &.toc-level-4 { padding-left: 30px; font-size: 0.85rem; }
        &.toc-level-5, &.toc-level-6 { padding-left: 45px; }
      }
    }
  }
}

// Responsive adjustments
@media (max-width: 800px) {
  .post-container .markdown-body {
    padding: 15px;
  }
}
</style>