<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const tools = ref([
 
  {
    id:'paperCut',
    name:'剪纸',
    description:'一款面向在线教育场景的仿真剪纸互动控件，通过 Canvas 技术模拟真实纸张的折叠、剪刻与展开效果',
    icon:'Tools'
  }, 
  { 
    id: 'HuarongRoad', 
    name: '华容道', 
    description: '基于 Konva.js 交互引擎 开发 “华容道”益智互动组件 ，实现 拖拽解谜、智能吸附、步数记录与路径回溯 ，助力 学生逻辑思维训练与趣味化学习',
    icon: 'Tools' // Using Element Plus Icon name
  },
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
