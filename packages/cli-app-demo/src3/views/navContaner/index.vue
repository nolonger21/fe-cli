<template functional>
  <div class="header-contaner">
    <div class="header-position">
      <div class="header-wrapper">
        <div class="header-content">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {}
</script>

<style lang="less">
.header-contaner {
  height: 100px;
  .header-position {
    position: fixed;
    left: 0;
    top: 0;
    z-index: 10;
    width: 100%;
    .header-wrapper {
      background-color: #fff;
      box-shadow: 0px 2px 12px 0px rgba(0, 0, 0, 0.09);
      .header-content {
        height: 100px;
        padding: 0 35px;
      }
    }
  }
}
</style>
