<template>
  <div class="mindmap-container">
    <div class="header-toolbar">
      <div class="tool-group">
        <a-tooltip title="回退">
          <a-button :disabled="isStart" @click="execCommand('BACK')" type="text">
            <template #icon><undo-outlined /></template>
          </a-button>
        </a-tooltip>
        <a-tooltip title="前进">
          <a-button :disabled="isEnd" @click="execCommand('FORWARD')" type="text">
            <template #icon><redo-outlined /></template>
          </a-button>
        </a-tooltip>
      </div>
      <a-divider type="vertical" />
      <div class="tool-group">
        <a-tooltip title="格式刷">
          <a-button :type="isInPainter ? 'primary' : 'text'" :disabled="activeNodes.length === 0" @click="execCommand('paintBrush')">
            <template #icon><format-painter-outlined /></template>
          </a-button>
        </a-tooltip>
      </div>
      <a-divider type="vertical" />
      <div class="tool-group">
        <a-tooltip title="同级节点 (Enter)">
          <a-button :disabled="activeNodes.length === 0 || activeNodes[0].isRoot" @click="execCommand('INSERT_NODE')" type="text">
            <template #icon><node-index-outlined /></template> 同级
          </a-button>
        </a-tooltip>
        <a-tooltip title="子节点 (Tab)">
          <a-button :disabled="activeNodes.length === 0" @click="execCommand('INSERT_CHILD_NODE')" type="text">
            <template #icon><apartment-outlined /></template> 子级
          </a-button>
        </a-tooltip>
        <a-tooltip title="删除节点 (Del)">
          <a-button :disabled="activeNodes.length === 0" @click="execCommand('REMOVE_NODE')" type="text" danger>
            <template #icon><delete-outlined /></template>
          </a-button>
        </a-tooltip>
        <a-tooltip title="关联线">
          <a-button :disabled="activeNodes.length === 0" @click="execCommand('releaseLine')" type="text">
            <template #icon><share-alt-outlined /></template> 关联
          </a-button>
        </a-tooltip>
      </div>
    </div>
    
    <div class="main-content">
      <div class="canvas-wrapper">
         <div id="mindMapContainer" ref="refContainer" :style="{ width: widgetWidth, height: widgetHeight }"></div>
      </div>
      
      <div class="side-panel">
        <div class="panel-trigger" @click="clickCustomToolbar('nodeStyle')" :class="{ active: customToolbarTitle === '节点样式' && visible }">
          <font-size-outlined />
          <span>样式</span>
        </div>
        <div class="panel-trigger" @click="clickCustomToolbar('theme')" :class="{ active: customToolbarTitle === '主题' && visible }">
          <skin-outlined />
          <span>主题</span>
        </div>
        <div class="panel-trigger" @click="clickCustomToolbar('structure')" :class="{ active: customToolbarTitle === '结构' && visible }">
          <branches-outlined />
          <span>结构</span>
        </div>
      </div>
    </div>

    <a-drawer placement="right" :closable="true" width="320px" :mask="false" :open="visible"
      @close="visible = false" :get-container="false" :style="{ position: 'absolute' }">
      <template #title>
        <div class="drawer-title">
          {{ customToolbarTitle }}
        </div>
      </template>
      <div class="drawer-content">
        <NodeStyle v-show="customToolbarTitle === '节点样式'" :customToolbarTitle="customToolbarTitle" :activeNodes="activeNodes" :myStyle="myStyle" />
        <Theme v-show="customToolbarTitle === '主题'" :customToolbarTitle="customToolbarTitle" :mindMap="mindMap" :getImageUrlFromPath="getImageUrlFromPath" />
        <Structure v-show="customToolbarTitle === '结构'" :customToolbarTitle="customToolbarTitle" :mindMap="mindMap" :getImageUrlFromPath="getImageUrlFromPath" />
      </div>
    </a-drawer>
  </div>
</template>

<script lang="ts" setup>
import {  ref, inject, shallowRef, onMounted, watch } from 'vue';
// import { createStore } from '../store/app';
import NodeStyle from './components/NodeStyle.vue';
import Theme from './components/Theme.vue';
import Structure from './components/Structure.vue';

import MindMap from "simple-mind-map"
import MiniMap from 'simple-mind-map/src/plugins/MiniMap.js'
import Drag from 'simple-mind-map/src/plugins/Drag.js'
import Painter from 'simple-mind-map/src/plugins/Painter.js'
import AssociativeLine from 'simple-mind-map/src/plugins/AssociativeLine.js'
import Themes from 'simple-mind-map-plugin-themes'
import TouchEvent from 'simple-mind-map/src/plugins/TouchEvent.js'
import Export from 'simple-mind-map/src/plugins/Export.js'
import {
  UndoOutlined,
  RedoOutlined,
  FormatPainterOutlined,
  NodeIndexOutlined,
  ApartmentOutlined,
  DeleteOutlined,
  ShareAltOutlined,
  FontSizeOutlined,
  SkinOutlined,
  BranchesOutlined
} from '@ant-design/icons-vue'
MindMap.usePlugin(Painter)
  .usePlugin(Drag)
  .usePlugin(MiniMap)
  .usePlugin(AssociativeLine)
  .usePlugin(TouchEvent)
  .usePlugin(Export)
Themes.init(MindMap)

// const store = inject('store') as ReturnType<ReturnType<typeof createStore>>;
const widget = inject('widget', {}) as any;
const preset = ref({
    "data":{
    "layout": "logicalStructure",
    "root": {
        "data": {
            "text": "根节点",
            "expand": true,
            "isActive": false,
            "uid": "a4da34fe-5083-4628-967b-fb363ab82e9c"
        },
        "children": [
            {
                "data": {
                    "text": "二级节点1",
                    "uid": "1ad65ab9-4bc3-4e44-865c-534f1ab7f941",
                    "expand": true,
                    "richText": false,
                    "isActive": false
                },
                "children": [
                    {
                        "data": {
                            "text": "分支主题3",
                            "uid": "c7fe1089-ff69-4d84-8766-b25de5f65d72",
                            "expand": true,
                            "richText": false,
                            "isActive": false
                        },
                        "children": []
                    }
                ]
            },
            {
                "data": {
                    "text": "二级节点2",
                    "expand": true,
                    "richText": false,
                    "isActive": false,
                    "uid": "1f3e2fe3-01a8-4873-bcc2-0a4d5a969d09"
                },
                "children": []
            },
            {
                "data": {
                    "text": "二级节点2",
                    "expand": true,
                    "richText": false,
                    "isActive": false,
                    "uid": "491efeb7-f7f2-4373-a7e9-62a041606993"
                },
                "children": []
            }
        ]
    },
    "theme": {
        "template": "rose",
        "config": {}
    },
    "view": {
        "transform": {
            "scaleX": 1,
            "scaleY": 1,
            "shear": 0,
            "rotate": 0,
            "translateX": -312,
            "translateY": -56,
            "originX": 0,
            "originY": 0,
            "a": 1,
            "b": 0,
            "c": 0,
            "d": 1,
            "e": -312,
            "f": -56
        },
        "state": {
            "scale": 1,
            "x": -312,
            "y": -56,
            "sx": -295,
            "sy": -60
        }
    }
}
   
  });
// const fullPath = computed(() => store.fullPath);
const widgetWidth = ref('100%');
const widgetHeight = ref('100%');
const saveData = ref(0);
const refContainer = ref(null as any);
const isStart = ref(true)
const isEnd = ref(true)
const activeNodes = shallowRef([] as any[])
const visible = ref(false);
const customToolbarTitle = ref('')
const isInPainter = ref(false)
let mindMap: any
const myStyle = ref({
  shape: '',
  paddingX: 0,
  paddingY: 0,
  color: '',
  fontFamily: '',
  fontSize: '',
  lineHeight: '',
  textDecoration: '',
  fontWeight: '',
  fontStyle: '',
  borderWidth: '',
  borderColor: '',
  fillColor: '',
  borderDasharray: '',
  borderRadius: '',
  gradientStyle: false,
  startColor: '',
  endColor: ''
})
watch(preset, () => {
  if (preset.value.data.root) {
    mindMap.setFullData(preset.value.data)
  } else {
    mindMap.setData(preset.value.data)
  }
  mindMap.view.reset()
}, { deep: true })
watch(saveData, () => {
  submit()
})
async function submit() {
  const screenShot = await  mindMap.doExport.png()
  const mindData = mindMap.getData(true)
  const data = {
    action: 'submitResult',
    data: mindData,
    screenShot,
    version: 1,
    t: Date.now(),
  };
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  const file = new File([blob], 'data.json', { type: 'application/json' });
  console.log(file);
  
  if (typeof widget.uploadWidgetFile === 'function') widget.uploadWidgetFile(file);
}
onMounted(() => {
  initMindMap()
  window.addEventListener('resize', handleResize)
})

import { onUnmounted } from 'vue'

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

function handleResize() {
  if (mindMap) {
    mindMap.resize()
  }
}
function onPainterStart() {
  isInPainter.value = true
}

// 格式刷结束
function onPainterEnd() {
  isInPainter.value = false
}
function initMindMap() {
  if (refContainer.value && preset.value.data.root) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    mindMap = new MindMap({
      el: refContainer.value,
      dragPlaceholderRectFill: 'deeppink',
      fit: true,
      data: preset.value.data.root,
      layout: preset.value.data.layout,
      theme: preset.value.data.theme.template,
      themeConfig: preset.value.data.theme.config,
      nodeTextEditZIndex: 1000,
      nodeNoteTooltipZIndex: 1000,
      openRealtimeRenderOnNodeTextEdit: true,
      enableAutoEnterTextEditWhenKeydown: true,
      demonstrateConfig: {
        openBlankMode: false
      },
      customInnerElsAppendTo: null,
      beforeDragStart: (node, i) => {
        console.log("beforeDragStart", node, i);

      }
    })
    try {
      mindMap.view.reset()
      if (mindMap.api && typeof mindMap.api.focusRoot === 'function') {
        mindMap.api.focusRoot()
      }
    } catch (e) {
      console.warn('MindMap view init warn:', e)
    }
  }
  if (!mindMap) return
  mindMap.on('node_active', (node, activeNodeList) => {
    activeNodes.value = activeNodeList;
    if (activeNodeList.length > 0) {
      [
        'shape',
        'paddingX',
        'paddingY',
        'color',
        'fontFamily',
        'fontSize',
        'lineHeight',
        'textDecoration',
        'fontWeight',
        'fontStyle',
        'borderWidth',
        'borderColor',
        'fillColor',
        'borderDasharray',
        'borderRadius',
        'gradientStyle',
        'startColor',
        'endColor'
      ].forEach(item => {
        myStyle.value[item] = activeNodeList[0].getStyle(item, false)
      })

    }
  })
  mindMap.on('back_forward', (index, len) => {
    isStart.value = index <= 0
    isEnd.value = index >= len - 1
  })
  mindMap.on('painter_start', () => {
  })
  mindMap.on('painter_end', () => {
    onPainterEnd()
  })
  mindMap.on('beforeDragStart', () => {
    console.log('beforeDragStart');

  })
}
function execCommand(type) {
  switch (type) {
    case 'BACK':
      mindMap.execCommand(type);
      break;
    case 'FORWARD':
      mindMap.execCommand(type);
      break;
    case 'INSERT_NODE':
      mindMap.execCommand(type);
      break;
    case 'INSERT_CHILD_NODE':
      mindMap.execCommand(type);
      break;
    case 'REMOVE_NODE':
      mindMap.execCommand(type);
      break;
    case 'releaseLine':
      mindMap.associativeLine.createLineFromActiveNode()
      break;
    case 'paintBrush':
      onPainterStart()
      mindMap.painter.startPainter()
      break;
  }
}

function clickCustomToolbar(type) {
  visible.value = true
  switch (type) {
    case 'nodeStyle':
      customToolbarTitle.value = '节点样式'
      break;
    case 'baseStyle':
      customToolbarTitle.value = '基础样式'
      break;
    case 'theme':
      customToolbarTitle.value = '主题'
      break;
    case 'structure':
      customToolbarTitle.value = '结构'


  }
}
function getImageUrlFromPath(imagePath: string) {
  // const url = fullPath.value;
  // if (!imagePath) return `${url}/${'controls/mindmap/resources/image/default.png'}`;
  // return `${url}/${imagePath}`;
  return ''
}
</script>

<style scoped lang="less">
.mindmap-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 240px); /* 适应页面高度，减去可能的外部边距 */
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  background: #fff;
  overflow: hidden;
  position: relative;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;

  .header-toolbar {
    height: 48px;
    background: #fafafa;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    align-items: center;
    padding: 0 16px;
    gap: 8px;
    flex-shrink: 0;

    .tool-group {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }

  .main-content {
    flex: 1;
    display: flex;
    position: relative;
    overflow: hidden;

    .canvas-wrapper {
      flex: 1;
      position: relative;
      background: #f5f7fa;
      
      #mindMapContainer {
        width: 100% !important;
        height: 100% !important;
      }
    }

    .side-panel {
      width: 48px;
      background: #fff;
      border-left: 1px solid #f0f0f0;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding-top: 16px;
      gap: 16px;
      z-index: 10;

      .panel-trigger {
        width: 40px;
        height: 48px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: #666;
        transition: all 0.2s;
        border-radius: 4px;
        font-size: 12px;
        gap: 4px;

        &:hover {
          background: #f0f0f0;
          color: #1890ff;
        }

        &.active {
          background: #e6f7ff;
          color: #1890ff;
        }

        .anticon {
          font-size: 18px;
        }
      }
    }
  }
}

.drawer-title {
  text-align: center;
  font-weight: 600;
  color: #333;
}

.drawer-content {
  padding: 0;
  height: 100%;
  overflow-y: auto;
}

/* 覆盖 Ant Design Drawer 样式使其嵌入容器 */
:deep(.ant-drawer) {
  position: absolute;
}
:deep(.ant-drawer-content-wrapper) {
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.05);
}
/* 响应式适配 */
@media (max-width: 768px) {
  .mindmap-container {
    height: auto;
    min-height: 80vh;

    .header-toolbar {
      height: auto;
      flex-wrap: wrap;
      padding: 8px;
      gap: 4px;
      
      .tool-group {
        flex-wrap: wrap;
      }
      
      .ant-divider {
        display: none;
      }
    }

    .main-content {
      flex-direction: column;
      height: 60vh;

      .side-panel {
        width: 100%;
        height: 48px;
        flex-direction: row;
        border-left: none;
        border-top: 1px solid #f0f0f0;
        justify-content: space-around;
        padding-top: 0;

        .panel-trigger {
          width: 100%;
          height: 100%;
          border-radius: 0;
        }
      }
    }
  }
}
</style>
<style>
svg text tspan {
    font-family: inherit !important;
}
</style>
