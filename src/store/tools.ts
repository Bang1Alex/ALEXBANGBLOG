import { defineStore } from 'pinia'

export const useToolsStore = defineStore('tools', {
  state: () => ({
    tools: [
      { 
        id: 'HuarongRoad', 
        name: 'Huarong Road', 
        description: 'A classic sliding block puzzle game.',
        icon: 'Grid'
      },
      { 
        id: 'paperCut', 
        name: 'Paper Cut', 
        description: 'A tool to cut paper into different shapes.',
        icon: 'Cut'
      },
      { 
        id: 'MindMap', 
        name: 'Mind Map', 
        description: 'A tool to create and visualize mind maps.',
        icon: 'Map'
      }
    ]
  }),
  actions: {
    getToolById(id: string) {
      return this.tools.find(tool => tool.id === id)
    }
  }
})
