#import <Foundation/Foundation.h>
#import "JiebaImpl.h"
#import <ReactCommon/CxxTurboModuleUtils.h>

@interface JiebaOnLoad : NSObject
@end

@implementation JiebaOnLoad

using namespace facebook::react;

+ (void)load
{
  registerCxxModuleToGlobalModuleMap(
    std::string(JiebaImpl::kModuleName),
    [](std::shared_ptr<CallInvoker> jsInvoker) {
      return std::make_shared<JiebaImpl>(jsInvoker);
    }
  );
}

@end
