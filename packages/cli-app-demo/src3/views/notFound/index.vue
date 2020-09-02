<template>
  <div class="notFound">
    <div class="not-found-info">
      <div class="not-found-message">
        您访问的是无效页面
      </div>
      <div class="back-button" @click="$root.app.jumpIndex">
        返回圈外首页
      </div>
    </div>
    <div class="not-found-image"></div>
  </div>
</template>
<script>
export default {
  name: 'notFound',
  route: {
    path: 'notFound',
    meta: {
      title: 'notFound',
    },
  },
  data() {
    return {}
  },
  mounted() {},
  methods: {},
}
</script>
<style lang="less">
.notFound {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;
  height: 100vh;
  .not-found-info {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    flex-direction: column;
    margin: 0 180px 0 120px;
    min-width: 380px;
    .not-found-message {
      color: #000;
      font-size: 32px;
      font-weight: 500;
    }
    .back-button {
      padding: 23px 24px;
      margin-top: 69px;
      color: #fff;
      font-size: 22px;
      background-color: #28c76f;
      border-radius: 50px;
      cursor: pointer;
    }
  }
  .not-found-image {
    width: 904px;
    min-width: 600px;
    height: 600px;
    background-image: url(https://static.iqycamp.com/img/2020-07-06/i_f6UzI4Rhtnn1Fub9.png);
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
  }
}
</style>
