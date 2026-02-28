<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const tools = ref([
  { 
    id: 'HuarongRoad', 
    name: 'Huarong Road', 
    description: 'A classic sliding block puzzle game.',
    icon: 'Grid' // Using Element Plus Icon name
  }
])

const openTool = (id: string) => {
  router.push(`/tools/${id}`)
}
</script>

<template>
  <div class="tools-container">
    <h2>Interactive Tools</h2>
    <div class="tools-grid">
      <el-card 
        v-for="tool in tools" 
        :key="tool.id" 
        class="tool-card" 
        shadow="hover" 
        @click="openTool(tool.id)"
      >
        <div class="tool-content">
          <el-icon :size="40" color="#409EFF"><component :is="tool.icon" /></el-icon>
          <h3>{{ tool.name }}</h3>
          <p>{{ tool.description }}</p>
        </div>
      </el-card>
    </div>
  </div>
</template>

<style lang="less" scoped>
.tools-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  
  h2 {
    text-align: center;
    margin-bottom: 40px;
  }
  
  .tools-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
    
    .tool-card {
      cursor: pointer;
      text-align: center;
      transition: all 0.3s;
      
      &:hover {
        transform: translateY(-5px);
      }
      
      .tool-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 15px;
        
        h3 {
          margin: 0;
          font-size: 1.2rem;
        }
        
        p {
          margin: 0;
          color: #666;
          font-size: 0.9rem;
        }
      }
    }
  }
}
</style>
