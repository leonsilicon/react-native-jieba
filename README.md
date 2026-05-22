# react-native-jieba

Native Chinese text segmentation for React Native, powered by [cppjieba](https://github.com/yanyiwu/cppjieba).

- Runs on the New Architecture as a C++ Turbo Module — no bridge overhead, no JS port of jieba.
- Ships the cppjieba dictionaries (`jieba.dict.utf8`, `hmm_model.utf8`, `idf.utf8`, `stop_words.utf8`, `user.dict.utf8`) inside the package, bundled as iOS pod resources and Android assets.
- Supports the standard jieba modes: precise (`cut`), full (`cutAll`), search engine (`cutForSearch`), HMM (`cutHMM`), small-word (`cutSmall`), POS tagging (`tag`), and TF-IDF keyword extraction (`extract`).

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

## Usage

Call `initJieba()` once before the first segmentation call. On iOS the dictionary path is resolved from the app bundle automatically; on Android it extracts the bundled assets to `filesDir/jieba-dict/` on first run.

```ts
import {
  initJieba,
  cut,
  cutAll,
  cutForSearch,
  tag,
  extract,
} from 'react-native-jieba';

await initJieba();

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

All segmentation calls are synchronous JSI calls — no Promises.

| Function | Signature | Notes |
| --- | --- | --- |
| `initJieba()` | `() => Promise<void>` | Must be awaited once before any other call. Idempotent. |
| `cut(sentence, hmm?)` | `(string, boolean) => string[]` | Precise mode. `hmm` defaults to `true`. |
| `cutAll(sentence)` | `(string) => string[]` | Full mode (every possible word). |
| `cutForSearch(sentence, hmm?)` | `(string, boolean) => string[]` | Search-engine mode. |
| `cutHMM(sentence)` | `(string) => string[]` | HMM-only segmentation. |
| `cutSmall(sentence, maxWordLen)` | `(string, number) => string[]` | Limits the maximum word length. |
| `tag(sentence)` | `(string) => Array<{ word, tag }>` | Part-of-speech tagging. |
| `extract(sentence, topK?)` | `(string, number) => Array<{ word, weight }>` | TF-IDF keyword extraction. `topK` defaults to `5`. |
| `insertUserWord(word, tag?)` | `(string, string) => boolean` | Adds a user dictionary word at runtime. |
| `find(word)` | `(string) => boolean` | Tests whether a word is in the dictionary. |

## How it works

- The Turbo Module lives in `cpp/JiebaImpl.{h,cpp}` and wraps `cppjieba::Jieba` as a JSI Cxx module.
- iOS resolves the dictionary directory from `NSBundle` in `ios/OnLoad.mm` before the module is registered, so `initJieba()` is a no-op on iOS.
- Android ships the dictionary as AAR assets and extracts them on demand via `JiebaAndroidHelperModule`, which then hands the path to the C++ module via the codegen-exposed `setDictPath` JSI method.
- cppjieba and its `limonp` dependency are vendored as git submodules under `cpp/cppjieba/`. The published npm tarball contains only the headers and dictionaries that are actually needed at build time.

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
