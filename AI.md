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
| `unref(v)` | ref 取 value，非 ref 返回自身 | `unref(maybeRef)` |
| `isRef(v)` | 判断是否为 ref | `isRef(x)` |

## 四、模板指令

| 指令 | 语法 | 说明 |
|------|------|------|
| 插值 | `{{ expr }}` | 自动 HTML 转义 |
| 条件 | `v-if="expr"` | 为假时隐藏 |
| 显示 | `v-show="expr"` | 切换 display |
| 列表 | `v-for="item in list"` | 或 `v-for="(item, i) in list"` |
| 双向 | `v-model="ref"` | 仅支持 input 等表单 |
| 属性 | `:attr="expr"` | 如 `:href` `:class` `:disabled` |
| 事件 | `@click="fn"` | 函数名，或内联 `@click="count++"` / `@click="count--"` |
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

**设计感组件**：`aura-display aura-display-xl`（大标题）、`aura-hero`（首屏区）、`aura-hero-tagline`、`aura-grid aura-grid-2`（网格）、`aura-section`

**主题**：`data-aura-theme="editorial"`（杂志风/大胆排版）、`data-aura-theme="monochrome"`（极简单色）、`data-aura-theme="dark"`、`data-aura-theme="sharp"`

## 七、设计配方（供 AI 生成有设计感的页面）

参考 Awwwards 2024-2025 获奖网站及反 AI 味设计趋势，遵循以下模式可生成有辨识度的页面：

### 配方 1：杂志 / 编辑风（Maximalist Typography）

- **大标题**：使用 `aura-display aura-display-xl`，文案简短有力（3–6 字）
- **副标题**：`aura-hero-tagline`，补充说明
- **布局**：`aura-hero` 居中、`aura-grid aura-grid-2` 或 `aura-grid-3` 分栏
- **主题**：`<body class="aura-app" data-aura-theme="editorial">`
- **留白**：`aura-section` 控制区块间距

### 配方 2：极简单色（Igloo / Opal 风格）

- **主题**：`data-aura-theme="monochrome"`
- **配色**：仅灰白双色，高对比，无彩色点缀
- **圆角**：可配合 `data-aura-theme="sharp"` 做直角
- **适用**：品牌页、产品介绍、极简落地页

### 配方 3：Aura 默认（大地色 / 森林绿）

- 使用 `aura-app` 默认主题
- 字体：`Source Serif 4` 标题 + `DM Sans` 正文
- 强调色：森林绿 `var(--aura-accent)`，避免紫色、蓝紫渐变

### 通用原则

- **禁止**：紫色渐变、Inter/Roboto、过度圆角（>8px）、大 blur 阴影
- **推荐**：流体字号 `var(--aura-display-xl)`、网格布局、留白充足
- **参考示例**：`examples/demo-editorial.html`

## 八、常见错误

1. `@click="count++"` 已支持 ✅；复杂逻辑仍建议用函数名
2. 路径 `../src/` ❌ → 用 `/src/` ✅
3. 直接双击 HTML ❌ → 用 `npm run serve` 等本地服务 ✅

## 九、示例文件

- `examples/index.html` - 基础
- `examples/demo-full.html` - 完整
- `examples/demo-landing.html` - 落地页
- `examples/demo-timer.html` - 计时器
- `examples/demo-editorial.html` - 杂志风 / 大胆排版
