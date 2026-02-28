<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Edit, Monitor, Scissor, Grid } from '@element-plus/icons-vue'

const router = useRouter()

// --- Post Logic ---
type PostMeta = {
  slug: string
  title: string
  summary: string
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
  const noCode = markdown.replace(/```[\s\S]*?```/g, '')
  const lines = noCode.split(/\r?\n/)
  for (const line of lines) {
    const text = line.trim()
    if (!text) continue
    if (text.startsWith('#')) continue
    if (text.startsWith('>')) continue
    if (text.startsWith('-')) continue
    if (text.startsWith('*')) continue
    if (/^\d+\./.test(text)) continue
    return text.slice(0, 100) + (text.length > 100 ? '...' : '')
  }
  return ''
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
      const summary = extractSummary(markdown)
      return {
        slug,
        title: slug,
        summary,
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
    id: 'HuarongRoad',
    name: '华容道',
    desc: '经典益智游戏，挑战你的逻辑思维。',
    icon: Grid,
    color: '#E6A23C'
  },
  {
    id: 'paperCut',
    name: '剪纸工具',
    desc: '自由创作剪纸艺术，感受传统文化魅力。',
    icon: Scissor,
    color: '#F56C6C'
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
        <h1 class="hero-title">Welcome to <span class="highlight">Alex's Blog</span></h1>
        <p class="hero-subtitle">
          探索技术之美，记录成长点滴。这里汇聚了前端技术分享、创意工具开发以及我的思考与实践。
        </p>
        <div class="hero-actions">
          <el-button type="primary" size="large" round @click="router.push('/blog')">
            <el-icon class="mr-2"><Edit /></el-icon> 阅读文章
          </el-button>
          <el-button size="large" round @click="router.push('/tools')">
            <el-icon class="mr-2"><Monitor /></el-icon> 体验工具
          </el-button>
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
            <div class="tool-icon" :style="{ backgroundColor: tool.color }">
              <el-icon><component :is="tool.icon" /></el-icon>
            </div>
            <div class="tool-info">
              <h3>{{ tool.name }}</h3>
              <p>{{ tool.desc }}</p>
            </div>
            <div class="tool-arrow">→</div>
          </div>
        </div>
      </section>

      <!-- Recent Posts -->
      <section class="section posts-section">
        <h2 class="section-title">最新文章 / Recent Posts</h2>
        <div class="posts-grid">
          <el-card 
            v-for="post in recentPosts" 
            :key="post.slug" 
            class="post-card" 
            shadow="hover"
            @click="goToPost(post.slug)"
          >
            <template #header>
              <div class="post-header">
                <span class="post-title">{{ post.title }}</span>
                <el-tag size="small" effect="plain">Article</el-tag>
              </div>
            </template>
            <p class="post-summary">{{ post.summary }}</p>
            <div class="post-footer">
              <span>Read More</span>
              <el-icon><Edit /></el-icon>
            </div>
          </el-card>
        </div>
        <div class="more-posts">
          <el-button text bg @click="router.push('/blog')">查看更多文章</el-button>
        </div>
      </section>

    </div>
  </div>
</template>

<style lang="less" scoped>
.home-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

// Hero Section
.hero-section {
  position: relative;
  background: linear-gradient(135deg, #1e293b 0%, #3b82f6 100%);
  color: white;
  padding: 80px 20px 100px;
  text-align: center;
  overflow: hidden;
  margin-bottom: -40px; // Pull content up
  
  .hero-content {
    position: relative;
    z-index: 2;
    max-width: 800px;
    margin: 0 auto;
    
    .hero-title {
      font-size: 3.5rem;
      font-weight: 800;
      margin-bottom: 20px;
      letter-spacing: -1px;
      
      .highlight {
        color: #60a5fa;
        background: linear-gradient(to right, #60a5fa, #a78bfa);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
    }
    
    .hero-subtitle {
      font-size: 1.25rem;
      color: rgba(255, 255, 255, 0.9);
      margin-bottom: 40px;
      line-height: 1.6;
    }
    
    .hero-actions {
      display: flex;
      justify-content: center;
      gap: 20px;
      
      .mr-2 {
        margin-right: 8px;
      }
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
      opacity: 0.1;
      background: white;
    }
    
    .circle-1 {
      width: 300px;
      height: 300px;
      top: -50px;
      left: -50px;
    }
    
    .circle-2 {
      width: 500px;
      height: 500px;
      bottom: -100px;
      right: -100px;
    }
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
  margin-bottom: 60px;
  
  .section-title {
    font-size: 1.8rem;
    font-weight: bold;
    margin-bottom: 30px;
    color: #303133;
    position: relative;
    padding-left: 15px;
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 24px;
      background-color: @primary-color;
      border-radius: 2px;
    }
  }
}

// Tools Section
.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  
  .tool-card {
    background: white;
    border-radius: 12px;
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 20px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    
    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      
      .tool-arrow {
        transform: translateX(5px);
        color: @primary-color;
      }
    }
    
    .tool-icon {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: flex;
      justify-content: center;
      align-items: center;
      color: white;
      font-size: 28px;
      flex-shrink: 0;
    }
    
    .tool-info {
      flex: 1;
      
      h3 {
        margin: 0 0 5px;
        font-size: 1.2rem;
        color: #303133;
      }
      
      p {
        margin: 0;
        font-size: 0.9rem;
        color: #909399;
        line-height: 1.4;
      }
    }
    
    .tool-arrow {
      font-size: 1.5rem;
      color: #dcdfe6;
      transition: all 0.3s;
    }
  }
}

// Posts Section
.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  
  .post-card {
    height: 100%;
    display: flex;
    flex-direction: column;
    border: none;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    transition: all 0.3s;
    
    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    }
    
    .post-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .post-title {
        font-size: 1.1rem;
        font-weight: bold;
        color: #303133;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
    
    .post-summary {
      color: #606266;
      font-size: 0.95rem;
      line-height: 1.6;
      margin: 10px 0 20px;
      flex: 1;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .post-footer {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 5px;
      color: @primary-color;
      font-size: 0.9rem;
      font-weight: 500;
    }
  }
}

.more-posts {
  text-align: center;
  margin-top: 30px;
}

// Mobile Responsiveness
@media (max-width: 768px) {
  .hero-section {
    padding: 60px 20px 80px;
    
    .hero-title {
      font-size: 2.5rem;
    }
    
    .hero-actions {
      flex-direction: column;
      
      .el-button {
        width: 100%;
        margin-left: 0 !important;
      }
    }
  }
  
  .section-title {
    font-size: 1.5rem;
  }
}
</style>