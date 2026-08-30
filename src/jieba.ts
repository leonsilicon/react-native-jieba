import Jieba from './NativeJieba';

export type Tagged = { word: string; tag: string };
export type Keyword = { word: string; weight: number };

export function cut(sentence: string, hmm: boolean = true): string[] {
  return Jieba.cut(sentence, hmm);
}

export function cutAll(sentence: string): string[] {
  return Jieba.cutAll(sentence);
}

export function cutForSearch(sentence: string, hmm: boolean = true): string[] {
  return Jieba.cutForSearch(sentence, hmm);
}

export function cutHMM(sentence: string): string[] {
  return Jieba.cutHMM(sentence);
}

export function cutSmall(sentence: string, maxWordLen: number): string[] {
  return Jieba.cutSmall(sentence, maxWordLen);
}

export function tag(sentence: string): Tagged[] {
  return Jieba.tag(sentence);
}

/**
 * TF-IDF keyword extraction.
 *
 * Requires the IDF dictionary, which is loaded lazily on the first call (every other API works
 * without it). Throws when that dictionary is unavailable:
 *  - on **web**, always — jieba-wasm ships no IDF data;
 *  - on **native**, only in builds that opted out of bundling it via `RN_JIEBA_EXCLUDE_IDF_DICT=1`
 *    (iOS) or `rnJiebaExcludeIdfDict=true` (Android), which drops ~5MB from the app.
 *
 * Guard it in cross-platform code, or in any app that may be built with the dictionary excluded.
 */
export function extract(sentence: string, topK: number = 5): Keyword[] {
  return Jieba.extract(sentence, topK);
}

export function insertUserWord(word: string, tag: string = ''): boolean {
  return Jieba.insertUserWord(word, tag);
}

export function find(word: string): boolean {
  return Jieba.find(word);
}
