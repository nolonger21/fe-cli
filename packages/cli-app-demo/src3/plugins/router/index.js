import Router from 'vue-router'
import notFound from '../../views/notFound'
import indexPage from '../../views/index'

// 路由配置
export const routerConfig = {
  scrollBehavior: () => ({ y: 0 }),
  mode: 'history',
  base: '/',
  routes: [
    {
      path: '/',
      name: 'index',
      component: indexPage,
      children: [], // 不自动导入就自己写
    },
    {
      path: '*',
      meta: {
        title: '账号系统—圈外同学',
      },
      component: notFound,
    },
  ],
}

export const router = mount => {
  const { Vue } = mount
  Vue.use(Router)
  window.VueRouter = Router

  const router = new Router(routerConfig) // 实例化路由
  router.beforeEach(async (to, from, next) => {
    next()
  })

  router.afterEach((to, from) => {
    if (to.meta && to.meta.title) {
      document.title = to.meta.title
    }
  })

  router.onError(err => {
    console.error(err)
  })

  return router
}
