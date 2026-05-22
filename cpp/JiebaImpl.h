#pragma once

#include <JiebaSpecJSI.h>

#include <memory>

namespace facebook::react {

class JiebaImpl
  : public NativeJiebaCxxSpec<JiebaImpl> {
public:
  JiebaImpl(std::shared_ptr<CallInvoker> jsInvoker);

  double multiply(jsi::Runtime& rt, double a, double b);
};

}
