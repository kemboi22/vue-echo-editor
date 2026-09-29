/// <reference types="vitest/config" />
import path from 'node:path'
import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
import { scopeCssPlugin } from './scripts/scope-css'

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'))

// Every runtime/peer dependency stays external so apps share a single copy of Vue, Tiptap and ProseMirror
const externalPackages = [...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.peerDependencies ?? {})]
const isExternal = (id: string) =>
  !id.endsWith('.css') && externalPackages.some(dep => id === dep || id.startsWith(`${dep}/`))

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    vue(),
    dts({
      tsconfigPath: './tsconfig.json',
      outDirs: 'lib',
      entryRoot: 'src',
      exclude: ['src/demo/**/*', 'examples/**/*', 'docs/**/*', 'tests/**/*', '**/*.test.ts'],
      insertTypesEntry: true,
    }),
    tailwindcss(),
    // Confine the stylesheet to editor elements so it never restyles the host app
    scopeCssPlugin(),
    command === 'serve' ? vueDevTools() : null,
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // `pnpm dev` runs the examples app against the library source (with HMR) instead of lib/
      ...(command === 'serve'
        ? {
            'vue-echo-editor/collaboration': path.resolve(__dirname, 'src/collaboration.ts'),
            'vue-echo-editor/style.css': path.resolve(__dirname, 'src/styles/index.css'),
            'vue-echo-editor': path.resolve(__dirname, 'src/index.ts'),
          }
        : {}),
    },
  },
  build: {
    outDir: 'lib',
    target: 'es2022',
    sourcemap: true,
    lib: {
      entry: {
        index: path.resolve(__dirname, 'src/index.ts'),
        collaboration: path.resolve(__dirname, 'src/collaboration.ts'),
      },
      name: 'EchoEditor',
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => `${entryName === 'index' ? 'echo-editor' : entryName}.${format === 'es' ? 'js' : 'cjs'}`,
    },
    cssCodeSplit: false,
    rolldownOptions: {
      external: isExternal,
      output: {
        exports: 'named',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: info => {
          if (info.names?.some(name => name.endsWith('.css'))) {
            return 'style.css'
          }
          return 'assets/[name].[hash][extname]'
        },
      },
    },
  },
  test: {
    environment: 'happy-dom',
    include: ['tests/**/*.test.ts'],
  },
}))
