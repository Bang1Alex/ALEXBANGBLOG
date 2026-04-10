<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import HuarongRoad from '@/tools/HuarongRoad/index.vue'
import PaperCut from '@/tools/paperCut/index.vue'
import MindMap from '@/tools/MindMap/index.vue'
import MatchstickChallengeGame from '@/tools/MatchstickChallengeGame/index.vue'
import NineLinkedRings from '@/tools/NineLinkedRings/index.vue'
import Gallery from '@/tools/3DGallery/index.vue'


const route = useRoute()

// Map tool IDs to components
const toolMap: Record<string, any> = {
  HuarongRoad,
  PaperCut,
  MindMap,
  MatchstickChallengeGame,
  NineLinkedRings,
  Gallery
}

const currentToolId = computed(() => route.params.id as string)
const currentTool = computed(() => toolMap[currentToolId.value] || null)
console.log(currentToolId.value);

</script>

<template>
  <div class="tool-detail-container">
    <div class="header">
      <router-link to="/tools" class="back-link">
        <span class="back-icon">←</span>
        <span>返回工具列表</span>
      </router-link>
      <h2>{{ currentTool.value?.name || currentToolId }}</h2>
    </div>
    
    <div v-if="currentTool" class="tool-wrapper">
      <component :is="currentTool" />
    </div>
    <div v-else class="not-found">
      工具未找到
    </div>
  </div>
</template>

<style lang="less" scoped>
.tool-detail-container {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 40px 20px 80px;
  box-sizing: border-box;
  
  .header {
    max-width: 1200px;
    margin: 0 auto 30px;
    display: flex;
    align-items: center;
    gap: 20px;
    
    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 30px;
      font-weight: 600;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
      text-decoration: none;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
        background: linear-gradient(135deg, #764ba2 0%, #f093fb 100%);
        color: white;
      }
      
      .back-icon {
        font-size: 1.2rem;
        transition: transform 0.3s;
      }
      
      &:hover .back-icon {
        transform: translateX(-4px);
      }
    }
    
    h2 {
      margin: 0;
      font-size: 1.8rem;
      font-weight: 700;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  }
  
  .tool-wrapper {
    max-width: 1200px;
    margin: 0 auto;
    background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
    border-radius: 20px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.8);
    overflow: hidden;
    min-height: 600px;
  }
  
  .not-found {
    max-width: 1200px;
    margin: 0 auto;
    text-align: center;
    font-size: 1.2rem;
    color: #6b7280;
    padding: 80px 20px;
    background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
    border-radius: 20px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.8);
  }
}

@media (max-width: 768px) {
  .tool-detail-container {
    padding: 30px 16px 60px;
  }
  
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    
    h2 {
      font-size: 1.5rem;
    }
  }
  
  .tool-wrapper {
    min-height: 500px;
  }
  
  .not-found {
    padding: 60px 20px;
  }
}

@media (max-width: 480px) {
  .tool-detail-container {
    padding: 20px 12px 40px;
  }
  
  .header {
    .back-link {
      padding: 10px 20px;
      font-size: 0.9rem;
    }
    
    h2 {
      font-size: 1.3rem;
    }
  }
  
  .tool-wrapper {
    border-radius: 16px;
    min-height: 400px;
  }
}
</style>
