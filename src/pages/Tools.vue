<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ScissorOutlined, DeploymentUnitOutlined, AppstoreOutlined, FireOutlined, MonitorOutlined, MacCommandOutlined } from '@ant-design/icons-vue'

const router = useRouter()

const tools = ref([
  {
    id:'PaperCut',
    name:'剪纸',
    description:'一款面向在线教育场景的仿真剪纸互动控件，通过 Canvas 技术模拟真实纸张的折叠、剪刻与展开效果',
    icon:ScissorOutlined,
    color: '#F56C6C'
  }, 
  {
    id:'MindMap',
    name:'思维导图',
    description:'一款基于 Vue.js 框架的思维导图组件，支持创建、编辑、分享和导出思维导图，同时提供了丰富的主题和插件扩展功能',
    icon:DeploymentUnitOutlined,
    color: '#E6A23C'
  },
   { 
    id: 'HuarongRoad', 
    name: '华容道', 
    description: '基于 Konva.js 交互引擎 开发 "华容道"益智互动组件 ，实现 拖拽解谜、智能吸附、步数记录与路径回溯 ，助力 学生逻辑思维训练与趣味化学习',
    icon: AppstoreOutlined,
    color: '#fa8c16'
  },
  {
    id:'MatchstickChallengeGame',
    name:'火柴棒挑战',
    description:'基于 Konva.js 引擎开发的益智游戏，通过移动火柴棒修复数学等式，锻炼逻辑思维与空间想象力',
    icon:FireOutlined,
    color: '#fa541c'
  },
  {
    id:'NineLinkedRings',
    name:'九宫格链接环',
    description:'一款基于 Konva.js 引擎开发的益智游戏，通过拖动链接环，将相同数字的环连接起来，最终形成完整的九宫格',
    icon:MonitorOutlined,
    color: '#8b4513'
  },
  {
    id:'Gallery',
    name:'3D展馆',
    description:'基于 Three.js 3D渲染引擎 开发 3D作品画廊与统计可视化工具 ，实现 学生作业/作品的沉浸式3D展示与互动 ，助力 教学成果生动化呈现与学生作品互评 ',
    icon:MacCommandOutlined,
    color: '#8b4513'
  }
])

const openTool = (id: string) => {
  router.push(`/tools/${id}`)
}
</script>

<template>
  <div class="tools-container">
    <div class="tools-header">
      <h1 class="tools-title">互动工具</h1>
      <p class="tools-subtitle">探索创意工具，体验互动乐趣</p>
    </div>
    <div class="tools-grid">
      <div 
        v-for="tool in tools" 
        :key="tool.id" 
        class="tool-card"
        @click="openTool(tool.id)"
      >
        <div class="tool-card-content">
          <div class="tool-icon" :style="{ backgroundColor: tool.color }">
            <component :is="tool.icon" />
          </div>
          <div class="tool-info">
            <h3>{{ tool.name }}</h3>
            <p>{{ tool.description }}</p>
          </div>
          <div class="tool-arrow">→</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.tools-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px 80px;
}

.tools-header {
  text-align: center;
  margin-bottom: 60px;
  
  .tools-title {
    font-size: 3rem;
    font-weight: 900;
    margin-bottom: 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -1px;
  }
  
  .tools-subtitle {
    font-size: 1.2rem;
    color: #6b7280;
    font-weight: 400;
  }
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 32px;
}

.tool-card {
  background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 24px;
  padding: 36px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.8);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #667eea, #764ba2, #f093fb);
    transform: scaleX(0);
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
    
    &::before {
      transform: scaleX(1);
    }
    
    .tool-arrow {
      transform: translateX(8px);
      color: #667eea;
    }
    
    .tool-icon {
      transform: scale(1.1) rotate(5deg);
    }
  }
  
  .tool-card-content {
    display: flex;
    align-items: center;
    gap: 24px;
    height: 100%;
  }
  
  .tool-icon {
    width: 72px;
    height: 72px;
    border-radius: 18px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    font-size: 32px;
    flex-shrink: 0;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    z-index: 2;
  }
  
  .tool-info {
    flex: 1;
    
    h3 {
      margin: 0 0 12px;
      font-size: 1.4rem;
      color: #1a1a2e;
      font-weight: 700;
      letter-spacing: -0.3px;
    }
    
    p {
      margin: 0;
      font-size: 0.95rem;
      color: #6b7280;
      line-height: 1.7;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }
  
  .tool-arrow {
    font-size: 1.8rem;
    color: #d1d5db;
    transition: all 0.3s;
    font-weight: 300;
    flex-shrink: 0;
  }
}

@media (max-width: 768px) {
  .tools-container {
    padding: 30px 16px 60px;
  }
  
  .tools-header {
    margin-bottom: 40px;
    
    .tools-title {
      font-size: 2.2rem;
    }
    
    .tools-subtitle {
      font-size: 1rem;
    }
  }
  
  .tools-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .tool-card {
    padding: 24px;
    
    .tool-card-content {
      gap: 16px;
    }
    
    .tool-icon {
      width: 56px;
      height: 56px;
      font-size: 24px;
    }
    
    .tool-info h3 {
      font-size: 1.15rem;
    }
    
    .tool-info p {
      font-size: 0.85rem;
      -webkit-line-clamp: 3;
    }
  }
}

@media (max-width: 480px) {
  .tools-container {
    padding: 20px 12px 40px;
  }
  
  .tools-header {
    margin-bottom: 30px;
    
    .tools-title {
      font-size: 1.8rem;
    }
  }
  
  .tool-card {
    padding: 20px;
    
    .tool-card-content {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }
    
    .tool-icon {
      width: 48px;
      height: 48px;
      font-size: 20px;
    }
    
    .tool-arrow {
      align-self: flex-end;
      margin-top: -40px;
    }
  }
}
</style>
