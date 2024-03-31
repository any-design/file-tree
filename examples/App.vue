<template>
  <div class="container">
    <div class="child child1">
      <div class="title">Simple Tree</div>
      <file-tree
        v-model="treeData1"
        draggable
        @nodeSelect="onNodeSelect"
        @fileCreate="onFileCreate"
        @folderCreate="onFolderCreate"
        @nodeRename="onNodeRename"
        @nodeExpand="onNodeExpand"
        @nodeCollapse="onNodeCollapse"
        @nodeDrop="onNodeDrop"
        @nodeMove="onNodeMove"
        @nodeContextmenu="onNodeContextmenu"
      >
      </file-tree>
    </div>
    <div class="child child1">
      <div class="title">Customizable Tree</div>
      <file-tree
        v-model="treeData2"
        @nodeSelect="onNodeSelect"
        @fileCreate="onFileCreate"
        @folderCreate="onFolderCreate"
        @nodeRename="onNodeRename"
        @nodeExpand="onNodeExpand"
        @nodeCollapse="onNodeCollapse"
        @nodeDrop="onNodeDrop"
        @nodeMove="onNodeMove"
        @nodeContextmenu="onNodeContextmenu"
      >
        <template v-slot:title="{ nodeData }">{{ nodeData.title }}</template>
        <template v-slot:toggler="{ nodeData }">
          <span style="margin-right: 5px">
            <i v-if="nodeData.expanded" class="fa-solid fa-chevron-down"></i>
            <i v-else class="fa-solid fa-chevron-right"></i>
          </span>
        </template>
        <template v-slot:icon="{ nodeData }">
          <span style="margin-right: 5px">
            <i v-if="nodeData.type === 'folder'" class="fa-regular fa-folder"></i>
            <i v-else-if="nodeData.title.endsWith('.mp3')" class="fa-regular fa-file-audio"></i>
            <i v-else-if="nodeData.title.endsWith('.jpg')" class="fa-regular fa-file-image"></i>
            <i v-else-if="nodeData.title.endsWith('.doc')" class="fa-solid fa-file-word"></i>
            <i v-else-if="nodeData.title.endsWith('.pdf')" class="fa-solid fa-file-pdf"></i>
            <i v-else-if="nodeData.title.endsWith('.csv')" class="fa-solid fa-file-csv"></i>
            <i v-else-if="nodeData.title.endsWith('.txt')" class="fa-regular fa-file-lines"></i>
            <i v-else class="fa-regular fa-file"></i>
          </span>
        </template>
      </file-tree>

      <ContextMenu ref="contextMenuRef" @menuitemClick="onMenuItemClick" >
        <ContextMenuItem menu-id="editing">editing</ContextMenuItem>
        <ContextMenuItem menu-id="addingFile">addingFile</ContextMenuItem>
        <ContextMenuItem menu-id="addingFolder">addingFolder</ContextMenuItem>
      </ContextMenu>
    </div>

    <div class="child child1">
      <div class="title">Logs</div>
      <ol reversed>
        <li  v-for="item in logs" :key="item" class="log" >{{ item }}</li>
      </ol>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue';
import ContextMenuItem from '../packages/contextmenu/ContextMenuItem.vue';
import ContextMenu from '../packages/contextmenu/ContextMenu.vue';
import type { TreeNode } from '../packages/filetree/types';
import FileTree from '../packages/filetree/FileTree.vue';

const contextMenuRef = ref();
const logs = reactive<string[]>([]);

function onNodeContextmenu(e: MouseEvent, d: TreeNode) {
  contextMenuRef.value.show(e, d);
  logs.push(`${d.title}`);
}

function addLog(event: string, content: string) {
  logs.unshift(`${new Date().toLocaleTimeString()} ${event} -> ${content}`);
}

function onNodeExpand(node: TreeNode) {
  addLog('expand', node.title);
}

function onNodeCollapse(node: TreeNode) {
  addLog('collapse', node.title);
}

function onNodeDrop(newPath: string, oldPath: string) {
  addLog('drop', `${oldPath} -> ${newPath}`);
}

function onNodeMove(newPath: string, oldPath: string) {
  addLog('move', `${oldPath} -> ${newPath}`);
}

function onMenuItemClick(node: TreeNode, menuId: string) {
  addLog('click menu', `${node.title}, ${menuId}`);
  if (menuId === 'editing') {
    // eslint-disable-next-line no-param-reassign
    node.editing = true;
  } else if (menuId === 'addingFile') {
    // eslint-disable-next-line no-param-reassign
    node.addingFile = true;
    // eslint-disable-next-line no-param-reassign
    node.addingFolder = false;
  } else if (menuId === 'addingFolder') {
    // eslint-disable-next-line no-param-reassign
    node.addingFile = false;
    // eslint-disable-next-line no-param-reassign
    node.addingFolder = true;
  }
}

function onNodeSelect(items: TreeNode[]) {
  addLog('select', items.map((n) => n.title).join(', '));
}

function onNodeRename(node: TreeNode, newTitle: string, oldTitle: string) {
  addLog('rename', `${oldTitle} -> ${newTitle}`);
}

function onFolderCreate(node: TreeNode, title: string) {
  // eslint-disable-next-line no-param-reassign
  node.addingFolder = false;
  addLog('create folder', `${node.title} -> ${title}`);
}

async function onFileCreate(node: TreeNode, title: string) {
  // eslint-disable-next-line no-param-reassign
  node.addingFile = false;
  addLog('create file', `${node.title} -> ${title}`);
}

const data = [
  {
    title: 'Documents',
    path: '/users/Jim/Documents',
    type: 'folder',
    children: [
      {
        title: 'File1.txt',
        path: '/users/Jim/Documents/File1.txt',
        type: 'file',
      },
      {
        title: 'File2.pdf',
        path: '/users/Jim/Documents/File2.pdf',
        type: 'file',
      },
      {
        title: 'File3.doc',
        path: '/users/Jim/Documents/File3.doc',
        type: 'file',
      },
      {
        title: 'File4.csv',
        path: '/users/Jim/Documents/File4.csv',
        type: 'file',
      },
      {
        title: 'File5.xxx',
        path: '/users/Jim/Documents/File5.xxx',
        type: 'file',
      },
    ],
  },
  {
    title: 'Pictures',
    path: '/users/Jim/Pictures',
    type: 'folder',
    children: [
      {
        title: 'Image1.jpg',
        path: '/users/Jim/Pictures/Image1.jpg',
        type: 'file',
      },
      {
        title: 'Image2.jpg',
        path: '/users/Jim/Pictures/Image2.jpg',
        type: 'file',
      },
    ],
  },
  {
    title: 'Music',
    path: '/users/Jim/Music',
    type: 'folder',
    children: [
      {
        title: 'File1.mp3',
        path: '/users/Jim/Music/File1.mp3',
        type: 'file',
      },
      {
        title: 'File2.mp3',
        path: '/users/Jim/Music/File2.mp3',
        type: 'file',
      },
      {
        title: 'Level 1',
        path: '/users/Jim/Music/Level1',
        type: 'folder',
        children: [
          {
            title: 'File3.mp3',
            path: '/users/Jim/Music/Level1/File3.mp3',
            type: 'file',
          },
          {
            title: 'File4.mp3',
            path: '/users/Jim/Music/Level1/File4.mp3',
            type: 'file',
          },
        ],
      },
    ],
  },
];

const treeData1 = ref(JSON.parse(JSON.stringify(data)));
const treeData2 = ref(JSON.parse(JSON.stringify(data)));
</script>
<style>
.container {
  height: 100vh;

  display: flex;
  overflow: hidden;
}

.title {
  color: var(--color-text);
}

.child {
  overflow: auto;
  margin: 10px;
}

.child1 {
  flex: 1;
}

.log {
  font-size: 12px;
  font-family: monospace;
}
</style>
