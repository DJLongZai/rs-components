import { defineConfig } from 'vite';
import dtsPlugin from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dtsPlugin()
  ],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: '@rs-components/rs-table',
      fileName: (format) => `@rs-components/rs-table.${format}.js`
    },
    cssCodeSplit: true,
    sourcemap: true,
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: ['react'],
      output: {
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          vue: 'React'
        }
      }
    }
  }
})
