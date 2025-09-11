import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  server: {
    host: '0.0.0.0', // 允许外部访问
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '3999031f.r8.cpolar.cn' // 允许内网穿透域名访问
    ],
    proxy: {
      // 代理所有以 /api 开头的请求
      '/api': {
        target: 'http://localhost:8080', // 后端服务器地址
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '') // 可选：重写路径，去掉 /api 前缀
      }
    }
  }
})
