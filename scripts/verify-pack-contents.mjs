#!/usr/bin/env node
// Fails the publish when the vendored cppjieba submodule is not checked out.
//
// `cpp/cppjieba/` is a git SUBMODULE, and a plain `git clone` leaves it empty. npm then packs
// nothing for those paths and still exits 0, producing a tarball that looks fine but omits every
// cppjieba header the wrapper #includes AND all five dictionaries. That shipped once as 0.4.0:
// 28.6 KB and 65 entries, against 4,222.7 KB and 103 entries for 0.3.0. Consumers cannot compile
// it ("cppjieba/DictTrie.hpp: No such file or directory"), and the missing dict files would break
// segmentation at runtime.
//
// Runs from `prepack`, so it guards `npm publish`, `npm pack`, and `release-it` alike.
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;

// Submodule content: headers the wrapper includes (one from the nested limonp submodule) plus
// every dictionary the podspec/gradle ship as resources.
const SUBMODULE_REQUIRED = [
  "cpp/cppjieba/include/cppjieba/Jieba.hpp",
  "cpp/cppjieba/include/cppjieba/KeywordExtractor.hpp",
  "cpp/cppjieba/deps/limonp/include/limonp/Logging.hpp",
  "cpp/cppjieba/dict/jieba.dict.utf8",
  "cpp/cppjieba/dict/hmm_model.utf8",
  "cpp/cppjieba/dict/user.dict.utf8",
  "cpp/cppjieba/dict/idf.utf8",
  "cpp/cppjieba/dict/stop_words.utf8",
];

// Build outputs, produced by `prepare` (bob build + codegen). Missing whenever a pack ran with
// --ignore-scripts or the build silently failed - another way to ship a plausible-looking tarball
// that no consumer can actually use.
const BUILD_REQUIRED = [
  "lib/module/index.js",
  "android/generated/java/com/jieba/NativeJiebaSpec.java",
  "ios/generated/ReactCodegen/JiebaSpec/JiebaSpec.h",
];

const REQUIRED = [...SUBMODULE_REQUIRED, ...BUILD_REQUIRED];

const missing = REQUIRED.filter((rel) => {
  const path = join(root, rel);
  return !existsSync(path) || statSync(path).size === 0;
});

if (missing.length > 0) {
  const fixes = [
    missing.some((m) => SUBMODULE_REQUIRED.includes(m))
      ? "  git submodule update --init --recursive"
      : null,
    missing.some((m) => BUILD_REQUIRED.includes(m))
      ? "  npm install && npm run prepare   (do not pack with --ignore-scripts)"
      : null,
  ].filter(Boolean);

  console.error(
    "\n[react-native-jieba] Refusing to pack: the tarball would be missing required files.\n\n" +
      `Missing or empty:\n${missing.map((m) => `  - ${m}`).join("\n")}\n\n` +
      `Fix with:\n${fixes.join("\n")}\n\n` +
      "A tarball missing any of these cannot be consumed. Packing without the cppjieba submodule\n" +
      "is how 0.4.0 shipped: 29 KB instead of 4.2 MB, with no cppjieba header or dictionary.\n",
  );
  process.exit(1);
}

console.log("[react-native-jieba] cppjieba submodule present — pack contents OK.");
