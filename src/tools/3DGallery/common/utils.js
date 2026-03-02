function getPropOfStringifiedObj (objStr, prop, defaultValue) {
  if (!objStr) return defaultValue;
  try {
    const obj = JSON.parse(objStr);
    if (typeof obj[prop] === 'undefined') return defaultValue;
    return obj[prop];
  } catch (e) {
    return defaultValue;
  }
}

function parseStringifiedObj (objStr) {
  if (!objStr) return null;
  try {
    return JSON.parse(objStr);
  } catch (e) {
    return null;
  }
}

function findOne (arr, predictFn) {
  const { length } = arr;
  for (let i = 0; i < length; i++) {
    if (predictFn(arr[i])) return arr[i];
  }
  return null;
}

function keys (obj) {
  return Object.keys(obj);
}

export default { getPropOfStringifiedObj, parseStringifiedObj, findOne, keys };
