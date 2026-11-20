<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ArrowRightOutlined } from '@ant-design/icons-vue'
import { motion } from 'motion-v'
import { toolCatalog } from '@/data/content'

const router = useRouter()
</script>

<template>
  <div class="tools-page">
    <motion.section
      class="tools-hero"
      :initial="{ opacity: 0, y: 24 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.6 }"
    >
      <span>Interactive playground</span>
      <h1>这些工具，不该躲在博客角落里。</h1>
      <p>我把它们作为作品来展示，每个入口都更强调类型、气质和交互方向，整体更像一个小型创意实验室。</p>
    </motion.section>

    <section class="tool-grid">
      <motion.button
        v-for="(tool, index) in toolCatalog"
        :key="tool.id"
        type="button"
        class="tool-card"
        :style="{ '--accent': tool.accent }"
        :initial="{ opacity: 0, y: 26 }"
        :while-in-view="{ opacity: 1, y: 0 }"
        :in-view-options="{ once: true, margin: '-80px' }"
        :transition="{ duration: 0.5, delay: index * 0.04 }"
        @click="router.push(`/tools/${tool.id}`)"
      >
        <div class="tool-head">
          <span class="tool-icon">
            <component :is="tool.icon" />
          </span>
          <span class="tool-status">{{ tool.status }}</span>
        </div>
        <h2>{{ tool.name }}</h2>
        <p>{{ tool.description }}</p>
        <div class="tool-foot">
          <span>打开体验</span>
          <ArrowRightOutlined />
        </div>
      </motion.button>
    </section>
  </div>
</template>

<style scoped>
.tools-page {
  display: grid;
  gap: 24px;
  padding-bottom: 24px;
}

.tools-hero {
  padding: 34px;
  border-radius: 30px;
  background:
    radial-gradient(circle at left top, rgba(29, 107, 92, 0.2), transparent 28%),
    rgba(255, 250, 244, 0.88);
  border: 1px solid rgba(123, 92, 59, 0.1);
  box-shadow: 0 22px 55px rgba(49, 34, 22, 0.08);
}

.tools-hero span {
  display: inline-block;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(29, 107, 92, 0.09);
  color: #1d6b5c;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.tools-hero h1 {
  margin: 16px 0 12px;
  font-size: clamp(2.2rem, 4vw, 4.4rem);
  line-height: 0.96;
  letter-spacing: -0.05em;
  color: #21170f;
}

.tools-hero p {
  max-width: 58ch;
  margin: 0;
  color: #655542;
  line-height: 1.9;
}

.tool-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.tool-card {
  --accent: #1d6b5c;
  padding: 28px;
  border: 1px solid rgba(123, 92, 59, 0.1);
  border-radius: 28px;
  background:
    radial-gradient(circle at top right, color-mix(in srgb, var(--accent) 18%, white), transparent 22%),
    rgba(255, 250, 244, 0.9);
  box-shadow: 0 22px 55px rgba(49, 34, 22, 0.08);
  text-align: left;
  cursor: pointer;
  transition: 0.25s ease;
}

.tool-card:hover {
  transform: translateY(-4px);
}

.tool-head,
.tool-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tool-icon {
  width: 54px;
  height: 54px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  background: var(--accent);
  color: white;
  font-size: 1.2rem;
  box-shadow: 0 14px 24px color-mix(in srgb, var(--accent) 28%, transparent);
}

.tool-status {
  padding: 7px 12px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--accent) 12%, white);
  color: color-mix(in srgb, var(--accent) 78%, black);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.tool-card h2 {
  margin: 22px 0 10px;
  font-size: 1.8rem;
  color: #221a12;
}

.tool-card p {
  margin: 0;
  color: #62513f;
  line-height: 1.85;
}

.tool-foot {
  margin-top: 28px;
  color: #7b654e;
  font-weight: 700;
}

@media (max-width: 840px) {
  .tool-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .tools-hero,
  .tool-card {
    padding: 22px;
    border-radius: 24px;
  }
}
</style>
