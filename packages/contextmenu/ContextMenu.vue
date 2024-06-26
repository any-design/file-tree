<template>
  <Teleport to="body">
    <div class="contextMenu-wrapper">
      <transition name="fade">
        <div v-if="visible" ref="contextmenuRef" class="contextMenu" :style="style">
          <slot />
        </div>
      </transition>
    </div>
  </Teleport>
</template>
<script setup lang="ts">
import { ref, computed, nextTick, provide } from 'vue';
import useClickOutside from './UseClickOutside';

const emits = defineEmits(['menuitemClick']);
const contextmenuRef = ref<HTMLDivElement | null>(null);
const visible = ref(false);

let contextData: any = null;

function onMenuItemClicked(menuId: string) {
  emits('menuitemClick', contextData, menuId);
  visible.value = false;
}

provide('onMenuItemClicked', onMenuItemClicked);

const position = ref({
  top: 0,
  left: 0,
});

const style = computed(() => ({
  left: `${position.value.left}px`,
  top: `${position.value.top}px`,
}));

const hide = () => {
  visible.value = false;
};
// 计算x,y的偏移值
const calculatePosition = (axis: 'X' | 'Y', mousePos: number, elSize: number) => {
  const windowSize = axis === 'X' ? window.innerWidth : window.innerHeight;
  const scrollPos = axis === 'X' ? window.scrollX : window.scrollY;

  let pos = mousePos - scrollPos;
  if (pos + elSize > windowSize) {
    pos = Math.max(0, pos - elSize);
  }

  return pos + scrollPos;
};
useClickOutside(contextmenuRef, () => {
  hide();
});

const show = async (e: MouseEvent, data: any) => {
  e.preventDefault();
  visible.value = true;
  contextData = data;
  await nextTick();
  const el = contextmenuRef.value;
  if (!el) {
    return;
  }
  const width = el.clientWidth;
  const height = el.clientHeight;
  const { pageX: x, pageY: y } = e;
  position.value.top = calculatePosition('Y', y, height);
  position.value.left = calculatePosition('X', x, width);
};

defineExpose({
  show,
  hide,
});
</script>
<style scoped>
.contextMenu-wrapper {
  z-index: 9999;
  background-color: transparent;
}

.contextMenu {
  position: absolute;
  top: 0;
  left: 0;
  padding: 5px 0;
  margin: 0;
  background-color: #fafafa;
  border-radius: 8px;
  font-size: 12px;
  line-height: 20px;
  min-width: 10px;
  word-wrap: break-word;
  overflow: hidden;
  box-shadow: 2px 4px 12px rgba(0, 0, 0, 0.08);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.1s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

@media screen and (prefers-color-scheme: dark) {
  .contextMenu {
    background-color: #2e2e2e;
  }
}
</style>
