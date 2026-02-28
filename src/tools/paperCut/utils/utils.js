import polygonClipping from "polygon-clipping";
import { fabric } from "fabric-with-gestures";
export function calculateIntersection(trianglePolygon, complexPathD) {
  let complexPolygon;
  // 清除旧结果
  if(Array.isArray(complexPathD)) {
    complexPolygon = [complexPathD];
  }else {
     complexPolygon = pathToApproxPolygon(complexPathD, 40);
  }
  const intersection = polygonClipping.intersection([trianglePolygon], complexPolygon);
  if (intersection.length === 0) {
    return null;
  }
  let d;
  intersection.forEach((polygon, index) => {
    if (index == 0) {
      d = `M ${polygon[0][0]} ${polygon[0][1]}`;

      for (let i = 1; i < polygon[0].length; i++) {
        d += ` L ${polygon[0][i][0]} ${polygon[0][i][1]}`;
      }
    } else {
      for (let i = 0; i < polygon[0].length; i++) {
        d += ` L ${polygon[0][i][0]} ${polygon[0][i][1]}`;
      }
    }
  });
  d += " Z";

  return d;
}

function pathToApproxPolygon(pathD, samplesPerSegment = 30) {
  const commands = pathD.match(/[MLQZVCS][^MLQZVCS]*/gi) || [];
  const points = [];
  let current = [0, 0];
  let start = null;

  for (const cmd of commands) {
    const type = cmd[0].toUpperCase();
    const args = cmd
      .slice(1)
      .trim()
      .split(/[\s,]+/)
      .filter(Boolean)
      .map(Number);

    if (type === "M") {
      current = [args[0], args[1]];
      points.push(current.slice());
      start = current.slice();
    } else if (type === "L") {
      current = [args[0], args[1]];
      points.push(current.slice());
    } else if (type === "Q") {
      const ctrl = [args[0], args[1]];
      const end = [args[2], args[3]];
      const seg = sampleQuadraticBezier(current, ctrl, end, samplesPerSegment);
      points.push(...seg.slice(1));
      current = end;
    } else if (type === "Z") {
      if (start) points.push(start.slice());
    }
  }
  return [points]; // polygon-clipping 需要的格式
}
function sampleQuadraticBezier(start, ctrl, end, steps = 30) {
  const points = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const u = 1 - t;
    const x = u * u * start[0] + 2 * u * t * ctrl[0] + t * t * end[0];
    const y = u * u * start[1] + 2 * u * t * ctrl[1] + t * t * end[1];
    points.push([x, y]);
  }
  return points;
}
