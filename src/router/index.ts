import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import Home from '@/pages/Home.vue'
import Blog from '@/pages/Blog.vue'
import Post from '@/pages/Post.vue'
import Tools from '@/pages/Tools.vue'
import ToolDetail from '@/pages/ToolDetail.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/blog',
    name: 'Blog',
    component: Blog
  },
  {
    path: '/blog/:id',
    name: 'Post',
    component: Post
  },
  {
    path: '/tools',
    name: 'Tools',
    component: Tools
  },
  {
    path: '/tools/:id',
    name: 'ToolDetail',
    component: ToolDetail
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
