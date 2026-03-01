<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const selectedKeys = ref<string[]>(['/'])

watch(() => route.path, (newPath) => {
  // Simple matching to highlight correct menu item
  if (newPath.startsWith('/blog')) selectedKeys.value = ['/blog']
  else if (newPath.startsWith('/tools')) selectedKeys.value = ['/tools']
  else selectedKeys.value = ['/']
})

const handleClick = ({ key }: { key: string }) => {
  router.push(key)
}
</script>

<template>
  <a-layout class="app-container">
    <a-layout-header class="header">
      <div class="logo" @click="handleClick({ key: '/' })">Alex Blog</div>
      <a-menu
        v-model:selectedKeys="selectedKeys"
        mode="horizontal"
        theme="light"
        class="menu"
        @click="handleClick"
      >
        <a-menu-item key="/">首页</a-menu-item>
        <a-menu-item key="/blog">博客</a-menu-item>
        <a-menu-item key="/tools">工具</a-menu-item>
      </a-menu>
    </a-layout-header>
    
    <a-layout-content class="main-content">
      <router-view />
    </a-layout-content>
    
    <a-layout-footer class="footer">
      <p>&copy; 2023 Alex Blog</p>
    </a-layout-footer>
  </a-layout>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  align-items: center;
  background: #fff;
  padding: 0 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  z-index: 1000;
  position: sticky;
  top: 0;
  width: 100%;
}

.logo {
  font-weight: bold;
  font-size: 1.2rem;
  color: #1890ff;
  margin-right: 20px;
  flex-shrink: 0;
  cursor: pointer;
}

.menu {
  flex: 1;
  border-bottom: none;
  justify-content: flex-end;
}

.main-content {
  flex: 1;
  padding: 20px;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  background: #fff; 
}

/* Ant Design Layout Content usually has grey background, override if needed */
:deep(.ant-layout-content) {
  background: #fff;
}

.footer {
  text-align: center;
  color: #999;
  padding: 20px;
  background-color: #f5f7fa;
  font-size: 0.9rem;
}
</style>
