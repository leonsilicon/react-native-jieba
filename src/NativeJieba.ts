import { TurboModuleRegistry, type TurboModule } from 'react-native';

export interface Spec extends TurboModule {
  isReady(): boolean;
  setDictPath(path: string): void;
  cut(sentence: string, hmm: boolean): string[];
  cutAll(sentence: string): string[];
  cutForSearch(sentence: string, hmm: boolean): string[];
  cutHMM(sentence: string): string[];
  cutSmall(sentence: string, maxWordLen: number): string[];
  tag(sentence: string): Array<{ word: string; tag: string }>;
  extract(
    sentence: string,
    topK: number
  ): Array<{ word: string; weight: number }>;
  insertUserWord(word: string, tag: string): boolean;
  find(word: string): boolean;
}

export default TurboModuleRegistry.getEnforcing<Spec>('Jieba');
