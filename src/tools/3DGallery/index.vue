<template>
  <div class="statistics-container">
    <a-image :width="200" :style="{ display: 'none' }" :preview="{
      visible,
      onVisibleChange: setVisible,
    }" :src="selectImage" />
    <div @click="onCanvasClick" class="canvas-container" ref="canvasContainerRef"></div>
  </div>
</template>
<script setup>
import { defineProps, ref, watch, computed, onMounted } from 'vue';
// import utils from './common/utils.js';
import {data,position} from './common/data.js'
import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import TouchControls from './common/TouchControls.js';

const props = defineProps({
  results: { type: String, default: '[]' },
  students: { type: String, default: '' },
  bookDir: { type: String, default: '' },
  widgetModel: { type: String, default: '' }
});
const selectImage = ref()
// const countedAnswerType = ref('last')
const uploadUrl = ref(data)
let renderer, camera, scene, controls
let sceneObject
let meshImage = [], meshText = []
let width
let height
let aspect
let viewAngle = 75
let near = 1
let far = 2000
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
const loadFinish = ref(false)
// let mode = computed(() => utils.getPropOfStringifiedObj(props.widgetModel, 'mode','normal'))
let imageUrl = ref(new URL('../../assets/cat.png', import.meta.url).href)

const canvasContainerRef = ref("")
onMounted(() => {
  init()
})
watch(imageUrl, () => {
  init()
})
const visible = ref(false);
function setVisible(value) {
  visible.value = value;
}
function init() {
  if (!canvasContainerRef.value) return
  startScene(canvasContainerRef.value)
  setTimeout(()=>{
    loadImageAndName()
  },2000)
}

function onCanvasClick(event) {
  event.preventDefault();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);
  if (intersects.length > 0) {
    const clickedObject = intersects[0].object;
    if (clickedObject.name === 'clickableImage') {
      selectImage.value = clickedObject.userData.url
      setVisible(true)
    }
  }
}
async function loadModeLuxury() {
  const url = new URL('../../assets/gallery.glb', import.meta.url).href;
  const loader = new GLTFLoader();
  const textureLoader = new THREE.TextureLoader(); // 用于加载墙纸纹理

  // 假设墙纸纹理图片路径
  const wallpaperTexture = textureLoader.load(new URL('../../assets/wall.png', import.meta.url).href); // 替换为你的墙纸图片路径
  wallpaperTexture.wrapS = wallpaperTexture.wrapT = THREE.RepeatWrapping; // 设置纹理重复
  wallpaperTexture.repeat.set(30, 30); // 调整纹理重复次数，视需要修改
  const groundPaperTexture = textureLoader.load(new URL('../../assets/ground.jpg', import.meta.url).href); // 替换为你的墙纸图片路径
  groundPaperTexture.wrapS = groundPaperTexture.wrapT = THREE.RepeatWrapping; // 设置纹理重复
  groundPaperTexture.repeat.set(15, 15); // 调整纹理重复次数，视需要修改
  let urlWall
  if(imageUrl.value){
  urlWall = await toImage(props.bookDir + imageUrl.value)
  }

  loader.load(url, (model) => {
    sceneObject = model.scene;
    scene.add(sceneObject);
    let ground;
    const windowArr = ['立方体1_1', '立方体1_2', "立方体1_3", '立方体1_4', '立方体1_5', "立方体1_6", '立方体1_7',
      '立方体_1', '立方体_2', '立方体_3', '立方体_4', '立方体_5', '立方体_6', '立方体_7', '平面'
    ];
    scene.traverse((child) => {

      if (child.isMesh && windowArr.includes(child.name)) {
        child.material = new THREE.MeshBasicMaterial({ map: wallpaperTexture });
        child.material.needsUpdate = true;
      }
      if (child.name === 'ground') {
        if (child.name === 'ground') {
          ground = child;
          const colors = [0x333333, 0x999999, 0xcccccc, 0xcccccc, 0xc2d1bf]
          if (ground) {
            ground.children.forEach((child, index) => {
              if (child.isMesh && index <= 1) {
                child.map = null;
                child.material.emissive.set(colors[index]);
              } else {
                child.material = new THREE.MeshBasicMaterial({ map: groundPaperTexture });
                child.material.needsUpdate = true;
              }
            });
          } else {
            console.error('加载失败');
          }
        }
      }


      if (child.name === 'wall' && urlWall) {
        if (child) {
          child.children.forEach((item) => {
            const textureLoader = new THREE.TextureLoader(); // 用于加载墙纸纹理

            renderWallPaper(textureLoader, item, urlWall)

          });
        } else {
          console.error('加载失败');
        }
      }
    });

    addLights();
    addControls();
    render();
  });
}
function renderWallPaper(textureLoader, item, urlWall) {
  textureLoader.crossOrigin = 'use-credentials';
  const wallBackgroundTexture = textureLoader.load(urlWall, () => {
    wallBackgroundTexture.wrapS = wallBackgroundTexture.wrapT = THREE.RepeatWrapping; // 设置纹理重复
    wallBackgroundTexture.flipY = false
    const imageAspectRatio = wallBackgroundTexture.image.width / wallBackgroundTexture.image.height;
    const box = new THREE.Box3().setFromObject(item);
    let wallWidth, wallHeight;
    if (item.name === '立方体6' || item.name === '立方体5') {
      wallWidth = box.max.z - box.min.z;
      wallHeight = box.max.y - box.min.y;
    } else {
      wallWidth = box.max.x - box.min.x;
      wallHeight = box.max.y - box.min.y;
    }
    const textureAspectRatio = wallWidth / wallHeight; // 墙的宽高比
    wallBackgroundTexture.repeat.set(textureAspectRatio / imageAspectRatio, 1);
    item.material = new THREE.MeshBasicMaterial({ map: wallBackgroundTexture });
    item.material.needsUpdate = true;
    item.children.forEach((child) => {
      if (child.isMesh) {
        const wallBackgroundTexture = textureLoader.load(urlWall, () => {
          wallBackgroundTexture.wrapS = wallBackgroundTexture.wrapT = THREE.RepeatWrapping; // 设置纹理重复

          wallBackgroundTexture.flipY = false
          const box = new THREE.Box3().setFromObject(child);
          const wallWidth = box.max.x - box.min.x;
          const wallHeight = box.max.y - box.min.y;
          const textureAspectRatio = wallWidth / wallHeight; // 墙的宽高比
          wallBackgroundTexture.repeat.set(textureAspectRatio / imageAspectRatio, 1);
          child.material = new THREE.MeshBasicMaterial({ map: wallBackgroundTexture });
          child.material.needsUpdate = true;
        })

      }
    });
  }); // 替换为你的墙纸图片路径
}

function toImage(url) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'use-credentials';
    img.src = url;
    // img.onerror = reject;
    img.onload = function () {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, img.width, img.height);
      const imageData = canvas.toDataURL('image/png');
      resolve(imageData);
    };
  });
}

function startScene(container) {
  if (loadFinish.value) {
    // 清理之前的渲染
    if (renderer) {
      renderer.dispose(); // 释放渲染器资源
      container.removeChild(renderer.domElement); // 移除画布
      renderer = null;
    }
    if (scene) {
      scene.clear(); // 清理场景
      scene = null;
    }
  }
  width = window.innerWidth;
  height = 700;
  aspect = width / height;
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xe9f4fc);
  loadModeLuxury()
  // if(mode.value === 'luxury') {
  //   loadModeLuxury()
  // }else {
  //   loadModeNormal()
  // }
  renderer = new THREE.WebGLRenderer({ antialias: true,alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);
  container.append(renderer.domElement);
  window.addEventListener('resize', onWindowResize);
  loadFinish.value = true;
}

function addLights() {
  let ambient = new THREE.AmbientLight(0x404040)
  scene.add(ambient)
  const light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 0.75);
  light.position.set(0.5, 1, 0.75);
  scene.add(light);
}

function addControls() {
  camera = new THREE.PerspectiveCamera(viewAngle, aspect, near, far)
  let options = {
    delta: 0.75,           // coefficient of movement
    moveSpeed: 1,          // speed of movement
    rotationSpeed: 0.002,  // coefficient of rotation
    maxPitch: 55,          // max camera pitch angle
    hitTest: true,         // stop on hitting objects
    hitTestDistance: 40    // distance to test for hit
  }
  controls = new TouchControls(canvasContainerRef.value.parentNode, camera, options)
  controls.setPosition(-280, 100, 340)
  controls.setRotation(0.0037999, 0.1872)
  controls.addToScene(scene)
}

function render() {
  requestAnimationFrame(render)
  controls.update()
  let vector = new THREE.Vector3(controls.mouse.x, controls.mouse.y, 1)
  vector.unproject(camera)
  renderer.render(scene, camera)
}

function onWindowResize() {
  width = window.innerWidth
  height = window.innerHeight
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}
function createImage({ x, y, z, rotation, url, width = 80, height = 100 },) {
  if (!x || !y || !z) return
  const textureLoader = new THREE.TextureLoader();

  return new Promise((resolve, reject) => {
    textureLoader.load(
      url,
      (texture) => {
        // 获取图片的原始宽高
        const imgWidth = texture.image.width;
        const imgHeight = texture.image.height;

        // 目标框的尺寸
        const targetWidth = width;  // 80
        const targetHeight = height; // 100

        // 计算图片的宽高比和目标框的宽高比
        const imgAspect = imgWidth / imgHeight;
        const targetAspect = targetWidth / targetHeight;

        let finalWidth, finalHeight;

        // 根据宽高比调整尺寸，保持图片比例
        if (imgAspect > targetAspect) {
          // 图片更宽，按宽度适配
          finalWidth = targetWidth;
          finalHeight = targetWidth / imgAspect;
        } else {
          // 图片更高，按高度适配
          finalHeight = targetHeight;
          finalWidth = targetHeight * imgAspect;
        }
        const geometry = new THREE.PlaneGeometry(finalWidth, finalHeight);
        const material = new THREE.MeshBasicMaterial({ map: texture ,transparent: true, });
        const mesh = new THREE.Mesh(geometry, material);
        texture.repeat.set(1, 1);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        mesh.position.set(x, y, z);
        mesh.userData = { url };
        mesh.name = 'clickableImage';
        mesh.rotation.y = rotation * Math.PI;
        textureLoader.generateMipmaps = true;
        textureLoader.minFilter = THREE.LinearMipmapLinearFilter;
        textureLoader.magFilter = THREE.LinearFilter;
        textureLoader.anisotropy = renderer.capabilities.getMaxAnisotropy();

        scene.add(mesh);
        resolve(mesh);
      },
      undefined,
      (error) => {
        console.error('图片加载失败:', error);
        reject(error);
      }
    );
  });
}

// 使用示例
function loadImageAndName() {
    console.log("开始");
  if (!uploadUrl.value || !uploadUrl.value.length) return
  const data = position;

  
  const promises = uploadUrl.value.map((item, i) => {
    const url = item.data.widgetScreenShot
    const { x, y, z, rotation } = data[i];
    return createImage({ x, y, z, rotation, url });
  });

  Promise.all(promises)
    .then(meshes => {
      removeImages()

      meshImage = meshes
      meshes.forEach(mesh => {
        scene.add(mesh);
      });
      renderer.render(scene, camera);
    })
    .catch(error => {
      console.error('加载图片时出错:', error);
    });
  const promises1 = uploadUrl.value.map((item, i) => {
    const name = item.user.name
    const { x, y, z, rotation } = data[i];
    return createText(x, y, z, rotation, name)

  });

  Promise.all(promises1)
    .then(meshes => {
      removeTexts()
      meshText = meshes
      meshes.forEach(mesh => {
        scene.add(mesh);
      });
      renderer.render(scene, camera);
    })
    .catch(error => {
      console.error('加载文字时出错:', error);
    });

}
function createText(x, y, z, rotation, name) {
  if (!x || !y || !z) return
  const loader = new FontLoader();
  return new Promise((resolve, reject) => {
    loader.load(
      new URL('../../assets/STFangsong_Regular.json', import.meta.url).href, // 字体文件路径
      function (font) {
        // 创建文字几何体
        const geometry = new TextGeometry(name, {
          font: font,
          size: 10,           // 文字大小
          height: 0.2,       // 厚度
          width: 80,
          curveSegments: 12, // 曲线细分
        });


        // 创建材质
        const material = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const textMesh = new THREE.Mesh(geometry, material);
        let l = 20
        let newX = x
        let newZ = z
        if (rotation == 0.5) {
          newZ = newZ + l
        } else if (rotation == -0.5) {
          newZ = newZ - l
        } else if (rotation == 0) {
          newX = newX - 30
        } else if (rotation == -1) {
          newX = newX + 30
        }
        // 设置位置
        textMesh.position.set(newX, 160, newZ);
        textMesh.rotation.y = rotation * Math.PI;
        resolve(textMesh)
      },
      undefined,
      (error) => {
        console.error('文字加载失败:', error);
        reject(error);
      }
    );
  }
  )

}
function removeImages() {
  if (meshImage.length <= 0) return
  meshImage.forEach(mesh => {
    scene.remove(mesh);
    mesh.geometry.dispose(); // 释放几何体资源
    mesh.material.dispose(); // 释放材质资源
  })
  meshImage = []

}
function removeTexts() {
  if (meshText.length == 0) return
  meshText.forEach(mesh => {
    scene.remove(mesh);
    mesh.geometry.dispose(); // 释放几何体资源
    mesh.material.dispose(); // 释放材质资源
  })
  meshText = []
}


watch([() => props.results], () => {
  loadUserData();
}, { deep: true });

watch([() => uploadUrl], () => {
  loadImageAndName()
}, { deep: true });
 function loadUserData() {
//   const parsedResults = utils.parseStringifiedObj(props.results);
//   if (!parsedResults || parsedResults.length === 0) return;
//   let uploadUrlArr = [];
//   for (let i = 0; i < parsedResults.length; i++) {
//     let items = parsedResults[i];
//     // 单个用户结果
//     let item = countedAnswerType.value === 'first' ? items[0] : items[items.length - 1];
//     let record = item.content[0];
//     if (record.action === "upload" && record.data?.file?.url) {
//       const url = record.data.file.url;
//       let timestamp = record.data.widgetData.timestamp;
//       await new Promise((resolve) => {
//         window.$.getJSON(url, (data) => {
//           uploadUrlArr.push({
//             user: item.user,
//             timestamp,
//             data
//           });
//           resolve('resolved');
//         });
//       });
//     }
//   }

//   if (uploadUrlArr.length >= parsedResults.length) {
//     uploadUrl.value = uploadUrlArr.sort((a, b) => a.timestamp - b.timestamp);

//   }
   uploadUrl.value = data
}




</script>

<style lang="less" scoped>
// @import "~ant-design-vue/lib/style/themes/default.less";
.statistics-container {
  position: relative;
  background: #f9f9f9;
  border-radius: 15px;
  width: 100%;
  height: 100%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;

  .canvas-container {
    overflow: hidden;
  }
}
</style>

<style>
body {
  /* background-color: #000000; */
}

.rotation-pad {
  width: 150px;
  height: 150px;
  position: absolute;
}

.rotation-pad .region {
  position: absolute;
  width: 150px;
  height: 150px;
  background: radial-gradient(rgba(218, 225, 230, 0.25) 5%, rgba(218, 225, 230, 0.50) 95%),
    url("../common/images/cam.png") center center no-repeat;
  border: 2px solid rgba(218, 225, 230, 0.25);
  border-radius: 90px;
  box-shadow: 0px 0px 5px rgba(194, 200, 204, 0.55);
  user-select: none;
}

.rotation-pad .handle {
  opacity: 0.1;
  position: absolute;
  height: 40px;
  width: 40px;
  top: 0px;
  left: 0px;
  background: radial-gradient(rgba(215, 225, 255, 0.70) 0%, rgba(215, 225, 255, 0.50) 100%);
  /*border: 1px solid rgba(145, 105, 245, 0.90);*/
  border-radius: 50%;
  box-shadow: 0px 0px 7px rgba(195, 205, 245, 0.9);
  text-align: center;
  font: 24px/44px "Courier New", Courier, monospace;
  user-select: none;
}

.movement-pad {
  position: absolute;
  width: 150px;
  height: 150px;
}

.movement-pad .region {
  position: absolute;
  width: 150px;
  height: 150px;
  background: radial-gradient(rgba(218, 225, 230, 0.25) 5%, rgba(218, 225, 230, 0.50) 95%),
    url("../common/images/nav.png") center center no-repeat;
  border: 2px solid rgba(218, 225, 230, 0.25);
  border-radius: 90px;
  box-shadow: 0px 0px 5px rgba(194, 200, 204, 0.55);
  user-select: none;
}

.movement-pad .handle {
  opacity: 0.1;
  position: absolute;
  height: 40px;
  width: 40px;
  top: 0px;
  left: 0px;
  background: radial-gradient(rgba(215, 225, 255, 0.70) 0%, rgba(215, 225, 255, 0.50) 100%);
  /*border: 1px solid rgba(145, 105, 245, 0.90);*/
  border-radius: 50%;
  box-shadow: 0px 0px 7px rgba(195, 205, 245, 0.9);
  text-align: center;
  font: 24px/44px "Courier New", Courier, monospace;
  user-select: none;
}
</style>