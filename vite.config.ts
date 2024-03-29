// filename: vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

import dts from 'vite-plugin-dts';
import * as path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    dts({
      tsconfigPath: 'tsconfig.app.json',
      staticImport: true,
      insertTypesEntry: true,
      rollupTypes: true,
    }),
  ],
  build: {
    rollupOptions: {
      // 请确保外部化那些你的库中不需要的依赖
      external: ['vue'],
      output: {
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          vue: 'Vue',
        },
      },
    },
    lib: {
      entry: './packages/index.ts',
      fileName: (format) => `file-tree.${format}.js`,
      name: 'file-tree',
    },
    target: 'esnext',
    minify: false,
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
