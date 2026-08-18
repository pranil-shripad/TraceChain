/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONTRACT_ADDRESS?: string;
  readonly VITE_PINATA_JWT?: string;
  readonly VITE_PINATA_API_KEY?: string;
  readonly VITE_PINATA_API_SECRET?: string;
  readonly PINATA_JWT?: string;
  readonly PINATA_API_KEY?: string;
  readonly PINATA_API_SECRET?: string;
  readonly [key: string]: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
