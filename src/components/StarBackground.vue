<template>
  <div class="star-bg">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const canvas = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null
let animationFrameId: number
let particles: Particle[] = []
let mouse = { x: 0, y: 0 }

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
}

const resizeCanvas = () => {
  if (!canvas.value) return
  canvas.value.width = window.innerWidth
  canvas.value.height = window.innerHeight
  initParticles()
}

const initParticles = () => {
  if (!canvas.value) return
  particles = []
  const particleCount = Math.floor((window.innerWidth * window.innerHeight) / 10000) // 根据屏幕面积调整粒子数量
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * canvas.value.width,
      y: Math.random() * canvas.value.height,
      vx: (Math.random() - 0.5) * 1, // 速度
      vy: (Math.random() - 0.5) * 1,
      size: Math.random() * 2 + 1 // 大小
    })
  }
}

const draw = () => {
  if (!canvas.value || !ctx) return
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)
  
  // 更新并绘制粒子
  particles.forEach((p, index) => {
    p.x += p.vx
    p.y += p.vy

    // 边界反弹
    if (p.x < 0 || p.x > canvas.value!.width) p.vx *= -1
    if (p.y < 0 || p.y > canvas.value!.height) p.vy *= -1

    ctx!.beginPath()
    ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2)
    ctx!.fillStyle = 'rgba(255, 255, 255, 0.5)'
    ctx!.fill()

    // 连线
    for (let j = index + 1; j < particles.length; j++) {
      const p2 = particles[j]
      const dx = p.x - p2.x
      const dy = p.y - p2.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 100) { // 连线距离阈值
        ctx!.beginPath()
        ctx!.moveTo(p.x, p.y)
        ctx!.lineTo(p2.x, p2.y)
        ctx!.strokeStyle = `rgba(255, 255, 255, ${1 - dist / 100})`
        ctx!.lineWidth = 0.5
        ctx!.stroke()
      }
    }
    
    // 鼠标连线
    const dx = p.x - mouse.x
    const dy = p.y - mouse.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist < 150) {
        ctx!.beginPath()
        ctx!.moveTo(p.x, p.y)
        ctx!.lineTo(mouse.x, mouse.y)
        ctx!.strokeStyle = `rgba(255, 255, 255, ${1 - dist / 150})`
        ctx!.lineWidth = 0.5
        ctx!.stroke()
    }
  })

  animationFrameId = requestAnimationFrame(draw)
}

const onMouseMove = (e: MouseEvent) => {
  mouse.x = e.clientX
  mouse.y = e.clientY
}

onMounted(() => {
  if (canvas.value) {
    ctx = canvas.value.getContext('2d')
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    window.addEventListener('mousemove', onMouseMove)
    draw()
  }
})

onUnmounted(() => {
  cancelAnimationFrame(animationFrameId)
  window.removeEventListener('resize', resizeCanvas)
  window.removeEventListener('mousemove', onMouseMove)
})
</script>

<style scoped>
.star-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none; /* 确保不影响页面交互 */
  z-index: -1;
  background: radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%); /* 深色星空背景 */
}
</style>
