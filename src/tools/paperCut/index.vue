<script setup lang="ts">
import { computed, ref, onMounted, shallowRef, watch } from 'vue';
import { fabric } from "fabric-with-gestures";
import { calculateIntersection } from './utils/utils'
import { normalizeColorWithHalfOpacity, drawBaseShape, listIcons, paperCutPath, bastPath, drawNormal } from './libs/config';
import { addIconMouseDown, addIconMouseMove, addIconMouseUp, cutting } from './libs/addIcon'

const currentTool = ref<'scissors' | 'pen' | 'eraser' | 'shapes' | ''>('scissors');
const shapeMode = ref<'normal' | 'symmetry' | 'fourCorners' | 'sixCorners' | 'fiveCorners'>('normal')
const paperColor = ref("rgba(165, 27, 42, 1)");
const brushColor = ref("rgba(165, 27, 42, 1)");
const paperMode = ["symmetry","fourCorners","sixCorners","fiveCorners"];
const isCutting = ref(true);
const isAnimating = ref(false);
const clicked = ref(false);
let deletShape = [] as any[];
const curtomOperation = ref<any[]>([]);
const operation = computed({
  get() {
    return curtomOperation.value;
  },
  set(value) {
    curtomOperation.value = value;
  }
}) 
const editorContainerRef= ref(null);
const fabricCanvas = shallowRef<null | fabric.Canvas>(null);
const isVisibleExpand = ref(true);
const isChangeResult = ref(true);
let startPoint;
let dynamicLine;
let scissorsPaths: fabric.Path[] = [];
let brushPaths: fabric.Path[] = [];
let undoStack: any[] = [];
let redoStack: any[] = [];
let trianglePath1, trianglePath2;
const iconLists = ref(listIcons)
const currentShapeType = ref("select_icon")
const foldMarkVisible = ref(false) // 折痕是否显示
onMounted(() => {
  initFabric();
  addEventListeners();
  setShapeMode(shapeMode.value);
});
watch(paperColor, () => {
  setShapeMode(shapeMode.value);
});
function initFabric() {
  if (!editorContainerRef.value) return;
  editorContainerRef.value.width = 800;
  editorContainerRef.value.height = 500;
  fabric.Object.prototype.objectCaching = false;
  fabric.Object.prototype.transparentCorners = false;
  fabric.Object.prototype.borderColor = "rgb(185,180,174)";
  fabric.Object.prototype.cornerStrokeColor = "rgb(185,180,174)";
  fabric.Object.prototype.cornerColor = "#019ae2";
  fabricCanvas.value = new fabric.Canvas(editorContainerRef.value);
  const pencilBrush = new fabric.PencilBrush(fabricCanvas.value)
  pencilBrush.color = '#019fe9';
  pencilBrush.width = 2;
  pencilBrush.decimate = 5
  fabricCanvas.value.freeDrawingBrush = pencilBrush
  fabricCanvas.value.isDrawingMode = true;
  fabricCanvas.value.selection = false;
}

function renderPath() {
  if (scissorsPaths.length > 0) {
    scissorsPaths.forEach(path => {
      const pathObj = new fabric.Path(path.path, {
        fill: path.fill,
        stroke: path.stroke,
        strokeWidth: path.strokeWidth,
        closePath: true,
        selectable: false,
        erasable: false,
      });
      fabricCanvas.value.add(pathObj);
      fabricCanvas.value.requestRenderAll();
    });
  }
}
function renderBrushPaths() {
  if (brushPaths.length > 0) {
    fabricCanvas.value.add(...brushPaths);
    fabricCanvas.value.requestRenderAll();
  }
}
function setTextControlsVisibility(target) {
  target.setControlsVisibility({
    bl: false,
    br: true,
    mb: false,
    ml: false,
    mr: false,
    mt: false,
    tl: false,
    tr: false,
    mtr: true,
  });
}
function addEventListeners() {
  fabricCanvas.value.on('mouse:down', (opt) => {
    if (currentTool.value == 'scissors') {
      const pointer = fabricCanvas.value.getPointer(opt.e);
      startPoint = { x: pointer.x, y: pointer.y };

      // 创建实时动态连接线
      dynamicLine = new fabric.Line([startPoint.x, startPoint.y, startPoint.x, startPoint.y], {
        stroke: '#019fe9',
        strokeWidth: 2,
        selectable: false,
        evented: false,
      });
      fabricCanvas.value.add(dynamicLine);
    } else if (currentTool.value == 'shapes') {
      addIconMouseDown(fabricCanvas.value, currentShapeType.value, opt, setTextControlsVisibility)
    }
  });
  fabricCanvas.value.on('mouse:move', (opt) => {
    if (currentTool.value == 'shapes') {
      addIconMouseMove(fabricCanvas.value, currentShapeType.value, opt)
    }

    if (!fabricCanvas.value.isDrawingMode || !startPoint || !dynamicLine || currentTool.value !== 'scissors') return;
    const pointer = fabricCanvas.value.getPointer(opt.e);
    dynamicLine.set({ x2: pointer.x, y2: pointer.y });
    fabricCanvas.value.requestRenderAll();
  });
  fabricCanvas.value.on('path:created', (opt) => {
    if (currentTool.value == 'scissors') {
      const originalPath = opt.path;
      const commands = originalPath.path;
      if (!commands.length) return;

      // 终点（最后命令的末两个参数）
      const lastCmd = commands[commands.length - 1];
      const end = {
        x: lastCmd[lastCmd.length - 2],
        y: lastCmd[lastCmd.length - 1],
      };

      // 重新构造 Path（带填充）
      let pathData = '';
      commands.forEach(cmd => {
        pathData += cmd.join(' ') + ' ';
      });
      pathData += `L ${end.x} ${end.y}`;
      const newPath = new fabric.Path(pathData.trim(), {
        stroke: 'transparent',
        strokeWidth: 2,
        fill: 'white',
        closePath: true,
        selectable: false,
        erasable: false,
      });
      // 清空画布并添加新对象
      fabricCanvas.value.clear();
      setShapeMode(shapeMode.value, true);
      fabricCanvas.value.add(newPath);
      renderBrushPaths();
      renderPath();
      startPoint = null;
      dynamicLine = null;
      let p = pathData.trim() + " Z";

      if (shapeMode.value == 'symmetry' || shapeMode.value == 'fourCorners') {
        const trianglePolygon = paperCutPath[shapeMode.value]
        p = calculateIntersection(trianglePolygon, p)
      } else if (shapeMode.value == 'sixCorners') {
        const trianglePolygon = paperCutPath.sixCorners
        p = calculateIntersection(trianglePolygon, p)
      }
      if (p) {
        const res = {
          path: p,
          fill: 'white',
          stroke: 'transparent',
          strokeWidth: 2,
          selectable: false,
        }
        scissorsPaths.push(res);
        const time = setTimeout(() => {
          saveState({
            type: 'scissors',
            res,
          })
          clearTimeout(time);
        }, 100);
      }

    }
    if (currentTool.value == 'pen') {
      const originalPath = opt.path;
      brushPaths.push(originalPath)
      saveState({
        type: 'pen',
        res: originalPath,
      })
    }
    if (currentTool.value == 'eraser') {
      const originalPath = opt.path;

      saveState({
        type: 'eraser',
        res: originalPath,
      })
    }
  });
  fabricCanvas.value.on("mouse:up", () => {
    if (currentTool.value == 'shapes') {
      addIconMouseUp(fabricCanvas.value, currentShapeType.value, setShapeType, saveState, shapeMode.value, scissorsPaths, isCutting)

    }
  });
}
function setTool(tool: 'scissors' | 'pen' | 'eraser' | 'shapes') {
  currentTool.value = tool;
  const canvas = fabricCanvas.value;
  canvas.isDrawingMode = true;
  if (tool === 'pen') {
    const pencilBrush = new fabric.PencilBrush(canvas);
    pencilBrush.color = brushColor.value;
    pencilBrush.width = 2;
    pencilBrush.decimate = 5;
    canvas.freeDrawingBrush = pencilBrush;
  } else if (tool === 'eraser') {
    const eraser = new fabric.EraserBrush(canvas);
    eraser.width = 10;
    canvas.freeDrawingBrush = eraser;
  } else if (tool === 'scissors') {
    const pencilBrush = new fabric.PencilBrush(canvas);
    pencilBrush.color = '#019fe9';
    pencilBrush.width = 2;
    pencilBrush.decimate = 5
    canvas.freeDrawingBrush = pencilBrush;
  } else if (tool === 'shapes') {
    canvas.isDrawingMode = false;
    // canvas.selection = false;
    // canvas.defaultCursor = 'default';
    // canvas.hoverCursor = 'default';
    // canvas.selectionColor = 'rgba(0,0,0,0.3)';
    // canvas.selectionBorderColor = 'black';
    // canvas.selectionLineWidth = 1;
  }
}
/**
 * 普通模式不折叠,对称模式：纸张折叠一次，四角模式：纸张折叠三次，六角模式：纸张折叠四次；
 * 对称模式折叠一次，沿正方形对角线进行折叠；四角模式，第一次沿着正方形的对角进行折叠，以后都是沿着三角形斜边上的高进行折叠
 * 设置工具
 * @param tool
 */
function setShapeMode(mode: 'normal' | 'symmetry' | 'fourCorners' | 'sixCorners' | 'fiveCorners', flag: boolean = false) {
  fabricCanvas.value.clear();
  isVisibleExpand.value = true;
  currentTool.value = 'scissors';
  shapeMode.value = mode;
  performFold();
  if (!flag) {
    scissorsPaths = []
    brushPaths = []
    saveState({ type: mode + 'Mode' })
  }
}

function normalMode() {
  const normalPath = drawNormal(paperColor.value);
  fabricCanvas.value.add(normalPath);
}
function performFold() {
   fabricCanvas.value.clear();
  const mode = shapeMode.value;
  trianglePath1 = drawBaseShape[mode](paperColor.value, "1");
  trianglePath2 = drawBaseShape[mode](paperColor.value, "2");
  fabricCanvas.value.add(trianglePath1);
  fabricCanvas.value.add(trianglePath2);
}

/**
 * 计算点 (px, py) 关于直线 AB 的镜像点
 */
function mirrorPoint(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const a = dy;
  const b = -dx;
  const c = dx * y1 - dy * x1;
  const d = (a * px + b * py + c) / (a * a + b * b);
  const x = px - 2 * a * d;
  const y = py - 2 * b * d;
  return { x, y };
}

/**
 * 将 fabric.Path 按给定的对称轴镜像
 */
function mirrorPathByAxis(path: fabric.Path, axis: [number, number, number, number]) {
  const [x1, y1, x2, y2] = axis;
  const mirroredCommands = path.path.map(cmd => {
    const type = cmd[0];
    const pts = cmd.slice(1);
    const newPts: number[] = [];
    for (let i = 0; i < pts.length; i += 2) {
      const p = mirrorPoint(pts[i], pts[i + 1], x1, y1, x2, y2);
      newPts.push(p.x, p.y);
    }
    return [type, ...newPts];
  });
  return new fabric.Path(mirroredCommands, {
    fill: path.fill,
    stroke: path.stroke,
    strokeWidth: path.strokeWidth,
    selectable: false,
    erasable: false,
  });
}

/**
 * 根据当前模式返回所有对称轴
 */
function getSymmetryAxes(mode: string): [number, number, number, number][] {
  // 纸张区域 [200,50] -> [600,450]
  if (mode === "symmetry") {
    // 沿左上角到右下角对角线折叠
    return [[400, 50, 400, 450]];
  } else if (mode === "fourCorners") {
    // 第一次对角线，然后沿中点垂直平分线折叠（总共三条）
    return [
      // 水平中线
      [400, 250, 400, 50],
      [400, 250, 600, 50],
      [200, 50, 600, 450],
    ];
  } else if (mode === "sixCorners") {
    return [
      [200, 50, 400, 250],
      [346.4101615043172, 50, 400, 250],
      [200, 196.41016, 400, 250],
      [200, 450, 600, 50],
    ];
  } else if (mode === "fiveCorners") {
    return [
      [200, 281.6768, 400, 250],
      [200, 148.0949, 400, 250],
      [298.0949, 50, 400, 250],
      [200, 450, 600, 50],
    ];
  }
  return [];
}

/**
 * 展开逻辑
 */
async function expandPaper() {
  const canvas = fabricCanvas.value;
  if (!canvas || scissorsPaths.length === 0 || shapeMode.value == 'normal') return;

  // 保持你原有的 visible 切换与当前工具清空逻辑
  isVisibleExpand.value = !isVisibleExpand.value;
  currentTool.value = '';
  canvas.clear();

  const mode = shapeMode.value;
  const axes = getSymmetryAxes(mode);

  // 如果无对称轴直接显示原路径（完全保留）
  if (axes.length === 0) {
    scissorsPaths.forEach(pathData => {
      const p = new fabric.Path(pathData.path, {
        fill: "blue",
        stroke: "transparent",
        strokeWidth: 2,
        selectable: false,
        erasable: false,
      });
      canvas.add(p);
    });
    canvas.requestRenderAll();
    return;
  }

  // 统一生成映射路径 —— 保持原始 map 调用与 ' Z' 拼接
  const newPaths = scissorsPaths.map(p => {
    const path = mapPathToTriangle1((p.path + '  Z'), trianglePath2, trianglePath1);
    return { ...p, path };
  });

  // ---------- 辅助函数（非侵入式、仅用于减少重复） ----------
  function makeFoldShapes(pathDataStr: string, fixedPathStr?: string) {
    const foldShape = createFabricPathFromString(pathDataStr, { fill: normalizeColorWithHalfOpacity(paperColor.value) });
    const fixedShape = fixedPathStr ? createFabricPathFromString(fixedPathStr, { fill: normalizeColorWithHalfOpacity(paperColor.value) }) : null;
    return { foldShape, fixedShape };
  }

  function toNewPathObjs(foldPathArray: any[]) {
    return foldPathArray.map(p => {
      const pathData = p.path.map((seg: any) => seg.join(' ')).join(' ');
      return { path: pathData };
    });
  }

  function addWhiteOverlays(canvasRef: any, foldPathArray: any[]) {
    foldPathArray.forEach((p: any) => {
      const pathObj = new fabric.Path(p.path, {
        fill: "white",
        stroke: 'transparent',
        strokeWidth: 2,
        selectable: false,
        erasable: false,
        objectCaching: false,
      });
      canvasRef.add(pathObj);
      pathObj.bringToFront();
    });
  }

  async function renderAndAnimate(A: any, B: any, segments: any[], foldShapeArr: any[], newPathArr: any[], foldPathArr: any[], dur = 1000) {
    canvas.requestRenderAll();
    await animateSingleFold(A, B, segments, foldShapeArr, newPathArr, foldPathArr, dur);
  }
  // ----------------------------------------------------------------

  // 以下各模式分支严格复刻你原始的控制流与细节（只使用上面几个小工具，不改变逻辑）
  if (mode === 'symmetry' || mode === 'fourCorners') {
     isAnimating.value = true;
    await expandAnimation(newPaths, axes, true);
  } else if (mode === 'sixCorners') {
     isAnimating.value = true;
    // ---- 第一条（保留你原来的调用） ----
    await expandAnimation(newPaths, [axes[0]], false); // 先沿第一条轴折叠
    canvas.clear();

    // 第二条
    const pathData2 = `M 126.794919 176.794819 L 346.4101615043172 50 L 400 250 Z`;
    const fixedPathData2 = `M 200 50 L 200 196.41016  L 400 250 L 326.794919 -23.205080 L 284.5299 50 Z`;
    const { foldShape: foldShape2, fixedShape: fixedshape2 } = makeFoldShapes(pathData2, fixedPathData2);
    addObjectsBatch(canvas, [foldShape2, fixedshape2]);

    const segments2 = [parsePathPoints(pathData2)] as any[];
    const A2 = { x: axes[1][0], y: axes[1][1] };
    const B2 = { x: axes[1][2], y: axes[1][3] };
    const foldPath2 = drawPathAndDashLine(newPaths, 1, 1);
    const newPath2 = toNewPathObjs(foldPath2);
    await renderAndAnimate(A2, B2, segments2, [foldShape2], newPath2, foldPath2, 1000);

    // 第三条
    canvas.clear();
    const pathData3 = `M  200 196.41016  326.794919 -23.205080 L 400 250 Z`;
    const fixedPathData3 = `M 200 50 L 200 196.41016  L 400 250 L 600 50 Z`;
    const { foldShape: foldShape3, fixedShape: fixedshape3 } = makeFoldShapes(pathData3, fixedPathData3);
    addObjectsBatch(canvas, [foldShape3, fixedshape3]);

    const segments3 = [parsePathPoints(pathData3)] as any[];
    const A3 = { x: axes[2][0], y: axes[2][1] };
    const B3 = { x: axes[2][2], y: axes[2][3] };
    const foldPath3 = drawPathAndDashLine(newPaths, 1, 2);
    const newPath3 = toNewPathObjs(foldPath3);

    // 这里保留你原先对 foldPath2 的处理 —— 先把 foldPath2 的 pathObj（白色遮挡）加入并 bringToFront，然后再把 foldPath2 的元素加入 canvas
    addWhiteOverlays(canvas, foldPath2);
    foldPath2.forEach((element: any) => canvas.add(element));
    canvas.requestRenderAll();

    await renderAndAnimate(A3, B3, segments3, [foldShape3], newPath3, foldPath3, 1000);

    // 第四条
    canvas.clear();
    const pathData4 = `M  200 50 L 600 50 L 200 450 Z`;
    const foldShape4 = createFabricPathFromString(pathData4, { fill: normalizeColorWithHalfOpacity(paperColor.value) });
    const fixedshape4 = createFabricPathFromString(pathData4, { fill: normalizeColorWithHalfOpacity(paperColor.value) });
    addObjectsBatch(canvas, [foldShape4, fixedshape4]);

    const segments4 = [parsePathPoints(pathData4)] as any[];
    const A4 = { x: axes[3][0], y: axes[3][1] };
    const B4 = { x: axes[3][2], y: axes[3][3] };
    const foldPath4 = drawPathAndDashLine(newPaths, 1, 3);

    // 保留你把 foldPath2/3 的元素合并到 foldPath4 的逻辑（顺序与原来相同）
    foldPath2.forEach(p => {
      canvas.add(p);
      foldPath4.push(p);
    });
    foldPath3.forEach(p => {
      foldPath4.push(p);
      canvas.add(p);
    });

    // 再把 foldPath2/3 的白色 overlay（pathObj）加回去并 bringToFront（保留你原有的覆盖逻辑）
    addWhiteOverlays(canvas, foldPath2);
    addWhiteOverlays(canvas, foldPath3);

    canvas.requestRenderAll();

    const newPath4 = toNewPathObjs(foldPath4);
    await renderAndAnimate(A4, B4, segments4, [foldShape4], newPath4, foldPath4, 1000);

    drawReflected(canvas, mode, axes, newPaths);

  } else if (mode === 'fiveCorners') {
     isAnimating.value = true;
    const axesLocal = getSymmetryAxes(mode); // 保持与你原来代码相同的 axes 获取
    // 第一条
    const pathData1 = `M 147.9852978095895 121.5920957266308 L 200 281.676888 L 400 250 Z`;
    const fixedPathData1 = `M 400 250 L 200 148.09491014 L 164.88589905486 173.6067978295L 120.6395506519 205.7536516755L 152.7864044901 250L 120.6395506762313 294.2463484 Z`;
    const { foldShape: foldShape1, fixedShape: fixedshape1 } = makeFoldShapes(pathData1, fixedPathData1);
    addObjectsBatch(canvas, [foldShape1, fixedshape1]);

    const segments1 = [parsePathPoints(pathData1)] as any[];
    const A1 = { x: axesLocal[0][0], y: axesLocal[0][1] };
    const B1 = { x: axesLocal[0][2], y: axesLocal[0][3] };
    const foldPath1 = drawPathAndDashLine(newPaths, 0, 0);
    const newPath1 = toNewPathObjs(foldPath1);
    await renderAndAnimate(A1, B1, segments1, [foldShape1], newPath1, foldPath1, 1000);

    // 第二条
    canvas.clear();
    const pathData2 = `M 200 148.09491014 L 120.6395506519 205.7536516755 L 178.298292 285.11410096 L 400 250 Z`;
    const fixedPathData2 = `M 400 250 L 200 148.09491014 L 200 185.016060 L 120.6395506  294.2463484 L 200 281.676888 L 200 450 Z`;
    const { foldShape: foldShape2b, fixedShape: fixedshape2b } = makeFoldShapes(pathData2, fixedPathData2);
    addObjectsBatch(canvas, [foldShape2b, fixedshape2b]);

    const segments2 = [parsePathPoints(pathData2)] as any[];
    const A2 = { x: axesLocal[1][0], y: axesLocal[1][1] };
    const B2 = { x: axesLocal[1][2], y: axesLocal[1][3] };
    const foldPath2b = drawPathAndDashLine(newPaths, 0, 1);
    const newPath2b = toNewPathObjs(foldPath2b);

    // 把 foldPath1 的白色 overlay 加回并 bringToFront（维持原来顺序）
    addWhiteOverlays(canvas, foldPath1);
    canvas.requestRenderAll();

    await renderAndAnimate(A2, B2, segments2, [foldShape2b], newPath2b, foldPath2b, 1000);

    // 第三条
    canvas.clear();
    const pathData3 = `M 298.0949100 50 L 120.639550676 294.246348477  L 400 250 Z`;
    const fixedPathData3 = `M 400 250 L 298.0949100 50 L 200 50 L 200 450 Z`;
    const { foldShape: foldShape3b, fixedShape: fixedshape3b } = makeFoldShapes(pathData3, fixedPathData3);
    addObjectsBatch(canvas, [foldShape3b, fixedshape3b]);

    const segments3 = [parsePathPoints(pathData3)] as any[];
    const A3 = { x: axesLocal[2][0], y: axesLocal[2][1] };
    const B3 = { x: axesLocal[2][2], y: axesLocal[2][3] };
    const foldPath3b = drawPathAndDashLine(newPaths, 0, 2);

    // 把 foldPath2 的元素加入并合并到 foldPath3（与原代码一致）
    foldPath2b.forEach(p => {
      canvas.add(p);
      foldPath3b.push(p);
    });

    // 再把 foldPath2 与 foldPath1 的白色 overlay 加回并 bringToFront（保留原来 overlay 逻辑）
    addWhiteOverlays(canvas, foldPath2b);
    addWhiteOverlays(canvas, foldPath1);
    canvas.requestRenderAll();

    const newPath3b = toNewPathObjs(foldPath3b);
    await renderAndAnimate(A3, B3, segments3, [foldShape3b], newPath3b, foldPath3b, 1000);

    // 第四条
    canvas.clear();
    const pathData4b = `M  200 50 L 600 50 L 200 450 Z`;
    const foldShape4b = createFabricPathFromString(pathData4b, { fill: normalizeColorWithHalfOpacity(paperColor.value) });
    const fixedshape4b = createFabricPathFromString(pathData4b, { fill: normalizeColorWithHalfOpacity(paperColor.value) });
    addObjectsBatch(canvas, [foldShape4b, fixedshape4b]);

    const segments4b = [parsePathPoints(pathData4b)] as any[];
    const A4 = { x: axesLocal[3][0], y: axesLocal[3][1] };
    const B4 = { x: axesLocal[3][2], y: axesLocal[3][3] };
    const foldPath4b = drawPathAndDashLine(newPaths, 2, 3);

    // 把 foldPath3 的元素加入并合并到 foldPath4（与你原来的合并顺序一致）
    foldPath3b.forEach(p => {
      canvas.add(p);
      foldPath4b.push(p);
    });

    // overlay 白色遮挡回填（保留你原来的覆盖处理）
    addWhiteOverlays(canvas, foldPath3b);
    canvas.requestRenderAll();

    const newPath4b = toNewPathObjs(foldPath4b);
    canvas.requestRenderAll();
    await renderAndAnimate(A4, B4, segments4b, [foldShape4b], newPath4b, foldPath4b, 1000);

    drawReflected(canvas, mode, axesLocal, newPaths);
  }
}
function addObjectsBatch(canvas, objs) {
  canvas.renderOnAddRemove = false;
  objs.forEach(o => canvas.add(o));
  canvas.renderOnAddRemove = true;
  canvas.requestRenderAll();
}

function createFabricPathFromString(pathStr, options = {}) {
  return new fabric.Path(pathStr, Object.assign({
    fill: "white",
    stroke: "transparent",
    strokeWidth: 2,
    selectable: false,
    erasable: false,
    objectCaching: false,
  }, options));
}
function drawDeleteShape() {
  const newShape = [] as fabric.Path[];
  const mode = shapeMode.value;
  const axes = getSymmetryAxes(mode)
  deletShape.forEach((s, i) => {
    if (i <= axes.length) {
      const path = s.path.map(seg => {
        return seg.join(' ');
      }).join(' ');
      const triangle1Copy = new fabric.Path(path, {
        fill: normalizeColorWithHalfOpacity(paperColor.value),
        objectCaching: false,
      });
      fabricCanvas.value.add(triangle1Copy);
      const triangle2Copy = new fabric.Path(path, {
        fill: normalizeColorWithHalfOpacity(paperColor.value),
        objectCaching: false,
      });
      newShape.push(triangle2Copy);
      fabricCanvas.value.add(triangle2Copy);
    }
  })
  return newShape;
}

function drawPathAndDashLine(newPaths, axesIndex, lineIndex) {
  const canvas = fabricCanvas.value;
  const mode = shapeMode.value;
  const axes = getSymmetryAxes(mode);
  let currentPaths: fabric.Path[] = newPaths.map(p => new fabric.Path(p.path, {
    fill: "white",
    stroke: "transparent",
    strokeWidth: 2,
    selectable: false,
    erasable: false,
    objectCaching: false,

  }));
  let currentPaths1: fabric.Path[] = newPaths.map(p => new fabric.Path(p.path, {
    fill: "white",
    stroke: "transparent",
    strokeWidth: 2,
    selectable: false,
    erasable: false,
    objectCaching: false,
  }));
  axes.forEach((axis, index) => {
    if (index <= lineIndex) {
      const line = new fabric.Line(axis, {
        stroke: '#000000',
        strokeWidth: 2,
        strokeDashArray: [5, 5],
        selectable: false
      });
     if(foldMarkVisible.value) canvas.add(line);
    }
    if (index <= axesIndex - 1) {
      const nextPaths: fabric.Path[] = [];
      // 对当前已有的所有路径再镜像一次
      let other
      if (index == 2 && mode == 'sixCorners') {
        const data1 = currentPaths.slice(0, 2 * scissorsPaths.length)
        const data2 = currentPaths.slice(2 * scissorsPaths.length)
        currentPaths = data1;
        other = data2;
      }
      currentPaths.forEach((p) => {
        const mirrored = mirrorPathByAxis(p, axis);
        nextPaths.push(mirrored);
      });
      if (index == 2 && mode == 'sixCorners') {
        nextPaths.push(...other)
      }
      // 将新的镜像添加到总集合中
      currentPaths.push(...nextPaths);
    }
    if (index <= axesIndex - 1) {
      let other
      const nextPaths: fabric.Path[] = [];
      if (index == 2 && mode == 'sixCorners') {
        const data1 = currentPaths.slice(0, 2 * scissorsPaths.length)
        const data2 = currentPaths.slice(2 * scissorsPaths.length)
        currentPaths = data1;
        other = data2;
      }
      currentPaths1.forEach((p) => {
        const mirrored = mirrorPathByAxis(p, axis);
        nextPaths.push(mirrored);
      });
      if (index == 2 && mode == 'sixCorners') {
        nextPaths.push(...other)
      }
      // 将新的镜像添加到总集合中
      currentPaths1.push(...nextPaths);
    }
  });
  currentPaths.forEach(p => canvas.add(p));
  currentPaths1.forEach(p => canvas.add(p));
  canvas.renderAll();
  return currentPaths;
}
function rotatePointAroundLine(px, py, A, B, angle) {
  const dx = B.x - A.x, dy = B.y - A.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return { x: px, y: py };
  const ux = dx / len, uy = dy / len;
  const vx = -uy, vy = ux;
  const relx = px - A.x, rely = py - A.y;
  const tx = relx * ux + rely * uy;
  const ty = relx * vx + rely * vy;
  const new_tx = tx;
  const new_ty = ty * Math.cos(angle);
  const rx = A.x + new_tx * ux + new_ty * vx;
  const ry = A.y + new_tx * uy + new_ty * vy;
  return { x: rx, y: ry };
}
function parsePathPoints(pathStr) {
  // 匹配字母命令及其后面的所有非命令字符
  const regex = /([MLQZmlqz])([^MLQZmlqz]*)/g;
  const result = [] as any[];
  let match;
  while ((match = regex.exec(pathStr))) {
    const cmdRaw = match[1];
    const cmd = cmdRaw.toUpperCase();
    const nums = match[2].trim().split(/[\s,]+/).map(Number).filter(n => !isNaN(n));
    if (cmd === 'M' || cmd === 'L') {
      // M 或 L 后可能有多对坐标：第一对若 cmd=M 则为 M，否则为 L；其余都按 L 处理
      for (let i = 0; i < nums.length; i += 2) {
        const x = nums[i], y = nums[i + 1];
        if (typeof x === 'undefined' || typeof y === 'undefined') break;
        const thisCmd = (i === 0) ? cmd : 'L';
        result.push({ cmd: thisCmd, points: [{ x, y }] });
      }
    } else if (cmd === 'Q') {
      // Q 后应该是一组控制点+终点，可以出现多组（每组4个数）
      for (let i = 0; i + 3 < nums.length; i += 4) {
        result.push({
          cmd: 'Q',
          points: [
            { x: nums[i], y: nums[i + 1] }, // 控制点
            { x: nums[i + 2], y: nums[i + 3] } // 终点
          ]
        });
      }
    } else if (cmd === 'Z') {
      result.push({ cmd: 'Z' });
    } else {
      // 若遇到其它命令（如 C 等），此处可以扩展；当前样本只需要 M,L,Q,Z
      // 忽略或跳过未知命令
    }
  }
  return result;
}

async function expandAnimation(newPaths, axes, flag = true) {
  const canvas = fabricCanvas.value;
  const mode = shapeMode.value;
  const segments = [parsePathPoints(bastPath[mode])] as any[];
  let foldPath: fabric.Path[] = newPaths.map(p => new fabric.Path((p.path), {
    fill: "white",
    stroke: "transparent",
    strokeWidth: 2,
    selectable: false,
    objectCaching: false,
    erasable: false,
  }));
  let fixedPath: fabric.Path[] = newPaths.map(p => new fabric.Path((p.path), {
    fill: "white",
    stroke: "transparent",
    strokeWidth: 2,
    selectable: false,
    objectCaching: false,
    erasable: false,
  }));
  let foldShape = [drawBaseShape[mode](normalizeColorWithHalfOpacity(paperColor.value), "1", true)];
  let fixedshape = [drawBaseShape[mode](normalizeColorWithHalfOpacity(paperColor.value), "1", true)];
  canvas.add(fixedshape[0]);
  canvas.add(foldShape[0]);
  foldPath.forEach(p => canvas.add(p));
  fixedPath.forEach(p => canvas.add(p));
  let newPath1 = JSON.parse(JSON.stringify(newPaths));

  for (let i = 0; i < axes.length; i++) {
    const [x1, y1, x2, y2] = axes[i];
    const A = { x: x1, y: y1 };
    const B = { x: x2, y: y2 };
    axes.forEach((axis, index) => {
      if (index <= i) {
        const line = new fabric.Line(axis, {
          stroke: '#000000',
          strokeWidth: 2,
          strokeDashArray: [5, 5],
          selectable: false
        });
       if(foldMarkVisible.value) canvas.add(line);
      }
    });
    // const lineAB = new fabric.Line([x1, y1, x2, y2], {
    //   stroke: '#000',
    //   strokeWidth: 2,
    //   strokeDashArray: [5, 5],
    //   selectable: false
    // });
    // if(foldMarkVisible.value) canvas.add(lineAB);
    await animateSingleFold(A, B, segments, foldShape, newPath1, foldPath, 1000);
    const temp = [] as fabric.Path[];
    if (i < axes.length - 1) {
      deletShape.push(...fixedshape);
      fabricCanvas.value.clear();
      canvas.renderAll();
      foldShape.forEach(s => {
        const path = s.path.map(seg => {
          return seg.join(' ');
        }).join(' ');
        const triangle2Copy = new fabric.Path(path, A, B, {
          fill: normalizeColorWithHalfOpacity(paperColor.value),
          objectCaching: false,
        });

        const tempPath = (triangle2Copy.path.map(seg => {
          return seg.join(' ');
        }).join(' '))
        segments.push(parsePathPoints(tempPath));
        deletShape.push(triangle2Copy);
      });
      const deleteShapes = drawDeleteShape();
      foldShape = [...deleteShapes, ...temp];
      fixedshape = [...foldShape];

      let currentPaths: fabric.Path[] = newPaths.map(p => new fabric.Path(p.path, {
        fill: "white",
        stroke: "transparent",
        strokeWidth: 2,
        selectable: false,
        erasable: false,
        objectCaching: false,

      }));
      let currentPaths1: fabric.Path[] = newPaths.map(p => new fabric.Path(p.path, {
        fill: "white",
        stroke: "transparent",
        strokeWidth: 2,
        selectable: false,
        erasable: false,
        objectCaching: false,

      }));
      axes.forEach((axis, k) => {
        if (k <= i) {
          const nextPaths: fabric.Path[] = [];
          currentPaths.forEach((p) => {
            const mirrored = mirrorPathByAxis(p, axis);
            nextPaths.push(mirrored);
          });

          // 将新的镜像添加到总集合中
          currentPaths.push(...nextPaths);

        }
        if (k <= i) {
          const nextPaths: fabric.Path[] = [];
          currentPaths1.forEach((p) => {
            const mirrored = mirrorPathByAxis(p, axis);
            nextPaths.push(mirrored);
          });

          // 将新的镜像添加到总集合中
          currentPaths1.push(...nextPaths);

        }
      });
      currentPaths.forEach(p => canvas.add(p));
      currentPaths1.forEach(p => canvas.add(p));
      canvas.renderAll();
      foldPath = currentPaths;
      newPath1 = currentPaths.map(p => {
        const pathData = p.path.map(seg => seg.join(' ')).join(' ');
        return {
          path: pathData,
        };
      });
    }

  }
  deletShape = [];
  if (flag) drawReflected(canvas, mode, axes, newPaths)
  return new Promise(resolve => {
    resolve(1);
  })

}

async function animateSingleFold(A, B, segments, foldShape, newPath1, foldPath, duration = 1000) {
  const start = performance.now();
  let progress = 0;

  return new Promise(resolve => {
    function animateFrame(now) {
      progress = Math.min((now - start) / duration, 1);
      const angle = Math.PI * progress;
      let newPath = Array(segments.length).fill('');
      let newPathList = Array(foldPath.length).fill('');

      // 主形状旋转
      segments.forEach((segs, i) => {
        segs.forEach(seg => {
          if (seg.cmd === 'M' || seg.cmd === 'L') {
            const p = seg.points[0];
            const np = rotatePointAroundLine(p.x, p.y, A, B, angle);
            newPath[i] += `${seg.cmd} ${np.x} ${np.y} `;
          } else if (seg.cmd === 'Q') {
            const cp = seg.points[0];
            const ep = seg.points[1];
            const ncp = rotatePointAroundLine(cp.x, cp.y, A, B, angle);
            const nep = rotatePointAroundLine(ep.x, ep.y, A, B, angle);
            newPath[i] += `Q ${ncp.x} ${ncp.y} ${nep.x} ${nep.y} `;
          } else if (seg.cmd === 'Z') {
            newPath[i] += 'Z';
          }
        });
      });


      // 裁剪路径旋转
      newPath1.forEach((p, i) => {
        const segs = parsePathPoints(p.path);
        segs.forEach(seg => {
          if (seg.cmd === 'M' || seg.cmd === 'L') {
            const pt = seg.points[0];
            const np = rotatePointAroundLine(pt.x, pt.y, A, B, angle);
            newPathList[i] += `${seg.cmd} ${np.x} ${np.y} `;
          } else if (seg.cmd === 'Q') {
            const cp = seg.points[0];
            const ep = seg.points[1];
            const ncp = rotatePointAroundLine(cp.x, cp.y, A, B, angle);
            const nep = rotatePointAroundLine(ep.x, ep.y, A, B, angle);
            newPathList[i] += `Q ${ncp.x} ${ncp.y} ${nep.x} ${nep.y} `;
          } else if (seg.cmd === 'Z') {
            newPathList[i] += 'Z';
          }
        });
      });

      // 更新
      foldShape.forEach((shape, i) => {
        shape.set({ path: new fabric.Path(newPath[i]).path });
      });
      foldPath.forEach((p, i) => {
        p.set({ path: new fabric.Path(newPathList[i]).path });
      });

      fabricCanvas.value.renderAll();

      if (progress < 1) {
        requestAnimationFrame(animateFrame);
      } else {
        resolve(1);
      }
    }
    requestAnimationFrame(animateFrame);
  });
}
function drawReflected(canvas, mode, axes, newPaths) {
  isAnimating.value = false;
  fabricCanvas.value.clear();
  // 一层层镜像展开
  let currentPaths: fabric.Path[] = newPaths.map(p => new fabric.Path(p.path, {
    fill: "white",
    stroke: "transparent",
    strokeWidth: 2,
    selectable: false,
    erasable: false,
  }));
  axes.forEach((axis, i) => {
    const nextPaths: fabric.Path[] = [];
    // 对当前已有的所有路径再镜像一次
    let other
    if (i == 2 && mode == 'sixCorners') {
      const data1 = currentPaths.slice(0, 2 * scissorsPaths.length)
      const data2 = currentPaths.slice(2 * scissorsPaths.length)
      currentPaths = data1;
      other = data2;
    }
    currentPaths.forEach((p) => {
      const mirrored = mirrorPathByAxis(p, axis);
      nextPaths.push(mirrored);
    });
    if (i == 2 && mode == 'sixCorners') {
      nextPaths.push(...other)
    }
    // 将新的镜像添加到总集合中
    currentPaths.push(...nextPaths);
  });
  normalMode();
  currentPaths.forEach(p => canvas.add(p));
  canvas.requestRenderAll();
  saveState({ type: 'expandPaper' })
}
function mapPathToTriangle1(pathData, sourceObj, targetObj) {
  // 获取两个图形的变换矩阵 ===
  const sourceMatrix = sourceObj.calcTransformMatrix();
  const targetMatrix = targetObj.calcTransformMatrix();
  const inverseSourceMatrix = fabric.util.invertTransform(sourceMatrix);
  //  解析路径指令 ===
  const commands = pathData.split(/(?=[A-Z])/);
  let result = '';
  commands.forEach(command => {
    if (!command.trim()) return;
    const type = command[0];
    const nums = command.substring(1).trim().split(/[\s,]+/).map(Number);
    result += type + ' ';

    for (let i = 0; i < nums.length; i += 2) {
      if (i + 1 < nums.length) {
        const x = nums[i];
        const y = nums[i + 1];
        // 将全局坐标转为图形2的局部坐标 ===
        const localPoint = fabric.util.transformPoint(new fabric.Point(x, y), inverseSourceMatrix);
        //  将局部坐标从图形2映射到图形1坐标系 ===
        const mappedPoint = fabric.util.transformPoint(localPoint, targetMatrix);
        result += mappedPoint.x.toFixed(2) + ' ' + mappedPoint.y.toFixed(2) + ' ';
      }
    }
    result = result.trim() + ' ';
  });

  return result.trim();
}

function foldPaper() {
  const canvas = fabricCanvas.value;
  canvas.clear();
  currentTool.value = 'scissors';
  isVisibleExpand.value = !isVisibleExpand.value;
  setShapeMode(shapeMode.value, true)
  renderBrushPaths()
  renderPath()
  saveState({ type: 'foldPaper' })
}
function saveState(data) {
  if (!fabricCanvas.value) return;
  const json = fabricCanvas.value.toJSON();
  const res = {
    json,
    data,
  }
  undoStack.push(res);
  isChangeResult.value = true;
  operation.value.push(res);
  // 每次有新操作时清空 redo 栈
  redoStack.length = 0;
}
function undo() {
  if (undoStack.length > 1) {
    // 当前状态入 redo 栈
    const current = undoStack.pop();
    redoStack.push(current);
    const prevState = undoStack[undoStack.length - 1];
    if (current.data.type == 'scissors') {
      scissorsPaths = scissorsPaths.splice(0, scissorsPaths.length - 1)
    } else if (prevState.data.type == 'pen') {
      brushPaths = brushPaths.splice(0, brushPaths.length - 1)
    } else if (current.data.type.endsWith('Mode')) {
      const mode = prevState.data.type.split('Mode')[0]
      shapeMode.value = mode
    } else if (current.data.type == 'expandPaper' || current.data.type == 'foldPaper') {
      isVisibleExpand.value = !isVisibleExpand.value;
      // currentTool.value = ''
    }
    fabricCanvas.value.loadFromJSON(prevState.json, () => {
      fabricCanvas.value.renderAll();
    });
    operation.value.push(prevState);
    isChangeResult.value = true;
  }
}

function redo() {
  if (redoStack.length > 0) {
    const state = redoStack.pop();
    undoStack.push(state);
    if (state.data.type == 'scissors') {
      scissorsPaths.push(state.data.res)
    } else if (state.data.type == 'pen') {
      brushPaths.push(state.data.res)
    }
    fabricCanvas.value.loadFromJSON(state.json, () => {
      fabricCanvas.value.renderAll();
    });
    operation.value.push(state);
  }
}
function clearCanvas() {
  fabricCanvas.value.clear();
  setShapeMode(shapeMode.value, true); // 重置折叠纸张背景
  scissorsPaths = [];
  brushPaths = [];
  undoStack = [];
  redoStack = [];
  operation.value = [];
  saveState({ type: 'clear' });
}

// async function submit() {
//   if (operation.value.length === 1) return;
//   if (!isChangeResult.value) {
//     // message.info("你已提交过本次数据，无需重复提交");
//     return;
//   }
//   const url = fabricCanvas.value.toDataURL();
//   let screenShot;
//   if (widgetInstance.uploadWidgetStandaloneFile) {
//     screenShot = await widgetInstance.uploadWidgetStandaloneFile(url)
//   } else {
//     screenShot = url
//   }
//   const data = {
//     url: screenShot,
//     operations: operation.value,
//     t: Date.now(),
//   }
//   const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
//   const file = new File([blob], 'data.json', { type: 'application/json' });
//   if (typeof widgetInstance.uploadWidgetFile === 'function') widgetInstance.uploadWidgetFile(file);
//   operation.value = [JSON.parse(JSON.stringify(operation.value[operation.value.length - 1]))];
//   isChangeResult.value = false;
// }
function setShapeType(type) {
  currentShapeType.value = type
}
function cut() {
  cutting(fabricCanvas.value, currentShapeType.value, setShapeType, saveState, shapeMode.value, scissorsPaths, isCutting)
}
function handleHoverChange(hover) {
  if (hover) {
    if (!isVisibleExpand.value) {
      clicked.value = false
      return;
    }
    clicked.value = true
  } else {
    clicked.value = false
  }
}
</script>

<template>
 <div class="container" id="container">
    <div class="tools">
      <div class="row"> <a-button @click="undo"><undo-outlined />撤销</a-button>
        <a-button @click="redo"><redo-outlined />重做</a-button>
        <a-button @click="clearCanvas"><delete-outlined />清空</a-button>
        <a-button :disabled="!isVisibleExpand" :type="currentTool === 'scissors' ? 'primary' : 'default'"
          @click="setTool('scissors')">
          <ScissorOutlined /> 剪刀
        </a-button>
        <a-button :disabled="!isVisibleExpand" :type="currentTool === 'pen' ? 'primary' : 'default'"
          @click="setTool('pen')">
          <EditOutlined /> 画笔
        </a-button>
        <a-button :disabled="!isVisibleExpand" :type="currentTool === 'eraser' ? 'primary' : 'default'"
          @click="setTool('eraser')">
          <ClearOutlined /> 橡皮
        </a-button>

        <a-popover title="添加图形" placement="bottomRight" :open="clicked" trigger="click"
          @openChange="handleHoverChange">
          <template #content>
            <div class="box-shape">
              <div class="img-icon" :class="currentShapeType == value.type ? 'active' : ''" v-for="value in iconLists" :key="value.type"
                :style="{ width: value.type === 'rectangle' ? '56px' : '41px' }" @click="setShapeType(value.type)">
                <img :src="value.url"
                  :style="{ width: value.type === 'rectangle' ? '55px' : '40px' }" :alt="value.type">
              </div>
            </div>
          </template>
          <a-button :disabled="!isVisibleExpand" :type="currentTool === 'shapes' ? 'primary' : 'default'"
            @click="setTool('shapes')">
            <windows-outlined /> 图形
          </a-button>
        </a-popover>


      </div>
      <div class="row">
        <a-button :disabled="!isCutting || isAnimating" :type="shapeMode === 'normal' ? 'primary' : 'default'"
          @click="setShapeMode('normal')">
          普通模式
        </a-button>
        <a-button :disabled="!isCutting || isAnimating" v-if="paperMode.find(it => it == 'symmetry')"
          :type="shapeMode === 'symmetry' ? 'primary' : 'default'" @click="setShapeMode('symmetry')">
          对折模式
        </a-button>
        <a-button :disabled="!isCutting || isAnimating" v-if="paperMode.find(it => it == 'fourCorners')"
          :type="shapeMode === 'fourCorners' ? 'primary' : 'default'" @click="setShapeMode('fourCorners')">
          四折模式
        </a-button>
        <a-button :disabled="!isCutting || isAnimating" v-if="paperMode.find(it => it == 'sixCorners')"
          :type="shapeMode === 'sixCorners' ? 'primary' : 'default'" @click="setShapeMode('sixCorners')">
          六折模式
        </a-button>
        <a-button :disabled="!isCutting || isAnimating" v-if="paperMode.find(it => it == 'fiveCorners')"
          :type="shapeMode === 'fiveCorners' ? 'primary' : 'default'" @click="setShapeMode('fiveCorners')">
          五折模式
        </a-button>
        <a-button :disabled="isCutting" @click="cut">裁切</a-button>
        <a-button :disabled="!isCutting" v-if="isVisibleExpand" @click="expandPaper">展开</a-button>
        
        <a-button :disabled="!isCutting || isAnimating" v-else @click="foldPaper">折叠</a-button>
         <a-switch v-model:checked="foldMarkVisible" checked-children="折痕开" un-checked-children="折痕关" />
        <!-- <a-button :disabled="!isCutting || isAnimating" @click="submit">提交</a-button> -->
      </div>
    </div>
    <canvas class="editor-container" ref="editorContainerRef"></canvas>
  </div>
</template>

<style src="./style.less" scoped></style>
<style scoped lang="less">
.block.selected {
  border: 3px solid #409EFF !important;
  box-shadow: 0 0 15px rgba(64, 158, 255, 0.6) !important;
  z-index: 10;
}
 .container {
  box-sizing: border-box;
  user-select: none;
  // width: 100%;
  height: 100%;
  border: 1px solid #073dba;
  border-radius: 8px;
  // background: #f5f7fa; // 浅灰背景，避免纯白刺眼
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: 'PingFang SC', 'Helvetica Neue', Helvetica, Arial, sans-serif;

  .tools {
    padding: 16px;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(10px); // 毛玻璃效果
    border-bottom: 1px solid #e1e4e8;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    z-index: 10;

    .row {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      justify-content: center;
      align-items: center;
      margin-bottom: 12px;

      &:last-child {
        margin-bottom: 0;
      }

      // 美化 Ant Design 按钮
      :deep(.ant-btn) {
        border-radius: 8px;
        height: 36px;
        padding: 0 16px;
        font-weight: 500;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
        }

        &.ant-btn-primary {
          background: linear-gradient(135deg, #019fe9, #007bb5);
          border: none;

          &:hover {
            background: linear-gradient(135deg, #00b0ff, #019fe9);
          }
        }

        .anticon {
          font-size: 16px;
          margin-right: 6px;
        }
      }
    }
  }
}

.box-shape {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 10px;

  .img-icon {
    img {
      width: 40px;
      height: 40px;
      padding: 1px;
    }

    &.active {
      border: 1px solid red;
    }
  }

}
</style>
