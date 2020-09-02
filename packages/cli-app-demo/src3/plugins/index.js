import Element from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import { router } from './router'
import { http } from './http'
import { store } from './store'

const initPlugin = Vue => {
  const mount = {
    Vue,
    $vue: Vue.prototype,
  }

  mount.router = router(mount)
  mount.http = http(mount)
  mount.store = store(mount)

  // 挂载Vue实例，方便调用
  Object.keys(mount).forEach(key => {
    if (['router'].includes(key)) return // router 这里不需要挂载
    Vue.prototype[`$${key}`] = mount[key]
  })

  Vue.use(Element, { size: 'medium' })

  return mount
}

export default initPlugin
