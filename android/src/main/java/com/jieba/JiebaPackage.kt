package com.jieba

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

class JiebaPackage : BaseReactPackage() {
  override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
    // Capture an application context as early as possible so the C++ module can
    // lazily extract the bundled dictionaries on first use without requiring a
    // call to prepareJieba().
    JiebaDict.setContext(reactContext)
    return if (name == JiebaAndroidHelperModule.NAME) {
      JiebaAndroidHelperModule(reactContext)
    } else {
      null
    }
  }

  override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
    return ReactModuleInfoProvider {
      mapOf(
        JiebaAndroidHelperModule.NAME to ReactModuleInfo(
          JiebaAndroidHelperModule.NAME,
          JiebaAndroidHelperModule::class.java.name,
          false,
          false,
          false,
          true,
        )
      )
    }
  }
}
