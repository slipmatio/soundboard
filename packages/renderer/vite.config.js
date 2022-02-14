/* eslint-env node */
import { chrome } from '../../.electron-vendors.config.json'
import { join, resolve } from 'path'
import { builtinModules } from 'module'
import vue from '@vitejs/plugin-vue'

if (process.env.VITE_APP_VERSION === undefined) {
  const now = new Date()
  process.env.VITE_APP_VERSION = `${now.getUTCFullYear()}-${
    now.getUTCMonth() + 1
  }-${now.getUTCDate()}.${now.getUTCHours() * 60 + now.getUTCMinutes()}`
}

const PACKAGE_ROOT = __dirname
const PACKAGES_ROOT = join(__dirname, '../')

/**
 * @type {import('vite').UserConfig}
 * @see https://vitejs.dev/config/
 */
const config = {
  mode: process.env.MODE,
  root: PACKAGE_ROOT,
  // base: '/',
  resolve: {
    alias: {
      '@': join(PACKAGE_ROOT, 'src'),
      'mainpkg/': join(PACKAGES_ROOT, 'main/src'),
    },
  },
  plugins: [vue()],
  base: './',
  server: {
    fs: {
      strict: true,
    },
  },
  build: {
    sourcemap: true,
    target: `chrome${chrome}`,
    outDir: 'dist',
    // assetsDir: '.',
    rollupOptions: {
      external: [...builtinModules],
      input: {
        main: resolve(PACKAGE_ROOT, './index.html'),
      },
    },
    emptyOutDir: true,
  },
}

export default config
