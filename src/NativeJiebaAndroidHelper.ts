import { TurboModuleRegistry, type TurboModule } from 'react-native';

export interface Spec extends TurboModule {
  prepareDictDir(): Promise<string>;
}

export default TurboModuleRegistry.get<Spec>('JiebaAndroidHelper');
