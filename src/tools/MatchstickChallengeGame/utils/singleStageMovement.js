/**
 * 数码管数字表示对象，每个数字包含段数和段标记
 * 数码管的7段按以下方式排列:
 *  --- a ---
 * |         |
 * f         b
 * |         |
 *  --- g ---
 * |         |
 * e         c
 * |         |
 *  --- d ---
 */
const digitalMeter = {
  0: { tickNum: 6, mark: [1, 1, 1, 1, 1, 1, 0] },
  1: { tickNum: 2, mark: [0, 1, 1, 0, 0, 0, 0] },
  2: { tickNum: 5, mark: [1, 1, 0, 1, 1, 0, 1] },
  3: { tickNum: 5, mark: [1, 1, 1, 1, 0, 0, 1] },
  4: { tickNum: 4, mark: [0, 1, 1, 0, 0, 1, 1] },
  5: { tickNum: 5, mark: [1, 0, 1, 1, 0, 1, 1] },
  6: { tickNum: 6, mark: [1, 0, 1, 1, 1, 1, 1] },
  7: { tickNum: 3, mark: [1, 1, 1, 0, 0, 0, 0] },
  8: { tickNum: 7, mark: [1, 1, 1, 1, 1, 1, 1] },
  9: { tickNum: 6, mark: [1, 1, 1, 1, 0, 1, 1] },
};

// 定义每一段的名称，对应数码管的7个段
const segmentNames = ["a", "b", "c", "d", "e", "f", "g"];

/**
 * 获取数字的数码管表示
 * @param {number} num - 要获取表示的数字 (0-9)
 * @returns {Array} 代表数码管各段状态的数组，1表示亮，0表示灭
 */
function getDigitDisplay(num) {
  return digitalMeter[num.toString()].mark;
}

/**
 * 检查两个数码管表示是否只差一个段的移动
 * 在火柴棒游戏中，这意味着移动一个火柴棒可以从一个数字变成另一个数字
 * @param {Array} fromMark - 起始数字的数码管表示
 * @param {Array} toMark - 目标数字的数码管表示
 * @returns {boolean} 如果只差一个段的移动则返回true，否则返回false
 */
function isSingleSegmentMove(fromMark, toMark) {
  let fromSeg = -1,
    toSeg = -1;
  let diffCount = 0;
  for (let i = 0; i < 7; i++) {
    if (fromMark[i] !== toMark[i]) {
      diffCount++;
      if (diffCount > 2) return false; // 超过2处不同

      if (fromMark[i] === 1 && toMark[i] === 0) {
        if (fromSeg !== -1) return false; // 已经有一个熄灭的段了
        fromSeg = i;
      } else if (fromMark[i] === 0 && toMark[i] === 1) {
        if (toSeg !== -1) return false; // 已经有一个点亮的段了
        toSeg = i;
      }
    }
  }

  return fromSeg !== -1 && toSeg !== -1;
}

/**
 * 获取移动描述
 * @param {Array} fromMark - 起始数码管表示
 * @param {Array} toMark - 目标数码管表示
 * @returns {Array|null} 移动的段名数组，如果不能移动则返回null
 */
function getMoveDescription(fromMark, toMark) {
  let fromSeg = -1,
    toSeg = -1;

  for (let i = 0; i < 7; i++) {
    if (fromMark[i] === 1 && toMark[i] === 0) {
      fromSeg = i;
    } else if (fromMark[i] === 0 && toMark[i] === 1) {
      toSeg = i;
    }
  }

  return fromSeg !== -1 && toSeg !== -1 ? [segmentNames[fromSeg], segmentNames[toSeg]] : null;
}

/**
 * 查找所有可能的单段移动转换
 * @returns {Array} 包含所有可能转换的数组，每个元素包含from, to, move等信息
 */
function getAllSingleMoveConversions() {
  const conversions = [];

  for (let fromNum = 0; fromNum <= 9; fromNum++) {
    const fromMark = getDigitDisplay(fromNum);

    for (let toNum = 0; toNum <= 9; toNum++) {
      if (fromNum === toNum) continue;

      const toMark = getDigitDisplay(toNum);

      if (isSingleSegmentMove(fromMark, toMark)) {
        const move = getMoveDescription(fromMark, toMark);
        conversions.push({
          from: fromNum,
          to: toNum,
          move: move,
          fromMark: fromMark,
          toMark: toMark,
        });
      }
    }
  }
  return conversions;
}

/**
 * 查找所有有效的等式（通过移动一根火柴棒可以成立的等式）
 * @returns {Array} 包含所有有效等式的数组，每个元素代表一个有效的等式及如何通过移动火柴棒来修正
 */
export function findAllValidEquations() {
  const conversions = getAllSingleMoveConversions();
  const validEquations = [];

  // console.log("所有可能的单段移动转换:");
  // conversions.forEach(c => console.log(`${c.from}→${c.to} (移动${c.move})`));

  // 生成所有可能的错误等式
  // 加法 A + B = C
  for (let wrongA = 0; wrongA <= 9; wrongA++) {
    for (let wrongB = 0; wrongB <= 9; wrongB++) {
      for (let wrongC = 0; wrongC <= 9; wrongC++) {
        const wrongSum = wrongA + wrongB;

        // 如果等式原本就是正确的，跳过
        if (wrongC === wrongSum) continue;

        // 现在我们需要检查：能否通过移动一个段，使这个错误等式变成正确等式
        // 有三种可能性：移动A、移动B、移动C

        // 情况1: 移动wrongC，使之变成correctC = wrongA + wrongB
        const correctC = wrongA + wrongB;
        if (correctC <= 9) {
          // 结果必须是单个数字
          const convC = conversions.find(c => c.from === wrongC && c.to === correctC);

          if (convC) {
            validEquations.push({
              type: "加法",
              equation: `${wrongA} + ${wrongB} = ${wrongC}`,
              corrected: `${wrongA} + ${wrongB} = ${correctC}`,
              wrongPart: wrongC,
              correctedPart: correctC,
              check: {
                start: "result",
                end: "result",
              },
              wrongPosition: "result",
              move: convC.move,
              description: `移动结果数字${wrongC}的${convC.move}段→${correctC}`,
            });
          }
        }

        // 情况2: 移动wrongA，使之变成correctA = wrongC - wrongB
        const correctA = wrongC - wrongB;
        if (correctA >= 0 && correctA <= 9 && correctA !== wrongA) {
          const convA = conversions.find(c => c.from === wrongA && c.to === correctA);

          if (convA) {
            validEquations.push({
              type: "加法",
              equation: `${wrongA} + ${wrongB} = ${wrongC}`,
              corrected: `${correctA} + ${wrongB} = ${wrongC}`,
              wrongPart: wrongA,
              correctedPart: correctA,
              check: {
                start: "first",
                end: "first",
              },
              wrongPosition: "first",
              move: convA.move,
              description: `移动第一个加数${wrongA}的${convA.move}段→${correctA}`,
            });
          }
        }

        // 情况3: 移动wrongB，使之变成correctB = wrongC - wrongA
        const correctB = wrongC - wrongA;
        if (correctB >= 0 && correctB <= 9 && correctB !== wrongB) {
          const convB = conversions.find(c => c.from === wrongB && c.to === correctB);

          if (convB) {
            validEquations.push({
              type: "加法",
              equation: `${wrongA} + ${wrongB} = ${wrongC}`,
              corrected: `${wrongA} + ${correctB} = ${wrongC}`,
              wrongPart: wrongB,
              correctedPart: correctB,
              check: {
                start: "second",
                end: "second",
              },
              wrongPosition: "second",
              move: convB.move,
              description: `移动第二个加数${wrongB}的${convB.move}段→${correctB}`,
            });
          }
        }
      }
    }
  }

  // 减法 A - B = C
  for (let wrongA = 0; wrongA <= 9; wrongA++) {
    for (let wrongB = 0; wrongB <= 9; wrongB++) {
      // 被减数必须大于等于减数
      if (wrongA < wrongB) continue;

      for (let wrongC = 0; wrongC <= 9; wrongC++) {
        const correctDiff = wrongA - wrongB;

        // 如果等式原本就是正确的，跳过
        if (wrongC === correctDiff) continue;

        // 情况1: 移动wrongC，使之变成correctC = wrongA - wrongB
        const convC = conversions.find(c => c.from === wrongC && c.to === correctDiff);

        if (convC) {
          validEquations.push({
            type: "减法",
            equation: `${wrongA} - ${wrongB} = ${wrongC}`,
            corrected: `${wrongA} - ${wrongB} = ${correctDiff}`,
            wrongPart: wrongC,
            correctedPart: correctDiff,
            check: {
              start: "result",
              end: "result",
            },
            wrongPosition: "result",
            move: convC.move,
            description: `移动结果数字${wrongC}的${convC.move}段→${correctDiff}`,
          });
        }

        // 情况2: 移动wrongA，使之变成correctA = wrongC + wrongB
        const correctA = wrongC + wrongB;
        if (correctA <= 9 && correctA !== wrongA) {
          const convA = conversions.find(c => c.from === wrongA && c.to === correctA);

          if (convA) {
            validEquations.push({
              type: "减法",
              equation: `${wrongA} - ${wrongB} = ${wrongC}`,
              corrected: `${correctA} - ${wrongB} = ${wrongC}`,
              wrongPart: wrongA,
              correctedPart: correctA,
              check: {
                start: "first",
                end: "first",
              },
              wrongPosition: "first",
              move: convA.move,
              description: `移动被减数${wrongA}的${convA.move}段→${correctA}`,
            });
          }
        }

        // 情况3: 移动wrongB，使之变成correctB = wrongA - wrongC
        const correctB = wrongA - wrongC;
        if (correctB >= 0 && correctB <= 9 && correctB !== wrongB) {
          const convB = conversions.find(c => c.from === wrongB && c.to === correctB);

          if (convB) {
            validEquations.push({
              type: "减法",
              equation: `${wrongA} - ${wrongB} = ${wrongC}`,
              corrected: `${wrongA} - ${correctB} = ${wrongC}`,
              wrongPart: wrongB,
              correctedPart: correctB,
              check: {
                start: "second",
                end: "second",
              },
              wrongPosition: "second",
              move: convB.move,
              description: `移动减数${wrongB}的${convB.move}段→${correctB}`,
            });
          }
        }
      }
    }
  }

  // 去重
  const uniqueEquations = [];
  const seen = new Set();

  validEquations.forEach(eq => {
    const key = `${eq.type}-${eq.equation}-${eq.wrongPosition}-${eq.move}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueEquations.push(eq);
    }
  });

  return uniqueEquations;
}