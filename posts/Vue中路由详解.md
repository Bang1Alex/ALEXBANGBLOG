----
summary: Vue中路由的详细说明，包括路由的基本概念、基本使用、路由的注意点、路由的多级路由等。
title: Vue中路由详解
date: 2024-11-09
tags: [Vue, VueRouter]
----


#  什么是路由？
1. 理解：一个路由（route）就是一组映射关系（key-value）,多个路由器需要路由器进行管理。
2. 前端路由：key是路径，value是组件

### 基本使用

1. 安装vue-router， 命令：`npm i vue-router@3` 

2. 应用插件: `Vue.use(VueRouter)`

3. 编写router配置项：

   ~~~js
   //引入VueRouter 
   import VueRouter from 'vue-router'
   //引入路由组件
   import About from '../components/About'
   import Home from '../components/Home'
   //创建router 实例对象 去管理一组 路由规则
   const router =  new Vuerouter({
       routers:[
           {
               path:'/about',
               component:About
           },
           {
               path:'/home',
               component:Home
           }
       ]
   })
   
   // 暴露 touter
   export default router
   ~~~

4. 实现切换（active-class可配置高亮显示）

   ~~~html
   <router-link active-class="active"  to='/about'></router-link>
   ~~~

5. 指定展示位置

   ~~~ html
   <router-view></router-view>
   ~~~

### 几个注意点

1. 路由组件通常存放在`pages`文件中，一般 组件通常存放在`components`文件夹。
2. 通过切换，“隐藏”了的路由组件，默认是被销毁的，需要的时候再去挂载。
3. 每一个组件都有一个自己的`$route`属性，里面存储着自己的路由信息
4. 整个应用只有一个router，可以通过组件的`$router`属性获取到

### 多级路由（嵌套路由）

1. 配置路由规则，使用childer配置项：

~~~js
   routers：[
       {
           path:'/about',
           component:About,
       },
       {
           path：'/home',
           component:Home,
           children:[//通过children配置子级路由
           //通过children配置子级路由
           {
           path:'nes', //此处一定不要写：/news
           compoinent:News
           },
       	{
               path:'message',
               component:Message//此处一定不要写：/message
           },
       }
           ]
       }
   ]
~~~

2. 跳转（要写完整的路径）

   ~~~js
   <router-link to='/home/news'>News</router-link>
   ~~~

### 路由的query参数

1. 传递参数

   ~~~js
   <router-link :to="/home/message/detail?id=666&title=你好" >跳转</router-link>
   
   //跳转并携带query出纳参数，to的对象写法
   <router-link
   	:to="{
   	path:'/home/message/detail',
       query:{
           id:666,
           title:'你好'
       }
   }"
   >跳转</router-link>
   ~~~

2. 接收参数：
~~~js
   $router.query.id
   $router.query.title
~~~

### 命名路由
1. 作用：可以简化路由的跳转

2. 如何使用

   1. 给路由命名

      ~~~js
      {
          path:'/demo',
              component:Demo,
              children:[
                  {
                      path:'test',
                      component:Test,
                      children:[
                          {
                              name:'hello' //给路由命名
                              path:'welcome',
                              component:Hello
                          }
                      ]
                  }
              ]
      }
2. 简化路由跳转

~~~ js
      //简化前  需要写完整路径
      <router-link to="/demo/test/welcome">跳转</router-link>
      
      //简化后 直接通过name跳转
      <router-link :to="{name:'hello'}">跳转</router-link>
      
      //简化写法配合传递参数
      
      <router-link :to="{
      	name:'hello',
              query:{
                  id:666,
                  title:'你好'
              }
      }">跳转</router-link>
   ~~~
### 路由的params参数

1. 配置路由，声明接收的参数



```go
 {
   	path:'/home',
   	component:Home,
   	children:[
   		{
   			path:'news',
   			component:News
   		},
   		{
   			component:Message,
   			children:[
   				{
   					name:'xiangqing',
   					path:'detail/:id/:title', //使用占位符声明接收params参数
   					component:Detail
   				}
   			]
   		}
   	]
   }
```

2. 传递参数

   ~~~js
   <!-- 跳转并携带params参数，to的字符串写法 -->
   <router-link :to="/home/message/detail/666/你好">跳转</router-link>
   				
   <!-- 跳转并携带params参数，to的对象写法 -->
   <router-link 
   	:to="{
   		name:'xiangqing',
   		params:{
   		   id:666,
               title:'你好'
   		}
   	}"
   >跳转</router-link>
   
   #特别注意：路由携带params参数时，使用to的对象写法，则不能使用path配置项，必须使用name配置！
   ~~~

3. 接收参数
~~~js
   $route.params.id
   $route.params.title
~~~



### 跳转+传参 总结

 **path 跳转：**

​      `1.params传参：`

~~~html
	格式：<router-link to="detail/2">娱乐新闻</router-link>
~~~

​       注意：path跳转 params传参 不写占位符 获取不到传递的参数，写了占位符可以通过$route.params.id进行获取，

​      `2.query传参：`

   ~~~html
	格式：  <router-link to="detail/?id=1">军事新闻</router-link>
   ~~~

​       	注意:query跳转不需要写占位符，

   **name 跳转：**

​      `1.params传参：`

​          格式：

   ~~~html
   <router-link
        :to="{
          name: 'Detail'
          params: {
            id: 1,
           },
        }"
        \>军事新闻</router-link>
   ~~~

​       `注意：name进行跳转， 不写占位符可以 获取参数 但是 当页面刷新的时候，参数丢失`

​      `2.query传参:`

```html
    格式：  
		<router-link
   		 :to="{
      	 name: 'Detail'
     	 query: {
       	 id: 1,
      	 },
    	}"
   		 \>军事新闻</router-link>
```

​          注意:query跳转不需要写占位符，

### 路由的props的配置

作用：让路由更方便的接收到参数

~~~js
{
	name:'xiangqing',
	path:'detail/:id',
	component:Detail,

	//第一种写法：props值为对象，该对象中所有的key-value的组合最终都会通过props传给Detail组件
	// props:{a:900}

	//第二种写法：props值为布尔值，布尔值为true，则把路由收到的所有params参数通过props传给Detail组件
	// props:true
	
	//第三种写法：props值为函数，该函数返回的对象中每一组key-value都会通过props传给Detail组件
	props(route){
		return {
			id:route.query.id,
			title:route.query.title
		}
	}
}
~~~
### 路由懒加载
> 路由懒加载（lazy-loader）：建议这种写法，在代码编译的时候不会把这个组件编译到主文件中，会单独生成一个文件。在需要的时候在加载，这样子可以减小主文件的大小
~~~js
{
      name: "List",
      path: "/list",
      meta: {
        needLogin: true, // 通过自定义属性设置user页面需要登录才能访问
      },
      component: () => import("./views/List.vue"), 
    },

~~~


### ```<router-link>```的replace属性

1. 作用：控制路由跳转时操作浏览器历史记录的模式
2. 浏览器的历史记录有两种方式：分别为`push`和`replace`是追加历史记录，`replace`是替换当前记录。路由跳转时候默认任务是push
3. 如何开启```replace```模式：```<router-link replace .......>News</router-link>```

### 编程式路由导航

1. 作用：不借助 `<router-link>`实现路由跳转，让路由跳转更加灵活

2. 具体编码

   ~~~js
   //$router的两个API
   this.$router.push({
   	name:'xiangqing',
   		params:{
   			id:xxx,
   			title:xxx
   		}
   })
   
   this.$router.replace({
   	name:'xiangqing',
   		params:{
   			id:xxx,
   			title:xxx
   		}
   })
   this.$router.forward() //前进
   this.$router.back() //后退
   this.$router.go() //可前进也可后退
   ~~~


### `$router`和`$route`的区别

#### **1、route对象**
 route是一个跳转的路由对象，每一个路由都会一个route对象，是一个局部的对象，标识当前的路由信息，包含当前URL解析的带的信息，包含当前的路径、参数、query对象等。
![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/abfd5cc9018016c325c4b9ff6d84e37f.png)

- $route.path： 字符串，对应当前路由的路径，总是解析为绝对路径，如/foo/bar。
-  $route.params： 一个 key/value 对象，包含了 动态片段 和 全匹配片段，如果没有路由参数，就是一个空对象。
- $route.query： 一个 key/value 对象，表示 URL 查询参数。例如，对于路径 /foo?user=1，则有$route.query.user == 1，如果没有查询参数，则是个空对象。
- $route.hash： 当前路由的hash值 (不带#) ，如果没有 hash 值，则为空字符串。锚点*
- $route.fullPath： 完成解析后的 URL，包含查询参数和hash的完整路径。
- $route.matched： 数组，包含当前匹配的路径中所包含的所有片段所对应的配置参数对象。
- $route.name： 当前路径名字
- $route.meta： 路由元信息


#### **2、router对象**
>
>router对象是全局路由的实例，是router构造方法的实例。router是VueRouter的一个对象，通过>Vue.use(VueRouter)和Vue构造函数得到一个router的实例对象，包含了所有的路由还有许多关键的> > 对象和属性。
>
![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/2730486d8dd5fcb79db5a808c28c7ad8.png)
>在使用$router.push的时候，实质上是在history栈中添加一个路由。
>
>切换路由的时候实质是添加一个新的记录。而$router.replace则是替换路由，不会有历史记录。


### 缓存路由组件

1. 作用：不展示的路由组件保持挂载，不被销毁。

2. 具体编码：

   ~~~js
   <keep-alive include="News"> 
       <router-view></router-view>
   </keep-alive>
   ~~~

### 两个新的生命周期钩子

1. 作用：路由组件所独有的两个钩子，用于捕获路由组件的激活状态。
2. 具体名字：
   1. `activated`路由组件被激活事触发
   2. `deactivated`路由组件失活时触发。



### 路由守卫

1. 作用：对路由进行权限控制

2. 分类：全局守卫（`beforEach、beforeafter`）、独享守卫(`beforeEnter`)、组件内守卫（`beforeRouteEnter、beforeRouteLeave`）

3. 全局守卫
~~~js
   //全局前置守卫：初始化时执行、每次路由切换前执行
   router.beforeEach((to,from,next)=>{
   	console.log('beforeEach',to,from)
   	if(to.meta.isAuth){ //判断当前路由是否需要进行权限控制
   		if(localStorage.getItem('school') === 'atguigu'){ //权限控制的具体规则
   			next() //放行
   		}else{
   			alert('暂无权限查看')
   			// next({name:'guanyu'})
   		}
   	}else{
   		next() //放行
   	}
   })
   
   //全局后置守卫：初始化时执行、每次路由切换后执行
   router.afterEach((to,from)=>{
   	console.log('afterEach',to,from)
   	if(to.meta.title){ 
   		document.title = to.meta.title //修改网页的title
   	}else{
   		document.title = 'vue_test'
   	}
   })
~~~

4. 独享守卫

~~~js
   beforeEnter(to,from,next){
   	console.log('beforeEnter',to,from)
   	if(to.meta.isAuth){ //判断当前路由是否需要进行权限控制
   		if(localStorage.getItem('school') === 'atguigu'){
   			next()
   		}else{
   			alert('暂无权限查看')
   			// next({name:'guanyu'})
   		}
   	}else{
   		next()
   	}
   }
~~~

5. 组件内守卫

   ~~~js
   //进入守卫：通过路由规则，进入该组件时被调用
   beforeRouteEnter (to, from, next) {
   },
   //离开守卫：通过路由规则，离开该组件时被调用
   beforeRouteLeave (to, from, next) {
   }
###  路由器的三种种工作模式


可以通过mode属性更改Vue中的路由的工作模式
![路由的三种模式](https://i-blog.csdnimg.cn/blog_migrate/cf0b1bb2b1e5edc1d133e2bad4dc27ba.png)

对于一个url来说，什么是hash值？    #及其后面的内容就是hash值

hash值不会包含在HTTP请求中，即：hash值不会带给服务器。



 	1.hash模式：
			   1. 地址永远带着#，不美观
			   2. 若以后将地址通过第三方手机app分享，若app校验严格，则地址被标记不合法
			   3. 兼容性比较好

 	2.history模式：
 	    1. 地址干净，美观 。
   		2. 兼容性和hash模式相比略差。
        3. 应用部署上线时需要后端人员支持，解决刷新页面服务端404的问题。 
 3.abstract模式 ：
			  支持所有JavaScript 运行环境 ，如 Node.js 服务器端。如果发现没有浏览器的 API 。路由会自动强制进入这个模式
