import vue from 'vue'
import App from './App'
import './style.less'

window.vm = new vue({
  el: '#app',
  render: (h) => h(App),
})

const abd = {}

if (abd) {
  //
}