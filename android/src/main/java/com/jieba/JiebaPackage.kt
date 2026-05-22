package com.jieba

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

class JiebaPackage : BaseReactPackage() {
  override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
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
