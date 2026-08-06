// H&R Blocker Vite 联邦配置（remote）
// 与全屏海报墙同一套约定：
//   1. 不指定 rollupOptions.input，产物名自动生成 __federation_expose_<Name>-<hash>.js
//   2. shared 只放 vue（vuetify 由 MoviePilot 主框架全局提供）
//   3. minify: false，postcss 过滤 .v-* / .mdi-* 避免与主框架样式冲突
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  appType: 'custom',
  plugins: [
    vue(),
    federation({
      name: 'HRBlocker',
      filename: 'remoteEntry.js',
      exposes: {
        './Page': './src/Page.vue',
      },
      shared: {
        vue: { requiredVersion: false, generate: false },
      },
      format: 'esm',
    }),
  ],
  build: {
    target: 'esnext',
    cssCodeSplit: true,
    sourcemap: false,
    minify: false,
    rollupOptions: {
      output: {
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '/* vue-federation: vuetify 样式由主应用提供 */',
      },
    },
    postcss: {
      plugins: [
        {
          postcssPlugin: 'internal:charset-removal',
          AtRule: {
            charset: (atRule: any) => {
              if (atRule.name === 'charset') atRule.remove();
            },
          },
        },
        {
          postcssPlugin: 'vuetify-filter',
          Root(root: any) {
            root.walkRules((rule: any) => {
              if (rule.selector && (rule.selector.includes('.v-') || rule.selector.includes('.mdi-'))) {
                rule.remove();
              }
            });
          },
        },
      ],
    },
  },
});
