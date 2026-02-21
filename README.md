# Aura

一个**类似 Vue** 的轻量响应式框架，内置**反「AI 味」**设计系统，用于减少 AI 生成网页的千篇一律感（紫色渐变、Inter 字体、过圆角等）。

## 特性

- **Vue 式 API**：`createApp`、`ref`、`computed`、`setup`
- **模板语法**：`{{ }}`、`v-if`、`v-for`、`:attr`、`@event`
- **设计令牌**：大地色/墨色/森林色 palette，DM Sans / Source Serif 字体，克制圆角与阴影

## 快速开始

```html
<link rel="stylesheet" href="src/design-tokens.css" />
<link rel="stylesheet" href="src/components.css" />
<script src="src/aura.js"></script>

<div id="app"></div>

<script>
  const { createApp, ref } = window.Aura;

  createApp({
    template: `
      <div>
        <h1 class="aura-title aura-title-lg">{{ title }}</h1>
        <p>{{ count }}</p>
        <button class="aura-btn aura-btn-primary" @click="increment">+1</button>
      </div>
    `,
    setup(api) {
      const title = ref('Hello Aura');
      const count = ref(0);
      return {
        title,
        count,
        increment: () => count.value++,
      };
    },
  }).mount('#app');
</script>
```

## 模板指令

| 指令 | 示例 |
|------|------|
| 插值 | `{{ expr }}` |
| 条件 | `v-if="expr"` |
| 显示 | `v-show="expr"` |
| 列表 | `v-for="item in list"` |
| 双向绑定 | `v-model="ref"` |
| 绑定 | `:checked="bool"` `:class="{ active: x }"` `:style="{ color: c }"` |
| 事件 | `@click="handler"` `@input="onInput"` |

## 生命周期

`setup(api)` 接收 `{ onMounted }`，用于 DOM 挂载后执行：

```js
setup({ onMounted }) {
  onMounted(() => console.log('mounted'));
  return {};
}
```

## 设计令牌

在 CSS 中使用 `var(--aura-*)` 变量，例如：

- `--aura-bg` / `--aura-fg`：背景 / 前景色
- `--aura-accent`：强调色
- `--aura-font-sans` / `--aura-font-serif`：字体
- `--aura-radius-md`：圆角
- `--aura-shadow-md`：阴影

主题：`data-aura-theme="dark"` 或 `"sharp"`。

## 运行示例

```bash
# 使用任意静态服务器
npx serve .
# 或
python -m http.server 8080
```

然后打开 `http://localhost:8080/examples/index.html`。

## 文件结构

```
├── src/
│   ├── aura.js          # 核心框架
│   ├── design-tokens.css # 设计令牌
│   └── components.css   # 基础组件样式
├── examples/
│   ├── index.html       # 基础示例
│   └── demo-full.html   # 完整示例（v-model/v-show/onMounted/标签页）
└── README.md
```
