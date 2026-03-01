import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import * as AntdIcons from '@ant-design/icons-vue'
import App from './App.vue'
import router from './router'
import './styles/global.less'
import './styles/markdownTheme/chocolate.less'

const app = createApp(App)
console.log(1);

app.use(createPinia())
app.use(router)
app.use(Antd)

// Register all icons
for (const [key, component] of Object.entries(AntdIcons)) {
  app.component(key, component)
}

app.mount('#app')
