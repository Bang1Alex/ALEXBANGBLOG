import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import * as AntdIcons from '@ant-design/icons-vue'
import { MotionPlugin } from 'motion-v'
import App from './App.vue'
import router from './router'
import './style.css'
import './styles/global.less'
import './styles/markdownTheme/z-blue.less'


const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(Antd)
app.use(MotionPlugin)

// Register all icons
for (const [key, component] of Object.entries(AntdIcons)) {
  app.component(key, component)
}

app.mount('#app')
