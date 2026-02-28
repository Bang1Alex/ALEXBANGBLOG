<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import MarkdownIt from 'markdown-it'
const route = useRoute()
const content = ref('')
const loading = ref(true)

const postLoaders = import.meta.glob('../../posts/*.md', { as: 'raw' }) as Record<
  string,
  () => Promise<string>
>

const getBasename = (filePath: string) => {
  const parts = filePath.split(/[\\/]/)
  const fileName = parts[parts.length - 1] ?? ''
  return fileName.replace(/\.md$/i, '')
}

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
})

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
  }
}

watch(
  () => route.params.id,
  () => {
    void loadPost()
  },
  { immediate: true }
)

const renderedContent = computed(() => {
  return md.render(content.value)
})
</script>

<template>
  <div class="post-container">
    <el-skeleton v-if="loading" :rows="5" animated />
    <div v-else class="markdown-body" v-html="renderedContent"></div>
    <div class="back-link">
      <router-link to="/blog">← Back to Blog</router-link>
    </div>
  </div>
</template>

<style lang="less" scoped>
.post-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  
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
</style>
