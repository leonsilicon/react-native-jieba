cmake_minimum_required(VERSION 3.4.1)
project(Jieba)

set (CMAKE_VERBOSE_MAKEFILE ON)

add_library(
    react-native-jieba    STATIC
    ../cpp/JiebaImpl.cpp
)

set_target_properties(
    react-native-jieba PROPERTIES
    CXX_STANDARD 20
    CXX_STANDARD_REQUIRED ON
    CXX_EXTENSIONS OFF
)

target_include_directories(
    react-native-jieba    PUBLIC
    ../cpp
    ../cpp/cppjieba/include
    ../cpp/cppjieba/deps/limonp/include
)

target_link_libraries(
    react-native-jieba    jsi
    reactnative
    react_codegen_JiebaSpec
)
