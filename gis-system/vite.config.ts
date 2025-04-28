import { defineConfig } from 'vite'
import svgr from '@svgr/rollup'
import react from '@vitejs/plugin-react'
import path from 'path'
import { serverOptions } from './config'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), svgr({ icon: true })],
  server: serverOptions,

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@app': path.resolve(__dirname, './src/app'),
      '@entities': path.resolve(__dirname, './src/entities'),
      '@features': path.resolve(__dirname, './src/features'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@processes': path.resolve(__dirname, './src/processes'),
      '@widgets': path.resolve(__dirname, './src/widgets'),
    },
  },
})
