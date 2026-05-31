import {
  setJiebaWasm,
  isJiebaWasmReady,
  type JiebaWasmModule,
} from './NativeJieba.web';

export type PrepareJiebaOptions = {
  /**
   * URL (or fetch input) for the jieba-wasm `.wasm` binary. Most bundlers
   * resolve it automatically, so this is only needed when the asset is served
   * from a custom location.
   */
  wasmUrl?: string | URL | Request;
};

let preparePromise: Promise<void> | null = null;

/**
 * **Required on web**: loads and instantiates the `jieba-wasm` binary (which
 * cannot be done synchronously). Await it once before calling `cut`, `tag`, etc.
 *
 * Idempotent: repeated calls return the same promise.
 */
export function prepareJieba(options: PrepareJiebaOptions = {}): Promise<void> {
  if (preparePromise) return preparePromise;
  preparePromise = (async () => {
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
    preparePromise = null;
    throw err;
  });
  return preparePromise;
}

/** Whether the wasm module has been loaded and jieba can segment. */
export function isJiebaReady(): boolean {
  return isJiebaWasmReady();
}
