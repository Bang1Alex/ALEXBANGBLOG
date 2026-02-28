/**
 fiveFold
  const points =[
    [400, 250],
    [147.9852978095895,121.5920957266308],
    [164.88589905486,173.6067978295],
    [120.6395506519,205.7536516755],
    [152.7864044901,250],
    [120.6395506762313,294.2463484],
  ]

 */
import { fabric } from "fabric-with-gestures";
export const bastPath  = {
  normal: "M 200 50 L 600 50 L 600 450 L 200 450 Z",
  symmetry: "M 200 50 L 400 50 L 400 450 L 200 450 Z",
  fourCorners: "M 200 50 L 400 250 L 400 50 Z",
  fiveCorners: "M 400 250L 147.9852978095895 121.5920957266308L 164.88589905486 173.6067978295L 120.6395506519 205.7536516755L 152.7864044901 250L 120.6395506762313 294.2463484 Z",
 sixCorners: "M 200 50 L 284.5299461738 50 L 326.794919267 -23.2050807 L 400 250 Z"
}
export const listIcons = [
  {
    url: "/controls/paperCut/resources/svg/select_icon.svg",
    type: "select_icon",
  },
  {
    url: "/controls/paperCut/resources/svg/圆.svg",
    type: "circle",
  },
  {
    url: "/controls/paperCut/resources/svg/椭圆.svg",
    type: "ellipse",
  },
  {
    url: "/controls/paperCut/resources/svg/柳叶.svg",
    type: "salixLeaf",
  },
  {
    url: "/controls/paperCut/resources/svg/水滴.svg",
    type: "waterDrop",
  },
  {
    url: "/controls/paperCut/resources/svg/单牙纹.svg",
    type: "singleDentition",
  },
  {
    url: "/controls/paperCut/resources/svg/爱心.svg",
    type: "heart",
  },
  {
    url: "/controls/paperCut/resources/svg/羽毛.svg",
    type: "feather",
  },
  {
    url: "/controls/paperCut/resources/svg/月亮.svg",
    type: "moon",
  },
  {
    url: "/controls/paperCut/resources/svg/逗号.svg",
    type: "commaPattern",
  },
  {
    url: "/controls/paperCut/resources/svg/菱形.svg",
    type: "diamond",
  },
  {
    url: "/controls/paperCut/resources/svg/shape1.svg",
    type: "shape1",
  },
  {
    url: "/controls/paperCut/resources/svg/shape2.svg",
    type: "shape2",
  },
]
const dot = 0.8
export const paperCutPath = {
 
  normal: [
    [
      200 - 2,
      50 - dot
    ],
    [
      600 - 2,
      50 - dot
    ],
    [
      600 + dot,
      450 + 2
    ],
    [
      200,
      450
    ],

    [
      200 - 2,
      50 - dot
    ],
  ],
   symmetry:[
    [
      200, 
      50 -dot 
    ],
    [
      400,
      50 -dot
    ],
    [
      400,
      450+dot
    ],
    [
      200,
      450+dot
    ], 
    [
      200, 
      50  -dot
    ],
    
  ],
  fourCorners: [
    [
      200 - 2,
      50 - dot
    ],
    [
      600 + dot,
      450 + 2
    ],
    [
      600 + dot,
      50 - dot
    ],
    [
      200 - 2,
      50 - dot
    ]
  ],
  // M 300.8874389639369 467.6087139788269 L 431.99224612138687 64.10960674287782 L 358.8965286835802 101.35373508791383 L 300.88743882421386 43.34464526683121 L 242.87834911754203 101.35373509623082 L 169.78263165600794 64.10960681097566 Z
  fiveCorners:[
    [
      300.8874389639369,
     467.6087139788269
    ],
    [
     431.99224612138687,
     64.10960674287782
    ],
    [
      358.8965286835802,
      101.35373508791383
    ],
    [
      300.88743882421386,
      43.34464526683121
    ],
    [
     242.87834911754203,
     101.35373509623082
    ]
      [
     169.78263165600794,
     64.10960681097566
    ],
      [
      300.8874389639369,
     467.6087139788269
    ],
  ],
  //M 267.9576211353316 24.60063510883282 L 377.7652422858946 87.99809473918282 L 487.57286339436007 24.600635200647957 L 377.7652422706632 434.4082562441644 Z
  sixCorners:[
    [267.9576211353316-1.5, 24.60063510883282  -dot],
    [377.7652422858946, 87.99809473918282 -dot],
    [487.57286339436007+dot, 24.600635200647957  -dot],
    [377.7652422706632, 434.4082562441644 +0.8],
    [267.9576211353316-1.5, 24.60063510883282  -dot],
  ]
}
export const drawBaseShape ={
  normal:(p)=>drawNormal(p),
  symmetry:(p)=>drawSymmetry(p),
  fourCorners:(p,m,v)=>drawFourCorners(p,m,v),
  fiveCorners:(p,m,v)=>drawFiveCorners(p,m,v),
  sixCorners:(p,m,v)=>drawSixCorners(p,m,v),
}
export const  drawNormal = (paperColor)=>{
  const rect = new fabric.Rect({
    left: 200,
    top: 50,
    fill: paperColor,
    width: 400,
    height: 400,
    mode: "rect",
    selectable: false,
    erasable: false,
  });
  return rect
}
export const  drawSymmetry = (paperColor)=>{
  const path = new fabric.Path(bastPath.symmetry, {
    fill: paperColor,
    selectable: false,
    originX: "center",
    originY: "center",
    erasable: false,
    mode: "rect",
     objectCaching: false,  
    // visible:false,
  });
  return path
}
export const  drawFourCorners = (paperColor,mode,visible=false)=>{
  const props1 ={
    fill: paperColor,  // 半透明蓝色
    selectable: false,
    originX: "center",
    originY: "center",
    erasable: false,
    visible: visible,
    mode: "rect",
     objectCaching: false,  
  }
  const props2 ={
    fill: paperColor,  // 半透明蓝色
    selectable: false,
    originX: "center",
    originY: "center",
    erasable: false,
    mode: "rect",
    left: 400,
    top: 250,
    scaleX: 2,
    scaleY: 2,
    objectCaching: false,  
  }
  const props = mode === "1"? props1:props2
  const path = new fabric.Path(bastPath.fourCorners, props);
  return path
}
export const  drawFiveCorners = (paperColor,mode,visible=false)=>{
  const props1 ={
     fill: paperColor,  // 半透明蓝色
    selectable: false,
    originX: "center",
    originY: "center",
    erasable: false,
    visible: visible,
    mode: "rect",
     objectCaching: false,  
  }
  const props2 ={
    fill: paperColor,  // 半透明蓝色
    selectable: false,
    originX: "center",
    originY: "center",
    erasable: false,
    mode: "rect",
     objectCaching: false,  
    left: 400,
    top: 250,
    scaleX: 1.5,
    scaleY: 1.5,
    angle: 81,
  }
  const props = mode === "1"? props1:props2
  const path = new fabric.Path(bastPath.fiveCorners, props);
  return path
}
export const  drawSixCorners = (paperColor,mode,visible=false)=>{
  const props1 ={
       fill: paperColor,  // 半透明蓝色
    selectable: false,
    originX: "center",
    originY: "center",
    erasable: false,
    mode: "rect",
     objectCaching: false,  
    visible: visible,
  }
  const props2 ={
    fill: paperColor,  // 半透明蓝色
    selectable: false,
    originX: "center",
    originY: "center",
    erasable: false,
    mode: "rect",
     objectCaching: false,  
    scaleX: 1.5,
    scaleY: 1.5,
    angle: 30,
  }
  const props = mode === "1"? props1:props2
  const path = new fabric.Path(bastPath.sixCorners, props);
  return path
}
/**
 * 处理颜色字符串：
 * - 16进制 → 转 rgba，透明度没有则设为 0.5
 * - rgba/rgb → 如果没有透明或透明=1，则改为 0.5
 * @param {string} color - 颜色字符串
 * @returns {string} 处理后的 rgba 字符串，或原字符串（无法处理时）
 */
export function normalizeColorWithHalfOpacity(color) {
  if (!color || typeof color !== 'string') return color;

  const str = color.trim().toLowerCase();

  // ──────────────── 情况1：16进制 ────────────────
  const hexRegex = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/;
  if (hexRegex.test(str)) {
    let hex = str.slice(1);

    // 3位缩写 → 6位
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }

    // 有8位 → 已经有 alpha
    if (hex.length === 8) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      const a = parseInt(hex.slice(6, 8), 16) / 255;
      // 如果已经是半透明，就保留原值
      return a === 1 ? `rgba(${r}, ${g}, ${b}, 0.3)` : `rgba(${r}, ${g}, ${b}, ${a})`;
    }

    // 普通 6位 hex
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, 0.3)`;
  }

  // ──────────────── 情况2：已经是 rgb / rgba ────────────────
  const rgbaRegex = /^rgba?\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*([0-1]?\.?\d*))?\s*\)$/;
  const match = str.match(rgbaRegex);

  if (match) {
    const [, r, g, b, a] = match;
    const red   = Math.min(255, Math.max(0, Number(r)));
    const green = Math.min(255, Math.max(0, Number(g)));
    const blue  = Math.min(255, Math.max(0, Number(b)));

    // 没有 alpha 或 alpha=1 → 改成 0.5
    if (a === undefined || a === '' || Number(a) === 1) {
      return `rgba(${red}, ${green}, ${blue}, 0.5)`;
    }

    // 已经有透明度（包括 0~1 之间）
    return `rgba(${red}, ${green}, ${blue}, ${Number(a)})`;
  }

  // 其他情况（hsl、颜色名、非法格式……）直接返回原值
  return color;
}