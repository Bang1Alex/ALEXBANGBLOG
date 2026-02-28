<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const activeIndex = ref('/')

watch(() => route.path, (newPath) => {
  // Simple matching to highlight correct menu item
  if (newPath.startsWith('/blog')) activeIndex.value = '/blog'
  else if (newPath.startsWith('/tools')) activeIndex.value = '/tools'
  else activeIndex.value = '/'
})

const handleSelect = (key: string) => {
  activeIndex.value = key
  router.push(key)
}
</script>

<template>
  <el-container class="app-container">
    <el-header>
      <el-menu
        :default-active="activeIndex"
        class="el-menu-demo"
        mode="horizontal"
        :ellipsis="false"
        @select="handleSelect"
      >
        <el-menu-item index="/">
          <div class="logo">Alex Blog</div>
        </el-menu-item>
        <div class="flex-grow" />
        <el-menu-item index="/">Home</el-menu-item>
        <el-menu-item index="/blog">Blog</el-menu-item>
        <el-menu-item index="/tools">Tools</el-menu-item>
      </el-menu>
    </el-header>
    
    <el-main>
      <router-view />
    </el-main>
    
    <el-footer>
      <p>&copy; 2023 Alex Blog. Built with Vue 3 + Element Plus.</p>
    </el-footer>
  </el-container>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.flex-grow {
  flex-grow: 1;
}

.logo {
  font-weight: bold;
  font-size: 1.2rem;
  color: #409EFF;
}

.el-header {
  padding: 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  z-index: 100;
}

.el-main {
  flex: 1;
  padding: 20px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.el-footer {
  text-align: center;
  color: #999;
  padding: 20px;
  background-color: #f5f7fa;
  font-size: 0.9rem;
}
</style>
