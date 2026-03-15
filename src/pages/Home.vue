<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { FireOutlined, EditOutlined, MonitorOutlined, ScissorOutlined, AppstoreOutlined, MacCommandOutlined, CalendarOutlined, TagOutlined } from '@ant-design/icons-vue'

const router = useRouter()

// --- Post Logic ---
type PostMeta = {
  slug: string
  title: string
  summary: string
  date: string
  tags: string[]
}

const recentPosts = ref<PostMeta[]>([])

const postLoaders = import.meta.glob('../../posts/*.md', { as: 'raw' }) as Record<
  string,
  () => Promise<string>
>

const getBasename = (filePath: string) => {
  const parts = filePath.split(/[\\/]/)
  const fileName = parts[parts.length - 1] ?? ''
  return fileName.replace(/\.md$/i, '')
}

const extractSummary = (markdown: string) => {
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
    .sort((a, b) => b.slug.localeCompare(a.slug, 'zh-Hans-CN')) // Sort by name descending (assuming date-ish or just recent)

  // Take first 3
  const latestEntries = entries.slice(0, 3)

  recentPosts.value = await Promise.all(
    latestEntries.map(async ({ slug, loader }) => {
      const markdown = await loader()
      // const summary = extractSummary(markdown)
      const { summary, title, date, tags } = extractSummary(markdown)
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

// --- Tools Logic ---
const featuredTools = [
  {
    id: 'PaperCut',
    name: '剪纸工具',
    desc: '自由创作剪纸艺术，感受传统文化魅力。',
    icon: ScissorOutlined,
    color: '#F56C6C'
  },
  {
    id: 'MindMap',
    name: '思维导图',
    desc: '基于 Vue.js 框架的思维导图组件，支持创建、编辑、分享和导出思维导图，同时提供了丰富的主题和插件扩展功能',
    icon: AppstoreOutlined,
    color: '#E6A23C'
  },
  {
    id: 'MatchstickChallengeGame',
    name: '火柴棒挑战',
    desc: '基于 Konva.js 引擎开发的益智游戏，通过移动火柴棒修复数学等式，锻炼逻辑思维与空间想象力',
    icon: FireOutlined,
    color: '#fa541c'
  }
  
]

const goToTool = (id: string) => {
  router.push(`/tools/${id}`)
}
</script>

<template>
  <div class="home-container">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">欢迎来到 <span class="highlight">Alex的博客</span></h1>
        <p class="hero-subtitle">
          探索技术之美，记录成长点滴。这里汇聚了前端技术分享、创意工具开发以及我的思考与实践。
        </p>
        <div class="hero-actions">
          <a-button type="primary" size="large" shape="round" @click="router.push('/blog')">
            <template #icon><EditOutlined /></template> 阅读文章
          </a-button>
          <a-button size="large" shape="round" @click="router.push('/tools')">
            <template #icon><MonitorOutlined /></template> 体验工具
          </a-button>
        </div>
      </div>
      <div class="hero-decoration">
        <div class="circle circle-1"></div>
        <div class="circle circle-2"></div>
      </div>
    </section>

    <!-- Content Wrapper -->
    <div class="content-wrapper">
      
      <!-- Featured Tools -->
      <section class="section tools-section">
        <h2 class="section-title">热门工具 / Popular Tools</h2>
        <div class="tools-grid">
          <div 
            v-for="tool in featuredTools" 
            :key="tool.id" 
            class="tool-card"
            @click="goToTool(tool.id)"
          >
           
             <div class="content-animation">
                <div class="back">
                    <div class="back-content">
                        <div class="tool-icon" :style="{ backgroundColor: tool.color }">
                          <component :is="tool.icon" />
                        </div>
                        <div class="tool-info">
                          <h3>{{ tool.name }}</h3>
                          <p>{{ tool.desc }}</p>
                        </div>
                        <div class="tool-arrow">→</div>

                    </div>
                </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Recent Posts -->
      <section class="section posts-section">
        <h2 class="section-title">最新文章 / Recent Posts</h2>
        <div class="posts-list">
          <div 
            v-for="post in recentPosts" 
            :key="post.slug" 
            class="post-list-item"
            @click="goToPost(post.slug)"
          >
            <div class="post-list-content">
              <div class="post-list-header">
                <h3 class="post-list-title">{{ post.title }}</h3>
              </div>
              <p class="post-list-summary">{{ post.summary }}</p>
            </div>
            <div class="post-list-footer">
              <div class="post-list-meta">
                <div class="post-list-tags" v-if="post.tags && post.tags.length > 0">
                  <TagOutlined />
                  <a-tag v-for="tag in post.tags" :key="tag" color="purple">{{ tag }}</a-tag>
                </div>
                <div class="post-list-date">
                  <CalendarOutlined />
                  <span>{{ post.date }}</span>
                </div>
              </div>
              <span class="post-list-arrow">→</span>
            </div>
          </div>
        </div>
        <div class="more-posts">
          <a-button type="text" @click="router.push('/blog')">查看更多文章</a-button>
        </div>
      </section>

    </div>
  </div>
</template>

<style lang="less" scoped>
.home-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);
}

// Hero Section
.hero-section {
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  color: white;
  padding: 100px 20px 120px;
  text-align: center;
  overflow: hidden;
  margin-bottom: -60px;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    opacity: 0.3;
  }
  
  .hero-content {
    position: relative;
    z-index: 2;
    max-width: 900px;
    margin: 0 auto;
    
    .hero-title {
      font-size: 4rem;
      font-weight: 900;
      margin-bottom: 24px;
      letter-spacing: -2px;
      text-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
      
      .highlight {
        background: linear-gradient(135deg, #fff 0%, #f0f0f0 50%, #e0e0e0 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        position: relative;
        display: inline-block;
        
        &::after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #fff, rgba(255,255,255,0.3));
          border-radius: 2px;
        }
      }
    }
    
    .hero-subtitle {
      font-size: 1.4rem;
      color: rgba(255, 255, 255, 0.95);
      margin-bottom: 48px;
      line-height: 1.8;
      font-weight: 400;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
    }
    
    .hero-actions {
      display: flex;
      justify-content: center;
      gap: 24px;
      flex-wrap: wrap;
    }
  }
  
  .hero-decoration {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    pointer-events: none;
    
    .circle {
      position: absolute;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 50%, transparent 70%);
      filter: blur(20px);
    }
    
    .circle-1 {
      width: 400px;
      height: 400px;
      top: -100px;
      left: -100px;
      animation: float 8s ease-in-out infinite;
    }
    
    .circle-2 {
      width: 600px;
      height: 600px;
      bottom: -150px;
      right: -150px;
      animation: float 10s ease-in-out infinite reverse;
    }
    
    .circle-3 {
      width: 250px;
      height: 250px;
      top: 40%;
      left: 10%;
      animation: float 6s ease-in-out infinite;
    }
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-20px) scale(1.05);
  }
}

// Content Wrapper
.content-wrapper {
  max-width: 1200px;
  margin: 120px auto;
  padding: 0 20px 60px;
  position: relative;
  z-index: 3;
}

.section {
  margin-bottom: 80px;
  
  .section-title {
    font-size: 2rem;
    font-weight: 800;
    margin-bottom: 36px;
    color: #1a1a2e;
    position: relative;
    padding-left: 20px;
    letter-spacing: -0.5px;
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 5px;
      height: 32px;
      background: linear-gradient(180deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
      border-radius: 3px;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
    
    &::after {
      content: '';
      position: absolute;
      left: 0;
      bottom: -8px;
      width: 60px;
      height: 3px;
      background: linear-gradient(90deg, #667eea, transparent);
      border-radius: 2px;
      opacity: 0.6;
    }
  }
}

// Tools Section
.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
  
  .tool-card {
        border-radius: 7px;
    /* padding: 28px; */
    display: flex;
    align-items: center;
    gap: 24px;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08), 0 2px 10px rgba(0, 0, 0, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.8);
    position: relative;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%);
      transform: translateX(-100%);
      transition: transform 0.6s;
    }
    
    &:hover {
      transform: translateY(-8px) scale(1.02);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12), 0 8px 20px rgba(0, 0, 0, 0.08);
      
      &::before {
        transform: translateX(100%);
      }
      
      .tool-arrow {
        transform: translateX(8px);
        color: #667eea;
      }
      
      .tool-icon {
        transform: scale(1.1) rotate(5deg);
      }
    }
    
  
  }
}

// Posts Section
.posts-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  
  .post-list-item {
    background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
    border-radius: 16px;
    padding: 24px 28px;
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
      transform: translateX(8px);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
      
      &::before {
        transform: scaleX(1);
      }
      
      .post-list-arrow {
        transform: translateX(4px);
        color: #667eea;
      }
    }
    
    .post-list-content {
      flex: 1;
    }
    
    .post-list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      
      .post-list-title {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 700;
        color: #1a1a2e;
        letter-spacing: -0.3px;
      }
    }
    
    .post-list-summary {
      color: #4b5563;
      font-size: 0.95rem;
      line-height: 1.7;
      margin: 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      font-weight: 400;
    }
    
    .post-list-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid rgba(0, 0, 0, 0.06);
      
      .post-list-meta {
        display: flex;
        align-items: center;
        gap: 24px;
        flex: 1;
      }
      
      .post-list-tags {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 0;
        
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
      
      .post-list-date {
        display: flex;
        align-items: center;
        gap: 6px;
        color: #9ca3af;
        font-size: 0.9rem;
        font-weight: 500;
        
        .anticon {
          font-size: 1rem;
        }
        
        span {
          line-height: 1;
        }
      }
      
      .post-list-arrow {
        font-size: 1.5rem;
        color: #d1d5db;
        transition: all 0.3s;
        font-weight: 300;
        flex-shrink: 0;
      }
    }
  }
}

.more-posts {
  text-align: center;
  margin-top: 40px;
  
  .ant-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    color: white;
    padding: 12px 32px;
    height: auto;
    font-size: 1rem;
    font-weight: 600;
    border-radius: 30px;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
      background: linear-gradient(135deg, #764ba2 0%, #f093fb 100%);
      color: white;
    }
  }
}

// Mobile Responsiveness
@media (max-width: 768px) {
  .hero-section {
    padding: 70px 20px 90px;
    
    .hero-title {
      font-size: 2.5rem;
      letter-spacing: -1px;
    }
    
    .hero-subtitle {
      font-size: 1.15rem;
      margin-bottom: 36px;
    }
    
    .hero-actions {
      flex-direction: column;
      
      .ant-btn {
        width: 100%;
        margin-left: 0 !important;
      }
    }
  }
  
  .section-title {
    font-size: 1.6rem;
    margin-bottom: 28px;
    
    &::before {
      height: 28px;
    }
  }
  
  .tools-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .posts-list {
    gap: 16px;
    
    .post-list-item {
      padding: 20px;
      
      .post-list-title {
        font-size: 1.1rem;
      }
      
      .post-list-summary {
        font-size: 0.9rem;
        -webkit-line-clamp: 3;
      }
      
      .post-list-meta {
        gap: 16px;
        flex-wrap: wrap;
      }
      
      .post-list-tags {
        width: 100%;
        margin-bottom: 8px;
      }
    }
  }
}

@media (max-width: 480px) {
  .hero-section {
    padding: 60px 16px 80px;
    
    .hero-title {
      font-size: 2rem;
    }
    
    .hero-subtitle {
      font-size: 1rem;
    }
  }
  
  .content-wrapper {
    padding: 0 16px 40px;
  }
  
  .section {
    margin-bottom: 60px;
  }
  
  .post-list-item {
    padding: 16px !important;
    
    .post-list-title {
      font-size: 1rem !important;
    }
  }
}

  .content-animation {
            width: 100%;
            height: 180px;
            transform-style: preserve-3d;
            transition: transform 300ms;
            box-shadow: 0px 0px 10px 1px #000000ee;
            border-radius: 5px;
               .back {
            background-color: #fafafb;
            position: absolute;
            width: 100%;
            height: 100%;
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            border-radius: 5px;
            overflow: hidden;
        }

        .back {
            width: 100%;
            height: 100%;
            justify-content: center;
            display: flex;
            align-items: center;
            overflow: hidden;
        }

        .back::before {
            position: absolute;
    content: ' ';
    display: block;
    width: 175px;
    height: 237%;
    background: linear-gradient(90deg, transparent, #e03636, #ff66f5, #6666ff, #66daff, transparent);
    animation: rotation_481-933e9cdf 5000ms infinite linear
        }

        .back-content {
            position: absolute;
            width: 97%;
            height: 97%;
            background-color: #fbfbfc;
            border-radius: 5px;
            color: white;
            display: flex;
            // flex-direction: column;
            padding: 10px;
            // justify-content: center;
            align-items: center;
            gap: 30px;

              .tool-icon {
      width: 72px;
      height: 72px;
      border-radius: 18px;
      display: flex;
      justify-content: center;
      align-items: center;
      color: white;
      font-size: 32px;
      flex-shrink: 0;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      z-index: 2;
    }
    
    .tool-info {
      flex: 1;
      
      h3 {
        margin: 0 0 8px;
        font-size: 1.35rem;
        color: #1a1a2e;
        font-weight: 700;
        letter-spacing: -0.3px;
      }
      
      p {
        margin: 0;
        font-size: 0.95rem;
        color: #6b7280;
        line-height: 1.6;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    }
    
    .tool-arrow {
      font-size: 1.8rem;
      color: #d1d5db;
      transition: all 0.3s;
      font-weight: 300;
      position: relative;
      z-index: 2;
    }
        }

        .card:hover .content {
            /* transform: rotateY(180deg); */
        }
        
        }

     
     

        @keyframes rotation_481 {
            0% {
                transform: rotateZ(0deg);
            }

            0% {
                transform: rotateZ(360deg);
            }
        }
</style>