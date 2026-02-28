import { paperCutPath } from "./config";
import { fabric } from "fabric-with-gestures";
import { calculateIntersection } from "../utils/utils";
// ================== 全局状态 ==================
let isDrawing = false;
let origX, origY;
let currentShape;
// let shapes = [];

// ================== 图形路径库 ==================
const dataPath = {
  // circle:"M512 512m-512 0a100 100 0 1 0 1024 0 100 100 0 1 0-1024 0Z",
  circle:
    "M 898.491 0.653 C 685.597 -1.953 593.435 211.681 600.813 290.994 C 601.478 510.309 776.286 595.886 882.769 601.25 C 972.892 614.684 1218.954 524.878 1204.554 298.331 C 1214.168 208.927 1133.577 17.549 898.491 0.653 Z",
  ellipse:
    "M 898.491 0.653 C 685.597 -1.953 593.435 211.681 600.813 290.994 C 601.478 510.309 776.286 595.886 882.769 601.25 C 972.892 614.684 1218.954 524.878 1204.554 298.331 C 1214.168 208.927 1133.577 17.549 898.491 0.653 Z",
  // salixLeaf:"M 1101.074 418.422 C 1220.034 299.437 1332.025 62.172 1286.218 -7.741 C 1240.411 -77.654 932.919 69.968 813.934 188.933 C 694.971 307.918 516.95 588.157 606.779 676.938 C 696.608 765.719 982.086 537.385 1101.074 418.422 Z M 950.961 315.479 C 839.52 426.899 1038.841 401.045 952.916 315.077 C 866.949 229.152 841.094 426.377 952.514 314.936 C 1063.956 203.514 866.727 230.413 952.657 316.386 C 1038.627 402.311 1062.381 204.037 950.961 315.479 Z",
  salixLeaf:
    "M 1209.795 13.955 C 1140.672 -17.56 971.005 64.562 850.276 216.25 C 618.951 476.588 661.471 641.183 679.425 662.767 C 765.812 776.75 1045.834 534.553 1116.509 410.16 C 1275.795 210.862 1270.606 39.676 1209.795 13.955 Z",
  waterDrop:
    "M727.8 745.2c0 29.7-5.7 57.4-17.1 83.2-11.4 25.8-26.9 48.5-46.5 68.1-19.7 19.6-42.4 35.2-68.2 46.5s-53.6 17-83.3 17c-29.8 0-57.7-5.7-84-17-26.2-11.3-49.2-26.9-68.9-46.5-19.7-19.6-35.2-42.4-46.6-68.1s-17.1-53.5-17.1-83.2c0-20.1 5.2-50.9 15.7-92.4s23.8-87.5 40-138.2c16.1-50.7 33.7-102.7 52.5-155.9s36.3-101.7 52.4-145.4 34.8-93.4 55.8-149.3c21 55.9 39.6 105.7 55.8 149.3 16.1 43.7 33.5 92.2 51.8 145.4 18.4 53.3 35.7 105.2 51.8 155.9s29.5 96.7 40 138.2c10.5 41.5 15.9 72.3 15.9 92.4z",
  singleDentition:
    "M 378.582 47.867 L 275.014 223.799 L 268.375 237.741 L 283.645 235.75 L 398.499 180.646 L 475.51 144.132 L 456.921 176.663 L 427.71 211.185 L 346.051 290.189 C 346.051 290.189 301.57 323.384 300.906 323.384 C 300.242 323.384 236.509 362.553 236.509 362.553 L 186.717 387.118 L 130.949 411.682 C 130.949 411.682 88.46 423.632 87.796 423.632 C 87.132 423.632 59.913 432.926 59.913 432.926 L 51.282 425.623 L 61.904 380.479 L 108.377 296.164 L 155.514 233.094 L 203.978 177.991 L 246.467 136.165 L 318.831 84.381 L 378.582 47.867 Z",
  heart:
    "M667.786667 117.333333C832.864 117.333333 938.666667 249.706667 938.666667 427.861333c0 138.250667-125.098667 290.506667-371.573334 461.589334a96.768 96.768 0 0 1-110.186666 0C210.432 718.368 85.333333 566.112 85.333333 427.861333 85.333333 249.706667 191.136 117.333333 356.213333 117.333333c59.616 0 100.053333 20.832 155.786667 68.096C567.744 138.176 608.170667 117.333333 667.786667 117.333333z",
  feather:
    "M 251.778 28.767 L 62.568 454.987 L 251.778 246.525 L 439.66 442.374 L 251.778 28.767 Z",
  moon: "M886.898 806.537c-195.3 45.751-390.709-75.482-436.46-270.782s75.483-390.709 270.782-436.46a367.362 367.362 0 0 1 35.974-6.557c-94.63-47.261-205.688-62.999-316.723-36.988-252.53 59.157-409.29 311.831-350.132 564.362 59.158 252.529 311.83 409.289 564.361 350.132 111.034-26.011 203.548-89.438 267.34-173.809a367.08 367.08 0 0 1-35.142 10.102z",
  commaPattern:
    "M 201.689 126.113 L 237.241 109.478 C 238.876 106.578 304.918 121.687 301.434 127.864 L 335.011 162.009 L 349.824 217.167 C 354.361 218.172 338.006 311.293 332.049 309.972 L 296.496 363.379 L 258.967 395.773 L 213.54 419.412 L 178.975 430.793 C 177.402 429.399 239.664 372.352 245.142 361.627 C 250.62 350.902 259.057 285.532 255.018 289.835 L 259.956 254.815 C 263.398 258.132 243.849 238.836 231.315 237.303 C 216.662 235.512 185.887 210.002 185.887 207.536 C 176.816 209.547 168.047 148.015 179.961 145.374 C 179.961 145.374 198.725 124.362 201.689 126.113 Z",
  // diamond:"M 264.814 477.531 L 98.959 250.05 L 262.375 24.112 L 425.792 250.05 L 264.814 477.531 Z M 125.788 250.05 L 268.884 249.826 L 403.841 250.05 L 268.884 251.172 L 125.788 250.05 Z",
  diamond:
    "M 928.888 -12.25 L 575.657 343.078 L 929.936 696.309 L 1282.118 342.03 L 928.888 -12.25 Z",
  shape1:
    "M 727.057 451.597 L 844.586 170.267 L 783.508 487.689 L 976.922 138.802 L 888.081 416.431 L 1040.776 223.942 L 937.129 452.522 L 1046.329 347.949 L 974.146 498.794 L 1110.183 368.308 L 976.922 594.113 L 1154.604 455.299 L 997.281 680.178 L 1093.526 640.384 C 1096.264 642.339 1197.315 572.003 1184.218 562.648 L 1222.16 459.926 C 1224.459 458.393 1202.071 383.552 1197.174 386.817 C 1209.701 392.663 1163.525 340.513 1139.797 329.44 L 1129.617 317.41 L 1161.082 275.766 C 1168.64 277.656 1187.857 184.364 1175.889 181.372 C 1187.707 181.372 1150.106 142.164 1155.529 140.653 C 1160.952 139.142 1101.128 90.678 1093.526 91.605 L 1024.119 74.022 C 1021.651 67.852 961.498 68.778 963.966 74.948 C 960.61 71.592 913.517 100.384 914.918 101.785 L 888.081 81.426 C 900.42 75.256 849.521 47.493 837.182 53.663 C 834.544 49.706 780.29 65.032 782.582 68.47 L 730.758 115.666 L 710.399 170.267 C 707.537 167.405 695.398 251.51 697.443 253.555 L 700.219 347.949 C 692.816 356.586 719.654 460.234 727.057 451.597 Z",
  shape2:
    "M 933.178 -26.485 L 1018.593 98.309 L 933.178 54.492 L 1035.786 177.623 L 921.531 128.259 L 1020.811 291.324 L 912.656 251.944 L 994.188 380.066 L 897.126 344.015 L 939.834 488.526 L 867.73 438.054 L 896.572 565.621 L 859.411 532.342 L 864.957 659.91 C 864.957 664.915 935.951 603.943 935.951 594.462 C 931.56 603.528 964.272 561.256 1000.844 485.753 C 994.923 505.886 1035.172 431.936 1056.863 358.185 C 1063.117 360.27 1081.234 249.988 1079.048 249.26 C 1088.31 251.245 1091.556 121.273 1080.158 118.831 C 1090.343 117.812 1045.342 44.662 1041.333 45.063 C 1047.459 45.063 994.345 -1.527 988.642 -1.527 C 991.734 -4.619 934.325 -27.632 933.178 -26.485 Z",
};

// ================== 工具函数 ==================

// 判断图形是否太小
function isShapeTooSmall(shape, minSize = 5) {
  if (!shape) return true;

  switch (shape.type) {
    case "ellipse":
      return shape.rx < minSize || shape.ry < minSize;

    case "group":
    case "text":
      return shape.scaleX * 50 < minSize || shape.scaleY * 50 < minSize;

    default:
      return (shape.width ?? 0) < minSize || (shape.height ?? 0) < minSize;
  }
}

// 默认样式配置
function getDefaultOptions(x, y) {
  return {
    left: x,
    top: y,
    fill: "rgba(255,255,255,1)",
    stroke: "rgba(255,255,255,1)",
    strokeWidth: 2,
    originX: "center",
    originY: "center",
    selectable: true,
    hasBorders: true,
    hasControls: true,
    isShapeIcon: true,
  };
}

// ================== 事件函数 ==================

export function addIconMouseDown(canvas, currentShapeType, options, setTextControlsVisibility) {
  if (currentShapeType === "select_icon" || options.target?.isShapeIcon) return;

  isDrawing = true;
  const { x, y } = canvas.getPointer(options.e);
  origX = x;
  origY = y;

  currentShape = createShape(currentShapeType, x, y);
  if (!currentShape) return;

  // setTextControlsVisibility(currentShape);
  canvas.add(currentShape);
}

export const addIconMouseMove = throttle((canvas, currentShapeType, options) => {
  if (currentShapeType === "select_icon" || !isDrawing || !currentShape) return;

  const pointer = canvas.getPointer(options.e);
  const dx = pointer.x - origX;
  const dy = pointer.y - origY;

  // 最小移动距离阈值（比如 2 像素）
  if (Math.abs(dx) < 2 && Math.abs(dy) < 2) return;

  updateShape(currentShape, currentShapeType, pointer.x, pointer.y);
  canvas.renderAll();
}, 20); // 每 16ms 最多执行一次（≈60fps）

export function addIconMouseUp(
  canvas,
  currentShapeType,
  setShapeType,
  saveState,
  shapeMode,
  scissorsPaths,
  isCutting
) {
  if (!isDrawing) return;
  isDrawing = false;

  if (currentShape) {
    if (isShapeTooSmall(currentShape)) {
      canvas.remove(currentShape);
    } else {
      canvas.setActiveObject(currentShape);
    }
    // getNewpath(canvas, currentShape, shapeMode, scissorsPaths);
    // currentShape = null;
    // shapes.push(currentShape);
    saveState({ type: "addIcon" });
    setShapeType("select_icon");
    isCutting.value = false;
  }

  canvas.renderAll();
}
export function cutting(
  canvas,
  currentShapeType,
  setShapeType,
  saveState,
  shapeMode,
  scissorsPaths,
  isCutting) {
  const shapes = canvas._objects.filter(obj => obj.isShapeIcon);
  shapes.forEach((shape) => {
    getNewpath(canvas, shape, shapeMode, scissorsPaths, saveState);
  });
  // getNewpath(canvas, currentShape, shapeMode, scissorsPaths);
  isCutting.value = true;
}
function pathArrayToString(pathArr) {
  return pathArr.map(seg => seg.join(" ")).join(" ");
}
function getNewpath(canvas, currentShape, shapeMode, scissorsPaths, saveState) {
  // const scaleX = currentShape.scaleX;
  // const scaleY = currentShape.scaleY;
  // const left = currentShape.left;
  // const top = currentShape.top;
  // const scaledPathArray = currentShape.path.map(cmd => {
  //   const [command, ...coords] = cmd;
  //   const newCoords = coords.map((n, i) => (i % 2 === 0 ? n * scaleX : n * scaleY));
  //   return [command, ...newCoords];
  // });
  // // 重新计算 缩放后的路径
  // const scaledPathData = pathArrayToString(scaledPathArray);
  // let p = scaledPathData;
  // const scaledPath = new fabric.Path(scaledPathData, {
  //   fill: "rgba(0,255,255,1)",
  //   stroke: "rgba(0,255,255,1)",
  //   left: currentShape.left,
  //   top: currentShape.top,
  //   originX: "center",
  //   originY: "center",
  //   angle: currentShape.angle,
  // });

  // p = pathToPoints(scaledPath);
  let p = pathToPoints(currentShape);
  if (shapeMode == "symmetry" || shapeMode == "fourCorners") {

    const trianglePolygon = paperCutPath[shapeMode];
    p = calculateIntersection(trianglePolygon, p);
  } else if (shapeMode == "sixCorners") {

    const trianglePolygon = paperCutPath.sixCorners;
    p = calculateIntersection(trianglePolygon, p);
  } else {
    const trianglePolygon = paperCutPath.normal;
    p = calculateIntersection(trianglePolygon, p);
  }
  canvas.remove(currentShape);
  console.log(p);
  if (p) {
    const res = {
      path: p,
      fill: "white",
      stroke: "transparent",
      strokeWidth: 2,
      selectable: false,
    };
    const newPath = new fabric.Path(p, res);
    canvas.add(newPath);
    scissorsPaths.push(res);
    saveState({
      type: 'scissors',
      res,
    })
  }

}
// ================== 创建与更新 ==================

export function createShape(type, x, y) {
  const opts = getDefaultOptions(x, y);
  if (type === "ellipse") {
    const path = dataPath[type];
    if (!path) return null;
    return new fabric.Path(path, {
      ...opts,
      fill: opts.stroke,
      stroke: opts.stroke,
      scaleX: 0.4,
      scaleY: 0.2,
    });
  }

  const path = dataPath[type];
  if (!path) return null;

  return new fabric.Path(path, {
    ...opts,
    fill: opts.stroke,
    stroke: opts.stroke,
    scaleX: 0.2,
    scaleY: 0.2,
  });
}

export function updateShape(shape, type, currentX, currentY) {
  const dx = currentX - origX;
  const dy = currentY - origY;
  const centerX = (origX + currentX) / 2;
  const centerY = (origY + currentY) / 2;

  if (["circle"].includes(type)) {
    const origWidth = shape.width || 1;
    const origHeight = shape.height || 1;
    const scaleX = dx / origWidth;
    const scaleY = dy / origHeight;
    const max = Math.max(scaleX, scaleY);
    const centerX = (origX + currentX) / 2;
    const centerY = (origY + currentY) / 2;
    shape.set({
      scaleX: max,
      scaleY: max,
      left: centerX,
      top: centerY,
    });
  } else {
    const origWidth = shape.width || 1;
    const origHeight = shape.height || 1;
    //  const scaleX = dx / origWidth;
    //   const scaleY = dy / origHeight;
    const scaleX = Math.abs(dx / origWidth);
    const scaleY = Math.abs(dy / origHeight);
    const centerX = (origX + currentX) / 2;
    const centerY = (origY + currentY) / 2;
    shape.set({
      scaleX,
      scaleY,
      left: centerX,
      top: centerY,
    });
  }

  shape.setCoords();
}
function throttle(fn, limit = 16) {
  let inThrottle = false;
  let lastArgs;
  return function (...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
        if (lastArgs) {
          fn.apply(this, lastArgs);
          lastArgs = null;
        }
      }, limit);
    } else {
      lastArgs = args;
    }
  };
}
// 贝塞尔曲线插值函数
function bezierInterpolate(p0, p1, p2, p3, t) {
  const a = (1 - t) ** 3 * p0 + 3 * (1 - t) ** 2 * t * p1 + 3 * (1 - t) * t ** 2 * p2 + t ** 3 * p3;
  return a;
}
function pathToPoints(path, samples = 200) {
  const pathEl = document.createElementNS("http://www.w3.org/2000/svg", "path");
  pathEl.setAttribute("d", path.path.map(p => p.join(" ")).join(" "));
  const length = pathEl.getTotalLength();
  const points = [];
  const matrix = path.calcTransformMatrix(); // 获取变换矩阵

  for (let i = 0; i <= samples; i++) {
    const p = pathEl.getPointAtLength((i / samples) * length);
    // 用 fabric 的矩阵转换出实际坐标
    const transformed = fabric.util.transformPoint(
      new fabric.Point(p.x - path.pathOffset.x, p.y - path.pathOffset.y),
      matrix
    );
    points.push([transformed.x, transformed.y]);
  }
  return points;
}
