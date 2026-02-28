<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

type PostMeta = {
  slug: string
  title: string
  summary: string
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
    return text.slice(0, 120)
  }
  return ''
}

onMounted(async () => {
  const entries = Object.entries(postLoaders)
    .map(([filePath, loader]) => ({ slug: getBasename(filePath), loader }))
    .sort((a, b) => a.slug.localeCompare(b.slug, 'zh-Hans-CN'))

  posts.value = await Promise.all(
    entries.map(async ({ slug, loader }) => {
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
</script>

<template>
  <div class="blog-container">
    <h2>Latest Articles</h2>
    <div class="post-list">
      <el-card v-for="post in posts" :key="post.slug" class="post-card" shadow="hover" @click="goToPost(post.slug)">
        <template #header>
          <div class="card-header">
            <span>{{ post.title }}</span>
          </div>
        </template>
        <div class="summary">{{ post.summary }}</div>
      </el-card>
    </div>
  </div>
</template>

<style lang="less" scoped>
.blog-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  
  h2 {
    margin-bottom: 30px;
    text-align: center;
  }
  
  .post-card {
    margin-bottom: 20px;
    cursor: pointer;
    transition: transform 0.2s;
    
    &:hover {
      transform: translateY(-2px);
    }
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: bold;
      font-size: 1.1rem;
      
      .date {
        font-size: 0.9rem;
        color: #999;
        font-weight: normal;
      }
    }
    
    .summary {
      color: #666;
      line-height: 1.6;
    }
  }
}
</style>
