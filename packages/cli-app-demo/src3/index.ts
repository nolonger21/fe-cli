import Vue from 'vue'
import './assets/normalize.css'
import './assets/domtokenlist' // support ie 9

import plugins from './plugins'
import App from './App.vue'

const { router, store } = plugins(Vue)

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App),
})

if (1 === null) {
}
const a = 0

debugger
