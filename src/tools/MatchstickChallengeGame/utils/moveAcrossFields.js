   // 七段数码管数据
        const data = {
            "0":{tickNum:6, mark:[1,1,1,1,1,1,0]},
            "1":{tickNum:2, mark:[0,1,1,0,0,0,0]},
            "2":{tickNum:5, mark:[1,1,0,1,1,0,1]},
            "3":{tickNum:5, mark:[1,1,1,1,0,0,1]},
            "4":{tickNum:4, mark:[0,1,1,0,0,1,1]},
            "5":{tickNum:5, mark:[1,0,1,1,0,1,1]},
            "6":{tickNum:6, mark:[1,0,1,1,1,1,1]},
            "7":{tickNum:3, mark:[1,1,1,0,0,0,0]},
            "8":{tickNum:7, mark:[1,1,1,1,1,1,1]},
            "9":{tickNum:6, mark:[1,1,1,1,0,1,1]}
        };

        const segmentNames = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

        // 获取数字的七段显示
        function getDigitDisplay(num) {
            return data[num.toString()].mark.slice(); // 返回副本
        }

        // 检查两个显示是否相同
        function displaysEqual(display1, display2) {
            for (let i = 0; i < 7; i++) {
                if (display1[i] !== display2[i]) return false;
            }
            return true;
        }

        // 查找显示对应的数字（可能多个）
        function findMatchingDigits(display) {
            const matches = [];
            for (let num = 0; num <= 9; num++) {
                const digitDisplay = getDigitDisplay(num);
                if (displaysEqual(digitDisplay, display)) {
                    matches.push(num);
                }
            }
            return matches;
        }

        // 生成所有可能的跨数字单段移动
        function findAllCrossDigitSingleMoves(a, b, result) {
            const moves = [];
            
            // 获取三个数字的原始显示
            const aDisplay = getDigitDisplay(a);
            const bDisplay = getDigitDisplay(b);
            const resultDisplay = getDigitDisplay(result);
            
            // 遍历所有可能的"从数字"和"到数字"组合
            const digits = [
                {name: 'a', value: a, display: aDisplay, position: 0},
                {name: 'b', value: b, display: bDisplay, position: 1},
                {name: 'result', value: result, display: resultDisplay, position: 2}
            ];
            
            // 从任意数字的任意亮段取走
            for (let fromIdx = 0; fromIdx < 3; fromIdx++) {
                const fromDigit = digits[fromIdx];
                const fromDisplay = fromDigit.display;
                
                // 检查该数字的所有亮段
                for (let seg = 0; seg < 7; seg++) {
                    if (fromDisplay[seg] !== 1) continue; // 必须是亮段
                    
                    // 移动到任意另一个数字的暗段
                    for (let toIdx = 0; toIdx < 3; toIdx++) {
                        if (fromIdx === toIdx) continue; // 不能移到自己
                        
                        const toDigit = digits[toIdx];
                        const toDisplay = toDigit.display;
                        
                        // 检查目标数字的所有暗段
                        for (let targetSeg = 0; targetSeg < 7; targetSeg++) {
                            if (toDisplay[targetSeg] !== 0) continue; // 必须是暗段
                            
                            // 创建新的显示状态
                            const newADisplay = getDigitDisplay(a);
                            const newBDisplay = getDigitDisplay(b);
                            const newResultDisplay = getDigitDisplay(result);
                            
                            // 应用移动：从源数字取走一段
                            if (fromIdx === 0) newADisplay[seg] = 0;
                            else if (fromIdx === 1) newBDisplay[seg] = 0;
                            else newResultDisplay[seg] = 0;
                            
                            // 应用到目标数字加上一段
                            if (toIdx === 0) newADisplay[targetSeg] = 1;
                            else if (toIdx === 1) newBDisplay[targetSeg] = 1;
                            else newResultDisplay[targetSeg] = 1;
                            
                            // 检查移动后三个数字是否都是有效数字
                            const newAOptions = findMatchingDigits(newADisplay);
                            const newBOptions = findMatchingDigits(newBDisplay);
                            const newResultOptions = findMatchingDigits(newResultDisplay);
                            
                            if (newAOptions.length > 0 && newBOptions.length > 0 && newResultOptions.length > 0) {
                                moves.push({
                                    fromDigit: fromDigit.name,
                                    fromValue: fromDigit.value,
                                    fromSegment: seg,
                                    toDigit: toDigit.name,
                                    toValue: toDigit.value,
                                    toSegment: targetSeg,
                                    moveDesc: `从${fromDigit.name}(${fromDigit.value})的${segmentNames[seg]}段移动到${toDigit.name}(${toDigit.value})的${segmentNames[targetSeg]}段`,
                                    move:[segmentNames[seg],segmentNames[targetSeg]],
                                    newADisplay: newADisplay,
                                    newBDisplay: newBDisplay,
                                    newResultDisplay: newResultDisplay,
                                    newAOptions: newAOptions,
                                    newBOptions: newBOptions,
                                    newResultOptions: newResultOptions
                                });
                            }
                        }
                    }
                }
            }
            
            return moves;
        }

        // 查找所有可能的等式修正方案（跨数字移动）
    export    function findAllEquationFixesWithCrossDigitMove() {
            const allFixes = [];
            
            // 检查加法
            // console.log("正在计算加法等式...");
            for (let a = 0; a <= 9; a++) {
                for (let b = 0; b <= 9; b++) {
                    const sum = a + b;
                    if (sum > 9) continue; // 结果必须是单个数字
                    
                    // 尝试所有可能的结果数字（错误显示）
                    for (let wrongResult = 0; wrongResult <= 9; wrongResult++) {
                        if (wrongResult === sum) continue; // 错误显示不能是正确结果
                        
                        // 原始错误的等式：a + b = wrongResult
                        
                        // 生成所有可能的跨数字移动
                        const moves = findAllCrossDigitSingleMoves(a, b, wrongResult);
                        
                        // 检查每个移动是否能修正等式
                        for (const move of moves) {
                            // 检查移动后是否存在a', b', result'使得a' + b' = result'成立
                            for (const newA of move.newAOptions) {
                                for (const newB of move.newBOptions) {
                                    for (const newResult of move.newResultOptions) {
                                        if (newA + newB === newResult) {
                                            // 记录这个修正方案
                                            // console.log(move);
                                            
                                            allFixes.push({
                                                type: "加法",
                                                equation: `${a} + ${b} = ${wrongResult}`,
                                                move: move.move,
                                                corrected: `${newA} + ${newB} = ${newResult}`,
                                                description: `${a}+${b}=${wrongResult} → ${move.moveDesc} → ${newA}+${newB}=${newResult} ✓`,
                                                check:{
                                                    start:move.fromDigit =='a'? 'first':(move.fromDigit =='b'? 'second':'result'),
                                                    end:move.toDigit =='a'? 'first':(move.toDigit =='b'? 'second':'result')
                                                },
                                                details: {
                                                    original: {a: a, b: b, result: wrongResult},
                                                    move: move,
                                                    corrected: {a: newA, b: newB, result: newResult}
                                                }
                                            });
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            
            for (let a = 0; a <= 9; a++) {
                for (let b = 0; b <= a; b++) { // 确保结果非负
                    const diff = a - b;
                    
                    // 尝试所有可能的结果数字（错误显示）
                    for (let wrongResult = 0; wrongResult <= 9; wrongResult++) {
                        if (wrongResult === diff) continue;
                        
                        // 生成所有可能的跨数字移动
                        const moves = findAllCrossDigitSingleMoves(a, b, wrongResult);
                        
                        // 检查每个移动是否能修正等式
                        for (const move of moves) {
                            // 检查移动后是否存在a', b', result'使得a' - b' = result'成立
                            for (const newA of move.newAOptions) {
                                for (const newB of move.newBOptions) {
                                    for (const newResult of move.newResultOptions) {
                                        if (newA - newB === newResult && newResult >= 0) {
                                            allFixes.push({
                                                type: "减法",
                                                equation: `${a} - ${b} = ${wrongResult}`,
                                                 move: move.move,
                                                corrected: `${newA} - ${newB} = ${newResult}`,
                                                description: `${a}-${b}=${wrongResult} → ${move.moveDesc} → ${newA}-${newB}=${newResult} ✓`,
                                                  check:{
                                                    start:move.fromDigit =='a'? 'first':(move.fromDigit =='b'? 'second':'result'),
                                                    end:move.toDigit =='a'? 'first':(move.toDigit =='b'? 'second':'result')
                                                },
                                                details: {
                                                    original: {a: a, b: b, result: wrongResult},
                                                    move: move,
                                                    corrected: {a: newA, b: newB, result: newResult}
                                                }
                                            });
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            
            return allFixes;
        }