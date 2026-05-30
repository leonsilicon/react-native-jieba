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

export function extract(sentence: string, topK: number = 5): Keyword[] {
  return Jieba.extract(sentence, topK);
}

export function insertUserWord(word: string, tag: string = ''): boolean {
  return Jieba.insertUserWord(word, tag);
}

export function find(word: string): boolean {
  return Jieba.find(word);
}
