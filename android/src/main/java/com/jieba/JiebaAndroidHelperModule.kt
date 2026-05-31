package com.jieba

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.annotations.ReactModule

@ReactModule(name = JiebaAndroidHelperModule.NAME)
class JiebaAndroidHelperModule(reactContext: ReactApplicationContext) :
  NativeJiebaAndroidHelperSpec(reactContext) {

  init {
    // Capture an application context so the C++ side can lazily extract the
    // dictionaries on first use, even if JS never calls prepareJieba().
    JiebaDict.setContext(reactContext)
  }

  override fun getName(): String = NAME

  override fun prepareDictDir(promise: Promise) {
    val context = reactApplicationContext
    Thread {
      try {
        promise.resolve(JiebaDict.extractDictDir(context))
      } catch (t: Throwable) {
        promise.reject("E_JIEBA_DICT_EXTRACT", t.message, t)
      }
    }.start()
  }

  companion object {
    const val NAME = "JiebaAndroidHelper"
  }
}
