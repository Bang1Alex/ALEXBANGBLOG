<template>
  <div class="container">
    <div id="mindMapContainer" ref="refContainer" :style="{ width: widgetWidth + 'px', height: widgetHeight + 'px' }"></div>
    <div class="toolbar">
      <div class="toolbarBtn" :class="{ disable: isStart }" @click="execCommand('BACK')">
        <span class="icon iconfont icon-huitui"></span>
        <div class="text">回退</div>
      </div>
      <div class="toolbarBtn" :class="{ disable: isEnd }" @click="execCommand('FORWARD')">
        <span class="icon iconfont icon-qianjin-shi"></span>
        <div class="text">前进</div>
      </div>
      <div class="toolbarBtn" :class="{ disable: activeNodes.length === 0, active: isInPainter }"
        @click="execCommand('paintBrush')">
        <span class="icon iconfont icon-geshishua"></span>
        <div class="text">格式刷</div>
      </div>
      <div class="toolbarBtn" :class="{ disable: activeNodes.length === 0 || activeNodes[0].isRoot }"
        @click="execCommand('INSERT_NODE')">
        <span class="icon iconfont icon-tongjijiedian-"></span>
        <div class="text">同级节点</div>
      </div>
      <div class="toolbarBtn" :class="{ disable: activeNodes.length === 0 }" @click="execCommand('INSERT_CHILD_NODE')">
        <span class="icon iconfont icon-tianjiazijiedian"></span>
        <div class="text">子节点</div>
      </div>
      <div class="toolbarBtn" :class="{ disable: activeNodes.length === 0 }" @click="execCommand('REMOVE_NODE')">
        <span class="icon iconfont icon-shanchu"></span>
        <div class="text">删除节点</div>
      </div>
      <div class="toolbarBtn" :class="{ disable: activeNodes.length === 0 }" @click="execCommand('releaseLine')">
        <span class="icon iconfont icon-guanlian"></span>
        <div class="text">关联线</div>
      </div>
    </div>
    <div class="custom-toolbar">
      <div class="toolbarBtn" @click="clickCustomToolbar('nodeStyle')">
        <span class="icon iconfont icon-jiedianyangshi"></span>
        <div class="text">节点样式</div>
      </div>
      <div class="toolbarBtn" @click="clickCustomToolbar('theme')">
        <span class="icon iconfont icon-zhuti"></span>
        <div class="text">主题</div>
      </div>
      <div class="toolbarBtn" @click="clickCustomToolbar('structure')">
        <span class="icon iconfont icon-jiegou"></span>
        <div class="text">结构</div>
      </div>
    </div>
    <a-drawer placement="right" :closable="false" width="300px" :mask="false" :open="visible"
      @close="visible = false" :get-container="false" :style="{ position: 'absolute' }">
      <template #title>
        <div class="title" style="position: relative;">
          <div class="text" style="text-align: center;">
            {{ customToolbarTitle }}
          </div>
          <span class="delete" @click="visible = false"
            style="position: absolute; top: 0; right: 0; cursor: pointer;">X</span>
        </div>
      </template>
      <NodeStyle :customToolbarTitle="customToolbarTitle" :activeNodes="activeNodes" :myStyle="myStyle" />
      <Theme :customToolbarTitle="customToolbarTitle" :mindMap="mindMap" :getImageUrlFromPath="getImageUrlFromPath" />
      <Structure :customToolbarTitle="customToolbarTitle" :mindMap="mindMap"
        :getImageUrlFromPath="getImageUrlFromPath" />
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
const widgetWidth = ref(800);
const widgetHeight = ref(400);
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
})
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
@import url("//at.alicdn.com/t/c/font_4970952_veohc2z9n6.css");

.container {
  position: relative;
  box-sizing: border-box;
  user-select: none;
  width: 100%;
  height: 100%;
  // border: 1px solid #000;
  overflow: hidden;

  .borderLine {
    display: inline-block;
    width: 100%;
    background-color: #000;

    &.isDark {
      background-color: #fff;
    }
  }

  .toolbar {
    display: flex;
    position: absolute;
    top: 5px;
    left: 50%;
    transform: translate(-50%);
    z-index: 10;

    .toolbarBtn {
      display: flex;
      justify-content: center;
      flex-direction: column;
      cursor: pointer;
      margin-right: 10px;

      &.disable {
        color: #bcbcbc;
        cursor: not-allowed;
        pointer-events: none;
      }

      &.active {
        .icon {
          background: #59697e;
        }
      }

      .icon {

        height: 26px;
        background: #fff;
        border-radius: 4px;
        border: 1px solid #e9e9e9;
        justify-content: center;
        flex-direction: column;
        text-align: center;
        padding: 0 5px;
      }

      .text {
        margin-top: 3px;
        text-align: center;
      }
    }
  }

  .custom-toolbar {
    display: flex;
    flex-direction: column;
    position: absolute;
    top: 50%;
    right: 0;
    transform: translateY(-50%);
    z-index: 10;
    gap: 8px;

    .toolbarBtn {
      display: flex;
      justify-content: center;
      flex-direction: column;
      cursor: pointer;
      margin-right: 10px;
      /* gap: 10px; */
      border: 1px solid #e9e9e9;

      &:hover {
        background: #ededed;
      }

      &.disable {
        color: #bcbcbc;
        cursor: not-allowed;
        pointer-events: none;
      }

      .icon {

        flex-direction: column;
        text-align: center;
        padding: 0 5px;
      }

      .text {
        margin-top: 3px;
        text-align: center;
      }
    }
  }

  #mindMapContainer {}

  .title {
    position: relative;

    .text {
      text-align: center;
    }

    .delete {
      position: absolute;
      top: 0;
      right: 0;
      cursor: pointer;
    }
  }
}
</style>
<style>
svg text tspan {
    font-family: inherit !important;
}
</style>
