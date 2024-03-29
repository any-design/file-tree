<template>
  <li
    :draggable="`${draggable}`"
    class="file-tree-node"
    @dragstart.stop="onDragStart"
    @dragend.stop="onDragEnd"
    @contextmenu.stop.prevent="onNodeContextmenu($event, nodeDataInner)"
  >
    <div
      v-show="nodeDataInner.path !== '/'"
      :class="[
        'node-block',
        {
          selected: nodeDataInner.selected,
          focused: nodeDataInner.focused,
          leaf: !nodeDataInner.children?.length,
          folder: nodeDataInner.type === 'folder',
        },
      ]"
      @dragenter.stop
      @dragover.stop.prevent="onDragOver"
      @dragleave.stop="onDragLeave"
      @drop.stop="onDrop"
      @click.stop="onNodeSelect($event, nodeDataInner)"
    >
      <div
        :style="{ 'margin-left': (props.level < 3 ? 0 : (props.level - 2) * props.levelMargin) + 'px' }"
        :class="[dragOverClass]"
      >
        <span v-if="nodeDataInner.type === 'folder'" class="icon" @dragover.prevent>
          <slot name="toggler" :nodeData="nodeDataInner">
            <template v-if="nodeDataInner.expanded">-</template>
            <template v-else>+</template>
          </slot>
        </span>
        <span>
          <slot name="icon" :nodeData="nodeDataInner">
            <template v-if="nodeDataInner.type === 'folder'">[D]</template>
            <template v-else>[F]</template>
          </slot>
        </span>

        <template v-if="nodeDataInner.editing">
          <input
            type="text"
            @blur="onNodeRename(nodeDataInner, newName)"
            v-on:keyup.esc="onEditingEsc"
            v-on:keydown.enter="onNodeRename(nodeDataInner, newName)"
            ref="editingInputRef"
            v-model="newName"
          />
        </template>
        <slot name="title" :nodeData="nodeDataInner" v-else>
          <span class="title">{{ nodeDataInner.title }}</span>
        </slot>
      </div>
    </div>
    <ul>
      <template
        v-if="
          nodeDataInner.addingFolder || nodeDataInner.addingFile || nodeDataInner.expanded || nodeDataInner.path === '/'
        "
      >
        <li
          v-if="nodeDataInner.type === 'folder' && (nodeDataInner.addingFile || nodeDataInner.addingFolder)"
          :style="{ 'padding-left': (props.level < 2 ? 0 : (props.level - 1) * props.levelMargin) + 'px' }"
        >
          <template v-if="nodeDataInner.addingFolder">
            <input
              type="text"
              ref="addingFolderInputRef"
              @blur="onFolderCreate(nodeDataInner, newFolderName)"
              v-on:keydown.enter="onFolderCreate(nodeDataInner, newFolderName)"
              v-on:keyup.esc="onFolderEsc"
              v-model="newFolderName"
            />
          </template>

          <template v-if="nodeDataInner.addingFile">
            <input
              type="text"
              ref="addingFileInputRef"
              @blur="onFileCreate(nodeDataInner, newFileName)"
              v-on:keydown.enter="onFileCreate(nodeDataInner, newFileName)"
              v-on:keyup.esc="onFileEsc"
              v-model="newFileName"
            />
          </template>
        </li>

        <FileTreeNode
          v-for="item in nodeDataInner.children"
          :key="item.title"
          :node-data="item"
          :level="props.level + 1"
          :level-margin="levelMargin"
          :draggable="draggable"
          @nodeDrop="onNodeDrop"
          @nodeSelect="onNodeSelect"
          @fileCreate="onFileCreate"
          @folderCreate="onFolderCreate"
          @nodeRename="onNodeRename"
          @nodeContextmenu="onNodeContextmenu"
          @nodeExpand="onNodeExpand"
          @nodeCollapse="onNodeCollapse"
        >
          <template v-slot:toggler="{ nodeData }">
            <slot name="toggler" :nodeData="nodeData"></slot>
          </template>

          <template v-slot:icon="{ nodeData }">
            <slot name="icon" :nodeData="nodeData"></slot>
          </template>

          <template v-slot:title="{ nodeData }">
            <slot name="title" :nodeData="nodeData"></slot>
          </template>
        </FileTreeNode>
      </template>
    </ul>
  </li>
</template>

<script lang="ts" setup>
import { inject, nextTick, reactive, ref, watch, type PropType } from 'vue';
import type { DragDropObject, TreeNode } from './types';
import { Position } from './types';

const props = defineProps({
  nodeData: {
    type: Object as PropType<TreeNode>,
    required: true,
  },
  level: {
    type: Number,
    required: true,
  },
  draggable: {
    type: Boolean,
    default: false,
  },
  levelMargin: {
    type: Number,
    default: 28,
  },
});

defineSlots<{
  title: (props: { nodeData: TreeNode }) => void;
  toggler: (props: { nodeData: TreeNode }) => void;
  icon: (props: { nodeData: TreeNode }) => void;
}>();

const nodeDataInner = reactive(props.nodeData);

const ddo = inject('ddo') as DragDropObject;

const editingInputRef = ref();
const addingFolderInputRef = ref();
const addingFileInputRef = ref();
const dragOverClass = ref('');

const newFileName = ref('');
const newFolderName = ref('');
const newName = ref(nodeDataInner.title);

watch(
  () => nodeDataInner.editing,
  async (newValue) => {
    if (newValue) {
      newName.value = nodeDataInner?.title;
      await nextTick();
      editingInputRef.value.focus();
    }
  },
);

watch(
  () => nodeDataInner.addingFolder,
  async (newValue) => {
    if (newValue) {
      newFolderName.value = '';
      await nextTick();
      addingFolderInputRef.value.focus();
    }
  },
);

watch(
  () => nodeDataInner.addingFile,
  async (newValue) => {
    if (newValue) {
      newFileName.value = '';
      await nextTick();
      addingFileInputRef.value.focus();
    }
  },
);

const onNodeContextmenu = async (e: MouseEvent, nodeData: TreeNode) => {
  emits('nodeContextmenu', e, nodeData);
};

const emits = defineEmits([
  'nodeDrop',
  'nodeSelect',
  'fileCreate',
  'folderCreate',
  'nodeRename',
  'nodeContextmenu',
  'nodeExpand',
  'nodeCollapse',
]);

function onNodeToggle() {
  nodeDataInner.expanded = !nodeDataInner.expanded;

  if (nodeDataInner.expanded) {
    emits('nodeExpand', nodeDataInner);
  } else {
    emits('nodeCollapse', nodeDataInner);
  }
}

function onNodeRename(node: TreeNode, name: string) {
  // 防止enter和onblur时重复触发
  if (node.editing) {
    if (name.length > 0) {
      emits('nodeRename', node, name);
    } else {
      onEditingEsc();
    }
  }
}

function onEditingEsc() {
  nodeDataInner.editing = false;
}

function onNodeDrop() {
  emits('nodeDrop');
}

function onNodeSelect(e: MouseEvent, nodeData: TreeNode) {
  const isCtrlOrCmdSelect = e.ctrlKey || e.metaKey;
  const isShiftSelect = e.shiftKey;

  if (nodeData.type === 'folder' && !isCtrlOrCmdSelect && !isShiftSelect && nodeData.path === props.nodeData.path) {
    onNodeToggle();
    if (!props.draggable) return;
  }

  emits('nodeSelect', e, nodeData);
}

function onFileCreate(nodeData: TreeNode, newFileName: string) {
  if (nodeData.addingFile) {
    // eslint-disable-next-line no-param-reassign
    nodeData.expanded = true;
    if (newFileName.length > 0) {
      emits('fileCreate', nodeData, newFileName);
    } else {
      onFileEsc();
    }
  }
}

function onFileEsc() {
  nodeDataInner.expanded = true;
  nodeDataInner.addingFile = false;
}

function onFolderCreate(nodeData: TreeNode, newFileName: string) {
  if (nodeData.addingFolder) {
    // eslint-disable-next-line no-param-reassign
    nodeData.expanded = true;

    if (newFileName.length > 0) {
      emits('folderCreate', nodeData, newFileName);
    } else {
      onFileEsc();
    }
  }
}

function onFolderEsc() {
  nodeDataInner.expanded = true;
  nodeDataInner.addingFolder = false;
}

function onNodeExpand(nodeData: TreeNode) {
  emits('nodeExpand', nodeData);
}

function onNodeCollapse(nodeData: TreeNode) {
  emits('nodeCollapse', nodeData);
}

function onDragStart() {
  ddo.drag = nodeDataInner;
}

function onDragOver(e: DragEvent) {
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = 'move';
  }

  if (nodeDataInner?.path === ddo.drag.path) {
    return;
  }

  const position = calculateDropPosition(e, nodeDataInner?.type);
  ddo.position = position;
  if (position === Position.ABOVE) {
    dragOverClass.value = 'tree-drag-over-top';
  } else if (position === Position.BELOW) {
    // when a folder is expanded, there is no below position
    if (nodeDataInner.type === 'file' || !nodeDataInner.expanded) {
      dragOverClass.value = 'tree-drag-over-bottom';
    }
  } else {
    dragOverClass.value = 'tree-drag-over';
  }
}

// 计算拖拽节点的放置方式0（作为目标节点的子节点），-1（放置在目标节点的前面）,1（放置在目标节点的后面）
function calculateDropPosition(e: DragEvent, type: string): Position {
  const targetElement = e.target as HTMLElement;
  const offsetTop = getOffset(targetElement).top;
  const { offsetHeight } = targetElement;
  const { pageY } = e;
  const gapHeight = type === 'folder' ? 0.2 * offsetHeight : 0.5 * offsetHeight;

  if (pageY >= offsetTop + offsetHeight - gapHeight) {
    return Position.BELOW;
  }
  if (pageY < offsetTop + gapHeight) {
    return Position.ABOVE;
  }

  return Position.IN;
}

function getOffset(ele: HTMLElement) {
  if (!ele.getClientRects().length) {
    return { top: 0, left: 0 };
  }
  const rect = ele.getBoundingClientRect();
  if (rect.width || rect.height) {
    const doc = ele.ownerDocument;
    const win = doc.defaultView;
    const docElem = doc.documentElement;
    if (win) {
      return {
        // 元素距离视窗顶部距离，滚动高度，元素边框厚度
        top: rect.top + win.scrollY - docElem.clientTop,
        left: rect.left + win.scrollX - docElem.clientLeft,
      };
    }
  }
  return rect;
}

function onDragLeave() {
  dragOverClass.value = '';
}

function onDrop() {
  ddo.drop = nodeDataInner;
  emits('nodeDrop');
  dragOverClass.value = '';

  return;
}

function onDragEnd() {
  dragOverClass.value = '';
}
</script>

<style>
.file-tree-view ul {
  margin-left: 0;
  padding-left: 0;
}

.file-tree-node ul,
.file-tree-node li {
  list-style-type: none;
}

.file-tree-node li[draggable='false'] {
  user-select: none;
}

.file-tree-node .leaf:hover,
.file-tree-node .folder:hover {
  background-color: rgba(0, 0, 0, 0.06);
}

.file-tree-node .selected {
  background-color: rgba(0, 0, 0, 0.1) !important;
}

.file-tree-node .node-block {
  border: 2px solid transparent;
  font-size: 13px;
}

.file-tree-node .node-block .icon {
  display: inline-block;
  width: 16px;
  margin-right: 2px;
  text-align: left;
}

.file-tree-node .focused {
  border: 2px rgba(0, 0, 0, 0.1) solid;
}

.tree-drag-over {
  background-color: rgba(0, 0, 0, 0.1);
  color: rgba(0, 0, 0, 0.6);
  border: 2px rgba(0, 0, 0, 0.1) solid;
}

.tree-drag-over-top {
  border-top: 2px rgba(0, 0, 0, 0.1) solid !important;
}

.tree-drag-over-bottom {
  border-bottom: 2px rgba(0, 0, 0, 0.1) solid !important;
}

@media screen and (prefers-color-scheme: dark) {
  .file-tree-node .leaf:hover,
  .file-tree-node .folder:hover {
    background-color: rgba(0, 0, 0, 0.2);
  }

  .file-tree-node .selected {
    background-color: rgba(255, 255, 255, 0.2) !important;
  }

  .file-tree-node .node-block {
    border: 2px solid transparent;
    font-size: 13px;
  }

  .file-tree-node .node-block .icon {
    display: inline-block;
    width: 16px;
    margin-right: 2px;
    text-align: left;
  }

  .file-tree-node .focused {
    border: 2px rgba(255, 255, 255, 0.2) solid;
  }

  .tree-drag-over {
    background-color: rgba(255, 255, 255, 0.2);
    color: white;
    border: 2px rgba(255, 255, 255, 0.2) solid;
  }

  .tree-drag-over-top {
    border-top: 2px rgba(255, 255, 255, 0.2) solid !important;
  }

  .tree-drag-over-bottom {
    border-bottom: 2px rgba(255, 255, 255, 0.2) solid !important;
  }
}
</style>
