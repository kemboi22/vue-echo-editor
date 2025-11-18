import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import svgLoader from 'vite-svg-loader'
import tailwind from '@tailwindcss/vite'

export default defineConfig({
  plugins: [vue(), svgLoader(), tailwind()],
  build: {
    outDir: path.resolve(__dirname, '../dist'),
    emptyOutDir: true,
  },
})
