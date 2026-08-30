# react-native-jieba

Native Chinese text segmentation for React Native, powered by [cppjieba](https://github.com/yanyiwu/cppjieba).

- Runs on the New Architecture as a C++ Turbo Module — no bridge overhead, no JS port of jieba.
- Ships the cppjieba dictionaries (`jieba.dict.utf8`, `hmm_model.utf8`, `idf.utf8`, `stop_words.utf8`, `user.dict.utf8`) inside the package, bundled as iOS pod resources and Android assets. The ~5.7 MB `idf.utf8` is loaded lazily and [can be excluded entirely](#reducing-app-size-excluding-the-idf-dictionary) in apps that never call `extract()`.
- Supports the standard jieba modes: precise (`cut`), full (`cutAll`), search engine (`cutForSearch`), HMM (`cutHMM`), small-word (`cutSmall`), POS tagging (`tag`), and TF-IDF keyword extraction (`extract`).
- Works on **web** (react-native-web) via [`jieba-wasm`](https://github.com/fengkx/jieba-wasm), with the same API.

## Requirements

- React Native **0.85+** with the New Architecture enabled.
- iOS 15.1+, Android `minSdkVersion` 24+.
- C++20 toolchain (default on recent Xcode and Android NDK 26+).

## Installation

```sh
npm install react-native-jieba
# or
yarn add react-native-jieba
```

iOS:

```sh
cd ios && pod install
```

Android: no extra steps — autolinking picks up the AAR.

Web (react-native-web): install the optional `jieba-wasm` peer dependency, which provides the WebAssembly backend.

```sh
npm install jieba-wasm
```

Any bundler that handles `.wasm` assets (Vite, Webpack 5, Metro-web, etc.) will bundle the binary automatically.

If you use **Vite**, exclude `jieba-wasm` from dependency pre-bundling so its `.wasm` is served from the package directory (otherwise the binary isn't copied into `.vite/deps` and the fetch 404s):

```js
// vite.config.js
export default {
  optimizeDeps: { exclude: ['jieba-wasm'] },
};
```

## Usage

On **native (iOS/Android)** there is no setup — just call `cut`, `tag`, etc. The dictionary is located/extracted automatically: on iOS the path is resolved from the app bundle, and on Android the bundled assets are extracted to `filesDir/jieba-dict/` on the first call.

```ts
import { cut } from 'react-native-jieba';

cut('我来到北京清华大学');
// ['我', '来到', '北京', '清华大学']
```

`prepareJieba()` is an **optional async warm-up** on native: on Android's first run the asset extraction happens off the call site (asynchronously), avoiding a one-time blocking pause on the first `cut`/`tag`. On **web** it is **required** — it loads the `jieba-wasm` binary, which cannot happen synchronously. Use `isJiebaReady()` to check synchronously whether segmentation can run.

```ts
import {
  prepareJieba,
  isJiebaReady,
  cut,
  cutAll,
  cutForSearch,
  tag,
  extract,
} from 'react-native-jieba';

// Native: optional warm-up. Web: required (loads wasm).
await prepareJieba();

isJiebaReady(); // true

cut('我来到北京清华大学');
// ['我', '来到', '北京', '清华大学']

cutAll('我来到北京清华大学');
// ['我', '来到', '北京', '清华', '清华大学', '华大', '大学']

cutForSearch('小明硕士毕业于中国科学院计算所');
// ['小明', '硕士', '毕业', '于', '中国', '科学', '学院', '科学院', '中国科学院', '计算', '计算所']

tag('我爱北京天安门');
// [{ word: '我', tag: 'r' }, { word: '爱', tag: 'v' }, ...]

extract('我是拖拉机学院手扶拖拉机专业的。', 5);
// [{ word: '手扶拖拉机', weight: 10.01 }, ...]
```

## API

On native, all segmentation calls are synchronous JSI calls — no Promises. On web they are synchronous too, but `prepareJieba()` must finish first (it loads the wasm module).

| Function | Signature | Notes |
| --- | --- | --- |
| `prepareJieba(options?)` | `(options?: { wasmUrl?: string \| URL \| Request }) => Promise<void>` | **Web:** must be awaited once before any other call. **Native:** optional warm-up — calling segmentation directly works too. Idempotent. `wasmUrl` is web-only and rarely needed (override where the `.wasm` is served). |
| `isJiebaReady()` | `() => boolean` | Synchronous check for whether segmentation can run now. Native-backed (reflects the real engine state, not whether `prepareJieba` was called): `true` on iOS from launch, `true` on Android once the dict is resolved (eagerly via `prepareJieba` or lazily on the first call). |
| `cut(sentence, hmm?)` | `(string, boolean) => string[]` | Precise mode. `hmm` defaults to `true`. |
| `cutAll(sentence)` | `(string) => string[]` | Full mode (every possible word). |
| `cutForSearch(sentence, hmm?)` | `(string, boolean) => string[]` | Search-engine mode. |
| `cutHMM(sentence)` | `(string) => string[]` | HMM-only segmentation. |
| `cutSmall(sentence, maxWordLen)` | `(string, number) => string[]` | Limits the maximum word length. |
| `tag(sentence)` | `(string) => Array<{ word, tag }>` | Part-of-speech tagging. |
| `extract(sentence, topK?)` | `(string, number) => Array<{ word, weight }>` | TF-IDF keyword extraction. `topK` defaults to `5`. Loads the IDF dictionary on first use; throws on web, and in native builds that [excluded it](#reducing-app-size-excluding-the-idf-dictionary). |
| `insertUserWord(word, tag?)` | `(string, string) => boolean` | Adds a user dictionary word at runtime. |
| `find(word)` | `(string) => boolean` | Tests whether a word is in the dictionary. |

### Web support

On web the implementation is backed by [`jieba-wasm`](https://github.com/fengkx/jieba-wasm) (jieba-rs compiled to WebAssembly) instead of cppjieba. The core API is identical, with a few caveats because jieba-wasm exposes a smaller surface:

| Function | Web behavior |
| --- | --- |
| `cut`, `cutAll`, `cutForSearch`, `tag` | Fully supported. |
| `insertUserWord` | Supported (maps to jieba-wasm `add_word`); the `tag` argument is honored, frequency is auto-assigned. |
| `cutHMM` | Falls back to `cut(sentence, true)` (jieba-wasm has no HMM-only mode). |
| `cutSmall` | Falls back to `cut`; the `maxWordLen` argument is accepted for parity but ignored. |
| `find` | Approximated: returns `true` when the word survives precise (non-HMM) segmentation as a single token. |
| `extract` | **Not supported** — throws. jieba-wasm does not ship the IDF dictionary needed for TF-IDF extraction. |

#### Example (Vite + react-native-web)

```js
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { 'react-native': 'react-native-web' },
  },
  // jieba-wasm resolves its `.wasm` via `import.meta.url`; pre-bundling into
  // `.vite/deps` would leave the binary behind, so exclude it.
  optimizeDeps: { exclude: ['jieba-wasm'] },
});
```

```tsx
// App.tsx
import { useEffect, useState } from 'react';
import { Platform, Text, View } from 'react-native';
import { prepareJieba, cut, cutForSearch, tag, extract } from 'react-native-jieba';

export default function App() {
  const [words, setWords] = useState<string[] | null>(null);

  useEffect(() => {
    // On web this loads + instantiates the wasm module (async) and is required.
    // On native you can skip this and call cut() directly.
    prepareJieba()
      .then(() => {
        setWords(cut('我来到北京清华大学'));
        // → ['我', '来到', '北京', '清华大学']

        cutForSearch('小明硕士毕业于中国科学院计算所');
        // → ['小明', '硕士', '毕业', '于', '中国', '科学', '学院', ...]

        tag('我爱北京天安门');
        // → [{ word: '我', tag: 'r' }, { word: '爱', tag: 'v' }, ...]

        // extract() throws on web — guard it for cross-platform code.
        const keywords = Platform.OS === 'web' ? [] : extract('…', 5);
      })
      .catch((e) => console.error(e));
  }, []);

  if (!words) return <Text>Loading…</Text>;
  return (
    <View>
      {words.map((w, i) => (
        <Text key={i}>{w}</Text>
      ))}
    </View>
  );
}
```

To self-host the binary (CDN or custom path), pass `wasmUrl`:

```ts
await prepareJieba({ wasmUrl: 'https://cdn.example.com/jieba_rs_wasm_bg.wasm' });
```

## Reducing app size: excluding the IDF dictionary

The bundled dictionaries account for most of this library's footprint, and `idf.utf8` is the
largest single file at **~5.7 MB**. It is read by exactly one API — `extract()`, TF-IDF keyword
extraction. Apps that only segment text (`cut`, `cutForSearch`, `tag`, …) never touch it.

The extractor is built lazily on first use, so the dictionary costs nothing at startup either way.
If your app never calls `extract()`, you can also drop the file from your binary entirely:

**iOS** — set the environment variable before CocoaPods evaluates the podspec, e.g. at the top of
your `Podfile`:

```rb
ENV['RN_JIEBA_EXCLUDE_IDF_DICT'] = '1'
```

Then reinstall pods (`bundle exec pod install`).

**Android** — set a Gradle property in `android/gradle.properties`:

```properties
rnJiebaExcludeIdfDict=true
```

(or `ext.rnJiebaExcludeIdfDict = true` in `android/build.gradle`, or pass
`-PrnJiebaExcludeIdfDict=true` on the command line).

With the dictionary excluded, `extract()` throws a descriptive error and **every other API keeps
working unchanged** — the same contract that already applies on web, where `extract()` is
unsupported because jieba-wasm ships no IDF data. Guard it as you would for web:

```ts
const keywords = canExtract ? extract(sentence, 5) : [];
```

On Android this also skips copying the file out of the APK into `filesDir/jieba-dict/` on first
run, saving the same ~5.7 MB of user device storage and shortening first-call extraction.

## How it works

- The Turbo Module lives in `cpp/JiebaImpl.{h,cpp}` and exposes the engine as a JSI Cxx module.
- `cpp/JiebaEngine.{h,cpp}` composes cppjieba's primitives (one shared `DictTrie` + `HMMModel` across every segmenter) instead of using the `cppjieba::Jieba` facade. The facade holds a `KeywordExtractor` **by value**, so constructing it always loads `idf.utf8` and hard-fails when that file is absent; composing the pieces directly is what lets the extractor — and its dictionary — be built only if `extract()` is called.
- iOS resolves the dictionary directory from `NSBundle` in `ios/OnLoad.mm` before the module is registered, so segmentation works immediately and `prepareJieba()` is a no-op on iOS.
- Android ships the dictionary as AAR assets and extracts them to `filesDir/jieba-dict/`. This happens automatically: if `prepareJieba()` is never called, the C++ module extracts them synchronously on the first segmentation call via an fbjni call into `JiebaDict.extractDictDirFromNative` (a one-time cost). `prepareJieba()` does the same extraction asynchronously up front (through `JiebaAndroidHelperModule` → the codegen-exposed `setDictPath` JSI method) so that first call doesn't block.
- `isJiebaReady()` is backed by the codegen-exposed `isReady()` JSI method, which reads the native engine state directly — so it stays correct even when the dictionary is resolved lazily on the first call.
- cppjieba and its `limonp` dependency are vendored as git submodules under `cpp/cppjieba/`. The published npm tarball contains only the headers and dictionaries that are actually needed at build time.
- On web, `react-native-web`'s bundler resolution picks up `src/NativeJieba.web.ts` and `src/init.web.ts`. `prepareJieba()` lazily imports `jieba-wasm`, awaits its async wasm initializer, and routes the JS API to the wasm exports.

## Contributing

This repository uses git submodules. Clone with:

```sh
git clone --recursive https://github.com/leonsilicon/react-native-jieba.git
# or after a plain clone:
git submodule update --init --recursive
```

- [Development workflow](CONTRIBUTING.md#development-workflow)
- [Sending a pull request](CONTRIBUTING.md#sending-a-pull-request)
- [Code of conduct](CODE_OF_CONDUCT.md)

## License

`react-native-jieba` is MIT-licensed. The bundled [cppjieba](https://github.com/yanyiwu/cppjieba) and [limonp](https://github.com/yanyiwu/limonp) projects are MIT-licensed; their respective `LICENSE` files are included inside `cpp/cppjieba/` and `cpp/cppjieba/deps/limonp/`.
