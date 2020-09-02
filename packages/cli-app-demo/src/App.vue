<template>
  <div id="app">
    <div class="text">{{ test }}</div>
  </div>
</template>

<script>
export default {
  data() {
    const set = new Set()
    set.add(1)
    set.add(1)
    set.add(3)
    return {
      test: '测试文字332' + [...set].join('\n')
    };
  },  
  mounted() {
    function kitchen(strings,...values){
      console.log(strings);
      console.log(values);
    }
    let dessert = 'cake',
    drink = 'tea'
    let breakfast =kitchen `今天的早餐是${dessert}与${drink}!`;
  }
};
</script>

<style lang="scss">
#app {
  width: 200px;
  height: 200px;
  margin: 0 auto;
  background-color: #ccc;
}

#app .text {
  color: white;
}

@import './import.scss';

</style>
