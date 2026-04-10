----
title: Promise简单理解
summary: Promise的简单理解，包括基本概念、基本使用、基本注意事项。
date: 2024-9-29
tags: [Promise]
----
# Promise
Promise 是异步编程的一种解决方案，比传统的解决方案——回调函数和事件——更合理和更强大。它由社区最早提出和实现，ES6 将其写进了语言标准，统一了用法，原生提供了`Promise`对象。

所谓`Promise`，简单说就是一个容器，里面保存着某个未来才会结束的事件（通常是一个异步操作）的结果。从语法上说，Promise 是一个对象，从它可以获取异步操作的消息。Promise 提供统一的 API，各种异步操作都可以用同样的方法进行处理。

`Promise`对象有以下两个特点。

（1）对象的状态不受外界影响。`Promise`对象代表一个异步操作，有三种状态：`pending`（进行中）、`fulfilled`（已成功）和`rejected`（已失败）。只有异步操作的结果，可以决定当前是哪一种状态，任何其他操作都无法改变这个状态。这也是`Promise`这个名字的由来，它的英语意思就是“承诺”，表示其他手段无法改变。

（2）一旦状态改变，就不会再变，任何时候都可以得到这个结果。`Promise`对象的状态改变，只有两种可能：从`pending`变为`fulfilled`和从`pending`变为`rejected`。只要这两种情况发生，状态就凝固了，不会再变了，会一直保持这个结果，这时就称为 resolved（已定型）。如果改变已经发生了，你再对`Promise`对象添加回调函数，也会立即得到这个结果。这与事件（Event）完全不同，事件的特点是，如果你错过了它，再去监听，是得不到结果的。


有了`Promise`对象，就可以将异步操作以同步操作的流程表达出来，避免了层层嵌套的回调函数。此外，`Promise`对象提供统一的接口，使得控制异步操作更加容易。

`Promise`也有一些缺点。
- 首先，无法取消`Promise`，一旦新建它就会立即执行，无法中途取消。
- 其次，如果不设置回调函数，`Promise`内部抛出的错误，不会反应到外部。
- 第三，当处于`pending`状态时，无法得知目前进展到哪一个阶段（刚刚开始还是即将完成）。

如果某些事件不断地反复发生，一般来说，使用 [Stream](https://nodejs.org/api/stream.html) 模式是比部署`Promise`更好的选择。
 ## Promise的基本使用
  ### 一、传统用法
  
```js
 const p1 = new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
            resolve(image);
        };
        image.onerror = () => {
            reject(new Error('Could not load image'));
        };
        image.src = 'https://gips3.baidu.com/it/u=3732737575,1337431568&fm=3028&app=3028&f=JPEG&fmt=auto&q=100&size=f1440_2560';
     });
     // then接收两个参数 一个onFulfilled(成功之后的回调) 另一个是onReject(失败时候的回调)
    p1.then(
        (res)=>{console.log(res)},
        (err)=>{console.log(err)}
    );
    //失败时候的回调 也可以catch进行接收
  p1
    .then((res)=>{console.log(res)})
    .catch((err)=>{console.log(err)})
    .finally(()=>{console.log('无论成功还是失败finally函数都会执行')});
```

### 二 、结合 async && await 使用


  ```js
     const p1 = new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => {
                resolve(image);
            };
            image.onerror = () => {
                reject(new Error('Could not load image'));
            };
            image.src = 'https://gips3.baidu.com/it/u=3732737575,1337431568&fm=3028&app=3028&f=JPEG&fmt=auto&q=100&size=f1440_2560';
         });
     async function test() {
        const image = await p1;
        console.log(image);
     }
    test();
```
## Promise的四大方法
### 1、 Promise.all()
> Promise.all()方法用于将多个 Promise 实例，包装成一个新的 Promise 实例,当所有都返回状态都变成`fulfilled`，则执行Promise.all成功之后的回调，若其中有一个变为`rejected`，会调用`Promise.all`方法失败后的回调函数。


```js
    // 异步加载多张图片，等所有图片全部加载完毕在进行渲染
   const images = [
        'https://www.baidu.com/img/bd_logo1.png',
        'https://www.baidu.com/img/bd_logo1.png',
        'https://www.baidu.com/img/bd_logo1.png',
        'https://www.baidu.com/img/bd_logo1.png',
        'https://www.baidu.com/img/bd_logo1.png',
    ]
    const newImages = images.map(img=>{
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.src = img;
            image.onload = function() {
                resolve(image);
            }
            image.onerror = function() {
                reject(new Error('Could not load image at ' + img));
            }
        });
    });
    Promise.all(newImages).then((images) => {
        images.forEach((image) => {
            document.body.appendChild(image);
        });
    }).catch((error) => {
        console.log(error);
    });
```
### 2、 Promise.race()
> Promise.race()方法同样是将多个 Promise 实例，包装成一个新的 Promise 实例。`race`有赛跑的意思，看多个Promise实例中谁跑的最快`(即谁的状态先发生改变，从pending->fulfilled 或pending->rejected)`这个时候不看它是成功还是失败，只要跑的快。

````js
  const images = [
        'https://www.baidu.com/img/bd_logo1.png',
        'https://www.baidu.com/img/bd_logo2.png',
        'https://www.baidu.com/img/bd_logo3.png',
    ]
    const newImages = images.map((img,index)=>{
        return new Promise((resolve, reject) => {
           if(index ==1) setTimeout(() => resolve(img), 1000);
           if(index ==2) setTimeout(() => resolve(img), 2000);
           if(index ==0) setTimeout(() => resolve(img), 3000);
        });
    });
    Promise.race(newImages).then((images) => {
        console.log(images); // https://www.baidu.com/img/bd_logo2.png  1s后输出
    }).catch((error) => {
        console.log(error);
    });
````
### 3、 Promse.allSettled
>  有时候，我们希望等到一组异步操作都结束了，不管每一个操作是成功还是失败，再进行下一步操作。> 但是，现有的 Promise 方法很难实现这个要求。
> `Promise.all()`方法只适合所有异步操作都成功的情况，如果有一个操作失败，就无法满足要求。

```js
const urls = [url_1, url_2, url_3];
const requests = urls.map(x => fetch(x));

try {
  await Promise.all(requests);
  console.log('所有请求都成功。');
} catch {
  console.log('至少一个请求失败，其他请求可能还没结束。');
}

```
`Promise.all()`可以确定所有请求都成功了，但是只要有一个请求失败，它就会报错，而不管另外的请求是否结束。

Promise.allSettled()方法，用来确定一组异步操作是否都结束了（不管成功或失败）。所以，它的名字叫做”Settled“，包含了”fulfilled“和”rejected“两种情况。

```js
 const newImages = images.map(img=>{
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.src = img;
            image.onload = function() {
                resolve(image);
            }
            image.onerror = function() {
                reject(new Error('Could not load image at ' + img));
            }
        });
    });
    Promise.allSettled(newImages).then((images) => {
        console.log(images);
        /** 
        images对象是一个数组，每一项包含对应的状态，以及对应的返回值，
         可以根据状态过滤出成功项有哪些。
        [
            {
                "status": "fulfilled",
                "value": {}
            },
            {
                "status": "fulfilled",
                "value": {}
            },
            {
                "status": "fulfilled",
                "value": {}
            },
            {
                "status": "rejected",
                "reason": {}
            },
            {
                "status": "fulfilled",
                "value": {}
            }
        ]
        **/
    }).catch((error) => {
        console.log(error);
    });
```

### 4、Promise.any()
> Promise.any()方法。该方法接受一组 Promise 实例作为参数，包装成一个新的 Promise 实例返回。只要参数有一个变成fulfilled状态，包装实例就会变成fullfilled状态；如果所有参数实例都变成rejected状态，包装实例就会变成rejected状态。(有点像数组中some方法)


```js
 const images = [
        'https://www.baidu.com/img/bd_logo1.png',
        'https://www.baidu.com/img/bd_logo1.png',
        'https://www.baidu.com/img/bd_logo1.png',
        'https://www.baidu.com/img/bd_logo1.png',
        'https://www.baidu.com/img/bd_logo1.png',
    ]
    const newImages = images.map(img=>{
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.src = img;
            image.onload = function() {
                resolve(image);
            }
            image.onerror = function() {
                reject(new Error('Could not load image at ' + img));
            }
        });
    });
    Promise.any(newImages).then((images) => {
        console.log(images);
    }).catch((error) => {
        console.log(error);
    });
```
## Promise源码
写一个简易的Promise，有问题还请各位大佬批评指正

```js
class MyPromise {
    constructor(executor) {
        this.state = 'pending';  // 初始状态
        this.value = undefined;  // 存储结果或错误
        this.onFulfilledCallbacks = [];  // 成功回调队列
        this.onRejectedCallbacks = [];   // 失败回调队列

        const resolve = (value) => {
            if (this.state !== 'pending') return;
            this.state = 'fulfilled';
            this.value = value;
            this.onFulfilledCallbacks.forEach(callback => callback(value));
        };

        const reject = (reason) => {
            if (this.state !== 'pending') return;
            this.state = 'rejected';
            this.value = reason;
            this.onRejectedCallbacks.forEach(callback => callback(reason));
        };

        try {
            executor(resolve, reject);
        } catch (error) {
            reject(error);
        }
    }

    then(onFulfilled, onRejected) {
        return new MyPromise((resolve, reject) => {
            const handleFulfilled = (value) => {
                try {
                    if (typeof onFulfilled === 'function') {
                        const result = onFulfilled(value);
                        resolve(result);
                    } else {
                        resolve(value);
                    }
                } catch (error) {
                    reject(error);
                }
            };

            const handleRejected = (reason) => {
                try {
                    if (typeof onRejected === 'function') {
                        const result = onRejected(reason);
                        resolve(result);
                    } else {
                        reject(reason);
                    }
                } catch (error) {
                    reject(error);
                }
            };

            if (this.state === 'fulfilled') {
                setTimeout(() => handleFulfilled(this.value), 0);
            } else if (this.state === 'rejected') {
                setTimeout(() => handleRejected(this.value), 0);
            } else {
                this.onFulfilledCallbacks.push(value => handleFulfilled(value));
                this.onRejectedCallbacks.push(reason => handleRejected(reason));
            }
        });
    }

    // 静态方法：所有 Promise 都成功时返回结果数组
    static all(promises) {
        return new MyPromise((resolve, reject) => {
            const results = [];
            let completed = 0;
            const total = promises.length;

            if (total === 0) {
                resolve([]);
                return;
            }

            promises.forEach((promise, index) => {
                MyPromise.resolve(promise)
                    .then(value => {
                        results[index] = value;
                        completed++;
                        if (completed === total) {
                            resolve(results);
                        }
                    })
                    .catch(error => reject(error));
            });
        });
    }

    // 静态方法：返回第一个成功的 Promise 的值
    static any(promises) {
        return new MyPromise((resolve, reject) => {
            let rejectedCount = 0;
            const errors = [];

            if (promises.length === 0) {
                reject(new Error('All promises were rejected'));
                return;
            }

            promises.forEach((promise, index) => {
                MyPromise.resolve(promise)
                    .then(value => resolve(value))
                    .catch(error => {
                        errors[index] = error;
                        rejectedCount++;
                        if (rejectedCount === promises.length) {
                            reject(errors);
                        }
                    });
            });
        });
    }

    // 静态方法：等待所有 Promise 完成，无论成功或失败
    static allSettled(promises) {
        return new MyPromise((resolve) => {
            const results = [];
            let completed = 0;
            const total = promises.length;

            if (total === 0) {
                resolve([]);
                return;
            }

            promises.forEach((promise, index) => {
                MyPromise.resolve(promise)
                    .then(value => {
                        results[index] = { status: 'fulfilled', value };
                    })
                    .catch(reason => {
                        results[index] = { status: 'rejected', reason };
                    })
                    .then(() => {
                        completed++;
                        if (completed === total) {
                            resolve(results);
                        }
                    });
            });
        });
    }

    // 静态方法：返回第一个完成的 Promise 的结果（无论成功或失败）
    static race(promises) {
        return new MyPromise((resolve, reject) => {
            if (promises.length === 0) {
                return;
            }

            promises.forEach(promise => {
                MyPromise.resolve(promise)
                    .then(value => resolve(value))
                    .catch(error => reject(error));
            });
        });
    }

    // 辅助方法：将值包装成 Promise
    static resolve(value) {
        if (value instanceof MyPromise) return value;
        return new MyPromise(resolve => resolve(value));
    }

    // 辅助方法：创建一个 rejected 状态的 Promise
    static reject(reason) {
        return new MyPromise((_, reject) => reject(reason));
    }
}

// 测试代码
const p1 = new MyPromise(resolve => setTimeout(() => resolve('p1'), 1000));
const p2 = new MyPromise(resolve => setTimeout(() => resolve('p2'), 500));
const p3 = new MyPromise((_, reject) => setTimeout(() => reject('p3 error'), 800));

// 测试 Promise.all
MyPromise.all([p1, p2])
    .then(results => console.log('all:', results))
    .catch(error => console.log('all error:', error));

// 测试 Promise.any
MyPromise.any([p3, p1])
    .then(result => console.log('any:', result))
    .catch(errors => console.log('any errors:', errors));

// 测试 Promise.allSettled
MyPromise.allSettled([p1, p3])
    .then(results => console.log('allSettled:', results));

// 测试 Promise.race
MyPromise.race([p2, p3])
    .then(result => console.log('race:', result))
    .catch(error => console.log('race error:', error));
```