<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRightOutlined, ReadOutlined, RocketOutlined } from '@ant-design/icons-vue'
import { motion } from 'motion-v'
import { getAllPosts, getFeaturedTools, type PostMeta } from '@/data/content'

const router = useRouter()
const recentPosts = ref<PostMeta[]>([])
const featuredTools = getFeaturedTools()

const highlights = [
  { value: '6+', label: '互动作品' },
  { value: '长期', label: '持续写作' },
  { value: 'Vue', label: '主力技术栈' },
]

const latestPost = computed(() => recentPosts.value[0])

onMounted(async () => {
  recentPosts.value = (await getAllPosts()).slice(0, 4)
})
</script>

<template>
  <div class="home-page">
    <section class="hero-panel">
      <motion.div
        class="hero-copy"
        :initial="{ opacity: 0, y: 28 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.65, ease: 'easeOut' }"
      >
        <span class="eyebrow">Independent developer journal</span>
        <h1>把博客做成作品集，而不是一张普通的文章列表。</h1>
        <p>
          这里收纳前端学习笔记、可交互工具和一些更偏创作性的实验。我把它重新整理成更像编辑部主页的结构，让内容与作品都能被一眼看到。
        </p>

        <div class="hero-actions">
          <a-button type="primary" size="large" @click="router.push('/blog')">
            <template #icon>
              <ReadOutlined />
            </template>
            阅读文章
          </a-button>
          <a-button size="large" @click="router.push('/tools')">
            <template #icon>
              <RocketOutlined />
            </template>
            浏览作品
          </a-button>
        </div>

        <div class="hero-stats">
          <div v-for="item in highlights" :key="item.label" class="stat-card">
            <strong>{{ item.value }}</strong>
            <span>{{ item.label }}</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        class="hero-feature"
        :initial="{ opacity: 0, scale: 0.94 }"
        :animate="{ opacity: 1, scale: 1 }"
        :transition="{ duration: 0.75, ease: 'easeOut', delay: 0.1 }"
      >
        <div class="feature-note">Latest Story</div>
        <h2>{{ latestPost?.title || '正在整理最近的文章...' }}</h2>
        <p>{{ latestPost?.summary || '新的版式已经准备好，内容会继续往里填。' }}</p>
        <div class="feature-meta" v-if="latestPost">
          <span>{{ latestPost.date }}</span>
          <span>{{ latestPost.readingTime }}</span>
        </div>
        <button v-if="latestPost" class="feature-link" @click="router.push(`/blog/${encodeURIComponent(latestPost.slug)}`)">
          继续阅读
          <ArrowRightOutlined />
        </button>
      </motion.div>
    </section>

    <section class="showcase-grid">
      <motion.article
        class="section-card tools-card"
        :initial="{ opacity: 0, y: 24 }"
        :while-in-view="{ opacity: 1, y: 0 }"
        :in-view-options="{ once: true, margin: '-80px' }"
        :transition="{ duration: 0.55 }"
      >
        <div class="section-heading">
          <span>Interactive collection</span>
          <h3>近期作品与工具</h3>
        </div>

        <div class="tool-list">
          <button
            v-for="tool in featuredTools"
            :key="tool.id"
            type="button"
            class="tool-row"
            @click="router.push(`/tools/${tool.id}`)"
          >
            <span class="tool-icon" :style="{ background: `linear-gradient(135deg, ${tool.accent}, #fff4e8)` }">
              <component :is="tool.icon" />
            </span>
            <span class="tool-copy">
              <strong>{{ tool.name }}</strong>
              <small>{{ tool.status }}</small>
              <p>{{ tool.description }}</p>
            </span>
            <ArrowRightOutlined />
          </button>
        </div>
      </motion.article>

      <motion.article
        class="section-card posts-card"
        :initial="{ opacity: 0, y: 24 }"
        :while-in-view="{ opacity: 1, y: 0 }"
        :in-view-options="{ once: true, margin: '-80px' }"
        :transition="{ duration: 0.55, delay: 0.08 }"
      >
        <div class="section-heading">
          <span>Editorial feed</span>
          <h3>最新文章</h3>
        </div>

        <div class="post-feed">
          <button
            v-for="post in recentPosts"
            :key="post.slug"
            type="button"
            class="post-row"
            @click="router.push(`/blog/${encodeURIComponent(post.slug)}`)"
          >
            <div class="post-row-top">
              <strong>{{ post.title }}</strong>
              <span>{{ post.date }}</span>
            </div>
            <p>{{ post.summary }}</p>
            <div class="post-row-bottom">
              <span>{{ post.readingTime }}</span>
              <span>{{ post.tags.join(' · ') }}</span>
            </div>
          </button>
        </div>
      </motion.article>
    </section>
  </div>
</template>

<style scoped>
.home-page {
  display: grid;
  gap: 24px;
  padding-bottom: 32px;
}

.hero-panel {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.8fr);
  gap: 24px;
}

.hero-copy,
.hero-feature,
.section-card {
  border-radius: 32px;
  background: rgba(255, 250, 244, 0.86);
  border: 1px solid rgba(123, 92, 59, 0.1);
  box-shadow: 0 24px 60px rgba(50, 35, 24, 0.08);
  backdrop-filter: blur(10px);
}

.hero-copy {
  padding: 40px;
  background:
    radial-gradient(circle at top left, rgba(30, 107, 92, 0.18), transparent 34%),
    radial-gradient(circle at right, rgba(239, 123, 69, 0.18), transparent 32%),
    rgba(255, 250, 244, 0.9);
}

.eyebrow,
.section-heading span,
.feature-note {
  display: inline-flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(29, 107, 92, 0.08);
  color: #1d6b5c;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.hero-copy h1 {
  margin: 18px 0 18px;
  max-width: 10ch;
  font-size: clamp(2.8rem, 5vw, 5.5rem);
  line-height: 0.94;
  color: #21170f;
  letter-spacing: -0.06em;
}

.hero-copy p {
  max-width: 58ch;
  margin: 0;
  font-size: 1.05rem;
  line-height: 1.9;
  color: #635340;
}

.hero-actions {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  margin: 28px 0 32px;
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.stat-card {
  padding: 18px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(123, 92, 59, 0.08);
}

.stat-card strong {
  display: block;
  font-size: 1.8rem;
  color: #1d160f;
}

.stat-card span {
  color: #7e6d59;
}

.hero-feature {
  padding: 32px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background:
    linear-gradient(160deg, rgba(29, 107, 92, 0.9), rgba(25, 48, 74, 0.96)),
    #19444f;
  color: #fff9f1;
}

.hero-feature h2 {
  margin: 20px 0 14px;
  font-size: 2rem;
  line-height: 1.1;
  color: inherit;
}

.hero-feature p {
  color: rgba(255, 249, 241, 0.8);
  line-height: 1.8;
}

.feature-meta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  color: rgba(255, 249, 241, 0.7);
  font-size: 0.9rem;
}

.feature-link {
  margin-top: 24px;
  width: fit-content;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 18px;
  border: none;
  border-radius: 999px;
  background: #fff7ed;
  color: #1d6b5c;
  font-weight: 700;
  cursor: pointer;
}

.showcase-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
}

.section-card {
  padding: 28px;
}

.section-heading h3 {
  margin: 14px 0 0;
  font-size: 2rem;
  color: #1f1710;
}

.tool-list,
.post-feed {
  margin-top: 24px;
  display: grid;
  gap: 14px;
}

.tool-row,
.post-row {
  width: 100%;
  border: 1px solid rgba(123, 92, 59, 0.08);
  background: rgba(255, 255, 255, 0.74);
  border-radius: 24px;
  padding: 18px;
  text-align: left;
  cursor: pointer;
  transition: 0.25s ease;
}

.tool-row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 16px;
  align-items: center;
}

.tool-row:hover,
.post-row:hover {
  transform: translateY(-3px);
  box-shadow: 0 18px 30px rgba(57, 41, 26, 0.08);
}

.tool-icon {
  width: 52px;
  height: 52px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  font-size: 1.2rem;
  color: #fff;
}

.tool-copy strong,
.post-row strong {
  display: block;
  color: #241b13;
  font-size: 1.08rem;
}

.tool-copy small,
.post-row span,
.post-row-bottom {
  color: #8a765f;
}

.tool-copy p,
.post-row p {
  margin: 8px 0 0;
  color: #62523f;
  line-height: 1.75;
}

.post-row-top,
.post-row-bottom {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.post-row-bottom {
  margin-top: 12px;
  font-size: 0.86rem;
}

@media (max-width: 980px) {
  .hero-panel,
  .showcase-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .hero-copy,
  .hero-feature,
  .section-card {
    padding: 22px;
    border-radius: 24px;
  }

  .hero-copy h1 {
    max-width: none;
    font-size: 2.7rem;
  }

  .hero-stats {
    grid-template-columns: 1fr;
  }

  .tool-row {
    grid-template-columns: 1fr;
  }
}
</style>
