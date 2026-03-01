<template>
	<div class="container">
		<div id="container" ref="refContainer"></div>
		<div class="list">
			<div class="frist" :style="{ fontSize: fontSize + 'px' }">
				<h4>(1) 方法：</h4>
				<div class="content" v-if="operations && operations.length" :style="{ fontSize: fontSize + 'px' }">
					<div class="item" v-for="(item, index) in operations">
						<span>{{ getNumber(item.id) }}</span>
						<span>{{ item.dirction == 'down' ? '下' : '上' }}</span>
						<span v-show="index != operations.length - 1">→</span>
					</div>
				</div>
				<h4>(2) 一共走了{{ operations.length }} 步</h4>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted, watch } from 'vue';
import { throttle } from 'lodash';
import NineLinkedRingsRight from './NineLinkedRingsRight.js'
import NineLinkedRingsLeft from './NineLinkedRingsLeft.js'
const rings = ref(9)
const widgetSize = ref({ width: 1200, height: 600 });
const fontSize = ref(20);
const direction = ref('left');
const refContainer = ref();
const nineLinkedRings = ref()
watch(rings, (val) => {
	nineLinkedRings.value.numOfRings = val;
	nineLinkedRings.value.initRingState();
	nineLinkedRings.value.createLinkedRings();
},)
onMounted(() => {
	if (rings.value) {
		if (direction.value == 'left') {
			nineLinkedRings.value = new NineLinkedRingsLeft(refContainer.value, widgetSize.value.width, widgetSize.value.height, rings.value, {
                operations: operations.value
            });
		} else {
			nineLinkedRings.value = new NineLinkedRingsRight(refContainer.value, widgetSize.value.width, widgetSize.value.height, rings.value, {
                operations: operations.value
            });
		}

		// store.setNineLinkedRings(nineLinkedRings.value);
	}
});
const operations = ref([])
watch(direction, (val) => {
	if (val == 'left') {
		nineLinkedRings.value = new NineLinkedRingsLeft(refContainer.value, widgetSize.value.width, widgetSize.value.height, rings.value, {
                operations: operations.value
            });
	} else {
		nineLinkedRings.value = new NineLinkedRingsRight(refContainer.value, widgetSize.value.width, widgetSize.value.height, rings.value, {
                operations: operations.value
            });
	}
	// store.setNineLinkedRings(nineLinkedRings.value);
})
function hintsButton() {
	nineLinkedRings.value.hintsButton();
}
watch(operations, () => {
	// store.setDataChange(true)
}, { deep: true })
function getNumber(id) {
	const num = ['①', "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨"]
	return num[id]
}
const undo = throttle(resetDo, 500)
function resetDo() {
	nineLinkedRings.value.undo();
}

</script>

<style scoped lang="less">
 .container {
	box-sizing: border-box;
	position: relative;
	user-select: none;
	width: 100%;
	height: 100%;
	overflow: hidden;
	border: 1px solid #ccc;

	.tools {
		position: absolute;
		left: 0;
		top: 0;
	}

	.list {
		position: absolute;
		right: 0;
		top: 0;
		width: 300px;
		height: 100%;
		overflow-y: auto;
		border: 1px solid #ccc;

		.content {
			display: flex;
			flex-wrap: wrap;
			font-size: 16px;
		}
	}
}
</style>