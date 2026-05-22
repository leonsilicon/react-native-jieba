#include "JiebaImpl.h"

#include <cppjieba/Jieba.hpp>

#include <memory>
#include <mutex>
#include <stdexcept>
#include <string>
#include <utility>
#include <vector>

namespace facebook::react {

namespace {

std::mutex& dictMutex() {
  static std::mutex m;
  return m;
}

std::string& dictPathStorage() {
  static std::string p;
  return p;
}

std::unique_ptr<cppjieba::Jieba>& jiebaStorage() {
  static std::unique_ptr<cppjieba::Jieba> j;
  return j;
}

std::string joinPath(const std::string& dir, const std::string& filename) {
  if (dir.empty()) return filename;
  char last = dir[dir.size() - 1];
  if (last == '/' || last == '\\') return dir + filename;
  return dir + "/" + filename;
}

jsi::Array stringVectorToArray(jsi::Runtime& rt, const std::vector<std::string>& words) {
  jsi::Array arr(rt, words.size());
  for (size_t i = 0; i < words.size(); ++i) {
    arr.setValueAtIndex(rt, i, jsi::String::createFromUtf8(rt, words[i]));
  }
  return arr;
}

}

JiebaImpl::JiebaImpl(
  std::shared_ptr<CallInvoker> jsInvoker
)
  : NativeJiebaCxxSpec(std::move(jsInvoker)) {}

void JiebaImpl::setDictPathFromNative(const std::string& dictPath) {
  std::lock_guard<std::mutex> lock(dictMutex());
  if (dictPathStorage() != dictPath) {
    dictPathStorage() = dictPath;
    jiebaStorage().reset();
  }
}

void JiebaImpl::setDictPath(jsi::Runtime& rt, jsi::String path) {
  setDictPathFromNative(path.utf8(rt));
}

cppjieba::Jieba& JiebaImpl::getJieba() {
  std::lock_guard<std::mutex> lock(dictMutex());
  if (!jiebaStorage()) {
    const std::string& base = dictPathStorage();
    if (base.empty()) {
      throw std::runtime_error(
        "react-native-jieba: dictionary path not set. "
        "The native module failed to locate bundled dict files."
      );
    }
    jiebaStorage() = std::make_unique<cppjieba::Jieba>(
      joinPath(base, "jieba.dict.utf8"),
      joinPath(base, "hmm_model.utf8"),
      joinPath(base, "user.dict.utf8"),
      joinPath(base, "idf.utf8"),
      joinPath(base, "stop_words.utf8")
    );
  }
  return *jiebaStorage();
}

jsi::Array JiebaImpl::cut(jsi::Runtime& rt, jsi::String sentence, bool hmm) {
  std::vector<std::string> words;
  getJieba().Cut(sentence.utf8(rt), words, hmm);
  return stringVectorToArray(rt, words);
}

jsi::Array JiebaImpl::cutAll(jsi::Runtime& rt, jsi::String sentence) {
  std::vector<std::string> words;
  getJieba().CutAll(sentence.utf8(rt), words);
  return stringVectorToArray(rt, words);
}

jsi::Array JiebaImpl::cutForSearch(jsi::Runtime& rt, jsi::String sentence, bool hmm) {
  std::vector<std::string> words;
  getJieba().CutForSearch(sentence.utf8(rt), words, hmm);
  return stringVectorToArray(rt, words);
}

jsi::Array JiebaImpl::cutHMM(jsi::Runtime& rt, jsi::String sentence) {
  std::vector<std::string> words;
  getJieba().CutHMM(sentence.utf8(rt), words);
  return stringVectorToArray(rt, words);
}

jsi::Array JiebaImpl::cutSmall(jsi::Runtime& rt, jsi::String sentence, double maxWordLen) {
  std::vector<std::string> words;
  size_t maxLen = maxWordLen <= 0 ? 0 : static_cast<size_t>(maxWordLen);
  getJieba().CutSmall(sentence.utf8(rt), words, maxLen);
  return stringVectorToArray(rt, words);
}

jsi::Array JiebaImpl::tag(jsi::Runtime& rt, jsi::String sentence) {
  std::vector<std::pair<std::string, std::string>> tagged;
  getJieba().Tag(sentence.utf8(rt), tagged);
  jsi::Array arr(rt, tagged.size());
  for (size_t i = 0; i < tagged.size(); ++i) {
    jsi::Object obj(rt);
    obj.setProperty(rt, "word", jsi::String::createFromUtf8(rt, tagged[i].first));
    obj.setProperty(rt, "tag", jsi::String::createFromUtf8(rt, tagged[i].second));
    arr.setValueAtIndex(rt, i, std::move(obj));
  }
  return arr;
}

jsi::Array JiebaImpl::extract(jsi::Runtime& rt, jsi::String sentence, double topK) {
  std::vector<cppjieba::KeywordExtractor::Word> keywords;
  size_t n = topK <= 0 ? 5 : static_cast<size_t>(topK);
  getJieba().extractor.Extract(sentence.utf8(rt), keywords, n);
  jsi::Array arr(rt, keywords.size());
  for (size_t i = 0; i < keywords.size(); ++i) {
    jsi::Object obj(rt);
    obj.setProperty(rt, "word", jsi::String::createFromUtf8(rt, keywords[i].word));
    obj.setProperty(rt, "weight", jsi::Value(keywords[i].weight));
    arr.setValueAtIndex(rt, i, std::move(obj));
  }
  return arr;
}

bool JiebaImpl::insertUserWord(jsi::Runtime& rt, jsi::String word, jsi::String tag) {
  std::string t = tag.utf8(rt);
  if (t.empty()) t = cppjieba::UNKNOWN_TAG;
  return getJieba().InsertUserWord(word.utf8(rt), t);
}

bool JiebaImpl::find(jsi::Runtime& rt, jsi::String word) {
  return getJieba().Find(word.utf8(rt));
}

}
