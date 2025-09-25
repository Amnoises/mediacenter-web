/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, never>, Record<string, never>, unknown>
  export default component
}

declare interface ImportMetaEnv {
  readonly VITE_BONJOUR_SERVICE_NAME?: string
  readonly VITE_BONJOUR_SERVICE_TYPE?: string
  readonly VITE_BONJOUR_FALLBACK_URL?: string
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv
}
