import { Platform } from 'react-native';
import Jieba from './NativeJieba';
import JiebaAndroidHelper from './NativeJiebaAndroidHelper';

export type InitJiebaOptions = {
  /**
   * Web only: URL (or fetch input) for the jieba-wasm `.wasm` binary. Most
   * bundlers resolve it automatically, so this is only needed when the asset
   * is served from a custom location. Ignored on iOS and Android.
   */
  wasmUrl?: string | URL | Request;
};

let initPromise: Promise<void> | null = null;

export function initJieba(_options: InitJiebaOptions = {}): Promise<void> {
  if (initPromise) return initPromise;
  initPromise = (async () => {
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
    initPromise = null;
    throw err;
  });
  return initPromise;
}
