#import <Foundation/Foundation.h>
#import "JiebaImpl.h"
#import <ReactCommon/CxxTurboModuleUtils.h>

@interface JiebaOnLoad : NSObject
@end

@implementation JiebaOnLoad

using namespace facebook::react;

+ (void)load
{
  NSBundle *bundle = [NSBundle bundleForClass:[JiebaOnLoad class]];
  NSString *dictPath = [bundle pathForResource:@"jieba.dict" ofType:@"utf8"];
  NSString *dictDir = dictPath ? [dictPath stringByDeletingLastPathComponent] : nil;
  if (dictDir == nil) {
    NSString *mainPath = [[NSBundle mainBundle] pathForResource:@"jieba.dict" ofType:@"utf8"];
    if (mainPath != nil) {
      dictDir = [mainPath stringByDeletingLastPathComponent];
    }
  }
  if (dictDir != nil) {
    JiebaImpl::setDictPathFromNative(std::string([dictDir UTF8String]));
  }

  registerCxxModuleToGlobalModuleMap(
    std::string(JiebaImpl::kModuleName),
    [](std::shared_ptr<CallInvoker> jsInvoker) {
      return std::make_shared<JiebaImpl>(jsInvoker);
    }
  );
}

@end
