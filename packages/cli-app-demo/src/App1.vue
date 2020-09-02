<template>
  <div id="app">
    demo
    <router-view b="b" aa="x" a="1" dd="b" wer="sdf" ff="sdf" qq="sdf" q="q" />
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'

@Component({})
export default class App extends Vue {
  test = {
    text: 'test',
  }
  mounted() {
    const abd = {}

    function sss() {}
    if (abd) {
    }

    const a = ['0']

    interface ItestObj {
      a: number
      b: number
      c: number
    }

    const testObj: ItestObj = {
      a: 1,
      b: 2,
      c: 3,
    }
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
