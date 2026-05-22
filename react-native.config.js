/**
 * @type {import('@react-native-community/cli-types').UserDependencyConfig}
 */
module.exports = {
  dependency: {
    platforms: {
      android: {
        cmakeListsPath: 'generated/jni/CMakeLists.txt',
        cxxModuleCMakeListsModuleName: 'react-native-jieba',
        cxxModuleCMakeListsPath: 'CMakeLists.txt',
        cxxModuleHeaderName: 'JiebaImpl',
        packageImportPath: 'import com.jieba.JiebaPackage;',
        packageInstance: 'new JiebaPackage()',
      },
    },
  },
};
