require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "Jieba"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => min_ios_version_supported }
  s.source       = { :git => "https://github.com/leonsilicon/react-native-jieba.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,mm}", "cpp/*.{hpp,cpp,c,h}", "ios/generated/*.{h,cpp,mm}"
  # JiebaDictAndroid.{cpp,h} depend on fbjni and are Android-only.
  s.exclude_files = "cpp/JiebaDictAndroid.{cpp,h}"
  s.private_header_files = "ios/**/*.h"

  # The IDF dictionary (~5MB) is only read by `extract()` (TF-IDF keyword extraction). Apps that
  # only tokenize can drop it from the bundle by setting RN_JIEBA_EXCLUDE_IDF_DICT=1 in the
  # environment that evaluates the Podfile, e.g.
  #
  #   ENV["RN_JIEBA_EXCLUDE_IDF_DICT"] = "1"   # in the Podfile, before use_react_native!
  #
  # `extract()` then throws a descriptive error, exactly as it already does on web (jieba-wasm
  # ships no IDF data). Every other API is unaffected.
  exclude_idf_dict = ENV["RN_JIEBA_EXCLUDE_IDF_DICT"] == "1"
  dict_files = Dir.glob(File.join(__dir__, "cpp/cppjieba/dict/*.utf8")).map do |path|
    "cpp/cppjieba/dict/#{File.basename(path)}"
  end
  dict_files.reject! { |path| File.basename(path) == "idf.utf8" } if exclude_idf_dict

  s.resources = dict_files

  s.pod_target_xcconfig = {
    "HEADER_SEARCH_PATHS" => [
      "\"$(PODS_TARGET_SRCROOT)/cpp/cppjieba/include\"",
      "\"$(PODS_TARGET_SRCROOT)/cpp/cppjieba/deps/limonp/include\"",
    ].join(" "),
    "CLANG_CXX_LANGUAGE_STANDARD" => "c++20",
  }

  install_modules_dependencies(s)
end
