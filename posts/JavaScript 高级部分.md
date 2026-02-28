# JavaScript 高级部分

## JavaScript高级 Day01

> JS Day01主要讲解了三个部分： 作用域 、解构赋值、箭头函数

### 作用域

作用域规定了变量能够访问的“范围”，离开了这个范围变量就不能被访问了

+ 作用域分为：
  - 局部作用域
  - 全局作用域

局部作用域分为函数作用域和块级作用域

1、函数作用域

在函数内部声明的变量只能在函数内部访问，外部无法直接访问

> 1. 函数内部声明的变量，在函数外部无法被访问
> 2. 函数的参数也是函数内部的局部变量
> 3. 不同函数内部，声明的变量无法互相访问
> 4. 函数执行完毕后，函数内部的变量就会被清空

2、块级作用域

在JavaScript中使用{}包括的代码称为代码块，代码块内部声明的变量外部【`有可能`】无法访问

> 1. let声明的变量会产生块级作用域，var不会产生块级作用域
> 2. const声明的常量会产生块级作用域
> 3. 不同的代码块之间的无法相互访问
> 4. 推荐使用let或const

```javascript
# 1、局部作用域分为两种：函数作用域、块级作用域
# 2、局部作用域声明的变量外部无法使用
```

3、全局作用域

script 标签和.js的最外层就是所谓的全局作用域，在此声明的变量在函数内部可以被访问。全局作用域中的声明的变量，任何其他作用域都可以被访问

> 1. 为window对象动态添加的属性默认也是全局的、但是不推荐使用
> 2. `在函数中未使用的任何关键字声明的变量为全局变量，不推荐!!!`
> 3. 尽可能少的声明全局变量，防止全局变量污染

```javascript
#全局作用域有哪些 script标签的最外层、 .js文件的最外层
#全局作用声明的变量其他作用域可以随意访问
#JavaScript中的作用域是程序被执行事的底层的机制，了解这一些机制有助于规范代码书写习惯，避免因作用域导致的语法错误
```

### 作用域链

作用域链的本质是底层的`变量查找机制`

```plain
- 在函数被执行时，会`优先查找当前`函数作用域中查找变量
- 如果当前作用域查找不到则会依次逐级查找父级作用域直到全局作用域
```

> 1. 嵌套关系的作用域串联起来形成了作用域链
> 2. 相同的作用域链中按着从小到大的规则查找变量

```javascript
#作用链的本质：变量的查找机制
#作用域链的查找规则：会优先从当前作用域进行查找，如果当前作用域查找不到，会依次逐级向父级作用域进行查找，知道全局作用域
```

### JS 垃圾回收机制

`了解JS的垃圾回收机制是为了了解闭包做铺垫`

什么是JS的垃圾回收机制？

垃圾回收机制(Garbage Collection) 简称 GC

JS中内存的分配和回收都是自动完成的，内存在不使用的时候会被垃圾回收器自动回收。

正因为垃圾回收的存在，很多人认为JS不用关心内存管理的问题

但是如果不了解JS的内存管理机制，我们通常非常容易，造成内存泄漏(内存无法被回收)的情况

不在用到的内存，没有即使释放，就叫`内存泄漏`

`内存的声明周期`

1. 内存分配：当我们声明变量、函数、对象的时候，系统自动为他们分配内存
2. 内存的使用：读写内存，也就是变量、函数的使用
3. 内存的回收：使用完毕后，有垃圾回收器自动回收不再使用的内存

> 全局变量一般不会回收（只有当面关闭的时候，页面才会被回收）
>
> 一般情况下局部变量的值，不用了，就会被自动回收

```javascript
#什么垃圾回收机制？
简称 GC ，Js中内存的分配和回收都是自动完成，内存不再使用的时候就会被垃圾回收器回收
#什么内存泄漏？
不再用到的内存，没有及时释放，就叫内存泄漏
#内存的声明周期？
分为三步：分配、使用、回收
注意：全局变量一般不会回收，一般情况下局部变量的值，不用了就会被垃圾回收器回收
```

### JS中垃圾回收算法

`所谓垃圾回收，核心思想就是如何判断内存是否已经不再使用，如果是，就是为垃圾，释放掉。`

`引用计算法`

IE采用的引用计算算法，定义“内存不再使用”的标准很简单，就是看`一个对象是否有指向它的引用`

> 算法说明：
>
> 1. 跟踪记录每一个值被引用的次数
> 2. 如果这个值被引用了一次，那么就记录次数为1
> 3. 多次引用会累计
> 4. 如果减少一个引用就减一
> 5. 如果引用次数为0，则释放内存

缺点：当两个对象相互引用，尽管他们已经不再使用，垃圾回收器也不会进行回收，导致内存泄漏

`标记清除法`

现在的浏览器已经不再使用引用计数算法了。

大多数浏览器都是基于标记清除法算法进行一些改进，总体思想都是一致

> 算法说明：
>
> 1. 标记清除法"不再使用的对象"定义为无法到达的对象。
> 2. 就是从根部出发定时扫描内存中的对象，凡是能从根部达到的对象，都是还需使用的
> 3. 那些无法从根部出发触及对象就被标记不再使用，稍后回收

标记清除法，很好的解决了引用计数遗留的问题。两个对象相互引用，无法达到，视为垃圾回收

### 闭包

对于刚入行的人来说，闭包是在面试的时候，几乎必问的问题，也是八股文中的重点

什么是闭包： 一个函数对周围状态的引用捆绑在一起，内层函数中访问到外层函数的作用域

简单说就是： 闭包 = 内层函数 + 外层函数的变量

```javascript
<script>
  function foo() {
    let i = 0;
    // 函数内部分函数
    function bar() {
			console.log(++i);
    }
    // 将函数做为返回值
    return bar;
  }  
  // fn 即为闭包函数
  let fn = foo();
  
  fn(); // 1
</script>
```

闭包的作用：

封闭数据，实现数据私有化，外部也可以访问函数内部的变量

闭包很有用，因为他允许将函数与其他操作的某些数据关联起来

闭包的缺点：

内存泄漏

总结：

1. 闭包的本质仍然是函数，只不过是从函数内部返回的
2. 闭包能创建外部可访问的隔离的作用，避免全局变量的污染
3. 过渡使用闭包可能会造成内存泄漏

注：回调函数也能访问函数内部的局部变量

### 变量提升

变量提升是 JavaScript 中比较“奇怪”的现象，它允许在变量声明之前即被访问，

```html
<script>
  // 访问变量 str
  console.log(str + 'world!');

  // 声明变量 str
  var str = 'hello ';
</script>
```

总结：

1. 变量在未声明即被访问时会报语法错误
2. 变量在声明之前即被访问，变量的值为 `undefined`
3. `let` 声明的变量不存在变量提升，推荐使用 `let`
4. 变量提升出现在相同作用域当中
5. 实际开发中推荐先声明再访问变量

注：关于变量提升的原理分析会涉及较为复杂的词法分析等知识，而开发中使用 `let` 可以轻松规避变量的提升，因此在此不做过多的探讨，

### 函数进阶

### 函数提升

函数提升与变量提升比较类似，是指函数在声明之前就可被调用

```javascript
<script>
  // 调用函数
  foo()
  // 声明函数
  function foo() {
    console.log('声明之前即被调用...')
  }

  // 不存在提升现象
  bar()  // 错误
  var bar = function () {
    console.log('函数表达式不存在提升现象...')
  }
</script>
```

总结：

1. 函数提升能够使函数的声明调用更加灵活
2. 函数表达式不存在提升的现象
3. 函数提升出现在相同作用域当中

### 函数参数

函数默认值

```javascript
<script>
  // 设置参数默认值
  function sayHi(name="小明", age=18) {
    document.write(`<p>大家好，我叫${name}，我今年${age}岁了。</p>`);
  }
  // 调用函数
  sayHi();
  sayHi('小红');
  sayHi('小刚', 21);
</script>
```

总结：

1. 声明函数时为形参赋值即为参数的默认值
2. 如果参数未自定义默认值时，参数的默认值为 `undefined`
3. 调用函数时没有传入对应实参时，参数的默认值被当做实参传入

#### 动态参数

`arguments`是函数内部内置的伪数组，它包含了调用函数传入的所有的参数

```javascript
<script>
  // 求生函数，计算所有参数的和
  function sum() {
    // console.log(arguments)
    let s = 0
    for(let i = 0; i < arguments.length; i++) {
      s += arguments[i]
    }
    console.log(s)
  }
  // 调用求和函数
  sum(5, 10)// 两个参数
  sum(1, 2, 4) // 两个参数
</script>
```

总结：

1. `arguments`是一个伪数组
2. `arguments`的作用是动态回去函数的实参

#### 剩余参数

```javascript
<script>
  function config(baseURL, ...other) {
    console.log(baseURL) // 得到 'http://baidu.com'
    console.log(other)  // other  得到 ['get', 'json']
  }
  // 调用函数
  config('http://baidu.com', 'get', 'json');
</script>
```

展开运算符：

```javascript
//展开运算符 ，将数组展开
const arr = [1,2,3,4,5]
console.log(...arr) // 1 2 3 4 5
//不会修改原数组

展开运算符的应用场景：求在数组最大值最小值 合并数组
```

剩余参数在函数内部使用

展开运算符主要在数组展开

总结：

1. `...` 是语法符号，置于最末函数形参之前，用于获取多余的实参
2. 借助 `...` 获取的剩余实参，是个真数组

总结：

1. 剩余参数得到的是真数组
2. 动态参数得到的是伪数组

### 箭头函数

箭头函数是一种声明函数的简洁语法，它与普通函数并无本质的区别，差异性更多体现在语法格式上。

```javascript
<script>
  // 箭头函数
  const foo = () => {
    console.log('^_^ 长相奇怪的函数...');
  }
  // 调用函数
  foo()
  
  // 更简洁的语法
  const form = document.querySelector('form')
  form.addEventListener('click', ev => ev.preventDefault())
</script>
```

总结：

1. 箭头函数属于表达式函数，因此不存在函数提升
2. 箭头函数只有一个参数时可以省略圆括号 `()`
3. 箭头函数函数体只有一行代码时可以省略花括号 `{}`，并自动做为返回值被返回
4. 箭头函数中没有 `arguments`，只能使用 `...` 动态获取实参

箭头函数的this

在剪头函数出现之前，每一个新函数根据它是如果调用的来定义这个函数的this值，

箭头函数不会创建自己的this，他只会从自己的作用域链上一层沿用this

### 解构赋值

解构赋值是一种快速为变量赋值的简洁语法，本质上仍然是变量赋值，分为数组解构、对象解构

#### 数组解构

数组解构是将数数组单元值快速批量赋值给一系列变量的简洁语法

```javascript
<script>
  // 普通的数组
  let arr = [1, 2, 3];
  // 批量声明变量 a b c 
  // 同时将数组单元值 1 2 3 依次赋值给变量 a b c
  let [a, b, c] = arr;
  console.log(a); // 1
  console.log(b); // 2
  console.log(c); // 3
</script>
```

总结：

1. 赋值运算符 `=` 左侧的 `[]` 用于批量声明变量，右侧数组的单元值将被赋值给左侧的变量
2. 变量的顺序对应数组单元值的位置依次进行赋值操作
3. 变量的数量大于单元值数量时，多余的变量将被赋值为  `undefined`
4. 变量的数量小于单元值数量时，可以通过 `...` 获取剩余单元值，但只能置于最末位
5. 允许初始化变量的默认值，且只有单元值为 `undefined` 时默认值才会生效

注：支持多维解构赋值，比较复杂后续有应用需求时再进一步分析

#### 对象的解构

对象解构是将数组对象属性和方法快速批量赋值一系列变量的简洁语法。

```javascript
<script>
  // 普通对象
  const user = {
    name: '小明',
    age: 18
  };
  // 批量声明变量 name age
  // 同时将数组单元值 小明  18 依次赋值给变量 name  age
  const {name, age} = user

  console.log(name) // 小明
  console.log(age) // 18
</script>
```

总结：

1. 赋值运算符 `=` 左侧的 `{}` 用于批量声明变量，右侧对象的属性值将被赋值给左侧的变量
2. 对象属性的值将被赋值给与属性名相同的变量
3. 对象中找不到与变量名一致的属性时变量值为 `undefined`
4. 允许初始化变量的默认值，属性不存在或单元值为 `undefined` 时默认值才会生效

注：支持多维解构赋值，比较复杂后续有应用需求时再进一步分析

## JavaScript高级 Day02

> JS Day02主要讲解了两个部分： 构造函数  数据常用的函数

### 深入对象

#### 创建对象三种方式

1. 利用字面量创建
2. 利用new Object创建对象
3. 利用构造函数

#### 构造函数

构造函数 ：是一种特殊的函数，主要用来初始化对象

使用场景：常规的 {...} 语法允许创建一个对象。比如我们创建了佩奇的对象，继续创建乔治的对象还需要重新写一 遍，此时可以通过`构造函数来快速创建多个类似的对象`。

构造函数在技术上是常规函数。 不过有两个约定：

1. 它们的命名以大写字母开头。
2. 它们只能由 "new" 操作符来执行

```javascript
 <script>
    // 创建一个猪 构造函数 
    function Pig(uname, age) {
      this.uname = uname
      this.age = age
    }

    console.log(new Pig('佩奇', 6))
    console.log(new Pig('乔治', 3))
    const p = new Pig('佩奇', 6)
    console.log(p)

    //  const pepa = { uname: '佩奇', age: 6 }

    // const obj = new Object()

    function Goods(name, price, count) {
      this.name = name
      this.price = price
      this.count = count
      this.sayhi = function () { }
    }
    const mi = new Goods('小米', 1999, 20)
    console.log(mi)
    const hw = new Goods('华为', 3999, 59)
    console.log(hw)
    console.log(mi === hw)
    mi.name = 'vivo'
    console.log(mi)
    console.log(hw)
    // const date = new Date('2022-4-8')
    // console.log(date)

    // 静态成员 
    Goods.num = 10
    console.log(Goods.num)
    Goods.sayhi = function () { }
  </script>
```

总结：

1. 使用 new 关键字调用函数的行为被称为实例化
2. 实例化构造函数时没有参数时可以省略 ()
3. 构造函数内部无需写return，返回值即为新创建的对象
4. 构造函数内部的 return 返回的值无效，所以不要写return
5. new Object（） new Date（） 也是实例化构造函数

`实例成员&静态成员`

`实例成员`： 通过构造函数创建的对象称为实例对象，`实例对象中的属性和方法称为实例成员`。

说明：

1. 实例对象的属性和方法即为实例成员
2. 为构造函数传入参数，动态创建结构相同但值不同的对象
3. 构造函数创建的实例对象彼此独立互不影响

`静态成员`： 构造函数的属性和方法被称为静态成员

说明：

1. 构造函数的属性和方法被称为静态成员
2. 一般公共特征的属性或方法静态成员设置为静态成员
3. 静态成员方法中的 this 指向构造函数本身

### 内置构造函数

Object、 Array、String、Number

在 JavaScript 中最主要的数据类型有 6 种：

基本数据类型： 字符串、数值、布尔、undefined、null

引用类型: 对象 但是，我们会发现有些特殊情况：

其实字符串、数值、布尔、等基本类型也都有专门的构造函数，

这些我们称为`包装类型`。 JS中几乎所有的数据都可以基于构成函数创建。

引用类型 Object，Array，RegExp，Date 等

包装类型 String，Number，Boolean 等

#### Object

Object是内置构造函数，用于创建对象

学习三个常用静态方法（静态方法就是只有构造函数Object可以调用的）

1. Object.keys() 静态方法获取对象中所有属性（键）  返回是一个数组
2. Object.values() 静态方法获取对象中所有属性值     返回是一个数组
3. ：Object. assign() 静态方法常用于对象拷贝     经常使用的场景给对象添加属性

```javascript
<script>
    const o = { uname: 'pink', age: 18 }
    // 1.获得所有的属性名
    console.log(Object.keys(o))  //返回数组['uname', 'age']
    // 2. 获得所有的属性值
    console.log(Object.values(o))  //  ['pink', 18]
    // 3. 对象的拷贝
     const oo = {}
     Object.assign(oo, o)
     console.log(oo)
    Object.assign(o, { gender: '女' })
    console.log(o)
  </script>
```

#### Array


|  方法  |   作用   |                             说明                             |
| :-----: | :------: | :----------------------------------------------------------: |
| forEach | 遍历数组 |         不返回，用于不改变值，经常用于查找打印输出值         |
| filter | 过滤数组 |                  筛选数组元素，并生成新数组                  |
|   map   | 迭代数组 | 返回新数组，新数组里面的元素是处理之后的值，经常用于处理数据 |
| reduce |  累计器  |            返回函数累计处理的结果，经常用于求和等            |
|        |          |                                                              |

代码演示：

```javascript
 const arr = [1, 3, 5]
    // item是数组的每一项  index是索引号  不会改变原始数组 返回一个新数组
    // map方法一般用来遍历数组对象
     const newArr = arr.map((item, index) => {
       return item + 10
     })
     console.log(newArr); //const arr = [11, 13, 15]
    // item是数组的每一项  index是索引号  
    // 不会改变原始数组 经常用于打印输出值  是增强版的for循环 
       arr.forEach((item, index) => {
       console.log(item);
       console.log(index);
     })

    //  item是数组的每一项  index是索引号  不会改变原始数组 返回一个新数组
    // filter方法经常用来筛选数据
     const newArr = arr.filter((item, index) => {
       return item >= 3
     })
     console.log(newArr); //[3, 5]

    // reduce方法 
    // arr.reduce(function(累计回调的返回值，当前元素[,索引号[,原数组]]){}，传递给函数的起始值)
    let a = arr.reduce((prev, item) => {
      return prev + item
    }, 0)
    console.log(a);
```

```javascript
 <script>
     const arr = ['red', 'blue', 'green']
     const re = arr.find(function (item) {
       return item === 'blue'
     })
     console.log(re)

    const arr = [
      {
        name: '小米',
        price: 1999
      },
      {
        name: '华为',
        price: 3999
      },
    ]
    // 找小米 这个对象，并且返回这个对象
    // const mi = arr.find(function (item) {
    //   // console.log(item)  //
    //   // console.log(item.name)  //
    //   console.log(111)
    //   return item.name === '华为'
    // })
    // 1. find 查找
    // const mi = arr.find(item => item.name === '小米')
    // console.log(mi)
    // 2. every 每一个是否都符合条件，如果都符合返回 true ，否则返回false
    const arr1 = [10, 20, 30]
    const flag = arr1.every(item => item >= 20)
    console.log(flag)
  </script>
```

总结：

1. 推荐使用字面量方式声明数组，而不是 `Array` 构造函数
2. 实例方法 `forEach` 用于遍历数组，替代 `for` 循环 (重点)
3. 实例方法 `filter` 过滤数组单元值，生成新数组(重点)
4. 实例方法 `map` 迭代原数组，生成新数组(重点)
5. 实例方法 `join` 数组元素拼接为字符串，返回字符串(重点)
6. 实例方法  `find`  查找元素， 返回符合测试条件的第一个数组元素值，如果没有符合条件的则返回 undefined(重点)
7. 实例方法`every` 检测数组所有元素是否都符合指定条件，如果**所有元素**都通过检测返回 true，否则返回 false(重点)
8. 实例方法`some` 检测数组中的元素是否满足指定条件   **如果数组中有**元素满足条件返回 true，否则返回 false
9. 实例方法 `concat`  合并两个数组，返回生成新数组
10. 实例方法 `sort` 对原数组单元值排序
11. 实例方法 `splice` 删除或替换原数组单元
12. 实例方法 `reverse` 反转数组
13. 实例方法 `findIndex`  查找元素的索引值

#### 包装类型

在 JavaScript 中的字符串、数值、布尔具有对象的使用特征，如具有属性和方法，如下代码举例：

```html
<script>
  // 字符串类型
  const str = 'hello world!'
 	// 统计字符的长度（字符数量）
  console.log(str.length)
  
  // 数值类型
  const price = 12.345
  // 保留两位小数
  price.toFixed(2) // 12.34
</script>
```

之所以具有对象特征的原因是字符串、数值、布尔类型数据是 JavaScript 底层使用 Object 构造函数“包装”来的，被称为包装类型。

`String` 是内置的构造函数，用于创建字符串。

```html
<script>
  // 使用构造函数创建字符串
  let str = new String('hello world!');

  // 字面量创建字符串
  let str2 = '你好，世界！';

  // 检测是否属于同一个构造函数
  console.log(str.constructor === str2.constructor); // true
  console.log(str instanceof String); // false
</script>
```

总结：

1. 实例属性 `length` 用来获取字符串的度长(重点)
2. `charAt()`返回字符串的索引值.(括号里面填写索引号)
3. 实例方法 `split('分隔符')` 用来将字符串拆分成数组(重点)
4. 实例方法 `substring（需要截取的第一个字符的索引[,结束的索引号]）` 用于字符串截取(重点)
5. 实例方法 `startsWith(检测字符串[, 检测位置索引号])` 检测是否以某字符开头(重点)
6. 实例方法 `includes(搜索的字符串[, 检测位置索引号])` 判断一个字符串是否包含在另一个字符串中，根据情况返回 true 或 false(重点)
7. 实例方法 `toUpperCase` 用于将字母转换成大写
8. 实例方法 `toLowerCase` 用于将就转换成小写
9. 实例方法 `indexOf`  检测是否包含某字符
10. 实例方法 `endsWith` 检测是否以某字符结尾
11. 实例方法 `replace` 用于替换字符串，支持正则匹配
12. 实例方法 `match` 用于查找字符串，支持正则匹配
13. 实例方法`trim`用于清楚空格

注：String 也可以当做普通函数使用，这时它的作用是强制转换成字符串数据类型。

`Number` 是内置的构造函数，用于创建数值。

```html
<script>
  // 使用构造函数创建数值
  let x = new Number('10')
  let y = new Number(5)

  // 字面量创建数值
  let z = 20

</script>
```

总结：

1. 推荐使用字面量方式声明数值，而不是 `Number` 构造函数
2. 实例方法 `toFixed` 用于设置保留小数位的长度

## JavaScript高级 Day03

> 本小节主要讲解：深入对象
>
> 编程思想 、 构造函数 、 原型

### 编程思想

#### 面向过程编程

面向过程就是分析出解决问题所需的步骤，然后用函数把这些步骤一步一步的实现，使用的时候再一个一个的一次执行调用就可了

面向过程，就是按照我们分析好了的步骤，按照步骤解决问题。

把大象放进冰箱

1.冰箱门打开

2.把大象放进去

3.冰箱门关上

#### 面向对象编程

面向对象是把事务分解成为一个个对象，然后由对象之间分工与合作。

面向对象是以对象功能来划分问题，而不是步骤

面向对象是吧事务分解成为一个对象，然后有对象之间分工和合作

1.大象对象

进去

2.冰箱对象

打开

关闭

3.使用大象和冰箱的功能、

面向对象是对象功能来划分问题，而不是步骤。

总结：

> 面向过程
> 优点：性能比面向对象高，适合跟硬件联系很紧密的东西，例如单片机就采用面向过程 编程。
> 缺点：没有面向对象易维护、易复用、易扩展。
> 面向对象
> 优点：易维护、易复用、易扩展，由于面向对象有封装、继承、多态性的特性，可以设计出低耦合的系统，使系统更加灵活、更加易于维护。
> 缺点：性能比面向过程的低

### 构造函数

封装是面向对象思想中比较重要的一部分，Js面向对象可以通过构造函数实现封装。

同样的将变量和函数组合到了一起并能通过this实现数据的共享，所不同的是借助构造函数创建出来的实例对象之间互不影响

总结：

1. 构造函数体现了面向对象的封装特性
2. 构造函数实例创建的对象彼此独立互不影响

面向对象编程的特性：封装、继承、多态借助构造函数来实现， 构造函数存在一个`浪费内存`的问题

怎么解决浪费内存的问题。接下来我就需要了解`原型`的知识

```javascript
 <script>
    // 构造函数  公共的属性和方法 封装到 Star 构造函数里面了
    // 1.公共的属性写到 构造函数里面
    function Star(uname, age) {
      this.uname = uname
      this.age = age
      // this.sing = function () {
      //   console.log('唱歌')
      // }
    }
    // 2. 公共的方法写到原型对象身上   节约了内存
    Star.prototype.sing = function () {
      console.log('唱歌')
    }
    const ldh = new Star('刘德华', 55)
    const zxy = new Star('张学友', 58)
    ldh.sing() //调用
    zxy.sing() //调用
    // console.log(ldh === zxy)  // false
    console.log(ldh.sing === zxy.sing)

    // console.dir(Star.prototype)
  </script>
```

### 原型

#### 原型

构造函数通过原型分配的函数是所有的对象所`共享的`

javaScript规定，每一个构造函数都有一个prototype属性，指向另一个对象，所以我们也称为原型对象

这个对象可以挂载函数，对象实例化不会多次创建在原型上函数，从而了节约内存

`我们可以把那些不变的方法，直接定义在prototype对象，这样所有的对象的实例就可以共享这些方法。`

总结：

原型是什么？   一个对象，我们也称为prototype为原型对象

原型作用是什么？ 共享方法，可以把那些不变的方法，直接定义在prototype对象上

#### constructor属性

constructor属性在哪里？

每一个原型对象里面都有一个constructor属性（constructor构造函数）

作用：该属性指向该原型对象的构造函数， 简单理解，就是指向我的爸爸，我是有爸爸的孩子

<!-- 这是一张图片，ocr 内容为： -->

![](https://cdn.nlark.com/yuque/0/2023/png/34137445/1700987821200-80042753-efa9-4e9c-a29a-0c3e282f4297.png)

constructor属性使用场景：

如果有多个对象的方法，我们可以可给原型对象采取对象形式赋值，但是这样就会覆盖构造函数原型对象原来的内容，这样修改后的原型对象constructor就不再指向当前构造函数了，此时，我们可以在修改后的原型对象中，添加一个constructor指向原来的对象。

```javascript
 <script>
    // constructor  单词 构造函数

     Star.prototype.sing = function () {
       console.log('唱歌')
     }
     Star.prototype.dance = function () {
       console.log('跳舞')
     }
    function Star() {
    }
     console.log(Star.prototype)
    Star.prototype = {
      // 从新指回创造这个原型对象的 构造函数
      constructor: Star,
      sing: function () {
        console.log('唱歌')
      },
      dance: function () {
        console.log('跳舞')
      },
    }
    console.log(Star.prototype)
     console.log(Star.prototype.constructor)

     const ldh = new Star()
     console.log(Star.prototype.constructor === Star)
  </script>
```

#### 对象原型

对象原型都会有一个属性`__ _proto_ _` _指向构造函数的prototype原型对象，之所以我们对象可以使用构造函数的prototype原型对象的属性方法，就是因为对象`_ _proto __`原型的存在

```javascript
<script>
    function Star() {

    }
    const ldh = new Star()
    // 对象原型__proto__ 指向 改构造函数的原型对象
    console.log(ldh.__proto__)
    // console.log(ldh.__proto__ === Star.prototype)
    // 对象原型里面有constructor 指向 构造函数 Star
    console.log(ldh.__proto__.constructor === Star)

  </script>
```

<!-- 这是一张图片，ocr 内容为： -->

![](https://cdn.nlark.com/yuque/0/2023/png/34137445/1700987911827-bdb797bb-2ac0-4040-b60d-c92ae0b00858.png)

注意：

1、_ _ proto_ _ 是JS非标准属性

2、[[prototype]]和_ _ proto _ _ 意义相同

3、用来表明当前实例对象指向哪个原型对象prototype

4、_ _ proto _ _ 对象原型里面也有一个constructor属性，`指向创建该实例对象的构造函数`
总结：

1、prototype是什么？

+ 原型（原型对象）
+ 构造函数都自动有原型

2、constructor属性在哪里？作用是啥？

+ prototype原型和对象_ _ proto _ _ 里面都有
+ 都指向穿件实例对象/原型的构造函数

3、_ _ proto _ _属性在哪里？指向谁

+ 在实例对象里面
+ 指向原型prototype

#### 原型继承

继承是面向对象编程的一个重要的特征，通过继承进一步提升代码封装的程度，JavaScript中大多是借助对象实现继承的属性。

> 俗话说的好：龙生龙、凤生凤、老鼠的儿子会打洞，正式继承的含义

```javascript
  // 继续抽取   公共的部分放到原型上
     const Person1 = {
       eyes: 2,
      head: 1
     }
     const Person2 = {
       eyes: 2,
       head: 1
     }
    // 构造函数  new 出来的对象 结构一样，但是对象不一样
    function Person() {
      this.eyes = 2
      this.head = 1
    }
    // console.log(new Person)
    // 女人  构造函数   继承  想要 继承 Person
    function Woman() {

    }
    // Woman 通过原型来继承 Person
    // 父构造函数（父类）   子构造函数（子类）
    // 子类的原型 =  new 父类  
    Woman.prototype = new Person()   // {eyes: 2, head: 1} 
    // 指回原来的构造函数
    Woman.prototype.constructor = Woman

    // 给女人添加一个方法  生孩子
    Woman.prototype.baby = function () {
      console.log('宝贝')
    }
    const red = new Woman()
    console.log(red)
    // console.log(Woman.prototype)
    // 男人 构造函数  继承  想要 继承 Person
    function Man() {

    }
    // 通过 原型继承 Person
    Man.prototype = new Person()
    Man.prototype.constructor = Man
    const pink = new Man()
    console.log(LBB)
  </script>
```

#### 原型链

`基于原型对象的继承使得不同构造函数的原型对象关联在一起，并且这种关联的关系是一种链状的结构，我们将原型对象的链状结构关系称为原型链`

<!-- 这是一张图片，ocr 内容为： -->

![](https://cdn.nlark.com/yuque/0/2023/png/34137445/1700987986467-f1a76c18-cac9-4f96-840f-6d6cbb10d726.png)

原型链的查找规则：

1. 当范文一个对象的属性（包括方法）时，首先查找这个`对象自身`的有没有该属性。
2. 如果没有就查找它的原型(也就是`__proto___指向的prototype 原型对象`)
3. 如果还没有就查找原型对象的原型(`Object的原型对象`)
4. 一次类推一致找到Object为止(null)
5. `__proto__`对象原型的意义就在于为对象成员查找机制提供一个方向，或者说一条路线

## JavaScript高级 Day04

> 深浅拷贝 、异常处理、处理this 、 性能优化

### `赋值、深拷贝和浅拷贝`

> `JavaScript的内存空间`在JavaScript中，每一个数据都需要一个内存空间。内存空间分为两种，栈内存（stack）与堆内存（heap）栈是系统自动分配的内存空间，由系统自动释放，堆则是动态分配的内存，大小不定不会自动释放。
>
> + 基本数据类型
>   JavaScript中的基本数据类型，这些值都有固定的大小，保存在栈内存中，由系统自动分配存储空间在栈内存空间的值，我们可以直接进行操作，因此基础数据类型都是按照值访问
>   在栈内存中的数据发生复制的行为时，系统会自动为新变量开辟一个新的内存空间，当复制执行后，两个内存空间的值就互不影响，改变其中一个不会影响另一个
> + 引用数据类型
>   引用类型的值是保存在堆内存中的对象，在JavaScript中我们不能直接操作对象的堆内存空间。因为引用类型的值都是按引用访问的，所以在操作对象时，实际上是操作对象的引用而不是实际的对象。引用可以理解为保存在栈内存中的一个地址，该地址指向堆内存中的一个实际对象
>
> 引用类型值的复制，系统会为新的变量自动分配一个新的栈内存空间这个栈内存空间保存着与被复制变量相同的指针，尽管他们在栈内存中的内存空间的位置互相独立但是在堆内存中访问到的对象实际上是同一个，因此，当我们改变其中一个对象的值时，实际上就是改变原来的对象
>
> 栈内存空间保存指针（地址），堆内存空间保存实际的对象，我们通过变量访问对象时，实际上访问的是对象的引用（地址）
>
> 内存中的栈区域存放变量（基本类型的变量包括变量声明和值）以及指向堆区域存储位置的指针（引用类型的变量包括变量声明和指向内容的指针）

`赋值：两个变量的值（指针）都指向同一个对象，改变其中一个，另一个也会受到影响`

```javascript
 <script>
    const obj = {
      uname: 'pink',
      age: 18
    }
    const o = obj
    console.log(o)
    o.age = 20
    console.log(o)
    console.log(obj)
//当修改 o的时候，obj也会随着改变
  </script>
```

首先浅拷贝和深拷贝只针对想Object,Array这样的复杂对象，简单来说，浅拷贝只复制一层对象的属性，二深拷贝则复制了所有的层级。对于字符串类型，浅复制是对值的复制，对于对象来说，浅复制是对对象地址的复制，并没有开辟新的栈，也就是复制的结果是两个对象指向同一个地址，修改其中一个对象的属性，则另一个对象的属性也会 改变，而深复制则是开辟新的栈，两个对象对应两个不同的地址，修改一个对象的属性，不会改变另一个对象的属性。

`浅拷贝`

常见方法：

1. 拷贝对象：Object.assgin() / 展开运算符 {...obj} 拷贝对象
2. 拷贝数组：Array.prototype.concat() 或者 [...arr]

总结：

1、直接赋值和浅拷贝有什么区别？

直接赋值的方法，只要是对象，都会相互影响，因为是直接拷贝对象栈里面的地址

浅拷贝如果是一层对象，不相互影响，如果出现多层对象拷贝还会 相互影响

2、浅拷贝怎么理解？

拷贝对象之后，里面的属性值是简单数据类型直接拷贝值

如果属性值是引用数据类型则拷贝的是地址

`深拷贝`

常见方法：

1. 通过递归实现深拷贝
2. lodash/cloneDeep
3. 通过JSON.stringify()实现

```javascript
 <script>
    const obj = {
      uname: 'Dad',
      age: 18,
      hobby: ['乒乓球', '足球'],
      family: {
        baby: 'son'
      }
    }
    const o = {}
    // 拷贝函数
    function deepCopy(newObj, oldObj) {
      debugger
      for (let k in oldObj) {
        // 处理数组的问题  一定先写数组 在写 对象 不能颠倒
        if (oldObj[k] instanceof Array) {
          newObj[k] = []
          //  newObj[k] 接收 []  hobby
          //  oldObj[k]   ['乒乓球', '足球']
          deepCopy(newObj[k], oldObj[k])
        } else if (oldObj[k] instanceof Object) {
          newObj[k] = {}
          deepCopy(newObj[k], oldObj[k])
        }
        else {
          //  k  属性名 uname age    oldObj[k]  属性值  18
          // newObj[k]  === o.uname  给新对象添加属性
          newObj[k] = oldObj[k]
        }
      }
    }
    deepCopy(o, obj) // 函数调用  两个参数 o 新对象  obj 旧对象
    console.log(o)
    o.age = 20
    o.hobby[0] = '篮球'
    o.family.baby = '老baby'
    console.log(obj)
    console.log([1, 23] instanceof Object)
    // 复习
    // const obj = {
    //   uname: 'pink',
    //   age: 18,
    //   hobby: ['乒乓球', '足球']
    // }
    // function deepCopy({ }, oldObj) {
    //   // k 属性名  oldObj[k] 属性值
    //   for (let k in oldObj) {
    //     // 处理数组的问题   k 变量
    //     newObj[k] = oldObj[k]
    //     // o.uname = 'pink'
    //     // newObj.k  = 'pink'
    //   }
    // }
// lodash/cloneDeep 
 const o = _.cloneDeep(obj)
    console.log(o)


  </script>
```

### this

> 了解函数中 this 在不同场景下的默认值，知道动态指定函数 this 值的方法。

#### 1.1 默认值

`this` 是 JavaScript 最具“魅惑”的知识点，不同的应用场合 `this` 的取值可能会有意想不到的结果，在此我们对以往学习过的关于【 `this` 默认的取值】情况进行归纳和总结。

##### 普通函数

**普通函数**的调用方式决定了 `this` 的值，即【谁调用 `this` 的值指向谁】，如下代码所示：

```html
<script>
  // 普通函数
  function sayHi() {
    console.log(this)  
  }
  // 函数表达式
  const sayHello = function () {
    console.log(this)
  }
  // 函数的调用方式决定了 this 的值
  sayHi() // window
  window.sayHi()


// 普通对象
  const user = {
    name: '小明',
    walk: function () {
      console.log(this)
    }
  }
  // 动态为 user 添加方法
  user.sayHi = sayHi
  uesr.sayHello = sayHello
  // 函数调用方式，决定了 this 的值
  user.sayHi()
  user.sayHello()
</script>
```

注： 普通函数没有明确调用者时 `this` 值为 `window`，严格模式下没有调用者时 `this` 的值为 `undefined`。

##### 箭头函数

**箭头函数**中的 `this` 与普通函数完全不同，也不受调用方式的影响，事实上箭头函数中并不存在 `this` ！箭头函数中访问的 `this` 不过是箭头函数所在作用域的 `this` 变量。

```html
<script>
  
  console.log(this) // 此处为 window
  // 箭头函数
  const sayHi = function() {
    console.log(this) // 该箭头函数中的 this 为函数声明环境中 this 一致
  }
  // 普通对象
  const user = {
    name: '小明',
    // 该箭头函数中的 this 为函数声明环境中 this 一致
    walk: () => {
      console.log(this)
    },
  
    sleep: function () {
      let str = 'hello'
      console.log(this)
      let fn = () => {
        console.log(str)
        console.log(this) // 该箭头函数中的 this 与 sleep 中的 this 一致
      }
      // 调用箭头函数
      fn();
    }
  }

  // 动态添加方法
  user.sayHi = sayHi
  
  // 函数调用
  user.sayHi()
  user.sleep()
  user.walk()
</script>
```

在开发中【使用箭头函数前需要考虑函数中 `this` 的值】，**事件回调函数**使用箭头函数时，`this` 为全局的 `window`，因此DOM事件回调函数不推荐使用箭头函数，如下代码所示：

```html
<script>
  // DOM 节点
  const btn = document.querySelector('.btn')
  // 箭头函数 此时 this 指向了 window
  btn.addEventListener('click', () => {
    console.log(this)
  })
  // 普通函数 此时 this 指向了 DOM 对象
  btn.addEventListener('click', function () {
    console.log(this)
  })
</script>
```

同样由于箭头函数 `this` 的原因，**基于原型的面向对象也不推荐采用箭头函数**，如下代码所示：

```html
<script>
  function Person() {
  }
  // 原型对像上添加了箭头函数
  Person.prototype.walk = () => {
    console.log('人都要走路...')
    console.log(this); // window
  }
  const p1 = new Person()
  p1.walk()
</script>
```

#### this指向

以上归纳了普通函数和箭头函数中关于 `this` 默认值的情形，不仅如此 JavaScript 中还允许指定函数中 `this` 的指向，有 3 个方法可以动态指定普通函数中 `this` 的指向：

##### call

使用 `call` 方法调用函数，同时指定函数中 `this` 的值，使用方法如下代码所示：

```html
<script>
  // 普通函数
  function sayHi() {
    console.log(this);
  }

  let user = {
    name: '小明',
    age: 18
  }

  let student = {
    name: '小红',
    age: 16
  }

  // 调用函数并指定 this 的值
  sayHi.call(user); // this 值为 user
  sayHi.call(student); // this 值为 student

  // 求和函数
  function counter(x, y) {
    return x + y;
  }

  // 调用 counter 函数，并传入参数
  let result = counter.call(null, 5, 10);
  console.log(result);
</script>
```

总结：

1. `call` 方法能够在调用函数的同时指定 `this` 的值
2. 使用 `call` 方法调用函数时，第1个参数为 `this` 指定的值
3. `call` 方法的其余参数会依次自动传入函数做为函数的参数

##### apply

使用 `call` 方法**调用函数**，同时指定函数中 `this` 的值，使用方法如下代码所示：

```html
<script>
  // 普通函数
  function sayHi() {
    console.log(this)
  }

  let user = {
    name: '小明',
    age: 18
  }

  let student = {
    name: '小红',
    age: 16
  }

  // 调用函数并指定 this 的值
  sayHi.apply(user) // this 值为 user
  sayHi.apply(student) // this 值为 student

  // 求和函数
  function counter(x, y) {
    return x + y
  }
  // 调用 counter 函数，并传入参数
  let result = counter.apply(null, [5, 10])
  console.log(result)
</script>
```

总结：

1. `apply` 方法能够在调用函数的同时指定 `this` 的值
2. 使用 `apply` 方法调用函数时，第1个参数为 `this` 指定的值
3. `apply` 方法第2个参数为数组，数组的单元值依次自动传入函数做为函数的参数

##### bind

`bind` 方法并**不会调用函数**，而是创建一个指定了 `this` 值的新函数，使用方法如下代码所示：

```html
<script>
  // 普通函数
  function sayHi() {
    console.log(this)
  }
  let user = {
    name: '小明',
    age: 18
  }
  // 调用 bind 指定 this 的值
  let sayHello = sayHi.bind(user);
  // 调用使用 bind 创建的新函数
  sayHello()
</script>
```

注：`bind` 方法创建新的函数，与原函数的唯一的变化是改变了 `this` 的值。

### 四、防抖节流

1. 防抖（debounce）
   所谓防抖，就是指触发事件后在 n 秒内函数只能执行一次，如果在 n 秒内又触发了事件，则会重新计算函数执行时间
2. 节流（throttle）
   所谓节流，就是指连续触发事件但是在 n 秒中只执行一次函数

```javascript
 <div class="box"></div>
  <script>
    const box = document.querySelector('.box')
    let i = 1  // 让这个变量++
    // 鼠标移动函数
    function mouseMove() {
      box.innerHTML = ++i
      // 如果里面存在大量操作 dom 的情况，可能会卡顿
    }
    // 防抖函数
    function debounce(fn, t) {
      let timeId
      return function () {
        // 如果有定时器就清除
        if (timeId) clearTimeout(timeId)
        // 开启定时器 200
        timeId = setTimeout(function () {
          fn()
        }, t)
      }
    }
    // box.addEventListener('mousemove', mouseMove)
    box.addEventListener('mousemove', debounce(mouseMove, 200))

  </script>
```

```javascript
const box = document.querySelector('.box')
    let i = 1  // 让这个变量++
    // 鼠标移动函数
    function mouseMove() {
      box.innerHTML = ++i
      // 如果里面存在大量操作 dom 的情况，可能会卡顿
    }

    // box.addEventListener('mousemove', mouseMove)
    // lodash 节流写法
    // box.addEventListener('mousemove', _.throttle(mouseMove, 500))
    // lodash 防抖的写法
    box.addEventListener('mousemove', _.debounce(mouseMove, 500))
```

Welcome to my blog! This is a markdown file.

## Features

- Vue 3
- TypeScript
- Element Plus
- Less
