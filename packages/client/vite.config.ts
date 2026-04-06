import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // 设置 @ 指向 src 目录
      '@': path.resolve(__dirname, './src'),
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        // Ant Design 必须开启，支持内联 JavaScript
        javascriptEnabled: true,
      },
    },
  },
  server: {
    port: 5173,
    open: true, // 启动后自动打开浏览器
    cors: true, // 允许跨域
  },
  build: {
    outDir: 'dist', // 打包产物目录
    assetsDir: 'assets', // 静态资源目录
    sourcemap: false, // 生产环境关闭 sourcemap 防止源码泄露
    minify: 'terser', // 使用 terser 压缩，效果更好
    terserOptions: {
      compress: {
        // 生产环境移除 console.log，保持代码洁净
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        // 静态资源分包策略：防止单个 JS 文件过大
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', 'antd'],
          utils: ['axios', 'dayjs', 'zustand'],
        },
      },
    },
  },
})