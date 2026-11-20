<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { motion } from 'motion-v'
import HuarongRoad from '@/tools/HuarongRoad/index.vue'
import PaperCut from '@/tools/paperCut/index.vue'
import MindMap from '@/tools/MindMap/index.vue'
import MatchstickChallengeGame from '@/tools/MatchstickChallengeGame/index.vue'
import NineLinkedRings from '@/tools/NineLinkedRings/index.vue'
import Gallery from '@/tools/3DGallery/index.vue'
import { toolCatalog } from '@/data/content'

const route = useRoute()

const toolMap: Record<string, unknown> = {
  HuarongRoad,
  PaperCut,
  MindMap,
  MatchstickChallengeGame,
  NineLinkedRings,
  Gallery,
}

const currentToolId = computed(() => route.params.id as string)
const currentTool = computed(() => toolMap[currentToolId.value] || null)
const toolMeta = computed(() => toolCatalog.find((tool) => tool.id === currentToolId.value) || null)
</script>

<template>
  <div class="tool-detail-page">
    <motion.section
      class="tool-detail-shell"
      :initial="{ opacity: 0, y: 24 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.55 }"
    >
      <div class="tool-detail-head">
        <router-link to="/tools" class="back-link">返回作品列表</router-link>
        <span class="tool-status">{{ toolMeta?.status || 'Interactive Tool' }}</span>
        <h1>{{ toolMeta?.name || currentToolId }}</h1>
        <p>{{ toolMeta?.description || '这是一个交互工具页面。' }}</p>
      </div>

      <div v-if="currentTool" class="tool-stage">
        <component :is="currentTool" />
      </div>
      <div v-else class="not-found">没有找到对应的工具页面。</div>
    </motion.section>
  </div>
</template>

<style scoped>
.tool-detail-page {
  padding-bottom: 24px;
}

.tool-detail-shell,
.tool-stage,
.not-found {
  border-radius: 30px;
  background: rgba(255, 250, 244, 0.88);
  border: 1px solid rgba(123, 92, 59, 0.1);
  box-shadow: 0 22px 55px rgba(49, 34, 22, 0.08);
}

.tool-detail-shell {
  padding: 22px;
}

.tool-detail-head {
  padding: 28px;
  border-radius: 26px;
  background:
    radial-gradient(circle at top right, rgba(29, 107, 92, 0.14), transparent 30%),
    rgba(255, 255, 255, 0.6);
}

.back-link,
.tool-status {
  display: inline-flex;
  padding: 9px 14px;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 700;
}

.back-link {
  background: rgba(29, 107, 92, 0.08);
  color: #1d6b5c;
  margin-right: 10px;
}

.tool-status {
  background: rgba(239, 123, 69, 0.1);
  color: #d76d3f;
}

.tool-detail-head h1 {
  margin: 18px 0 10px;
  font-size: clamp(2rem, 4vw, 3.8rem);
  line-height: 0.98;
  letter-spacing: -0.05em;
  color: #20170f;
}

.tool-detail-head p {
  max-width: 58ch;
  margin: 0;
  color: #645441;
  line-height: 1.8;
}

.tool-stage,
.not-found {
  margin-top: 18px;
  overflow: hidden;
}

.tool-stage {
  padding: 8px;
}

.not-found {
  padding: 48px 24px;
  text-align: center;
  color: #7d6954;
}

@media (max-width: 640px) {
  .tool-detail-shell {
    padding: 18px;
    border-radius: 24px;
  }

  .tool-detail-head {
    padding: 20px;
    border-radius: 22px;
  }
}
</style>
