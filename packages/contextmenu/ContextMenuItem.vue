<template>
  <div class="context-item" @click="handleClick">
    <slot />
  </div>
</template>

<script lang="ts" setup>
import { inject } from 'vue';

const { menuId } = defineProps({
  // 数据源列表
  menuId: {
    type: String,
    required: true,
  },
});

const onMenuItemClicked = inject('onMenuItemClicked') as Function;
const handleClick = () => {
  onMenuItemClicked(menuId);
};
</script>

<style>
.context-item {
  display: flex;
  align-items: center;
  white-space: nowrap;
  list-style: none;
  line-height: 22px;
  padding: 5px 16px;
  margin: 0;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.65);
  cursor: pointer;
  outline: none;
  user-select: none;
}

.context-item:hover {
  background-color: rgba(0, 0, 0, 0.06);
  color: #fff;
}

.context-item.is-disabled {
  cursor: not-allowed;
}

@media screen and (prefers-color-scheme: dark) {
  .context-item {
    color: rgba(255, 255, 255, 0.8);
  }
  .context-item:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
}
</style>
