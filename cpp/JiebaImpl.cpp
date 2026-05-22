#include "JiebaImpl.h"

namespace facebook::react {

JiebaImpl::JiebaImpl(
  std::shared_ptr<CallInvoker> jsInvoker
)
  : NativeJiebaCxxSpec(std::move(jsInvoker)) {}

double JiebaImpl::multiply(
  jsi::Runtime& rt,
  double a,
  double b
) {
  return a * b;
}

}
