#pragma once

#include <cppjieba/DictTrie.hpp>
#include <cppjieba/FullSegment.hpp>
#include <cppjieba/HMMModel.hpp>
#include <cppjieba/HMMSegment.hpp>
#include <cppjieba/KeywordExtractor.hpp>
#include <cppjieba/MPSegment.hpp>
#include <cppjieba/MixSegment.hpp>
#include <cppjieba/QuerySegment.hpp>

#include <memory>
#include <string>
#include <utility>
#include <vector>

namespace rnjieba {

/**
 * A cppjieba engine whose keyword extractor is built ON DEMAND.
 *
 * `cppjieba::Jieba` holds `KeywordExtractor` by value, so its constructor always
 * loads `idf.utf8` and hard-fails (XCHECK) when that file is absent. That makes the
 * ~5MB IDF dictionary a mandatory dependency of plain segmentation, even though only
 * `extract()` ever reads it.
 *
 * This type composes the same cppjieba primitives directly, sharing one `DictTrie` and
 * one `HMMModel` across every segmenter exactly as `cppjieba::Jieba` does, but defers the
 * `KeywordExtractor` until `extract()` is first called. Apps that only tokenize therefore
 * never load the IDF dictionary — and may omit the file from their bundle entirely (see
 * `excludeIdfDict` in the README).
 */
class JiebaEngine {
public:
  JiebaEngine(
    std::string dictPath,
    std::string hmmModelPath,
    std::string userDictPath,
    std::string idfPath,
    std::string stopWordPath
  )
    : idfPath_(std::move(idfPath)),
      stopWordPath_(std::move(stopWordPath)),
      dictTrie_(dictPath, userDictPath),
      model_(hmmModelPath),
      mpSeg_(&dictTrie_),
      hmmSeg_(&model_),
      mixSeg_(&dictTrie_, &model_),
      fullSeg_(&dictTrie_),
      querySeg_(&dictTrie_, &model_) {}

  void Cut(const std::string& sentence, std::vector<std::string>& words, bool hmm) const {
    mixSeg_.Cut(sentence, words, hmm);
  }
  void CutAll(const std::string& sentence, std::vector<std::string>& words) const {
    fullSeg_.Cut(sentence, words);
  }
  void CutForSearch(const std::string& sentence, std::vector<std::string>& words, bool hmm) const {
    querySeg_.Cut(sentence, words, hmm);
  }
  void CutHMM(const std::string& sentence, std::vector<std::string>& words) const {
    hmmSeg_.Cut(sentence, words);
  }
  void CutSmall(
    const std::string& sentence,
    std::vector<std::string>& words,
    size_t maxWordLen
  ) const {
    mpSeg_.Cut(sentence, words, maxWordLen);
  }
  void Tag(
    const std::string& sentence,
    std::vector<std::pair<std::string, std::string>>& words
  ) const {
    mixSeg_.Tag(sentence, words);
  }
  bool InsertUserWord(const std::string& word, const std::string& tag) {
    return dictTrie_.InsertUserWord(word, tag);
  }
  bool Find(const std::string& word) {
    return dictTrie_.Find(word);
  }

  /**
   * The TF-IDF keyword extractor, constructed on first use.
   *
   * Reuses this engine's already-loaded trie and HMM model, so the only additional cost is
   * reading `idf.utf8` and `stop_words.utf8`. Throws `std::runtime_error` when the IDF
   * dictionary is missing — mirroring the web backend, where `extract()` is likewise
   * unsupported because jieba-wasm ships no IDF data.
   */
  const cppjieba::KeywordExtractor& Extractor() {
    if (!extractor_) {
      if (!UnicodeFileExists(idfPath_)) {
        throw std::runtime_error(
          "react-native-jieba: extract() is unavailable because the IDF dictionary was not "
          "found at '" + idfPath_ + "'. This build excluded it (see the `excludeIdfDict` "
          "build flag). Re-enable the IDF dictionary to use extract(); cut()/tag() are "
          "unaffected."
        );
      }
      extractor_ = std::make_unique<cppjieba::KeywordExtractor>(
        &dictTrie_, &model_, idfPath_, stopWordPath_
      );
    }
    return *extractor_;
  }

private:
  static bool UnicodeFileExists(const std::string& path);

  std::string idfPath_;
  std::string stopWordPath_;

  cppjieba::DictTrie dictTrie_;
  cppjieba::HMMModel model_;

  // All share the trie and model above.
  cppjieba::MPSegment mpSeg_;
  cppjieba::HMMSegment hmmSeg_;
  cppjieba::MixSegment mixSeg_;
  cppjieba::FullSegment fullSeg_;
  cppjieba::QuerySegment querySeg_;

  std::unique_ptr<cppjieba::KeywordExtractor> extractor_;
};

}
