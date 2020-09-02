<template>
  <div :class="['index-root', 'index-style']">
    <nav-contaner>
      <div class="header-pannel">
        <a class="header-logo">
          <span class="logo-text">圈外同学</span>
        </a>
        <div class="header-nav">
          <router-link :to="{ path: '/course' }"><span>我的课堂</span></router-link>
        </div>
      </div>
    </nav-contaner>
    <router-view />
  </div>
</template>
<script>
import navContaner from '../navContaner'

export default {
  components: {
    navContaner,
  },
  data() {
    return {}
  },
  created() {},
  methods: {},
  mounted() {
    if (1 === null) {
    }
    const a = 0

    debugger
  },
}
</script>
<style lang="less">
.index-root {
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .header-pannel {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      .header-logo {
        width: 200px;
        height: 60px;
        background-color: #fff;
        background-image: url('https://static.iqycamp.com/img/2020-06-24/i_ZkzE40mbj31MBoZL.png');
        background-repeat: no-repeat;
        cursor: pointer;
        .logo-text {
          display: none;
        }
      }
      .header-nav {
        margin-right: 35px;
        a {
          color: #101010;
          font-size: 24px;
          font-weight: 500;
          padding: 10px 20px 10px 20px !important;
          margin: 20px 0 !important;
          &:hover {
            background-color: #f5f5f5;
            border-radius: 5px;
          }
        }
        .router-link-active {
          color: #ffc323;
        }
      }
    }
    .header-user {
      width: 200px;
      height: 60px;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      border-left: 2px solid #ececec;
    }
  }
}

.index-style {
  // 首页header风格
  .header-content {
    width: 1170px;
    margin: 0 auto;
    .header-pannel {
      .header-logo {
        height: 60px;
        background-image: url('https://static.iqycamp.com/71527579350_-ze3vlyrx.pic_hd.jpg');
        background-size: contain;
        .logo-text {
          display: block;
          margin-left: 70px;
          font-size: 30px;
          line-height: 60px;
          color: #666;
        }
      }
      .header-nav {
        a {
          font-size: 20px !important;
          font-weight: 900 !important;
          padding: 10px 20px 10px 20px !important;
          margin: 20px 0 !important;
          &:hover {
            background-color: #f5f5f5;
            border-radius: 5px;
          }
        }
      }
    }
  }
}
.tips {
  height: 36px;
  .tp-con {
    position: fixed;
    z-index: 10;
    width: 100%;
    text-align: center;
    color: #28c76f;
    font-size: 16px;
    letter-spacing: -0.3px;
    padding: 10px 0px;
    background: rgb(226, 243, 233);
  }
}
</style>
