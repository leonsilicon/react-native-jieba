# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 0.3.0

### Breaking changes

- **`initJieba` has been renamed to `prepareJieba`.** The old name implied a
  mandatory global init step, which it no longer is on native. Update imports and
  calls:

  ```diff
  - import { initJieba } from 'react-native-jieba';
  - await initJieba();
  + import { prepareJieba } from 'react-native-jieba';
  + await prepareJieba();
  ```

  On **web** `prepareJieba()` is still required (it loads the `jieba-wasm`
  binary). On **iOS/Android** it is now optional — see below.

  `InitJiebaOptions` is likewise renamed to `PrepareJiebaOptions`.

### Added

- **`prepareJieba()` is now optional on native.** You can call `cut`, `tag`, etc.
  directly without any setup — the dictionary is located/extracted automatically on
  first use (iOS resolves it from the app bundle; Android lazily extracts the bundled
  assets to `filesDir/jieba-dict/` via an fbjni bridge). Calling `prepareJieba()`
  remains useful as an async warm-up to avoid a one-time blocking pause on Android's
  first call.
- **`isJiebaReady(): boolean`** — a synchronous readiness check, backed by the real
  native engine state (a new `isReady()` JSI method) rather than a JS flag, so it
  stays correct even when the dictionary is resolved lazily on the first call.

## 0.2.0

### Added

- Web support via [`jieba-wasm`](https://github.com/fengkx/jieba-wasm) for
  react-native-web, exposing the same API as the native build.

## 0.1.0

- Initial release: cppjieba C++ Turbo Module for iOS and Android with `cut`,
  `cutAll`, `cutForSearch`, `cutHMM`, `cutSmall`, `tag`, `extract`, `insertUserWord`,
  and `find`.
