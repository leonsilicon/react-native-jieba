#include "JiebaDictAndroid.h"

#include <fbjni/fbjni.h>

namespace facebook::react {

std::string extractJiebaDictDirAndroid() {
  using namespace facebook::jni;

  // Calling a JNI method requires a thread attached to the JVM. cut()/tag()
  // run on the JS thread, which fbjni attaches; ThreadScope makes this robust
  // for any caller thread.
  ThreadScope ts;

  static const auto cls = findClassStatic("com/jieba/JiebaDict");
  static const auto method =
    cls->getStaticMethod<jstring()>("extractDictDirFromNative");

  local_ref<jstring> result = method(cls);
  if (!result) {
    return "";
  }
  return result->toStdString();
}

}
