<template>
  <div class="checkers-game">
    <!-- 开始封面 -->
    <div v-show="showCover" class="cover-layer" :style="{ width: widgetWidth + 'px', height: widgetHeight + 'px' }">
      <div class="cover-content">
        <h1 class="title">火柴棒闯关游戏</h1>
        <p class="subtitle">拖动火柴棒补全正确的数字</p>
        <a-button type="primary" size="large" @click="startGame">开始挑战</a-button>
      </div>
    </div>

    <!-- 游戏完成界面 -->
    <div v-if="gameCompleted" class="game-complete-layer">
      <div class="complete-content">
        <h1>🎉 全部通关！</h1>
        <p class="level">已完成 {{ totalLevels }} 关</p>
        <p class="time">总用时：{{ finalTime }}</p>
        <a-button type="primary" size="large" @click="resetGame">
          再玩一次
        </a-button>
      </div>
    </div>

    <!-- 主游戏区域 + 顶部信息栏 -->
    <div v-show="!showCover && !gameCompleted" class="game-area">
      <div class="game-header">
        <div class="level-badge">
          <span class="label">LEVEL</span>
          <span class="value">{{ currentLevelIndex + 1 }}</span>
          <span class="total">/ {{ totalLevels }}</span>
        </div>
        
        <div class="header-center">
          <div class="timer-card">
            <clock-circle-outlined />
            <span>{{ elapsedTime }}</span>
          </div>
        </div>

        <div class="header-actions">
          <a-tooltip title="获取提示">
            <a-button type="primary" shape="circle" size="large" @click="showHint" class="action-btn hint">
              <bulb-outlined />
            </a-button>
          </a-tooltip>
          <a-tooltip title="重置本关">
            <a-button shape="circle" size="large" @click="loadLevel" class="action-btn">
              <reload-outlined />
            </a-button>
          </a-tooltip>
        </div>
      </div>

      <div class="game-container-wrapper">
        <div class="game-container" :id="containerId"></div>
      </div>

      <!-- 过关弹窗 -->
      <a-modal v-model:open="showSuccessModal" :footer="null" :closable="false" :maskClosable="false" :keyboard="false" centered width="360px" class="success-modal">
        <div class="success-content">
          <div class="success-icon">
            <check-circle-filled />
          </div>
          <h3 class="success-title">挑战成功!</h3>
          <p class="success-desc">太棒了，你的逻辑思维很敏捷！</p>
          <a-button type="primary" size="large" block @click="goToNextLevel" class="next-btn">
            下一关 <arrow-right-outlined />
          </a-button>
        </div>
        <!-- <template #footer>null</template> -->
      </a-modal>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import Konva from 'konva'
import { message } from 'ant-design-vue'
import { 
  ClockCircleOutlined, 
  BulbOutlined, 
  ReloadOutlined,
  CheckCircleFilled,
  ArrowRightOutlined
} from '@ant-design/icons-vue'
import { main } from './utils/index'  // 请根据实际路径导入你的关卡生成函数

// ==================== 注入与容器相关 ====================
// const store = inject('store') as any
// const widget = inject('widget') as any
const containerId = computed(() => `${'alex-bang'}-konva`)
const widgetWidth = ref('100%')
const widgetHeight = ref('100%')

// ==================== 游戏状态 ====================
const showCover = ref(true)
const gameCompleted = ref(false)
const showSuccessModal = ref(false)
const currentLevelIndex = ref(0)
const totalLevels = ref(200) // 关卡数

// 关卡数据（这里用模拟数据，实际请替换为你的 main() 函数）
const levels = ref<any[]>([])

// Konva
const stage = ref(null);
const layer = ref(null);
const darkPieces = ref<Konva.Image[]>([])
const allScreenShot = ref<Array<string>>([])
// 计时相关
const startTime = ref(0)
const elapsedTime = ref('00:00')
const finalTime = ref('')
let timerInterval: any = null
const useTipsNumber = ref(0)
// 常量 - 火柴棒七段数码管位置
const SEGMENT_WIDTH = 42
const SEGMENT_HEIGHT = 153

const SEGMENT_POSITIONS = {
  a: { x: 190, y: 110, rotation: -90 },
  b: { x: 340, y: 100, rotation: 0 },
  c: { x: 340, y: 283, rotation: 0 },
  d: { x: 190, y: 470, rotation: -90 },
  e: { x: 150, y: 283, rotation: 0 },
  f: { x: 150, y: 100, rotation: 0 },
  g: { x: 190, y: 290, rotation: -90 },
} as const

const SEGMENT_NAMES = ['a', 'b', 'c', 'd', 'e', 'f', 'g'] as const

const DIGIT_SEGMENTS = {
  '0': [1, 1, 1, 1, 1, 1, 0],
  '1': [0, 1, 1, 0, 0, 0, 0],
  '2': [1, 1, 0, 1, 1, 0, 1],
  '3': [1, 1, 1, 1, 0, 0, 1],
  '4': [0, 1, 1, 0, 0, 1, 1],
  '5': [1, 0, 1, 1, 0, 1, 1],
  '6': [1, 0, 1, 1, 1, 1, 1],
  '7': [1, 1, 1, 0, 0, 0, 0],
  '8': [1, 1, 1, 1, 1, 1, 1],
  '9': [1, 1, 1, 1, 0, 1, 1],
} as const

// ==================== 生命周期 ====================
onMounted(() => {
  // 模拟生成 100 关数据（实际请替换为你的 main()）
  levels.value = main()
  initKonvaStage()
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
  window.removeEventListener('resize', handleResize)
})

// ==================== 计时器 ====================
function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const min = Math.floor(totalSec / 60).toString().padStart(2, '0')
  const sec = (totalSec % 60).toString().padStart(2, '0')
  return `${min}:${sec}`
}

function startTimer() {
  if (timerInterval) clearInterval(timerInterval)
  startTime.value = Date.now()
  elapsedTime.value = '00:00'

  timerInterval = setInterval(() => {
    const passed = Date.now() - startTime.value
    elapsedTime.value = formatTime(passed)
  }, 1000)
}

function stopTimer(): { format: string, totalMs: number } {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
  const totalMs = Date.now() - startTime.value
  return {
    format: formatTime(totalMs),
    totalMs,
  }
}

// ==================== 游戏控制 ====================
async function startGame() {
  showCover.value = false
  gameCompleted.value = false
  currentLevelIndex.value = 0
  
  await nextTick()
  handleResize()
  
  startTimer()
  loadLevel()
}

function resetGame() {
  gameCompleted.value = false
  currentLevelIndex.value = 0
  useTipsNumber.value = 0
  allScreenShot.value = []
  startTimer()
  loadLevel()
}

function goToNextLevel() {
  showSuccessModal.value = false
  currentLevelIndex.value++

  if (currentLevelIndex.value >= totalLevels.value) {
    const stopTime = stopTimer()
    finalTime.value = stopTime.format
    gameCompleted.value = true
    message.success(`恭喜完成全部 ${totalLevels.value} 关！用时 ${finalTime.value}`, 5)
    // const timer = setTimeout(() => {
    //   const res = {
    //     action: 'submitResult',
    //     data: {
    //       time: stopTime.totalMs,
    //       finalTime: finalTime.value,
    //       useTipsNumber: useTipsNumber.value,
    //       screenshot: allScreenShot.value
    //     },
    //     time: Date.now()
    //   }
    //   console.log(res);
    // const blob = new Blob([JSON.stringify(res)], { type: 'application/json' });
    // const file = new File([blob], 'data.json', { type: 'application/json' });
    // if (typeof widget.uploadWidgetFile === 'function') widget.uploadWidgetFile(file);
    // clearTimeout(timer)
    // }, 400)

    return
  }

  loadLevel()
}

// ==================== Konva 初始化与关卡加载 ====================
function initKonvaStage() {
  const container = document.getElementById(containerId.value)
  if (!container) return

  stage.value = new Konva.Stage({
    container: containerId.value,
    width: container.clientWidth,
    height: container.clientHeight,
  })

  layer.value = new Konva.Layer()
  stage.value.add(layer.value)
  
  // 响应式调整
  window.addEventListener('resize', handleResize)
  handleResize()
}

function handleResize() {
  const container = document.getElementById(containerId.value)
  if (!container || !stage.value) return
  
  stage.value.width(container.clientWidth)
  stage.value.height(container.clientHeight)
  
  // 重新计算内容缩放和位置
  if (layer.value) {
    // 简单的居中逻辑，可以根据需要优化
    const scale = Math.min(
      container.clientWidth / 1200, 
      container.clientHeight / 600
    ) * 0.9 // 留一点边距
    
    layer.value.scale({ x: scale, y: scale })
    
    // 居中偏移
    const offsetX = (container.clientWidth - 1200 * scale) / 2
    const offsetY = (container.clientHeight - 600 * scale) / 2
    layer.value.position({ x: offsetX, y: offsetY })
    
    layer.value.batchDraw()
  }
}

function loadLevel() {
  if (!stage.value || !layer.value) return
  layer.value.destroyChildren()
  darkPieces.value = []

  const level = levels.value[currentLevelIndex.value]
  const numbers = extractNumbers(level.equation)

  // 放置运算符和等号
  addStaticText(level.equation.includes('+') ? '+' : '-', 400, 180)
  addStaticText('=', 740, 180)

  const img = new Image()
  img.crossOrigin = 'anonymous'
  // img.src = '/controls/matchstickChallengeGame/resources/image/bright.png'
  const imageUrl = new URL('./image/bright.png', import.meta.url).href
  img.src = imageUrl

  img.onload = () => {
    numbers.forEach((num, colIndex) => {
      const segments = DIGIT_SEGMENTS[num.toString() as keyof typeof DIGIT_SEGMENTS]
      Object.entries(SEGMENT_POSITIONS).forEach(([key, pos]) => {
        const segmentIdx = SEGMENT_NAMES.indexOf(key as any)
        const isLit = segments[segmentIdx] === 1

        const baseX = pos.x + 340 * colIndex
        const baseY = pos.y

        // 暗块（底板）
        const dark = createSegmentImage(colIndex, baseX, baseY, key, img, pos.rotation, false)
        layer.value!.add(dark)

        if (!isLit) {
          darkPieces.value.push(dark)
        } else {
          // 亮块（可拖动）
          const bright = createSegmentImage(colIndex, baseX, baseY, key, img, pos.rotation, true)
          layer.value!.add(bright)
          addDragEvents(bright)
        }
      })
    })
    layer.value!.batchDraw()
  }
}

function addStaticText(text: string, x: number, y: number) {
  const txt = new Konva.Text({
    x,
    y,
    text,
    fontSize: 170,
    fontFamily: 'Arial, sans-serif',
    fill: '#333',
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowBlur: 8,
    shadowOffsetX: 2,
    shadowOffsetY: 3,
  })
  layer.value?.add(txt)
}

function createSegmentImage(
  colIndex: number,
  x: number,
  y: number,
  name: string,
  image: HTMLImageElement,
  rotation: number,
  draggable: boolean
) {
  const cId = colIndex === 0 ? 'first' : (colIndex === 1 ? 'second' : 'result')

  const imgKonva = new Konva.Image({
    x,
    y,
    name,
    image,
    width: SEGMENT_WIDTH,
    height: SEGMENT_HEIGHT,
    rotation,
    draggable,
    cId,
  }) as any

  if (!draggable) {
    imgKonva.cache()
    imgKonva.filters([Konva.Filters.RGB])
    imgKonva.red(110)
    imgKonva.green(110)
    imgKonva.blue(130)
    imgKonva.opacity(0.28)
  }

  return imgKonva
}

function addDragEvents(bright: Konva.Image) {
  let startX = 0, startY = 0, startAngle = 0

  bright.on('dragstart', () => {
    startX = bright.x()
    startY = bright.y()
    startAngle = bright.rotation()
    bright.rotation(-45)
  })

  bright.on('dragend', () => {
    const pieceRect = bright.getClientRect()

    for (const slot of darkPieces.value) {
      const targetRect = slot.getClientRect()
      if (haveIntersection(targetRect, pieceRect)) {
        if (isCorrectMatch(bright as Konva.Image, slot as Konva.Image)) {
          bright.position({ x: slot.x(), y: slot.y() })
          bright.rotation(slot.rotation())
          bright.draggable(false)
          showSuccessModal.value = true
          saveScreenShot(bright, slot, startX, startY, startAngle)
          return
        }
      }
    }

    // 未命中 → 回原位
    bright.position({ x: startX, y: startY })
    bright.rotation(startAngle)
    layer.value?.batchDraw()
  })
}
async function saveScreenShot(bright, slot, startX, startY, startAngle) {
  const clone = bright.clone()
  clone.position({ x: startX, y: startY })
  clone.rotation(startAngle)
  clone.cache()
  clone.filters([Konva.Filters.RGB])
  clone.red(140)
  clone.green(140)
  clone.blue(140)
  layer.value?.add(clone)

  const clone1 = slot.clone()
  clone1.cache()
  clone1.filters([Konva.Filters.RGB])
  clone1.red(255)
  clone1.green(0)
  clone1.blue(0)
  clone1.opacity(1)
  layer.value?.add(clone1)
  layer.value?.batchDraw()
  const screenShot = stage.value?.toDataURL() as string
  allScreenShot.value.push(screenShot)
  // if (widget.uploadWidgetStandaloneFile && typeof widget.uploadWidgetStandaloneFile === 'function') {
  //   const url = await widget.uploadWidgetStandaloneFile(screenShot)
  //   allScreenShot.value.push(url)
  // } else {
  //   allScreenShot.value.push(screenShot)
  // }

}
function isCorrectMatch(piece: Konva.Image, slot: Konva.Image): boolean {
  const level = levels.value[currentLevelIndex.value]

  const basicMatch =
    piece.attrs.cId === level.check.start &&
    piece.attrs.name === level.move[0] &&
    slot.attrs.cId === level.check.end &&
    slot.attrs.name === level.move[1]

  if (basicMatch) return true

  if (level.otherAnswers?.length) {
    return level.otherAnswers.some((ans: any) => (
      piece.attrs.cId === ans.check.start &&
      piece.attrs.name === ans.move[0] &&
      slot.attrs.cId === ans.check.end &&
      slot.attrs.name === ans.move[1]
    ))
  }

  return false
}

// ==================== 工具函数 ====================
function extractNumbers(str: string): number[] {
  return (str.match(/-?\d+(\.\d+)?/g) || []).map(Number)
}

function haveIntersection(r1: any, r2: any) {
  return !(
    r2.x > r1.x + r1.width ||
    r2.x + r2.width < r1.x ||
    r2.y > r1.y + r1.height ||
    r2.y + r2.height < r1.y
  )
}

function showHint() {
  const hint = levels.value[currentLevelIndex.value].corrected
  const str = levels.value[currentLevelIndex.value].otherAnswers.reduce((acc, cur, i) => {

    if (i === levels.value[currentLevelIndex.value].otherAnswers.length - 1) {
      return acc + cur.corrected
    }
    return acc + cur.corrected + '||'
  }, '')
  const tips = !levels.value[currentLevelIndex.value].otherAnswers.length ? hint : hint + '||' + str
  message.info(tips, 2)
  useTipsNumber.value++
}
</script>

<style scoped lang="less">
.checkers-game {
  position: relative;
  width: 100%;
  height: 80vh; /* 设定固定高度，或者使用 min-height */
  user-select: none;
  overflow: hidden;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
  border-radius: 12px;
}

.cover-layer {
  // position: absolute;
  height: 100%;
  inset: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;

  .cover-content {
    text-align: center;
    padding: 60px 40px;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 20px;
    backdrop-filter: blur(10px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);

    .title {
      font-size: 3.6rem;
      margin-bottom: 20px;
      text-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    }

    .subtitle {
      font-size: 1.5rem;
      margin-bottom: 40px;
      opacity: 0.92;
    }
  }
}

.game-area {
  position: relative;
  height: 100%;
}

.game-container-wrapper {
  position: absolute;
  top: 64px; /* 留出 header 高度 */
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.game-container {
  width: 100%;
  height: 100%;
}

.game-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(10px);
  z-index: 8;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  font-size: 1.18rem;
  border-bottom: 1px solid #eee;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);

  strong {
    color: #1890ff;
    font-size: 1.4rem;
  }

  .timer {
    color: #fa8c16;
    font-weight: bold;
  }
}

.game-complete-layer {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.68);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 12;

  .complete-content {
    text-align: center;
    color: white;
    background: rgba(0, 0, 0, 0.55);
    padding: 60px 90px;
    border-radius: 24px;
    backdrop-filter: blur(12px);

    h1 {
      font-size: 4rem;
      margin-bottom: 24px;
      color: beige;
    }

    .level {
      font-size: 1.8rem;
      margin: 12px 0;
    }

    .time {
      font-size: 2.6rem;
      color: #52c41a;
      margin: 20px 0 40px;
      font-weight: bold;
    }
  }
}

.hint-btn {
  position: absolute;
  top: 6px;
  right: 129px;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: #ff4d4f;
  color: white;
  font-size: 1.3rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 6px 16px rgba(255, 77, 79, 0.4);
  z-index: 9;
  transition: all 0.2s;

  &:hover {
    transform: scale(1.1);
    background: #ff7875;
  }
}

.success-content {
  text-align: center;
  padding: 40px 0;

  .emoji {
    font-size: 6rem;
    margin-bottom: 20px;
  }

  p {
    font-size: 1.5rem;
    color: #555;
  }
}
  /* 响应式调整 */
  @media (max-width: 768px) {
    .game-header {
      padding: 0 16px;
      
      .level-badge {
        .label { display: none; }
      }
      
      .timer-card {
        padding: 4px 12px;
        font-size: 1rem;
      }
    }
  }
</style>