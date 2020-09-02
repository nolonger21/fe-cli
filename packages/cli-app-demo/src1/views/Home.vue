<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png" />
    <HelloWorld msg="Welcome to Your Vue.js App" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import HelloWorld from '@/components/HelloWorld.vue'
import { test } from './test'

export default defineComponent({
  name: 'Home',
  components: {
    HelloWorld,
  },
  setup() {
    const { count, inc } = test({ count: 3 })
    return { count, inc }
  },
})
</script>
