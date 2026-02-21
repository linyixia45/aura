# Aura 架构概览

供 AI 与贡献者理解项目结构。

## 目录

```
src/
  aura.js          # 核心：响应式 + 模板编译 + createApp
  design-tokens.css# 设计令牌
  components.css   # 基础组件样式
examples/          # 示例页面
docs/              # 文档
```

## 核心流程

1. `createApp({ template, setup })` 调用 `setup(api)` 得到 ctx
2. `renderTemplate` 将 template 编译为 HTML，注入 container
3. `effect(update)` 建立响应式依赖，数据变化时重新编译并更新 DOM
4. `bindEvents` 绑定 `@click` 等事件

## 模板处理顺序

1. v-for
2. v-model
3. :attr（v-bind）
4. :class
5. :style
6. v-show
7. {{ }}
8. v-html
9. v-if

## 响应式

基于 Proxy + Dep：`ref`/`reactive` 的 get 收集 effect，set 触发 notify。
