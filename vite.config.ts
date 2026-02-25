import { defineConfig } from 'vite'
import path from 'node:path'
import electron from 'vite-plugin-electron/simple'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  // 渲染进程根目录
  root: path.join(__dirname, 'src/renderer'),
  // 相对路径，避免 Electron 打包后路径错误
  base: './',
  // public 目录仍在项目根
  publicDir: path.join(__dirname, 'public'),
  resolve: {
    alias: {
      '@': path.join(__dirname, 'src/renderer'),
      '@shared': path.join(__dirname, 'shared'),
    },
  },
  build: {
    outDir: path.join(__dirname, 'dist'),
    emptyOutDir: true,
  },
  plugins: [
    vue(),
    electron({
      main: {
        // 主进程入口
        entry: path.join(__dirname, 'src/main/index.ts'),
        // 显式指定输出目录，避免被 root 影响
        vite: {
          build: {
            outDir: path.join(__dirname, 'dist-electron'),
          },
        },
      },
      preload: {
        // 预加载脚本入口
        input: path.join(__dirname, 'src/preload/index.ts'),
        // 显式指定输出目录，避免被 root 影响
        vite: {
          build: {
            outDir: path.join(__dirname, 'dist-electron'),
          },
        },
      },
      // Polyfill the Electron and Node.js API for Renderer process.
      renderer: process.env.NODE_ENV === 'test'
        ? undefined
        : {},
    }),
  ],
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
  },
})
