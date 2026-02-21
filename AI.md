# Aura 框架 · AI 使用说明

> 写给 AI：用这个框架帮用户做点不一样的东西吧。下面是你需要知道的一切。

## 一、框架概览

- **Aura**：Vue 风格的轻量响应式框架，零构建，会 Vue 就会用
- **设计目标**：让页面不那么「AI 味」—— 避免紫色渐变、Inter 字体、千篇一律的感觉
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
| 条件链 | `v-else-if="expr"` / `v-else` | 与 v-if 相邻，显示首个为真的分支 |
| 显示 | `v-show="expr"` | 切换 display |
| 列表 | `v-for="item in list"` | 或 `v-for="(item, i) in list"` |
| 双向 | `v-model="ref"` | 仅支持 input 等表单 |
| 属性 | `:attr="expr"` | 如 `:href` `:class` `:disabled` |
| 事件 | `@click="fn"` | 函数名，或内联 `@click="count++"` / `@click="count--"` |
| 修饰符 | `@click.prevent` `@click.stop` | `.prevent` `.stop` `.self` |
| 键盘 | `@keydown.enter` | `.enter` `.esc` `.tab` `.space` |
| 组件 | `<MyComponent />` `<my-component>` | props、slot，PascalCase 或 kebab-case |

## 五、组件（Vue 风格）

```js
const MyButton = defineComponent({
  template: `<button @click="onClick"><slot></slot></button>`,
  setup({ props }) { return { onClick: props.onClick }; },
});
createApp({
  components: { MyButton },
  template: `<MyButton :onClick="handleClick">点我</MyButton>`,
  setup() { return { handleClick: () => {} }; },
}).mount('#app');
```

- **PascalCase / kebab-case**：`<MyButton>` 与 `<my-button>` 均可
- **props**：`msg="hi"` 或 `:count="n"` 传入
- **slot**：`<slot></slot>` 占位默认插槽内容

## 六、setup 参数

```js
setup({ onMounted, onUnmounted }) {
  onMounted(() => { /* DOM 已挂载 */ });
  onUnmounted(() => { /* 清理定时器、事件 */ });
  return { /* 暴露给模板 */ };
}
```

## 七、设计约定（反 AI 味）

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

## 八、设计配方（供 AI 生成有设计感的页面）

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

## 九、AI 风格推荐（根据项目自动选风格写样式）

**使用方式**：当用户描述项目或页面类型时，根据下表自动选择主题与组件组合，并生成对应样式。

| 项目类型 | 推荐主题 | 推荐组件/布局 | 说明 |
|----------|----------|----------------|------|
| 作品集 / 个人主页 | `editorial` | `aura-display aura-display-xl`、`aura-hero`、`aura-grid-2` | 杂志风、大胆排版、留白充足 |
| 品牌 / 产品落地页 | `monochrome` 或默认 | `aura-hero`、`aura-section`、`aura-card` | 极简或大地色，强调产品信息 |
| 仪表盘 / 后台 | `monochrome` 或 `dark` | `aura-grid aura-grid-2`、`aura-card`、`aura-tabs` | 信息密度高，克制配色 |
| 博客 / 文章站 | 默认 | `aura-title`、`aura-font-serif`、`aura-section` | 阅读舒适，森林绿点缀 |
| 工具 / 表单页 | 默认 | `aura-input`、`aura-btn`、`aura-alert` | 表单清晰，反馈明确 |
| 营销 / 活动页 | `editorial` | `aura-display`、`aura-hero-tagline`、CTA 按钮突出 | 吸引注意力，行动号召明显 |

**自动输出示例**：若用户说「做一个作品集首页」，应输出：
- `<body class="aura-app" data-aura-theme="editorial">`
- 大标题用 `aura-display aura-display-xl`
- 区块用 `aura-hero`、`aura-section`、`aura-grid aura-grid-2`
- 避免紫色、Inter、大圆角

**若用户未指定类型**：默认使用 `aura-app`（大地色主题）与基础组件。

## 十、常见错误（帮用户避开这些坑）

1. `@click="count++"` 已支持 ✅，简单增减可以直接写；复杂逻辑还是用函数名更清晰
2. 路径 `../src/` ❌ → 用 `/src/` ✅，不然 examples 加载会失败
3. 直接双击 HTML 打不开 examples ❌ → 需要 `npm run serve` 或本地服务 ✅

## 十一、文案建议（生成更人性化的页面）

帮你生成的页面不仅好看，也更像人写的：

- **标题**：简短有力，3–6 字最好，别堆砌关键词
- **副标题 / 描述**：像朋友介绍一样，自然、具体，少用「极致」「完美」「革命性」
- **按钮**：用动词或动作感强的词（「开始」「保存」「试试看」），少用「点击这里」「提交」
- **空状态**：别冷冰冰的「暂无数据」，可以写「这里还没什么」「加一条试试？」

## 十二、示例文件

- `examples/index.html` - 基础
- `examples/demo-full.html` - 完整
- `examples/demo-landing.html` - 落地页
- `examples/demo-timer.html` - 计时器
- `examples/demo-editorial.html` - 杂志风 / 大胆排版
- `examples/demo-v-if-else.html` - v-if / v-else-if / v-else
- `examples/demo-multi-component.html` - 多组件（props、slot）
