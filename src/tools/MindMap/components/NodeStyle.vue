<template>
  <div v-if="customToolbarTitle === '节点样式'">
    <div class="node-style" v-if="activeNodes.length !== 0">
      <div class="text">
        <h4>文字</h4>
        <div class="text-container">
          <div class="row">
            <div class="font-family">
              <a-select v-model:value="props.myStyle.fontFamily" style="width: 120px" @change="changeFontFamily">
                <a-select-option v-for="item in fontFamilyList" :key="item.value" :value="item.value"
                  :style="{ fontFamily: item.value }">
                  {{ item.name }}
                </a-select-option>
              </a-select>
            </div>
            <div class="font-size">
              <a-select v-model:value="props.myStyle.fontSize" style="width: 120px" @change="changeFontSize">
                <a-select-option v-for="item in fontSizeList" :key="item" :value="item"
                  :style="{ fontSize: item + 'px' }">
                  {{ item }}
                </a-select-option>
              </a-select>
            </div>
          </div>
          <div class="row">
            <a-tooltip placement="topLeft">
              <template #title>
                <span>颜色</span>
              </template>
              <a-popconfirm placement="topLeft" ok-text="" cancel-text="" @confirm="confirm">
                <template #title>
                  <Sketch v-model="props.myStyle.color" :preset-colors="colorList"
                    @update:model-value="changeFontColor" />
                </template>
                <template #cancelButton> </template>
                <template #okButton></template>
                <template #icon></template>
                <div :style="{ background: props.myStyle.color }"
                  style="width: 30px;height: 30px;border: 1px solid #ccc;border-radius:5px ;"></div>
              </a-popconfirm>
            </a-tooltip>

            <a-tooltip placement="topLeft">
              <template #title>
                <span>加粗</span>
              </template>
              <div class="styleBtn" :class="{
                actived: props.myStyle.fontWeight === 'bold'
              }" @click="toggleFontWeight">
                B
              </div>
            </a-tooltip>

            <a-tooltip placement="topLeft">
              <template #title>
                <span>斜体</span>
              </template>
              <div class="styleBtn i" :class="{
                actived: props.myStyle.fontStyle === 'italic'
              }" @click="toggleFontStyle">
                I
              </div>
            </a-tooltip>
            <a-tooltip placement="topLeft">
              <template #title>
                <span>下划线</span>
              </template>
              <a-popconfirm placement="bottomLeft" ok-text="" cancel-text="" @confirm="confirm">
                <template #title>
                  <a-radio-group v-model:value="props.myStyle.textDecoration" :options="plainOptions"
                    @change="update('textDecoration')" />
                </template>
                <template #cancelButton> </template>
                <template #okButton></template>
                <template #icon></template>
                <div class="styleBtn u" :style="{
                  textDecoration: props.myStyle.textDecoration || 'none'
                }">
                  U
                </div>
              </a-popconfirm>
            </a-tooltip>
          </div>
        </div>
      </div>
      <div class="border">
        <h4>边框</h4>
        <div class="border-container">
          <div class="row">
            <div class="color styleBtn">
              <div class="text">颜色</div>
              <a-tooltip placement="topLeft">
                <template #title>
                  <span>颜色</span>
                </template>
                <a-popconfirm placement="topLeft" ok-text="" cancel-text="" @confirm="confirm">
                  <template #title>
                    <Sketch v-model="props.myStyle.borderColor" :preset-colors="colorList"
                      @update:model-value="changeBorderColor" />
                  </template>
                  <template #cancelButton> </template>
                  <template #okButton></template>
                  <template #icon></template>
                  <div :style="{ background: props.myStyle.borderColor }"
                    style="width: 30px;height: 30px;border: 1px solid #ccc;border-radius:5px ;"></div>
                </a-popconfirm>
              </a-tooltip>
            </div>
            <div class="border-style styleBtn">
              <div class="text">样式</div>
              <div class="value">
                <a-select v-model:value="props.myStyle.borderDasharray" style="width: 120px" @change="changeBorderDash">
                  <a-select-option v-for="item in borderDasharrayList" :key="item.value" :label="item.name"
                    :value="item.value">
                    <svg width="120" height="34">
                      <line x1="10" y1="17" x2="110" y2="17" stroke-width="2"
                        :stroke="props.myStyle.borderDasharray === item.value ? '#409eff' : '#000'"
                        :stroke-dasharray="item.value"></line>
                    </svg>
                  </a-select-option>
                </a-select>
              </div>
            </div>

          </div>
          <div class="row">
            <div class="border-width styleBtn">
              <div class="text">宽度</div>
              <div class="value">
                <a-select v-model:value="props.myStyle.borderWidth" style="width: 80px" @change="changeBorderWidth">
                  <a-select-option v-for="item in borderWidthList" :key="item" :label="item" :value="item">
                    <span v-if="item > 0"
                      :style="{ height: item + 'px', width: '100%', display: 'inline-block', background: '#000' }"></span>
                    <span v-else>0</span>
                  </a-select-option>
                </a-select>
              </div>
            </div>
            <div class="border-radius styleBtn">
              <div class="text">圆角</div>
              <div class="value">
                <a-select v-model:value="props.myStyle.borderRadius" style="width: 80px" @change="changeBorderRadius">
                  <a-select-option v-for="item in borderRadiusList" :key="item" :label="item" :value="item">
                  </a-select-option>
                </a-select>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="bgc">
        <h4>背景</h4>
        <div class="bgc-container">
          <div class="row">
            <div class="color styleBtn">
              <div class="text">颜色</div>
              <a-popconfirm placement="topLeft" ok-text="" cancel-text="" @confirm="confirm">
                <template #title>
                  <Sketch v-model="props.myStyle.fillColor" :preset-colors="colorList"
                    @update:model-value="changeFillColor" />
                </template>
                <template #cancelButton> </template>
                <template #okButton></template>
                <template #icon></template>
                <div :style="{ background: props.myStyle.fillColor }"
                  style="width: 30px;height: 30px;border: 1px solid #ccc;border-radius:5px ;"></div>
              </a-popconfirm>
            </div>
            <div class="rowItem">
              <span class="name">渐变</span>
              <a-checkbox v-model:checked="props.myStyle.gradientStyle" @change=changeGradientStyle></a-checkbox>

            </div>
          </div>
          <div class="row" v-if="props.myStyle.gradientStyle">

            <div class="rowItem">
              <span class="name">起始</span>
              <a-popconfirm placement="topLeft" ok-text="" cancel-text="" @confirm="confirm">
                <template #title>
                  <Sketch v-model="props.myStyle.startColor" :preset-colors="colorList"
                    @update:model-value="changeStartColor" />
                </template>
                <template #cancelButton> </template>
                <template #okButton></template>
                <template #icon></template>
                <div :style="{ background: props.myStyle.startColor }"
                  style="width: 30px;height: 30px;border: 1px solid #ccc;border-radius:5px ;"></div>
              </a-popconfirm>
            </div>
            <div class="rowItem">
              <span class="name">结束</span>
              <a-popconfirm placement="topLeft" ok-text="" cancel-text="" @confirm="confirm">
                <template #title>
                  <Sketch v-model="props.myStyle.endColor" :preset-colors="colorList"
                    @update:model-value="changeEndColor" />
                </template>
                <template #cancelButton> </template>
                <template #okButton></template>
                <template #icon></template>
                <div :style="{ background: props.myStyle.endColor }"
                  style="width: 30px;height: 30px;border: 1px solid #ccc;border-radius:5px ;"></div>
              </a-popconfirm>
            </div>
          </div>
        </div>
      </div>
      <div class="shape">
        <h4>形状</h4>
        <div class="shape-container">
          <div class="row">
            <div class="shape styleBtn">
              <div class="text">形状</div>
              <a-select v-model:value="props.myStyle.shape" style="width: 120px" @change="changeShape">
                <a-select-option v-for="item in shapeList" :key="item" :label="item.name" :value="item.value">
                  <svg width="60" height="26" style="margin-top: 5px">
                    <path :d="shapeListMap[item.value]" fill="none"
                      :stroke="props.myStyle.shape === item.value ? '#409eff' : '#000'" stroke-width="2"></path>
                  </svg>
                </a-select-option>
              </a-select>
            </div>
          </div>
        </div>
      </div>
      <div class="line"></div>
    </div>
    <div v-else>
      <div class="tipIcon iconfont icon-tianjiazijiedian"></div>
      <div class="tipText">请选择一个节点</div>
    </div>
  </div>
</template>
<script setup>
import { fontFamilyList, fontSizeList, borderDasharrayList, borderWidthList, borderRadiusList, shapeList, shapeListMap } from "../config/zh.js"
import { colorList } from '../config/zh.js'
import { Sketch } from "@ckpack/vue-color"
const props = defineProps({
  customToolbarTitle: {
    type: String,
    default: ''
  },
  activeNodes: {
    type: Array,
    default: () => []
  },
  myStyle: {
    type: Object,
    default: () => ({})
  },
})
const plainOptions = [
  { label: '无', value: 'none' },
  { label: '下划线', value: 'underline' },
  { label: '中划线', value: 'line-through' },
  { label: '上划线', value: 'overline' },
];
function update(prop) {
  props.activeNodes.forEach((node) => {
    node.setStyle(prop, props.myStyle[prop])
  })
}
function changeFontColor(color) {
  props.myStyle.color = color.hex
  update('color')
}
function changeBorderDash(dash) {
  props.myStyle.borderDasharray = dash
  update('borderDasharray')
}
function changeBorderRadius(radius) {
  props.myStyle.borderRadius = radius
  update('borderRadius')
}
function changeBorderWidth(width) {
  props.myStyle.borderWidth = width
  update('borderWidth')
}
function toggleFontWeight() {
  if (props.myStyle.fontWeight === 'bold') {
    props.myStyle.fontWeight = 'normal'
  } else {
    props.myStyle.fontWeight = 'bold'
  }
  update('fontWeight')
}
function toggleFontStyle() {
  if (props.myStyle.fontStyle === 'italic') {
    props.myStyle.fontStyle = 'normal'
  } else {
    props.myStyle.fontStyle = 'italic'
  }
  update('fontStyle')
}
function changeBorderColor(color) {
  props.myStyle.borderColor = color.hex
  update('borderColor')
}
function changeShape(shape) {
  props.myStyle.shape = shape
  update('shape')
}
function changeFillColor(color) {
  props.myStyle.fillColor = color.hex
  update('fillColor')
}
function changeGradientStyle(e) {
  props.myStyle.gradientStyle = e.target.checked
  update('gradientStyle')
}
function changeStartColor(color) {
  props.myStyle.startColor = color.hex
  update('startColor')
}
function changeEndColor(color) {
  props.myStyle.endColor = color.hex
  update('endColor')
}
function changeFontFamily(family) {
  props.myStyle.fontFamily = family
  update('fontFamily')
}
function changeFontSize(size) {
  props.myStyle.fontSize = size
  update('fontSize')
}
</script>
<style lang="less" scoped>
.node-style {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .text {
    display: flex;
    flex-direction: column;

    .text-container {

      // display: flex;
      // flex-wrap: wrap;
      .row {
        display: flex;
        flex-direction: row;
        justify-content: space-evenly;
        margin-bottom: 8px;

        .text {
          margin-right: 4px;
        }

        .styleBtn {
          position: relative;
          width: 50px;
          height: 30px;
          background: #fff;
          border: 1px solid #eee;
          display: flex;
          justify-content: center;
          align-items: center;
          font-weight: 700;
          cursor: pointer;
          border-radius: 4px;
        }
      }
    }
  }

  .border {
    .row {
      display: flex;
      flex-direction: row;
      justify-content: space-evenly;
      margin-bottom: 8px;

      .text {
        margin-right: 4px;
      }

      .styleBtn {
        position: relative;
        background: #fff;
        /* border: 1px solid #eee; */
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
  }

  .bgc {
    .row {
      display: flex;
      flex-direction: row;
      justify-content: space-evenly;
      margin-bottom: 8px;

      .text {
        margin-right: 4px;
      }

      .styleBtn {
        position: relative;
        background: #fff;
        /* border: 1px solid #eee; */
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .rowItem {
        display: flex;
        align-items: center;

        .name {
          font-size: 12px;
          margin-right: 10px;
        }

        .block {
          display: inline-block;
          width: 30px;
          height: 30px;
          border: 1px solid #dcdfe6;
          border-radius: 4px;
          cursor: pointer;
        }
      }
    }
  }

  .shape {
    .row {
      display: flex;
      flex-direction: row;
      justify-content: space-evenly;
      margin-bottom: 8px;

      .text {
        margin-right: 4px;
      }

      .styleBtn {
        position: relative;
        background: #fff;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
  }
}
</style>