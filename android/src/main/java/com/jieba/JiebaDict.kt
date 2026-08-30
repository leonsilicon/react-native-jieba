package com.jieba

import android.content.Context
import java.io.File
import java.io.FileOutputStream

/**
 * Shared dictionary extraction logic for Android.
 *
 * The cppjieba dictionaries ship as compressed APK assets, but cppjieba needs
 * real filesystem paths. This object extracts them once into `filesDir/jieba-dict`
 * and returns the directory.
 *
 * It is used from two places:
 *  - [JiebaAndroidHelperModule.prepareDictDir] — the async warm-up exposed to JS
 *    via `prepareJieba()`.
 *  - [extractDictDirFromNative] — a synchronous entry point invoked from C++
 *    (`JiebaImpl::getJieba`) on the very first segmentation call if `prepareJieba()`
 *    was never awaited, so that callers don't have to call `prepareJieba` at all.
 */
object JiebaDict {
  const val DICT_DIR_NAME = "jieba-dict"

  /** The IDF dictionary, needed only by `extract()` (TF-IDF keyword extraction). */
  const val IDF_DICT_FILE = "idf.utf8"

  /**
   * Dictionary assets to extract.
   *
   * [IDF_DICT_FILE] is omitted when the library was built with `rnJiebaExcludeIdfDict=true`, since
   * the asset is then not packaged at all and opening it would throw. `extract()` reports the
   * omission with a descriptive error; every other API is unaffected.
   */
  val DICT_FILES: Array<String> = buildList {
    add("jieba.dict.utf8")
    add("hmm_model.utf8")
    add("user.dict.utf8")
    if (!BuildConfig.RN_JIEBA_EXCLUDE_IDF_DICT) add(IDF_DICT_FILE)
    add("stop_words.utf8")
  }.toTypedArray()

  /**
   * Application context captured at module construction so the native (C++)
   * fallback can extract assets without a `ReactApplicationContext` handle.
   */
  @Volatile
  private var appContext: Context? = null

  @JvmStatic
  fun setContext(context: Context) {
    if (appContext == null) {
      appContext = context.applicationContext
    }
  }

  /** Synchronously extract the dictionary assets and return the directory path. */
  @JvmStatic
  fun extractDictDir(context: Context): String {
    val dictDir = File(context.filesDir, DICT_DIR_NAME)
    if (!dictDir.exists()) dictDir.mkdirs()
    for (filename in DICT_FILES) {
      val target = File(dictDir, filename)
      if (target.exists() && target.length() > 0) continue
      context.assets.open(filename).use { input ->
        FileOutputStream(target).use { output ->
          input.copyTo(output)
        }
      }
    }
    return dictDir.absolutePath
  }

  /**
   * Called from C++ via JNI. Returns the dict directory path, or an empty
   * string if no context has been captured yet (extraction not possible).
   */
  @JvmStatic
  fun extractDictDirFromNative(): String {
    val context = appContext ?: return ""
    return extractDictDir(context)
  }
}
