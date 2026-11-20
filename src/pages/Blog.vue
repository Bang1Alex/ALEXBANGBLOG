<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRightOutlined } from '@ant-design/icons-vue'
import { motion } from 'motion-v'
import { getAllPosts, type PostMeta } from '@/data/content'

const router = useRouter()
const posts = ref<PostMeta[]>([])

onMounted(async () => {
  posts.value = await getAllPosts()
})
</script>

<template>
  <div class="blog-page">
    <motion.section
      class="blog-hero"
      :initial="{ opacity: 0, y: 24 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.6 }"
    >
      <span>Article archive</span>
      <h1>像杂志目录一样浏览文章。</h1>
      <p>我把文章区改成更清晰的编排，强调标题、摘要、时间和阅读节奏，而不是一串普通卡片。</p>
    </motion.section>

    <section class="article-list">
      <motion.button
        v-for="(post, index) in posts"
        :key="post.slug"
        type="button"
        class="article-card"
        :initial="{ opacity: 0, y: 26 }"
        :while-in-view="{ opacity: 1, y: 0 }"
        :in-view-options="{ once: true, margin: '-80px' }"
        :transition="{ duration: 0.45, delay: index * 0.03 }"
        @click="router.push(`/blog/${encodeURIComponent(post.slug)}`)"
      >
        <div class="article-index">{{ String(index + 1).padStart(2, '0') }}</div>
        <div class="article-main">
          <div class="article-topline">
            <span>{{ post.date || 'Undated' }}</span>
            <span>{{ post.readingTime }}</span>
          </div>
          <h2>{{ post.title }}</h2>
          <p>{{ post.summary }}</p>
          <div class="article-tags">
            <span v-for="tag in post.tags" :key="tag">{{ tag }}</span>
          </div>
        </div>
        <ArrowRightOutlined class="article-arrow" />
      </motion.button>
    </section>
  </div>
</template>

<style scoped>
.blog-page {
  display: grid;
  gap: 24px;
  padding-bottom: 24px;
}

.blog-hero,
.article-card {
  border-radius: 30px;
  background: rgba(255, 250, 244, 0.86);
  border: 1px solid rgba(123, 92, 59, 0.1);
  box-shadow: 0 22px 55px rgba(49, 34, 22, 0.08);
}

.blog-hero {
  padding: 34px;
  background:
    radial-gradient(circle at top right, rgba(239, 123, 69, 0.18), transparent 30%),
    rgba(255, 250, 244, 0.9);
}

.blog-hero span {
  display: inline-block;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(239, 123, 69, 0.1);
  color: #d76d3f;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.blog-hero h1 {
  margin: 16px 0 12px;
  font-size: clamp(2.2rem, 4vw, 4.4rem);
  line-height: 0.96;
  letter-spacing: -0.05em;
  color: #21170f;
}

.blog-hero p {
  max-width: 58ch;
  margin: 0;
  color: #655542;
  line-height: 1.9;
}

.article-list {
  display: grid;
  gap: 16px;
}

.article-card {
  width: 100%;
  padding: 24px;
  display: grid;
  grid-template-columns: 70px minmax(0, 1fr) auto;
  gap: 22px;
  text-align: left;
  cursor: pointer;
  transition: 0.25s ease;
}

.article-card:hover {
  transform: translateY(-4px);
}

.article-index {
  font-size: 1.1rem;
  font-weight: 800;
  color: #c86b40;
}

.article-topline,
.article-tags {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  color: #8d7861;
  font-size: 0.88rem;
}

.article-main h2 {
  margin: 10px 0 10px;
  font-size: 1.6rem;
  color: #221a12;
}

.article-main p {
  margin: 0;
  color: #62513f;
  line-height: 1.8;
}

.article-tags {
  margin-top: 16px;
}

.article-tags span {
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(29, 107, 92, 0.08);
  color: #1d6b5c;
}

.article-arrow {
  align-self: center;
  font-size: 1.3rem;
  color: #8d7861;
}

@media (max-width: 720px) {
  .blog-hero,
  .article-card {
    padding: 22px;
    border-radius: 24px;
  }

  .article-card {
    grid-template-columns: 1fr;
  }
}
</style>
