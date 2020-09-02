<template>
  <div id="app">
    <div class="text">{{ test.text }}</div>
    <about />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
// import { Action, Mutation } from 'vuex-class';
import about from './tsDemo/pages/about/index.vue';

@Component({
  components: {
    about
  }
})
export default class App extends Vue {
  test = {
    text: 'test'
  };
  mounted() {
    interface ItestObj {
      a: number;
      b: number;
      c: number;
    }
    const testObj: ItestObj = {
      a: 1,
      b: 2,
      c: 3
    };
    console.info(testObj);
  }
}
</script>

<style lang="less">
#app {
  width: 200px;
  height: 200px;
  margin: 0 auto;
  background-color: #ccc;
  .text {
    color: red;
  }
}
</style>
