<template lang="pug">
  #app
    .text {{test}}
    .text {{test}}
    .text {{test}}
    .text {{test}}
    .text {{test}}
  </div>
</template>

<script>
export default {
  data() {
    return {
      test: '测试文字2'
    };
  }
};
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
