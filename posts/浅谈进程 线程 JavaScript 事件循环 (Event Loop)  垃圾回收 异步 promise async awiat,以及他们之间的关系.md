# 浅谈 进程/线程、JavaScript 事件循环 (Event Loop)、垃圾回收、异步、promise、async/awiat,以及他们之间的关系

## 一、核心概念解析（由底层到上层，通俗易懂）

### 1. 进程 / 线程（操作系统层面，JS 的运行基础）

可以把计算机想象成一个工厂：

* **进程**：工厂里的一个独立车间（比如打开的 Chrome 浏览器、VSCode、Node.js 程序），是**操作系统分配内存、CPU 等资源的最小单位**。每个车间有自己独立的空间，不同车间互不干扰。
* **线程**：车间里的工人，是**CPU 调度执行的最小单位**。一个车间（进程）可以有多个工人（线程），共享车间的资源（内存、工具等）。

#### JS 的线程特点

浏览器 / Node.js 中，JS 引擎运行在单线程（称为 “JS 主线程”）中（比如 Chrome 的 V8 引擎线程）。这是因为 JS 最初设计用于操作 DOM，多线程同时修改 DOM 会导致冲突（比如一个线程删节点，一个线程加样式）。但单线程的问题是：如果遇到耗时操作（比如网络请求、定时器），会阻塞主线程，导致页面卡死 —— 这就是**异步**要解决的核心问题。

### 2. 异步（JS 的核心需求）

* **同步**：代码从上到下依次执行，前一个任务完成才能执行后一个（比如`let a = 1; console.log(a);`），耗时操作会阻塞主线程。
* **异步**：耗时任务（如网络请求、`setTimeout`、DOM 事件）交给浏览器 / Node 的其他线程（比如网络线程、定时器线程）处理，主线程继续执行后续代码；等耗时任务完成后，再把回调函数 “丢回” 主线程执行，全程不阻塞。

### 3. 事件循环（Event Loop，异步的实现机制）

JS 单线程下，异步的执行全靠事件循环这个 “调度员”。

#### 核心组成

* **执行栈（调用栈）**：同步代码的执行容器，代码从上到下进入栈中执行，执行完出栈。
* **任务队列**：存放异步任务的回调函数，分两类：
  * **宏任务（macrotask）**：优先级低，包括`script`整体代码、`setTimeout/setInterval`、I/O、UI 交互事件、`requestAnimationFrame`（浏览器）。
  * **微任务（microtask）**：优先级高，包括`Promise.then/catch/finally`、`async/await`、`queueMicrotask`、`MutationObserver`（浏览器）。

#### 事件循环流程

1. 执行栈执行同步代码（属于宏任务），遇到异步任务时，交给对应线程处理，回调函数放入对应任务队列；
2. 执行栈清空后，**立即执行所有微任务队列中的任务**（按顺序）；
3. 微任务执行完后，浏览器更新 UI（可选），然后执行**宏任务队列中的第一个任务**；
4. 重复步骤 2-3，形成 “循环”。

#### 示例（直观理解）

```javascipt
async function async1() {
  console.log("async1 start"); // 同步执行：async1调用时立即执行
  await async2(); // await 右侧的async2()先同步执行，后续代码被放入微任务队列
  console.log("async1 end"); // 微任务：async2执行完后，这行进入微任务队列
}

async function async2() {
  console.log("async2"); // 同步执行：被await调用时立即执行
}

// ========== 执行开始 ==========
console.log("script start"); // 同步任务：第1个打印

// 宏任务：setTimeout回调放入宏任务队列（优先级低于微任务）
setTimeout(function() {
  console.log("setTimeout"); // 宏任务：最后执行
}, 0);

async1(); // 调用async1函数（同步执行）

// Promise构造函数内的代码是同步的，then回调是微任务
new Promise(function(resolve) {
  console.log("promise1"); // 同步任务：立即执行
  resolve(); // 触发then回调，放入微任务队列
}).then(function() {
  console.log("promise2"); // 微任务：排队执行
});

console.log('script end') // 同步任务：最后一个同步打印

// ========== 执行顺序总结 ==========
// 1. script start（同步）
// 2. async1 start（async1调用，同步）
// 3. async2（await右侧，同步）
// 4. promise1（Promise构造函数，同步）
// 5. script end（同步）
// 6. async1 end（微任务：await后的代码）
// 7. promise2（微任务：Promise.then）
// 8. setTimeout（宏任务：最后执行）
```

### 4. 垃圾回收（GC，内存管理）

JS 自动管理内存，垃圾回收就是回收 “不再使用” 的内存空间，避免内存泄漏。

#### 核心规则

**可达性**：从根对象`window`（浏览器）/`global`（Node.js）出发，能访问到的对象是 “可达的”，不可达的会被回收。

#### 常见算法

* **标记清除（主流）**：先标记所有可达对象，再清除未标记的不可达对象；
* **引用计数（有缺陷）**：记录对象被引用的次数，次数为 0 则回收，但无法处理 “循环引用”（比如`a = {b: {}}; b.a = a; a = null; b = null;`，循环引用导致计数不为 0，早期 IE 有此问题）。

#### 和异步的关联

异步回调如果被全局变量意外引用（比如`window.fn = 回调函数`），会导致回调一直可达，无法被回收，造成内存泄漏。

### 5. Promise（异步的规范封装）

解决 “回调地狱”（异步嵌套回调）的问题，是异步编程的标准化方案。

#### 核心特性

* 状态不可逆：`pending`（进行中）→ `fulfilled`（成功）/`rejected`（失败），状态一旦改变就固定；
* 链式调用：`then/catch/finally`返回新的 Promise，避免嵌套；
* 微任务特性：`then/catch/finally`的回调会被放入**微任务队列**（这是和`setTimeout`的关键区别）。

#### 示例

javascript

运行

```
// 基础用法
const p = new Promise((resolve, reject) => {
  // 异步操作（比如网络请求）
  setTimeout(() => {
    resolve('成功结果'); // 状态变为fulfilled
    // reject('失败原因'); // 状态变为rejected
  }, 1000);
});

p.then(res => console.log(res)) // 成功回调（微任务）
  .catch(err => console.log(err)) // 失败回调（微任务）
  .finally(() => console.log('无论成功失败都执行'));
```

### 6. async/await（Promise 的语法糖）

ES7 引入，让异步代码 “看起来像同步代码”，本质还是基于 Promise。

#### 核心规则

* `async`函数：返回一个 Promise 对象，函数内的代码默认同步执行；
* `await`：只能在`async`函数内使用，后面跟 Promise（非 Promise 会被包装成`Promise.resolve()`），会暂停函数执行，等待 Promise 状态改变后，再继续执行后续代码；
* 微任务特性：`await`暂停处的后续代码，会被放入**微任务队列**（和 Promise.then 一致）。

#### 示例

javascript

运行

```
// 封装异步函数
function fetchData() {
  return new Promise(resolve => {
    setTimeout(() => resolve('数据'), 1000);
  });
}

// async/await简化异步
async function getData() {
  console.log('开始请求');
  const data = await fetchData(); // 暂停，等待Promise完成（微任务）
  console.log('获取到数据：', data); // 等待后执行
  return data;
}

getData(); // 输出：开始请求 → （1秒后）获取到数据：数据
```

## 二、所有概念的关联逻辑

1. **底层基础：进程 / 线程**
   
   JS 引擎运行在浏览器 / Node 的单线程中（属于对应进程），单线程决定了必须通过**异步**避免阻塞，而**事件循环**是异步的核心执行机制（协调主线程和其他线程的任务）。
2. **异步的语法进化**
   
   异步是需求，早期用回调函数实现（易出回调地狱）→ `Promise`规范了异步写法（链式调用）→ `async/await`基于 Promise 做语法糖（同步化写法）；且`Promise`/`async/await`的回调都属于**微任务**，优先于宏任务执行。
3. **内存管理：垃圾回收**
   
   所有异步回调、Promise 实例、变量等，只要失去 “可达性”（比如没有全局引用），就会被 GC 回收；如果异步回调被意外引用（比如全局变量），会导致内存泄漏，这是异步编程中需要注意的点。

## 三、总结

1. 进程 / 线程是 JS 运行的底层环境，JS 单线程特性催生了异步需求，事件循环是异步的核心执行机制；
2. Promise 和 async/await 是异步的语法封装（async/await 是 Promise 的语法糖），其回调属于微任务，优先级高于宏任务；
3. 垃圾回收贯穿所有操作，负责回收不可达的对象（包括异步回调、Promise 实例），避免内存泄漏。

