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
    callback: () => {
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

    let markdown = await entry[1]()
     // 第一步：去除开头的不可见字符（空格、换行、制表符、全角空格等）
    const trimmedMarkdown = markdown.replace(/^\s*/, '');
    content.value = trimmedMarkdown.replace(/^----[\s\S]*?----\n?/, '')
  } catch {
    content.value = '# Error loading post'
  } finally {
    loading.value = false
    nextTick(() => {
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
      <div class="post-container">
         <div class="back-link">
          <router-link to="/blog">
            <span class="back-icon">←</span>
            <span>返回博客列表</span>
          </router-link>
        </div>
        <a-skeleton v-if="loading" active :paragraph="{ rows: 5 }" />
        <div v-else class="markdown-body" v-html="renderedContent"></div>
       
      </div>
      
      <aside class="toc-sidebar" v-if="toc.length > 0">
        <div class="toc-container">
          <div class="toc-header">
            <h3>目录</h3>
            <div class="toc-line"></div>
          </div>
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
    
    <a-back-top :style="{ right: '40px', bottom: '40px' }" />
  </div>
</template>

<style lang="less" scoped>
.post-page {
  position: relative;
  min-height: 100vh;
  background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 40px 20px 80px;
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
  max-width: 800px;
  min-width: 0;
  
  .markdown-body {
    background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
    padding: 40px;
    border-radius: 20px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.8);
  }
  
  .back-link {
    margin-bottom: 30px;
    a {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 30px;
      font-weight: 600;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
        background: linear-gradient(135deg, #764ba2 0%, #f093fb 100%);
        color: white;
      }
      
      .back-icon {
        font-size: 1.2rem;
        transition: transform 0.3s;
      }
      
      &:hover .back-icon {
        transform: translateX(-4px);
      }
    }
  }
}

.toc-sidebar {
  width: 280px;
  flex-shrink: 0;
  display: none;
  position: sticky;
  top: 40px;
  
  @media (min-width: 1100px) {
    display: block;
  }
  
  .toc-container {
    background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
    padding: 24px;
    border-radius: 20px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.8);
    max-height: calc(100vh - 80px);
    overflow-y: auto;
    
    .toc-header {
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.06);
      
      h3 {
        font-size: 1.2rem;
        font-weight: 700;
        margin: 0 0 8px 0;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      
      .toc-line {
        height: 3px;
        background: linear-gradient(90deg, #667eea, #764ba2, #f093fb);
        border-radius: 2px;
        width: 60px;
      }
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
          color: #4b5563;
          text-decoration: none;
          display: block;
          transition: all 0.2s;
          font-size: 0.9rem;
          padding: 6px 12px;
          border-radius: 8px;
          
          &:hover {
            color: #667eea;
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
          }
        }
        
        &.active a {
          color: #667eea;
          font-weight: 600;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
          border-left: 3px solid #667eea;
        }
        
        &.toc-level-1 { padding-left: 0; font-weight: 600; }
        &.toc-level-2 { padding-left: 0; }
        &.toc-level-3 { padding-left: 15px; font-size: 0.85rem; }
        &.toc-level-4 { padding-left: 30px; font-size: 0.85rem; }
        &.toc-level-5, &.toc-level-6 { padding-left: 45px; }
      }
    }
  }
}

@media (max-width: 800px) {
  .post-page {
    padding: 30px 16px 60px;
  }
  
  .post-container .markdown-body {
    padding: 24px;
  }
}

@media (max-width: 480px) {
  .post-page {
    padding: 20px 12px 40px;
  }
  
  .post-container .markdown-body {
    padding: 20px;
    border-radius: 16px;
  }
  
  .post-layout {
    gap: 20px;
  }
}
</style>