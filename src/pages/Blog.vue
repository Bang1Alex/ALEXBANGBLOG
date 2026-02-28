<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Mock data for now, later fetch from store/API
const posts = ref([
  { id: '1', title: 'Hello World', date: '2023-10-01', summary: 'My first post.' },
  { id: '2', title: 'Vue 3 Tips', date: '2023-10-05', summary: 'Some useful tips for Vue 3 development.' }
])

const goToPost = (id: string) => {
  router.push(`/blog/${id}`)
}
</script>

<template>
  <div class="blog-container">
    <h2>Latest Articles</h2>
    <div class="post-list">
      <el-card v-for="post in posts" :key="post.id" class="post-card" shadow="hover" @click="goToPost(post.id)">
        <template #header>
          <div class="card-header">
            <span>{{ post.title }}</span>
            <span class="date">{{ post.date }}</span>
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
