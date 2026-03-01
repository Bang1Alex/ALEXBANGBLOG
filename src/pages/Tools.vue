<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const tools = ref([
 
  {
    id:'PaperCut',
    name:'剪纸',
    description:'一款面向在线教育场景的仿真剪纸互动控件，通过 Canvas 技术模拟真实纸张的折叠、剪刻与展开效果',
    icon:'ScissorOutlined',
    color: '#ff4d4f'
  }, 
  {
    id:'MindMap',
    name:'思维导图',
    description:'一款基于 Vue.js 框架的思维导图组件，支持创建、编辑、分享和导出思维导图，同时提供了丰富的主题和插件扩展功能',
    icon:'DeploymentUnitOutlined',
    color: '#1890ff'
  },
   { 
    id: 'HuarongRoad', 
    name: '华容道', 
    description: '基于 Konva.js 交互引擎 开发 “华容道”益智互动组件 ，实现 拖拽解谜、智能吸附、步数记录与路径回溯 ，助力 学生逻辑思维训练与趣味化学习',
    icon: 'AppstoreOutlined',
    color: '#fa8c16'
  },
  {
    id:'MatchstickChallengeGame',
    name:'火柴棒挑战',
    description:'基于 Konva.js 引擎开发的益智游戏，通过移动火柴棒修复数学等式，锻炼逻辑思维与空间想象力',
    icon:'FireOutlined',
    color: '#fa541c'
  },
  {
    id:'NineLinkedRings',
    name:'九宫格链接环',
    description:'一款基于 Konva.js 引擎开发的益智游戏，通过拖动链接环，将相同数字的环连接起来，最终形成完整的九宫格',
    icon:'FireOutlined',
    color: '#fa541c'
  },
])

const openTool = (id: string) => {
  router.push(`/tools/${id}`)
}
</script>

<template>
  <div class="tools-container">
    <h2>互动工具</h2>
    <div class="tools-grid">
      <a-card 
        v-for="tool in tools" 
        :key="tool.id" 
        class="tool-card" 
        hoverable 
        @click="openTool(tool.id)"
      >
        <div class="tool-content">
          <component :is="tool.icon" :style="{ fontSize: '40px', color: tool.color || '#1890ff' }" />
          <h3>{{ tool.name }}</h3>
          <p>{{ tool.description }}</p>
        </div>
      </a-card>
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
    color: #fff; /* 确保标题在深色背景下可见 */
    font-size: 2rem;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
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
