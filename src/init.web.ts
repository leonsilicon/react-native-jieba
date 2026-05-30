import { setJiebaWasm, type JiebaWasmModule } from './NativeJieba.web';
import type { InitJiebaOptions } from './init';

export type { InitJiebaOptions } from './init';

let initPromise: Promise<void> | null = null;

export function initJieba(options: InitJiebaOptions = {}): Promise<void> {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    // `jieba-wasm` resolves to its `web` build under the `browser`/`import`
    // conditions, whose default export is an async initializer that fetches
    // and instantiates the wasm binary.
    const wasm = (await import('jieba-wasm')) as unknown as {
      default: (input?: string | URL | Request) => Promise<unknown>;
    } & JiebaWasmModule;

    // With no argument, jieba-wasm's `web` initializer resolves the binary via
    // `new URL('jieba_rs_wasm_bg.wasm', import.meta.url)` *relative to its own
    // module*, which bundlers (Vite, Webpack 5, …) rewrite to the correct
    // emitted asset URL in both dev and production. Only pass `wasmUrl` when the
    // consumer explicitly overrides where the binary is served from — passing a
    // wrong/relative path here makes the dev server return index.html and wasm
    // instantiation fails with a bad magic word.
    await wasm.default(options.wasmUrl);
    setJiebaWasm(wasm);
  })().catch((err) => {
    initPromise = null;
    throw err;
  });
  return initPromise;
}
