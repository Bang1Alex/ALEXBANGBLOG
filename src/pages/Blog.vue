<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { CalendarOutlined, TagOutlined } from '@ant-design/icons-vue'

const router = useRouter()

type PostMeta = {
  slug: string
  title: string
  summary: string
  date: string
  tags: string[]
}

const posts = ref<PostMeta[]>([])

const postLoaders = import.meta.glob('../../posts/*.md', { as: 'raw' }) as Record<
  string,
  () => Promise<string>
>

const getBasename = (filePath: string) => {
  const parts = filePath.split(/[\\/]/)
  const fileName = parts[parts.length - 1] ?? ''
  return fileName.replace(/\.md$/i, '')
}

const extractMeta = (markdown: string) => {
  const frontmatterMatch = markdown.match(/^---[\s\S]*?---/)
  let summary = ''
  let title = ''
  let date = ''
  let tags: string[] = []
  
  if (frontmatterMatch) {
    const frontmatter = frontmatterMatch[0]
    const summaryMatch = frontmatter.match(/summary:\s*(.+)/)
    const titleMatch = frontmatter.match(/title:\s*(.+)/)
    const dateMatch = frontmatter.match(/date:\s*(.+)/)
    const tagsMatch = frontmatter.match(/tags:\s*(.+)/)
    
    if (summaryMatch) summary = summaryMatch[1].trim()
    if (titleMatch) title = titleMatch[1].trim()
    if (dateMatch) date = dateMatch[1].trim()
    if (tagsMatch) {
      const tagsStr = tagsMatch[1].trim()
      if (tagsStr.startsWith('[') && tagsStr.endsWith(']')) {
        tags = tagsStr.slice(1, -1).split(',').map(t => t.trim().replace(/['"]/g, ''))
      } else {
        tags = tagsStr.split(',').map(t => t.trim())
      }
    }
  }
  
  if (!summary) {
    let cleaned = markdown
    cleaned = cleaned.replace(/^---[\s\S]*?---/g, '')
    cleaned = cleaned.replace(/```[\s\S]*?```/g, '')
    cleaned = cleaned.replace(/!\[.*?\]\(.*?\)/g, '')
    
    const lines = cleaned.split(/\r?\n/)
    const sentences: string[] = []
    let currentParagraph = ''
    
    for (const line of lines) {
      const text = line.trim()
      if (!text) {
        if (currentParagraph) {
          sentences.push(currentParagraph)
          currentParagraph = ''
        }
        continue
      }
      if (text.startsWith('#')) continue
      if (text.startsWith('>')) continue
      if (text.startsWith('-')) continue
      if (text.startsWith('*')) continue
      if (/^\d+\./.test(text)) continue
      
      currentParagraph += (currentParagraph ? ' ' : '') + text
    }
    if (currentParagraph) {
      sentences.push(currentParagraph)
    }
    
    const fullText = sentences.join(' ')
    if (fullText) {
      const targetLength = 150
      if (fullText.length <= targetLength) {
        summary = fullText
      } else {
        const truncated = fullText.slice(0, targetLength)
        const lastPeriod = truncated.lastIndexOf('。')
        const lastExclamation = truncated.lastIndexOf('！')
        const lastQuestion = truncated.lastIndexOf('？')
        const lastSentenceEnd = Math.max(lastPeriod, lastExclamation, lastQuestion)
        
        if (lastSentenceEnd > targetLength * 0.5) {
          summary = truncated.slice(0, lastSentenceEnd + 1)
        } else {
          const lastSpace = truncated.lastIndexOf(' ')
          if (lastSpace > targetLength * 0.5) {
            summary = truncated.slice(0, lastSpace) + '...'
          } else {
            summary = truncated + '...'
          }
        }
      }
    }
  }
  
  return { summary, title, date, tags }
}

onMounted(async () => {
  const entries = Object.entries(postLoaders)
    .map(([filePath, loader]) => ({ slug: getBasename(filePath), loader }))
    .sort((a, b) => a.slug.localeCompare(b.slug, 'zh-Hans-CN'))
  // console.log("entries",entries);
  posts.value = await Promise.all(
  
    entries.map(async ({ slug, loader }) => {
      const markdown = await loader()

      const { summary, title, date, tags } = extractMeta(markdown)
      console.log(tags);
      
      return {
        slug,
        title: title || slug,
        summary,
        date,
        tags,
      }
    })
  )
})

const goToPost = (slug: string) => {
  router.push(`/blog/${encodeURIComponent(slug)}`)
}
</script>

<template>
  <div class="blog-container">
    <div class="blog-header">
      <h1 class="blog-title">文章列表</h1>
      <p class="blog-subtitle">探索技术之美，记录成长点滴</p>
    </div>
    <div class="posts-grid">
      <div 
        v-for="post in posts" 
        :key="post.slug" 
        class="post-card"
        @click="goToPost(post.slug)"
      >
        <div class="post-card-content">
          <div class="post-card-header">
            <h3 class="post-title">{{ post.title }}</h3>
            <div v-if="post.date" class="post-date">
              <CalendarOutlined />
              <span>{{ post.date }}</span>
            </div>
          </div>
          <p class="post-summary">{{ post.summary }}</p>
          <div class="post-footer">
            <div v-if="post.tags && post.tags.length > 0" class="post-tags">
              <TagOutlined />
              <a-tag v-for="tag in post.tags" :key="tag" color="purple">{{ tag }}</a-tag>
            </div>
            <span class="post-arrow">→</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.blog-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px 80px;
}

.blog-header {
  text-align: center;
  margin-bottom: 60px;
  
  .blog-title {
    font-size: 3rem;
    font-weight: 900;
    margin-bottom: 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -1px;
  }
  
  .blog-subtitle {
    font-size: 1.2rem;
    color: #6b7280;
    font-weight: 400;
  }
}

.posts-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.post-card {
  background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 20px;
  padding: 28px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.8);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #667eea, #764ba2, #f093fb);
    transform: scaleX(0);
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
    
    &::before {
      transform: scaleX(1);
    }
    
    .post-arrow {
      transform: translateX(8px);
      color: #667eea;
    }
  }
  
  .post-card-content {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  
  .post-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
    gap: 12px;
  }
  
  .post-title {
    margin: 0;
    font-size: 1.35rem;
    font-weight: 700;
    color: #1a1a2e;
    letter-spacing: -0.3px;
    line-height: 1.4;
    flex: 1;
  }
  
  .post-date {
    display: flex;
    align-items: center;
    gap: 4px;
    color: #9ca3af;
    font-size: 0.85rem;
    font-weight: 500;
    white-space: nowrap;
    
    .anticon {
      font-size: 0.9rem;
    }
  }
  
  .post-summary {
    color: #4b5563;
    font-size: 0.95rem;
    line-height: 1.7;
    margin: 0 0 20px;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    flex: 1;
  }
  
  .post-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 16px;
    border-top: 1px solid rgba(0, 0, 0, 0.06);
  }
  
  .post-tags {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    
    .anticon {
      color: #667eea;
      font-size: 1rem;
      margin-right: 4px;
    }
    
    .ant-tag {
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
      border: 1px solid rgba(102, 126, 234, 0.2);
      color: #667eea;
      font-weight: 500;
      font-size: 0.85rem;
      padding: 4px 12px;
      border-radius: 6px;
      transition: all 0.3s ease;
      
      &:hover {
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
        border-color: rgba(102, 126, 234, 0.4);
        transform: translateY(-1px);
      }
    }
  }
  
  .post-arrow {
    font-size: 1.5rem;
    color: #d1d5db;
    transition: all 0.3s;
    font-weight: 300;
    flex-shrink: 0;
  }
}

@media (max-width: 768px) {
  .blog-container {
    padding: 30px 16px 60px;
  }
  
  .blog-header {
    margin-bottom: 40px;
    
    .blog-title {
      font-size: 2.2rem;
    }
    
    .blog-subtitle {
      font-size: 1rem;
    }
  }
  
  .post-card {
    padding: 24px;
    
    .post-title {
      font-size: 1.2rem;
    }
    
    .post-summary {
      font-size: 0.9rem;
      -webkit-line-clamp: 4;
    }
  }
}

@media (max-width: 480px) {
  .blog-container {
    padding: 20px 12px 40px;
  }
  
  .blog-header {
    margin-bottom: 30px;
    
    .blog-title {
      font-size: 1.8rem;
    }
  }
  
  .post-card {
    padding: 20px;
    
    .post-card-header {
      flex-direction: column;
      gap: 8px;
    }
    
    .post-title {
      font-size: 1.1rem;
    }
    
    .post-footer {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }
    
    .post-arrow {
      align-self: flex-end;
    }
  }
}
</style>
