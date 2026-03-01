<template>
  <div class="themeList" v-if="props.customToolbarTitle === '主题'">
    <a-tabs v-model:activeKey="activeName">
      <a-tab-pane v-for="group in groupList" :key="group.name" :tab="group.name"></a-tab-pane>
    </a-tabs>
    <div class="themeItem" v-for="item in currentList" :key="item.value" @click="useTheme(item)"
      :class="{ active: item.value === theme }">
      <div class="imgBox" v-if="props.getImageUrlFromPath(themeMap[item.value])">
        <img :src="props.getImageUrlFromPath(themeMap[item.value])" :alt="item.value" />
      </div>
      <div class="name">{{ item.name =='脑残粉' ?'粉色' : item.name}}</div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue';
import themeList from 'simple-mind-map-plugin-themes/themeList'
import customThemeList from '../customThemes'
import { Modal } from 'ant-design-vue';

const props = defineProps({
  customToolbarTitle: {
    type: String,
    default: ''
  },
  mindMap: {
    type: Object,
    default: () => ({})
  },
  getImageUrlFromPath: {
    type: Function,
    default: () => ''
  },
  updatePreset: {
    type: Function,
  }
})
const currentList = computed(() => {
  if (groupList.value.length > 0) {
    return groupList.value.find(item => item.name === activeName.value).list
  }
})
const themeMap = ref({
  default: 'controls/mindmap/resources/image/themes/default.jpg',
  classic: 'controls/mindmap/resources/image/themes/classic.jpg',
  minions: 'controls/mindmap/resources/image/themes/minions.jpg',
  pinkGrape: 'controls/mindmap/resources/image/themes/pinkGrape.jpg',
  mint: 'controls/mindmap/resources/image/themes/mint.jpg',
  gold: 'controls/mindmap/resources/image/themes/gold.jpg',
  vitalityOrange: 'controls/mindmap/resources/image/themes/vitalityOrange.jpg',
  greenLeaf: 'controls/mindmap/resources/image/themes/greenLeaf.jpg',
  dark2: 'controls/mindmap/resources/image/themes/dark2.jpg',
  skyGreen: 'controls/mindmap/resources/image/themes/skyGreen.jpg',
  classic2: 'controls/mindmap/resources/image/themes/classic2.jpg',
  classic3: 'controls/mindmap/resources/image/themes/classic3.jpg',
  classic4: 'controls/mindmap/resources/image/themes/classic4.jpg',
  classicGreen: 'controls/mindmap/resources/image/themes/classicGreen.jpg',
  classicBlue: 'controls/mindmap/resources/image/themes/classicBlue.jpg',
  blueSky: 'controls/mindmap/resources/image/themes/blueSky.jpg',
  brainImpairedPink: 'controls/mindmap/resources/image/themes/brainImpairedPink.jpg',
  dark: 'controls/mindmap/resources/image/themes/dark.jpg',
  earthYellow: 'controls/mindmap/resources/image/themes/earthYellow.jpg',
  freshGreen: 'controls/mindmap/resources/image/themes/freshGreen.jpg',
  freshRed: 'controls/mindmap/resources/image/themes/freshRed.jpg',
  romanticPurple: 'controls/mindmap/resources/image/themes/romanticPurple.jpg',
  simpleBlack: 'controls/mindmap/resources/image/themes/simpleBlack.jpg',
  courseGreen: 'controls/mindmap/resources/image/themes/courseGreen.jpg',
  coffee: 'controls/mindmap/resources/image/themes/coffee.jpg',
  redSpirit: 'controls/mindmap/resources/image/themes/redSpirit.jpg',
  blackHumour: 'controls/mindmap/resources/image/themes/blackHumour.jpg',
  lateNightOffice: 'controls/mindmap/resources/image/themes/lateNightOffice.jpg',
  blackGold: 'controls/mindmap/resources/image/themes/blackGold.jpg',
  autumn: 'controls/mindmap/resources/image/themes/autumn.jpg',
  avocado: 'controls/mindmap/resources/image/themes/avocado.jpg',
  orangeJuice: 'controls/mindmap/resources/image/themes/orangeJuice.jpg',
  oreo: 'controls/mindmap/resources/image/themes/oreo.jpg',
  shallowSea: 'controls/mindmap/resources/image/themes/shallowSea.jpg',
  lemonBubbles: 'controls/mindmap/resources/image/themes/lemonBubbles.jpg',
  rose: 'controls/mindmap/resources/image/themes/rose.jpg',
  seaBlueLine: 'controls/mindmap/resources/image/themes/seaBlueLine.jpg',
  neonLamp: 'controls/mindmap/resources/image/themes/neonLamp.jpg',
  darkNightLceBlade: 'controls/mindmap/resources/image/themes/darkNightLceBlade.jpg',
  morandi: 'controls/mindmap/resources/image/themes/morandi.jpg',
  classic5: 'controls/mindmap/resources/image/themes/classic5.jpg',
  dark3: 'controls/mindmap/resources/image/themes/dark3.jpg',
  dark4: 'controls/mindmap/resources/image/themes/dark4.jpg',
  cactus: 'controls/mindmap/resources/image/themes/cactus.jpg'
})

const useTheme = item => {
  if (theme.value === item.value) return
  theme.value = item.value
  const customThemeConfig = props.mindMap.getCustomThemeConfig()
  const hasCustomThemeConfig = Object.keys(customThemeConfig).length > 0
  if (hasCustomThemeConfig) {
    Modal.confirm({
      title: '提示',
      content: '你当前自定义过基础样式，是否覆盖？',
      okText: '覆盖',
      cancelText: '保留',
      onOk() {
        props.mindMap.setThemeConfig({}, true)
        changeTheme(theme, {})
      },
      onCancel() {
        changeTheme(theme, customThemeConfig)
      }
    })
  } else {
    changeTheme(theme, customThemeConfig)
  }

}
const changeTheme = (theme, config) => {
  props.mindMap.setTheme(theme.value)
}
const groupList = ref([]);
const activeName = ref('')
const theme = ref('')
const themeAllList = ref([...themeList, ...customThemeList].reverse())
onMounted(async () => {
  await initGroup()
})
const initGroup = () => {
  let baiduThemes = [
    'default',
    'skyGreen',
    'classic2',
    'classic3',
    'classicGreen',
    'classicBlue',
    'blueSky',
    'brainImpairedPink',
    'earthYellow',
    'freshGreen',
    'freshRed',
    'romanticPurple',
    'pinkGrape',
    'mint'
  ]
  let baiduList = []
  let classicsList = []
  themeAllList.value.forEach(item => {
    if (baiduThemes.includes(item.value)) {
      baiduList.push(item)
    } else if (!item.dark) {
      classicsList.push(item)
    }
  })
  groupList.value = [
    {
      name: '经典',
      list: classicsList
    },
    {
      name: '深色',
      list: themeAllList.value.filter(item => {
        return item.dark
      })
    },
    {
      name: '朴素',
      list: baiduList
    }
  ]
  activeName.value = groupList.value[0].name
}
</script>
<style lang="less" scoped>
.themeList {
  padding: 20px;
  padding-top: 0;

  &.isDark {
    .name {
      color: #fff;
    }
  }

  .themeItem {
    width: 100%;
    cursor: pointer;
    border-bottom: 1px solid #e9e9e9;
    margin-bottom: 20px;
    padding-bottom: 20px;
    transition: all 0.2s;
    border: 1px solid transparent;

    &:last-of-type {
      border: none;
    }

    &:hover {
      box-shadow: 0 1px 2px -2px rgba(0, 0, 0, 0.16), 0 3px 6px 0 rgba(0, 0, 0, 0.12), 0 5px 12px 4px rgba(0, 0, 0, 0.09);
    }

    &.active {
      border: 1px solid #67c23a;
    }

    .imgBox {
      width: 100%;

      img {
        width: 100%;
      }
    }

    .name {
      text-align: center;
      font-size: 14px;
    }
  }
}
</style>