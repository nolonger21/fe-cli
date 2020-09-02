import Vuex from 'vuex'

export const store = mount => {
  const { Vue } = mount
  Vue.use(Vuex)
  window.Vuex = Vuex

  const store = new Vuex.Store({
    modules: {},
  })
  return store
}
