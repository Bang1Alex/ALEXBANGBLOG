<template>
  <div class="layoutList" v-if="props.customToolbarTitle === '结构'">
    <div
      class="layoutItem" v-for="item in layoutList" :key="item.value" :class="{ active: item.value === layout }"
      @click="useLayout(item)">
      <div v-if="props.getImageUrlFromPath(layoutImgMap[item.value])" class="imgBox">
        <img :src="props.getImageUrlFromPath(layoutImgMap[item.value])" alt="" >
      </div>
      <div class="name">
        {{ item.name }}
      </div>
    </div>
  </div>
</template>
<script setup>
import { layoutList } from 'simple-mind-map/src/constants/constant'
import { ref, toRaw } from 'vue';
const layout = ref('')
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
const useLayout = item => {
    layout.value = item.value
    toRaw(props.mindMap).setLayout(layout.value)
}
const layoutImgMap = ref({
    logicalStructure: 'controls/mindmap/resources/image/structures/logicalStructure.png',
    mindMap: 'controls/mindmap/resources/image/structures/mindMap.png',
    organizationStructure: 'controls/mindmap/resources/image/structures/organizationStructure.png',
    catalogOrganization: 'controls/mindmap/resources/image/structures/catalogOrganization.png',
    timeline: 'controls/mindmap/resources/image/structures/timeline.png',
    timeline2: 'controls/mindmap/resources/image/structures/timeline2.png',
    fishbone: 'controls/mindmap/resources/image/structures/fishbone.png',
    verticalTimeline: 'controls/mindmap/resources/image/structures/verticalTimeline.png'
})
</script>
<style lang="less" scoped>
.layoutList {
    padding: 20px;

    &.isDark {
        .name {
            color: #fff;
        }
    }

    .layoutItem {
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
