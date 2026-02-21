# Changelog

## [0.1.0] - 2025-02

### 新增

- Vue 式响应式 API：`ref`、`computed`、`reactive`、`effect`
- 模板指令：`{{ }}`、`v-if`、`v-show`、`v-for`、`v-model`、`:class`、`:style`、`@event`
- 事件修饰符：`@keydown.enter`、`@keydown.esc`、`@keydown.tab`、`@keydown.space`
- `v-for="(item, index) in list"` 语法
- `v-html` 原始 HTML 渲染
- 生命周期：`onMounted`
- 响应式工具：`watch`、`watchEffect`、`toRefs`、`nextTick`
- 反 AI 味设计令牌与基础组件
- XSS 转义（`{{ }}` 插值）
- `npm run build` 生成压缩版

### 后续优化

- `@click.prevent` / `@click.stop` / `@click.self`
- `onUnmounted` 生命周期
- `defineComponent` 组件封装
- `@click="count++"` / `@click="count--"` 内联表达式
- `starter.html` 零配置入门
- `unref()` 工具函数
- `v-cloak` 防闪烁
- 友好错误提示
