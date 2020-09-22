<template>
  <div :class="`tree-list ${treeClass(level, index)}`">
    <div v-for="(item, i) in treeData" :class="`node-item ${nodeClass(level, i)}`"
    :draggable="draggable(level, i, treeData) ? 'true' : 'false'" @dragstart="dragstart" @drag="drag" @dragend="dragend" @dragenter="dragenter" @dragover="dragover" @dragleave="dragleave" @drop="drop">
      <template v-if="item.children && Array.isArray(item.children)">
        <div class="node-label">
          <slot :item="treeData[i]" :index="i" :level="level" :treeData="treeData" />
        </div>
        <treeSort :tree-data="item.children" :level="level + 1" :index="i" #default="{ item, index, level, treeData }"
        :draggable="draggable"
        @dragstart="dragstart" @drag="drag" @dragend="dragend" @dragenter="dragenter" @dragover="dragover" @dragleave="dragleave" @drop="drop">
          <div class="node-label">
            <slot :item="item" :index="index" :level="level" :treeData="treeData"/>
          </div>
        </treeSort>
      </template>
      <template v-else>
        <div class="node-label">
          <slot :item="treeData[i]" :index="i" :level="level" :treeData="treeData" />
        </div>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: 'treeSort',
  props:{
    treeData:{
      type: Array,
      default: () => ([])
    },
    level:{
      type: Number,
      default: 0
    },
    index:{
      type: Number,
      default: 0
    },
    treeClass: {
      type: Function,
      default: (level, index) => `tree-${level} index-${index}`
    },
    nodeClass: {
      type: Function,
      default: (level, index) => `n-${level} i-${index}`
    },
    draggable: {
      type: Function,
      default: (level, index, treeData) => false
    }
  },
  methods: {
    dragstart(e) {
      this.$emit('dragstart', e)
    },
    drag(e) {
      this.$emit('drag', e)
    },
    dragend(e) {
      this.$emit('dragend', e)
    },
    dragenter(e) {
      this.$emit('dragenter', e)
    },
    dragover(e) {
      this.$emit('dragover', e)
    },
    dragleave(e) {
      this.$emit('dragleave', e)
    },
    drop(e) {
      this.$emit('drop', e)
    }
  }
}
</script>

<style lang="less">
.tree-list {
  .node-label {
    &:hover {
      background-color: #efefef;
    }
  }
}

.tree-0 {
  .tree-list {
    padding-left: 20px;
  }
}
</style>