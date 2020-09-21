<template>
  <div id="app">
    <treeSort :tree-data="listData" #default="{ item, index, level, treeData }">
      <div class="node-item-content">
        <span>{{item.name}}</span>
        <div class="sort-operation">
          <span class="up-arrow" @click="up(item, index, treeData)" :style="index === 0 ? 'visibility:hidden': ''">↑</span>
          <span class="down-arrow" @click="down(item, index, treeData)" :style="index === treeData.length - 1 ? 'visibility:hidden': ''">↓</span>
        </div>
      </div>
    </treeSort>
  </div>
</template>

<script>
import treeSort from './components/treeSort'

export default {
  components:{
    treeSort
  },
  data() {
    return {
      listData: [
        {
          name: 'aaa',
          seq: 0,
          children: [
            {
              name: 'aaa',
              seq: 0,
            },
            {
              name: 'bbb',
              seq: 1,
            },
            {
              name: 'ccc',
              seq: 2,
            },
            {
              name: 'ddd',
              seq: 3,
            },
          ]
        },
        {
          name: 'bbb',
          seq: 1,
          children: [
            {
              name: 'aaa',
              seq: 0,
            },
            {
              name: 'bbb',
              seq: 1,
            },
            {
              name: 'ccc',
              seq: 2,
            },
            {
              name: 'ddd',
              seq: 3,
            },
          ]
        },
        {
          name: 'ccc',
          seq: 2,
        },
        {
          name: 'ddd',
          seq: 3,
        },
      ]
    };
  },
  mounted() {
  },
  methods: {
    up(item, index, treeData) {
      let lastItem = treeData[index - 1]
      let tmpSave = item
      treeData[index] = lastItem
      treeData[index - 1] = tmpSave
    },
    down() {
      let nextItem = treeData[index + 1]
      let tmpSave = item
      treeData[index] = nextItem
      treeData[index + 1] = nextItem
    },
    sort(){

    }
  }
};
</script>

<style lang="scss">
#app {
  width: 200px;
  height: 200px;
  margin: 0 auto;
  border: 1px solid gray;
}
.node-item-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  &:hover .sort-operation {
    display: block;
  }
  .sort-operation {
    margin: 0 30px;
    display: none;
    .up-arrow {
      font-size: 12px;
      cursor: pointer;
    }
    .down-arrow {
      font-size: 12px;
      cursor: pointer;
      margin-left: 20px;
    }
  }
}
</style>
