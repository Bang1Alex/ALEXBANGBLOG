<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { HomeOutlined, ReadOutlined, ToolOutlined } from '@ant-design/icons-vue'
import { motion } from 'motion-v'
import newBackground from './components/newBackground.vue'
import { globalStore } from './store'

const router = useRouter()
const route = useRoute()
const store = globalStore()

const selectedKeys = ref<string[]>(['/'])
const navItems = [
  { key: '/', label: '首页', icon: HomeOutlined, note: 'Overview' },
  { key: '/blog', label: '文章', icon: ReadOutlined, note: 'Writing' },
  { key: '/tools', label: '作品', icon: ToolOutlined, note: 'Tools' },
]

const isParticleEffectEnabled = computed({
  get: () => store.isVisibleParticleEffect,
  set: (value: boolean) => store.setParticleEffect(value),
})

const shouldShowParticleEffect = computed(() => route.path === '/' && isParticleEffectEnabled.value)
const currentYear = new Date().getFullYear()

watch(() => route.path, (newPath) => {
  if (newPath.startsWith('/blog')) selectedKeys.value = ['/blog']
  else if (newPath.startsWith('/tools')) selectedKeys.value = ['/tools']
  else selectedKeys.value = ['/']
}, { immediate: true })

const handleClick = ({ key }: { key: string }) => {
  router.push(key)
}
</script>

<template>
  <newBackground v-if="shouldShowParticleEffect" />
  <a-layout class="app-shell">
    <motion.header
      class="site-header"
      :initial="{ opacity: 0, y: -24 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.55, ease: 'easeOut' }"
    >
      <div class="brand-mark" @click="handleClick({ key: '/' })">
        <span class="brand-badge">Alex</span>
        <div>
          <strong>Alex Bang Blog</strong>
          <p>Writing, experiments, and playful interfaces.</p>
        </div>
      </div>

      <nav class="site-nav">
        <button
          v-for="item in navItems"
          :key="item.key"
          type="button"
          class="nav-chip"
          :class="{ active: selectedKeys[0] === item.key }"
          @click="handleClick({ key: item.key })"
        >
          <component :is="item.icon" />
          <span>{{ item.label }}</span>
          <small>{{ item.note }}</small>
        </button>
      </nav>

      <label class="particle-toggle" for="particle-effect-switch">
        <div>
          <span>粒子背景</span>
          <small>Homepage atmosphere</small>
        </div>
        <input
          id="particle-effect-switch"
          v-model="isParticleEffectEnabled"
          type="checkbox"
        >
        <span class="toggle-track">
          <span class="toggle-thumb" />
        </span>
      </label>
    </motion.header>

    <a-layout-content class="page-content">
      <router-view />
    </a-layout-content>

    <a-layout-footer class="site-footer">
      <div>
        <strong>Alex Bang Blog</strong>
        <p>把技术、写作和互动作品放在同一个舞台里。</p>
      </div>
      <span>&copy; {{ currentYear }}</span>
    </a-layout-footer>
  </a-layout>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  background: transparent;
  position: relative;
}

.site-header {
  width: min(1180px, calc(100% - 32px));
  margin: 20px auto 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 16px 18px;
  background: rgba(255, 252, 244, 0.76);
  border: 1px solid rgba(123, 92, 59, 0.12);
  box-shadow: 0 18px 45px rgba(44, 31, 20, 0.1);
  backdrop-filter: blur(16px);
  border-radius: 24px;
  position: sticky;
  top: 0;
  z-index: 20;
}

.brand-mark {
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  min-width: 0;
}

.brand-badge {
  width: 46px;
  height: 46px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #1c6b5c, #ef7b45);
  color: #fffaf1;
  font-size: 0.95rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  box-shadow: 0 14px 25px rgba(28, 107, 92, 0.28);
}

.brand-mark strong {
  display: block;
  color: #1d160f;
  font-size: 1.05rem;
  letter-spacing: -0.03em;
}

.brand-mark p {
  margin: 4px 0 0;
  color: #72614e;
  font-size: 0.82rem;
}

.site-nav {
  flex: 1;
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

.nav-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 999px;
  border: 1px solid rgba(123, 92, 59, 0.12);
  background: rgba(255, 255, 255, 0.45);
  color: #594938;
  font-weight: 600;
  cursor: pointer;
  transition: 0.25s ease;
  box-shadow: 0 10px 20px rgba(77, 59, 40, 0.06);
}

.nav-chip span {
  white-space: nowrap;
}

.nav-chip small {
  color: #8d7963;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.nav-chip:hover,
.nav-chip.active {
  transform: translateY(-1px);
  color: #fffaf1;
  background: linear-gradient(135deg, #1d6b5c, #d76d3f);
  border-color: transparent;
}

.nav-chip:hover small,
.nav-chip.active small {
  color: rgba(255, 250, 241, 0.72);
}

.particle-toggle {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.52);
  border: 1px solid rgba(123, 92, 59, 0.12);
  cursor: pointer;
}

.particle-toggle span {
  display: block;
  color: #2a2118;
  font-weight: 700;
  font-size: 0.9rem;
}

.particle-toggle small {
  display: block;
  color: #8d7963;
  font-size: 0.75rem;
}

.particle-toggle input {
  display: none;
}

.toggle-track {
  width: 52px;
  height: 30px;
  border-radius: 999px;
  background: rgba(29, 107, 92, 0.15);
  padding: 3px;
  position: relative;
  transition: background 0.2s ease;
}

.toggle-thumb {
  display: block;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1d6b5c, #d76d3f);
  box-shadow: 0 8px 14px rgba(29, 107, 92, 0.24);
  transition: transform 0.25s ease;
}

.particle-toggle input:checked + .toggle-track {
  background: rgba(215, 109, 63, 0.18);
}

.particle-toggle input:checked + .toggle-track .toggle-thumb {
  transform: translateX(22px);
}

.page-content {
  width: min(1240px, calc(100% - 32px));
  margin: 18px auto 0;
  flex: 1;
}

.site-footer {
  width: min(1180px, calc(100% - 32px));
  margin: 28px auto 24px;
  padding: 18px 22px;
  background: rgba(255, 251, 245, 0.82);
  border: 1px solid rgba(123, 92, 59, 0.1);
  border-radius: 22px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #6d5c49;
}

.site-footer strong {
  display: block;
  color: #241c13;
  margin-bottom: 4px;
}

.site-footer p {
  margin: 0;
}

@media (max-width: 960px) {
  .site-header {
    flex-direction: column;
    align-items: stretch;
  }

  .site-nav {
    justify-content: flex-start;
  }

  .particle-toggle {
    justify-content: space-between;
  }

  .site-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>
