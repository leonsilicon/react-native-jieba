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

  s.resources = ["cpp/cppjieba/dict/*.utf8"]

  s.pod_target_xcconfig = {
    "HEADER_SEARCH_PATHS" => [
      "\"$(PODS_TARGET_SRCROOT)/cpp/cppjieba/include\"",
      "\"$(PODS_TARGET_SRCROOT)/cpp/cppjieba/deps/limonp/include\"",
    ].join(" "),
    "CLANG_CXX_LANGUAGE_STANDARD" => "c++20",
  }

  install_modules_dependencies(s)
end
