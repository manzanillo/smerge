// Provide Vite's import.meta.env typings when not using the global `vite/client` types
interface ImportMetaEnv {
  readonly VITE_BUILD_HASH?: string;
  readonly MODE?: string;
  readonly [key: string]: any;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

