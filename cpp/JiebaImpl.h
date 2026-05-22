#pragma once

#include <JiebaSpecJSI.h>

#include <memory>
#include <mutex>
#include <string>

namespace cppjieba {
class Jieba;
}

namespace facebook::react {

class JiebaImpl
  : public NativeJiebaCxxSpec<JiebaImpl> {
public:
  JiebaImpl(std::shared_ptr<CallInvoker> jsInvoker);

  static void setDictPathFromNative(const std::string& dictPath);

  void setDictPath(jsi::Runtime& rt, jsi::String path);
  jsi::Array cut(jsi::Runtime& rt, jsi::String sentence, bool hmm);
  jsi::Array cutAll(jsi::Runtime& rt, jsi::String sentence);
  jsi::Array cutForSearch(jsi::Runtime& rt, jsi::String sentence, bool hmm);
  jsi::Array cutHMM(jsi::Runtime& rt, jsi::String sentence);
  jsi::Array cutSmall(jsi::Runtime& rt, jsi::String sentence, double maxWordLen);
  jsi::Array tag(jsi::Runtime& rt, jsi::String sentence);
  jsi::Array extract(jsi::Runtime& rt, jsi::String sentence, double topK);
  bool insertUserWord(jsi::Runtime& rt, jsi::String word, jsi::String tag);
  bool find(jsi::Runtime& rt, jsi::String word);

private:
  cppjieba::Jieba& getJieba();
};

}
