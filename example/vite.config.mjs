import { defineConfig, mergeConfig } from 'vite';

import config from 'react-native-builder-bob/vite-config';
import pack from '../package.json' with { type: 'json' };

export default defineConfig((env) =>
  mergeConfig(config(env), {
    resolve: {
      alias: {
        [pack.name]: new URL('..', import.meta.url),
      },
      dedupe: Object.keys(pack.peerDependencies),
    },
    // jieba-wasm's `web` build resolves its `.wasm` via `import.meta.url`. If
    // Vite pre-bundles it into `.vite/deps`, the binary isn't copied alongside
    // the JS and the fetch 404s. Excluding it keeps the package served from its
    // own directory so the relative wasm URL resolves correctly.
    optimizeDeps: {
      exclude: ['jieba-wasm'],
    },
  })
);
