import type { Spec } from './NativeJieba';

// `jieba-wasm` exposes the same segmentation primitives as cppjieba, but a
// smaller surface: cut / cutAll / cutForSearch / tag / add_word. The remaining
// native methods are polyfilled on top of those where the semantics allow, and
// throw otherwise. The wasm module is loaded lazily by `prepareJieba()` (see
// `init.web.ts`) and handed to this shim via `setJiebaWasm`.

export type JiebaWasmModule = {
  cut(text: string, hmm?: boolean | null): string[];
  cut_all(text: string): string[];
  cut_for_search(text: string, hmm?: boolean | null): string[];
  tag(
    sentence: string,
    hmm?: boolean | null
  ): Array<{ word: string; tag: string }>;
  add_word(word: string, freq?: number | null, tag?: string | null): number;
};

let wasm: JiebaWasmModule | null = null;

export function setJiebaWasm(module: JiebaWasmModule): void {
  wasm = module;
}

export function isJiebaWasmReady(): boolean {
  return wasm !== null;
}

function getWasm(): JiebaWasmModule {
  if (!wasm) {
    throw new Error(
      'react-native-jieba: jieba-wasm is not loaded yet. ' +
        'On web you must call (and await) prepareJieba() before any ' +
        'segmentation call.'
    );
  }
  return wasm;
}

const Jieba: Spec = {
  isReady() {
    return isJiebaWasmReady();
  },
  setDictPath() {
    // No-op on web: jieba-wasm bundles its own dictionary.
  },
  cut(sentence, hmm) {
    return getWasm().cut(sentence, hmm);
  },
  cutAll(sentence) {
    return getWasm().cut_all(sentence);
  },
  cutForSearch(sentence, hmm) {
    return getWasm().cut_for_search(sentence, hmm);
  },
  cutHMM(sentence) {
    // jieba-wasm has no HMM-only mode; precise cut with HMM enabled is the
    // closest equivalent.
    return getWasm().cut(sentence, true);
  },
  cutSmall(sentence, _maxWordLen) {
    // jieba-wasm does not expose a max-word-length cut; fall back to precise
    // cut. The maxWordLen argument is accepted for API parity but ignored.
    return getWasm().cut(sentence, true);
  },
  tag(sentence) {
    return getWasm().tag(sentence);
  },
  extract() {
    throw new Error(
      'react-native-jieba: extract() (TF-IDF keyword extraction) is not ' +
        'supported on web — jieba-wasm does not ship the IDF dictionary.'
    );
  },
  insertUserWord(word, tag) {
    // add_word returns the inserted word's frequency (>= 0 on success).
    return (
      getWasm().add_word(word, undefined, tag === '' ? undefined : tag) >= 0
    );
  },
  find(word) {
    // jieba-wasm has no dictionary lookup; approximate it by checking whether
    // the word survives precise (non-HMM) segmentation as a single token.
    const segments = getWasm().cut(word, false);
    return segments.length === 1 && segments[0] === word;
  },
};

export default Jieba;
