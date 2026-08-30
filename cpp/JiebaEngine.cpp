#include "JiebaEngine.h"

#include <fstream>

namespace rnjieba {

bool JiebaEngine::UnicodeFileExists(const std::string& path) {
  if (path.empty()) {
    return false;
  }
  // Probe by opening rather than stat()-ing: cppjieba itself loads the dictionary through
  // an ifstream, so this reports exactly the condition that would otherwise trip its
  // XCHECK — including a path that exists but cannot be read.
  std::ifstream ifs(path.c_str());
  return ifs.is_open();
}

}
