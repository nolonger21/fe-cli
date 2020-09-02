<template>
  <div id="app">
    <router-view />
  </div>
</template>
<script>
import Vue from 'vue'
import Component from 'vue-class-component'

@Component({})
export default class App extends Vue {
  test = {
    text: 'test',
  }
  mounted() {
    const testObj = {
      a: 1,
      b: 2,
      c: 3,
    }
    window.location
    console.info(testObj)

    if (true) {
    }
    const a: any = 0

    debugger

    interface IJas {}
  }
}
</script>

<style lang="less">
.not-select {
  moz-user-select: -moz-none;
  -moz-user-select: none;
  -o-user-select: none;
  -khtml-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
