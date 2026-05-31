#pragma once

#include <string>

namespace facebook::react {

// Android-only: synchronously extracts the bundled dictionary assets (via a
// JNI call into Kotlin) and returns the directory path. Returns an empty string
// if extraction is not possible yet (e.g. no application context captured).
//
// Defined in JiebaDictAndroid.cpp and only compiled on Android.
std::string extractJiebaDictDirAndroid();

}
