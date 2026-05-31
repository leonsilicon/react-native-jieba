import { Platform } from 'react-native';
import Jieba from './NativeJieba';
import JiebaAndroidHelper from './NativeJiebaAndroidHelper';

export type PrepareJiebaOptions = {
  /**
   * Web only: URL (or fetch input) for the jieba-wasm `.wasm` binary. Most
   * bundlers resolve it automatically, so this is only needed when the asset
   * is served from a custom location. Ignored on iOS and Android.
   */
  wasmUrl?: string | URL | Request;
};

let preparePromise: Promise<void> | null = null;

/**
 * Optional on native (iOS/Android): the dictionary is located/extracted
 * automatically on the first segmentation call, so you can call `cut`, `tag`,
 * etc. directly without ever calling `prepareJieba`.
 *
 * Calling it is still useful as a *warm-up*: on Android's very first run the
 * dictionary assets are extracted from the APK, and doing that work here
 * (asynchronously, up front) avoids a one-time blocking pause on the first
 * `cut`/`tag` call.
 *
 * On web it is **required** — it loads and instantiates the `jieba-wasm`
 * binary, which cannot be done synchronously.
 *
 * Idempotent: repeated calls return the same promise.
 */
export function prepareJieba(
  _options: PrepareJiebaOptions = {}
): Promise<void> {
  if (preparePromise) return preparePromise;
  preparePromise = (async () => {
    if (Platform.OS === 'android') {
      if (!JiebaAndroidHelper) {
        throw new Error(
          'react-native-jieba: JiebaAndroidHelper native module is missing.'
        );
      }
      const path = await JiebaAndroidHelper.prepareDictDir();
      Jieba.setDictPath(path);
    }
    // iOS: OnLoad.mm already configured the dict path from the bundle.
  })().catch((err) => {
    preparePromise = null;
    throw err;
  });
  return preparePromise;
}

/**
 * Whether jieba is ready to segment synchronously.
 *
 * Backed by the native engine state (not by whether `prepareJieba` was called),
 * so it stays correct even when the dictionary is resolved lazily on the first
 * `cut`/`tag` call. On iOS this is `true` from app launch.
 */
export function isJiebaReady(): boolean {
  return Jieba.isReady();
}
