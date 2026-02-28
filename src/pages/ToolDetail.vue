<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import HuarongRoad from '@/tools/HuarongRoad/index.vue'
import PaperCut from '@/tools/paperCut/index.vue'

const route = useRoute()

// Map tool IDs to components
const toolMap: Record<string, any> = {
  HuarongRoad,
  paperCut: PaperCut
}

const currentToolId = computed(() => route.params.id as string)
const currentTool = computed(() => toolMap[currentToolId.value] || null)

</script>

<template>
  <div class="tool-detail-container">
    <div class="header">
      <router-link to="/tools">← Back to Tools</router-link>
      <h2>{{ currentToolId }}</h2>
    </div>
    
    <div v-if="currentTool" class="tool-wrapper">
      <component :is="currentTool" />
    </div>
    <div v-else class="not-found">
      Tool not found.
    </div>
  </div>
</template>

<style lang="less" scoped>
.tool-detail-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  
  .header {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 30px;
    
    a {
      color: @primary-color;
      font-weight: bold;
    }
    
    h2 {
      margin: 0;
    }
  }
  
  .tool-wrapper {
    display: flex;
    justify-content: center;
    padding: 20px;
    background-color: #fff;
    border-radius: @border-radius-base;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  }
  
  .not-found {
    text-align: center;
    font-size: 1.2rem;
    color: #999;
    padding: 50px;
  }
}
</style>
