# Aura 框架 · AI 使用说明

> 本文档面向 AI 助手。生成 Aura 相关代码时请以此为准。

## 一、框架概览

- **Aura**：Vue 风格的轻量响应式框架，零构建
- **设计目标**：减少「AI 味」界面（避免紫色渐变、Inter 字体）
- **文件**：`src/aura.js`、`src/design-tokens.css`、`src/components.css`

## 二、最小可运行示例

```html
<link rel="stylesheet" href="/src/design-tokens.css" />
<link rel="stylesheet" href="/src/components.css" />
<script src="/src/aura.js"></script>
<div id="app"></div>
<script>
  const { createApp, ref } = window.Aura;
  createApp({
    template: `<div><h1>{{ title }}</h1><button @click="inc">+1</button></div>`,
    setup() {
      const title = ref('Hello');
      return { title, inc: () => title.value++ };
    },
  }).mount('#app');
</script>
```

## 三、API 速查

| API | 用途 | 示例 |
|-----|------|------|
| `createApp(options)` | 创建应用 | `createApp({ template, setup }).mount('#app')` |
| `ref(initial)` | 响应式值 | `const n = ref(0)`；读写用 `n.value` |
| `computed(getter)` | 计算属性 | `computed(() => a.value + b.value)` |
| `watch(getter, cb, { immediate })` | 监听 | `watch(() => x.value, (v) => {})` |
| `defineComponent(opts)` | 组件封装 | 可选，直接返回 options |
| `nextTick(fn)` | DOM 更新后执行 | `nextTick(() => {})` |

## 四、模板指令

| 指令 | 语法 | 说明 |
|------|------|------|
| 插值 | `{{ expr }}` | 自动 HTML 转义 |
| 条件 | `v-if="expr"` | 为假时隐藏 |
| 显示 | `v-show="expr"` | 切换 display |
| 列表 | `v-for="item in list"` | 或 `v-for="(item, i) in list"` |
| 双向 | `v-model="ref"` | 仅支持 input 等表单 |
| 属性 | `:attr="expr"` | 如 `:href` `:class` `:disabled` |
| 事件 | `@click="fn"` | 必须为 setup 返回的函数名 |
| 修饰符 | `@click.prevent` `@click.stop` | `.prevent` `.stop` `.self` |
| 键盘 | `@keydown.enter` | `.enter` `.esc` `.tab` `.space` |

## 五、setup 参数

```js
setup({ onMounted, onUnmounted }) {
  onMounted(() => { /* DOM 已挂载 */ });
  onUnmounted(() => { /* 清理定时器、事件 */ });
  return { /* 暴露给模板 */ };
}
```

## 六、设计约定（反 AI 味）

**禁止**：紫色/蓝紫渐变、Inter/Roboto、过度圆角、大 blur 阴影

**使用 Aura 令牌**：

```css
var(--aura-bg)      /* 背景 */
var(--aura-fg)      /* 前景 */
var(--aura-accent)  /* 强调 */
var(--aura-muted)   /* 弱化 */
var(--aura-font-sans)
var(--aura-font-serif)
var(--aura-radius-md)
var(--aura-shadow-md)
```

**组件类**：`aura-app` `aura-btn` `aura-btn-primary` `aura-card` `aura-input` `aura-title` `aura-title-lg`

## 七、常见错误

1. `@click="count++"` ❌ → 用 `@click="increment"`，且 `increment: () => count.value++` ✅
2. 路径 `../src/` ❌ → 用 `/src/` ✅
3. 直接双击 HTML ❌ → 用 `npm run serve` 等本地服务 ✅

## 八、示例文件

- `examples/index.html` - 基础
- `examples/demo-full.html` - 完整
- `examples/demo-landing.html` - 落地页
- `examples/demo-timer.html` - 计时器
