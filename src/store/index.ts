import {defineStore} from 'pinia'

export const globalStore = defineStore('global', {
  state: () => ({
    isVisibleParticleEffect:true,
  }),
  actions: {
    setParticleEffect(value: boolean) {
      this.isVisibleParticleEffect = value
    }
  }
})
