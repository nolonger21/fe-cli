<template>
  <div :class="`tree-list ${treeClass(level, index)}`">
    <div v-for="(item, i) in treeData" :class="`node-item ${nodeClass(level, i)}`">
      <template v-if="item.children && Array.isArray(item.children)">
        <div class="node-label">
          <slot :item="treeData[i]" :index="i" :level="level" :treeData="treeData" />
        </div>
        <treeSort :tree-data="item.children" :level="level + 1" :index="i" #default="{ item, index, level, treeData }">
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
  },
  methods: {
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