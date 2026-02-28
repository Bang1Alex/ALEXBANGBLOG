import { defineStore } from 'pinia'

export const useBlogStore = defineStore('blog', {
  state: () => ({
    posts: [
      { id: '1', title: 'Hello World', date: '2023-10-01', summary: 'My first post.' },
      { id: '2', title: 'Vue 3 Tips', date: '2023-10-05', summary: 'Some useful tips for Vue 3 development.' }
    ]
  }),
  actions: {
    getPostById(id: string) {
      return this.posts.find(post => post.id === id)
    }
  }
})
