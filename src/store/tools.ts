import { defineStore } from 'pinia'

export const useToolsStore = defineStore('tools', {
  state: () => ({
    tools: [
      { 
        id: 'HuarongRoad', 
        name: 'Huarong Road', 
        description: 'A classic sliding block puzzle game.',
        icon: 'Grid'
      }
    ]
  }),
  actions: {
    getToolById(id: string) {
      return this.tools.find(tool => tool.id === id)
    }
  }
})
