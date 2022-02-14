if (process.env.VITE_APP_VERSION === undefined) {
  const now = new Date()
  process.env.VITE_APP_VERSION = `${now.getUTCFullYear()}-${
    now.getUTCMonth() + 1
  }-${now.getUTCDate()}.${now.getUTCHours() * 60 + now.getUTCMinutes()}`
}

/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
const config = {
  directories: {
    output: 'dist',
    buildResources: 'buildResources',
  },
  files: ['packages/**/dist/**'],
  extraMetadata: {
    version: process.env.VITE_APP_VERSION,
    appId: process.env.APP_BUNDLE_ID,
    mac: {
      category: 'public.app-category.developer-tools',
      target: ['zip'],
      arch: ['arm64'],
      hardenedRuntime: true,
      gatekeeperAssess: false,
      entitlements: 'buildResources/entitlements.mac.plist',
      entitlementsInherit: 'buildResources/entitlements.mac.plist',
    },
  },
  afterSign: 'scripts/notarize.js',
}

module.exports = config
