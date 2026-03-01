<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeftOutlined } from '@ant-design/icons-vue'
import HuarongRoad from '@/tools/HuarongRoad/index.vue'
import PaperCut from '@/tools/paperCut/index.vue'
import MindMap from '@/tools/MindMap/index.vue'
import MatchstickChallengeGame from '@/tools/MatchstickChallengeGame/index.vue'
import NineLinkedRings from '@/tools/NineLinkedRings/index.vue'



const route = useRoute()

// Map tool IDs to components
const toolMap: Record<string, any> = {
  HuarongRoad,
  PaperCut,
  MindMap,
  MatchstickChallengeGame,
  NineLinkedRings
}

const currentToolId = computed(() => route.params.id as string)
const currentTool = computed(() => toolMap[currentToolId.value] || null)
console.log(currentToolId.value);

</script>

<template>
  <div class="tool-detail-container">
    <div class="header">
      <router-link to="/tools" class="back-link">
        <arrow-left-outlined /> 返回工具列表
      </router-link>
      <!-- {{ currentTool}} {{ currentToolId }} -->
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
  margin: 0 auto;
  padding: 20px;
  box-sizing: border-box;
  
  .header {
    max-width: 1400px;
    margin: 0 auto 30px;
    display: flex;
    align-items: center;
    gap: 20px;
    
    .back-link {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 20px;
      color: #fff;
      font-weight: 500;
      transition: all 0.3s ease;
      text-decoration: none;
      backdrop-filter: blur(4px);

      &:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: translateX(-2px);
      }
    }
    
    h2 {
      margin: 0;
      color: #fff;
      font-size: 1.8rem;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    }
  }
  
  .tool-wrapper {
    width: 100%;
    background-color: #fff;
    border-radius: @border-radius-base;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    overflow: hidden; /* 防止内容溢出 */
  }
  
  .not-found {
    text-align: center;
    font-size: 1.2rem;
    color: #999;
    padding: 50px;
  }
}
</style>
