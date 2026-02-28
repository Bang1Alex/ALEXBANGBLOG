<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'

const route = useRoute()
const content = ref('')
const loading = ref(true)

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value
      } catch (__) {}
    }
    return '' // use external default escaping
  }
})

// Mock loading a post based on ID
// In a real app, this would fetch from an API or import the file dynamically
onMounted(async () => {
  const id = route.params.id as string
  loading.value = true
  
  try {
    // Determine which file to load based on ID
    // For now, we simulate content. In production, use import.meta.glob or similar.
    // Example: const modules = import.meta.glob('/posts/*.md', { as: 'raw' })
    
    // Simulating delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    if (id === '1') {
      content.value = '# Hello World\n\nThis is my **first** blog post.\n\n```javascript\nconsole.log("Hello Vue 3");\n```'
    } else if (id === '2') {
      content.value = '# Vue 3 Tips\n\n- Use Composition API\n- Use Pinia\n- Use Vite'
    } else {
      content.value = '# Post Not Found'
    }
  } catch (e) {
    content.value = '# Error loading post'
  } finally {
    loading.value = false
  }
})

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
    
    // Basic Markdown Styles
    :deep(h1) { border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
    :deep(pre) { background-color: #282c34; padding: 16px; border-radius: 6px; overflow: auto; }
    :deep(code) { font-family: monospace; }
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
