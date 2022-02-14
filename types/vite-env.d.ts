/// <reference types="vite/client" />

interface ImportMetaEnv extends Readonly<Record<string, string>> {
  // Only string type here to avoid hard to debug cast problems in your components!
  readonly VITE_APP_VERSION: string
  readonly VITE_DEV_SERVER_URL: undefined | string
  readonly VITE_VENV_PATH: string
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}
