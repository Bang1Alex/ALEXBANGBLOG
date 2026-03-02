<template>
  <div class="nine-rings-container">
    <div class="game-area">
      <div id="container" ref="refContainer" class="canvas-container"></div>
    </div>
    
    <div class="sidebar">
      <a-card class="control-panel" title="控制面板">
        <div class="actions">
          <a-button type="primary" @click="hintsButton">提示 / 演示</a-button>
          <a-button @click="undo">撤销</a-button>
        </div>

        <div class="settings">
           <a-form layout="vertical">
             <a-form-item label="环数">
               <a-input-number v-model:value="rings" :min="3" :max="9" />
             </a-form-item>
             <a-form-item label="布局方向">
                <a-radio-group v-model:value="direction" button-style="solid">
                  <a-radio-button value="left">左式</a-radio-button>
                  <a-radio-button value="right">右式</a-radio-button>
                </a-radio-group>
             </a-form-item>
           </a-form>
        </div>
      </a-card>

      <a-card class="steps-panel" :title="`解法步骤 (${operations.length})`">
        <div class="steps-list" style="height: 240px;" v-if="operations && operations.length">
           <a-timeline>
             <a-timeline-item
               v-for="(item, index) in operations"
               :key="index"
             >
               <template #dot>
                 <a-tag :color="item.dirction == 'down' ? 'success' : 'warning'" style="margin: 0">
                   第 {{ index + 1 }} 步
                 </a-tag>
               </template>
               <a-card size="small" :bodyStyle="{ padding: '8px 12px' }">
                 <div class="step-content">
                   <span class="ring-num">环 {{ getNumber(item.id) }}</span>
                   <span :style="{ color: item.dirction == 'down' ? '#52c41a' : '#faad14', fontWeight: 'bold' }">
                     {{ item.dirction == 'down' ? '下' : '上' }}
                   </span>
                 </div>
               </a-card>
             </a-timeline-item>
           </a-timeline>
        </div>
        <div v-else class="empty-steps">
          <a-empty description="暂无步骤，点击“提示”开始演示" :image-style="{ height: '100px' }" />
        </div>
      </a-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import { throttle } from 'lodash';
import NineLinkedRingsRight from './NineLinkedRingsRight.js'
import NineLinkedRingsLeft from './NineLinkedRingsLeft.js'

const rings = ref(9)
const widgetSize = ref({ width: 1200, height: 600 });
const direction = ref('left');
const refContainer = ref();
const nineLinkedRings = ref()
const operations = ref<any[]>([])

const initGame = () => {
    if (!refContainer.value) return;
    
    // Clear previous canvas if any
    refContainer.value.innerHTML = ''; 

    if (direction.value == 'left') {
        nineLinkedRings.value = new NineLinkedRingsLeft(refContainer.value, widgetSize.value.width, widgetSize.value.height, rings.value, {
            operations: operations.value
        });
    } else {
        nineLinkedRings.value = new NineLinkedRingsRight(refContainer.value, widgetSize.value.width, widgetSize.value.height, rings.value, {
            operations: operations.value
        });
    }
}

watch(rings, (val) => {
    if (nineLinkedRings.value) {
        nineLinkedRings.value.numOfRings = val;
        nineLinkedRings.value.initRingState();
        nineLinkedRings.value.createLinkedRings();
    }
})

watch(direction, () => {
    initGame();
})

onMounted(() => {
    initGame();
});

function hintsButton() {
    nineLinkedRings.value?.hintsButton();
}

function getNumber(id: number) {
    const num = ['①', "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨"]
    return num[id] || id + 1
}

const undo = throttle(resetDo, 500)
function resetDo() {
    nineLinkedRings.value?.undo();
}
</script>

<style scoped lang="less">
.nine-rings-container {
  display: flex;
  height: 100%;
  gap: 20px;
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px); 

  .game-area {
    flex: 1;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    display: flex;
   //  justify-content: center;
    align-items: center;
    overflow: hidden;
    position: relative;
    min-height: 600px;
    
    .canvas-container {
       // Konva canvas container
    }
  }

  .sidebar {
    width: 320px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    
    .control-panel {
        .card-header {
            font-weight: bold;
        }
        .actions {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            flex-wrap: wrap;
        }
    }

    .steps-panel {
        flex: 1;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        // min-height: 300px;
        
        .card-header {
            font-weight: bold;
        }

        .steps-list {
            height: 240px;
            overflow-y: auto;
            padding-right: 10px;
            padding-top: 10px;
            
            &::-webkit-scrollbar {
                width: 6px;
            }
            &::-webkit-scrollbar-thumb {
                background-color: #dcdfe6;
                border-radius: 3px;
            }
            
            .step-content {
                display: flex;
                justify-content: space-between;
                align-items: center;
                
                .ring-num {
                    font-weight: bold;
                    font-size: 1.1rem;
                }
            }
        }
        
        .empty-steps {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100%;
        }
    }
  }
}

// Responsive layout
@media (max-width: 1000px) {
    .nine-rings-container {
        flex-direction: column;
        height: auto;
        
        .game-area {
            min-height: 400px;
        }
        
        .sidebar {
            width: 100%;
            flex-direction: row;
            flex-wrap: wrap;
            align-items: flex-start;
            
            .control-panel, .steps-panel {
                flex: 1;
                min-width: 300px;
            }
            
            .steps-panel {
                height: 400px; // Fixed height in responsive mode
            }
        }
    }
}
</style>