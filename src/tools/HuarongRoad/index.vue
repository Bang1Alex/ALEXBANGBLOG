<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { initialBlocks, canMove, type Block } from './logic'

const blocks = ref<Block[]>(JSON.parse(JSON.stringify(initialBlocks)))
const selectedId = ref<number | null>(null)

const selectBlock = (id: number) => {
  selectedId.value = id
}

const moveSelected = (dx: number, dy: number) => {
  if (selectedId.value === null) return
  
  const block = blocks.value.find(b => b.id === selectedId.value)
  if (!block) return

  if (canMove(block, dx, dy, blocks.value)) {
    block.x += dx
    block.y += dy
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  if (selectedId.value === null) return
  
  // Prevent scrolling when playing
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
    e.preventDefault()
  }

  switch(e.key) {
    case 'ArrowUp':
    case 'w':
      moveSelected(0, -1)
      break
    case 'ArrowDown':
    case 's':
      moveSelected(0, 1)
      break
    case 'ArrowLeft':
    case 'a':
      moveSelected(-1, 0)
      break
    case 'ArrowRight':
    case 'd':
      moveSelected(1, 0)
      break
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="huarong-road">
    <div class="game-board">
      <div 
        v-for="block in blocks" 
        :key="block.id"
        class="block"
        :class="[block.type, { selected: selectedId === block.id }]"
        :style="{
          left: block.x * 80 + 'px',
          top: block.y * 80 + 'px',
          width: block.w * 80 + 'px',
          height: block.h * 80 + 'px'
        }"
        @click.stop="selectBlock(block.id)"
      >
        {{ block.name }}
      </div>
    </div>
    <div class="controls">
      <p>Click block to select, use Arrow keys to move.</p>
      <el-button type="primary" @click="blocks = JSON.parse(JSON.stringify(initialBlocks))">Reset</el-button>
    </div>
  </div>
</template>

<style src="./style.less" scoped></style>
<style scoped>
.block.selected {
  border: 3px solid #409EFF !important;
  box-shadow: 0 0 15px rgba(64, 158, 255, 0.6) !important;
  z-index: 10;
}
</style>
