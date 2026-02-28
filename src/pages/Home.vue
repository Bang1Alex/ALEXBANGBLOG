<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="home-container">
    <h1>Welcome to Alex's Blog</h1>
    <p>A place to share thoughts and Vue widgets.</p>
    <div class="actions">
      <el-button type="primary" @click="router.push('/blog')">Read Blog</el-button>
      <el-button type="success" @click="router.push('/tools')">Try Tools</el-button>
    </div>
  </div>
</template>

<style lang="less" scoped>
.home-container {
  text-align: center;
  padding: 50px 20px;
  
  h1 {
    font-size: 2.5rem;
    margin-bottom: 20px;
  }
  
  p {
    font-size: 1.2rem;
    color: #666;
    margin-bottom: 40px;
  }
  
  .actions {
    display: flex;
    justify-content: center;
    gap: 20px;
  }
}
</style>
