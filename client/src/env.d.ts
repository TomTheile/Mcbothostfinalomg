interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly REPLIT_DOMAINS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}