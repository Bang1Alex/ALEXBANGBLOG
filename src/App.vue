<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { HomeOutlined, ReadOutlined, ToolOutlined } from '@ant-design/icons-vue'
import newBackground from './components/newBackground.vue'
import { globalStore } from './store'
const router = useRouter()
const route = useRoute()
const store = globalStore()
const selectedKeys = ref<string[]>(['/'])
const isParticleEffectEnabled = computed({
  get: () => store.isVisibleParticleEffect,
  set: (value: boolean) => store.setParticleEffect(value),
})
const shouldShowParticleEffect = computed(() => route.path === '/' && isParticleEffectEnabled.value)

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
  <a-layout class="app-container">
    <div class="header">
      <div class="logo" @click="handleClick({ key: '/' })">Alex Blog</div>
      <div class="header-actions">
        <div class="glass-radio-group">
        <input 
          id="glass-silver" 
          type="radio" 
          name="plan"
          :checked="selectedKeys[0] === '/'"
        >
        <label
          key="/"
          for="glass-silver" 
          @click="handleClick({ key: '/' })">
          <HomeOutlined /> 首页
        </label>
        <input
          id="glass-gold"
          type="radio"
          name="plan"
          :checked="selectedKeys[0] === '/blog'"
        >
        <label
          key="/blog"
          for="glass-gold"
          @click="handleClick({ key: '/blog' })"
        >
          <ReadOutlined /> 博客
        </label>
        <input
          id="glass-platinum"
          type="radio"
          name="plan"
          :checked="selectedKeys[0] === '/tools'"
        >
        <label
          key="/tools"
          for="glass-platinum"
          @click="handleClick({ key: '/tools' })"
        >
          <ToolOutlined /> 工具
        </label>
        <div class="glass-glider" />
        </div>
        <div class="glass-switch">
          <span class="switch-label">流体特效</span>
          <input
            id="particle-effect-switch"
            v-model="isParticleEffectEnabled"
            type="checkbox"
          >
          <label for="particle-effect-switch" class="switch-track">
            <span class="switch-text switch-text-off">OFF</span>
            <span class="switch-text switch-text-on">ON</span>
            <span class="switch-thumb" />
          </label>
        </div>
      </div>
    </div>
    
    <a-layout-content class="main-content">
      <router-view />
    </a-layout-content>
    
    <a-layout-footer class="footer">
      <p>&copy; 2023 Alex Blog</p>
    </a-layout-footer>
  </a-layout>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: transparent;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  padding: 12px 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 15;
  position: sticky;
  top: 0;
  width: 100%;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo {
  font-weight: 800;
  font-size: 1.4rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-right: 24px;
  flex-shrink: 0;
  cursor: pointer;
  letter-spacing: -0.5px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
    filter: brightness(1.2);
  }
}

.menu {
  flex: 1;
  border-bottom: none;
  justify-content: flex-end;
}

.main-content {
  flex: 1;
  padding: 20px;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  margin-top: 20px;
}

/* Ant Design Layout Content usually has grey background, override if needed */
:deep(.ant-layout-content) {
  background: transparent;
}

.footer {
  text-align: center;
  color: #999;
  padding: 20px;
  background-color: #f5f7fa;
  font-size: 0.9rem;
}

/* From Uiverse.io by chase2k25 */ 
.glass-radio-group {
  --bg: rgba(255, 255, 255, 0.08);
  --text: #e5e5e5;

  display: flex;
  position: relative;
  background: var(--bg);
  border-radius: 1.2rem;
  backdrop-filter: blur(16px);
  box-shadow:
    inset 1px 1px 6px rgba(255, 255, 255, 0.15),
    inset -1px -1px 8px rgba(0, 0, 0, 0.4),
    0 6px 20px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  width: fit-content;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.glass-radio-group input {
  display: none;
}

.glass-radio-group label {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 80px;
  font-size: 14px;
  padding: 0.8rem 1.6rem;
  cursor: pointer;
  font-weight: 600;
  letter-spacing: 0.3px;
  color: var(--text);
  position: relative;
  z-index: 2;
  transition: color 0.3s ease-in-out;
  gap: 6px;
}

.glass-radio-group label:hover {
  color: white;
}

.glass-radio-group input:checked + label {
  color: #fff;
}

.glass-glider {
  position: absolute;
  top: 0;
  bottom: 0;
  width: calc(100% / 3);
  border-radius: 1rem;
  z-index: 1;
  transition:
    transform 0.5s cubic-bezier(0.37, 1.95, 0.66, 0.56),
    background 0.4s ease-in-out,
    box-shadow 0.4s ease-in-out;
}

/* Silver */
#glass-silver:checked ~ .glass-glider {
  transform: translateX(0%);
  background: linear-gradient(135deg, #c0c0c055, #e0e0e0);
  box-shadow:
    0 0 18px rgba(192, 192, 192, 0.5),
    0 0 10px rgba(255, 255, 255, 0.4) inset;
}

/* Gold */
#glass-gold:checked ~ .glass-glider {
  transform: translateX(100%);
  background: linear-gradient(135deg, #ffd70055, #ffcc00);
  box-shadow:
    0 0 18px rgba(255, 215, 0, 0.5),
    0 0 10px rgba(255, 235, 150, 0.4) inset;
}

/* Platinum */
#glass-platinum:checked ~ .glass-glider {
  transform: translateX(200%);
  background: linear-gradient(135deg, #d0e7ff55, #a0d8ff);
  box-shadow:
    0 0 18px rgba(160, 216, 255, 0.5),
    0 0 10px rgba(200, 240, 255, 0.4) inset;
}

.glass-switch {
  --bg: rgba(255, 255, 255, 0.08);
  --text: #e5e5e5;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0.5rem 0.7rem 0.5rem 1rem;
  border-radius: 1.2rem;
  background: var(--bg);
  color: var(--text);
  backdrop-filter: blur(16px);
  box-shadow:
    inset 1px 1px 6px rgba(255, 255, 255, 0.15),
    inset -1px -1px 8px rgba(0, 0, 0, 0.4),
    0 6px 20px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.switch-label {
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.3px;
  white-space: nowrap;
}

.glass-switch input {
  display: none;
}

.switch-track {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 84px;
  padding: 4px 8px;
  border-radius: 999px;
  cursor: pointer;
  background: rgba(13, 18, 35, 0.65);
  box-shadow:
    inset 0 1px 3px rgba(255, 255, 255, 0.08),
    inset 0 -2px 6px rgba(0, 0, 0, 0.3);
  transition: background 0.35s ease, box-shadow 0.35s ease;
}

.switch-text {
  z-index: 2;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.8px;
  transition: color 0.35s ease, opacity 0.35s ease;
}

.switch-text-off {
  color: rgba(255, 255, 255, 0.9);
}

.switch-text-on {
  color: rgba(255, 255, 255, 0.45);
}

.switch-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 38px;
  height: calc(100% - 6px);
  border-radius: 999px;
  background: linear-gradient(135deg, #c0c0c055, #e0e0e0);
  box-shadow:
    0 0 18px rgba(192, 192, 192, 0.35),
    0 0 10px rgba(255, 255, 255, 0.25) inset;
  transition:
    transform 0.35s cubic-bezier(0.37, 1.95, 0.66, 0.56),
    background 0.35s ease,
    box-shadow 0.35s ease;
}

.glass-switch input:checked + .switch-track {
  background: rgba(24, 34, 56, 0.88);
  box-shadow:
    inset 0 1px 3px rgba(255, 255, 255, 0.08),
    inset 0 -2px 6px rgba(0, 0, 0, 0.4),
    0 0 18px rgba(102, 126, 234, 0.15);
}

.glass-switch input:checked + .switch-track .switch-thumb {
  transform: translateX(35px);
  background: linear-gradient(135deg, #d0e7ff55, #a0d8ff);
  box-shadow:
    0 0 18px rgba(160, 216, 255, 0.45),
    0 0 10px rgba(200, 240, 255, 0.35) inset;
}

.glass-switch input:checked + .switch-track .switch-text-off {
  color: rgba(255, 255, 255, 0.45);
}

.glass-switch input:checked + .switch-track .switch-text-on {
  color: rgba(255, 255, 255, 0.95);
}

@media (max-width: 900px) {
  .header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .header-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .glass-radio-group,
  .glass-switch {
    justify-content: center;
  }
}

</style>
