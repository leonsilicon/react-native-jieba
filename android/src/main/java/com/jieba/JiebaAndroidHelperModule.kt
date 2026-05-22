package com.jieba

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.annotations.ReactModule
import java.io.File
import java.io.FileOutputStream

@ReactModule(name = JiebaAndroidHelperModule.NAME)
class JiebaAndroidHelperModule(reactContext: ReactApplicationContext) :
  NativeJiebaAndroidHelperSpec(reactContext) {

  override fun getName(): String = NAME

  override fun prepareDictDir(promise: Promise) {
    val context = reactApplicationContext
    Thread {
      try {
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
        promise.resolve(dictDir.absolutePath)
      } catch (t: Throwable) {
        promise.reject("E_JIEBA_DICT_EXTRACT", t.message, t)
      }
    }.start()
  }

  companion object {
    const val NAME = "JiebaAndroidHelper"
    private const val DICT_DIR_NAME = "jieba-dict"
    private val DICT_FILES = arrayOf(
      "jieba.dict.utf8",
      "hmm_model.utf8",
      "user.dict.utf8",
      "idf.utf8",
      "stop_words.utf8",
    )
  }
}
