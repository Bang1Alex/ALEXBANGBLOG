import { findAllEquationFixesWithCrossDigitMove } from "./moveAcrossFields";
import { findAllValidEquations } from "./singleStageMovement";

export function main() { 
   const data1= findAllEquationFixesWithCrossDigitMove();
   const data2 = findAllValidEquations();

  const newData1 = CombineAnswers(shuffleArray(data1))
  const newData2 = CombineAnswers(shuffleArray(data2))

   return CombineAnswers(shuffleArray([...newData1, ...newData2]));
}
function CombineAnswers(data){
    const newData =[];
    data.forEach(item=>{
       const mark1 = item.equation;
       const isExist = newData.find(item2=>item2.equation.includes(mark1));
       if(!isExist){
         newData.push({...item,otherAnswers:[]});
         
       }else {
        isExist.otherAnswers.push(item);
       }
    })
  return newData;
    
}
function shuffleArray(array) {
  // 创建数组副本以避免修改原数组
  const shuffled = [...array]; // 或者使用 array.slice() 创建副本

  for (let i = shuffled.length - 1; i > 0; i--) {
    // 生成 [0, i] 范围内的随机整数
    const j = Math.floor(Math.random() * (i + 1));
    // 交换元素
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}