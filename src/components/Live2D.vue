<template>
  <div class="live2d-wrapper">
    <vue-live2d
      :width="250"
      :height="300"
      :direction="direction"
      :customId="customId"
      :apiPath="apiPath"
      :modelId="modelId"
      :texturesId="texturesId"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import VueLive2d from 'vue-live2d'

const direction = ref('right')
const customId = ref('live2d-main')
const apiPath = ref('https://unpkg.com/live2d-static-api@latest/indexes')
const modelId = ref(3) // 默认模型 ID
const texturesId = ref(53) // 默认皮肤 ID
</script>

<style scoped>
.live2d-wrapper {
  position: fixed;
  left: 0;
  bottom: 0;
  z-index: 9999;
  pointer-events: auto;
}
</style>