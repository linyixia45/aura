<p align="center">
  <img src="https://img.shields.io/github/stars/linyixia45/aura?style=social" alt="Stars" />
  <img src="https://img.shields.io/github/license/linyixia45/aura" alt="License" />
  <img src="https://img.shields.io/badge/size-%3C5kb-blue" alt="Size" />
</p>

# Aura

> **Vue-like 轻量响应式框架**，内置反「AI 味」设计系统。零构建、零依赖，让 AI 生成的页面不再千篇一律。

**[📦 在线 Demo](https://linyixia45.github.io/aura/)**

[English](#english) | 简体中文

---

## 为什么做 Aura？

AI 生成的网页总是一个味道：紫色渐变、Inter 字体、8px 圆角……**审美疲劳**。Aura 内置反 cliché 设计令牌，采用 **Vue 式 API**，上手即用。

## 为什么 Vue 式？（借鉴 Vue 的设计哲学）

| Vue 受欢迎的原因 | Aura 对应 |
|-----------------|----------|
| **渐进式** | 零构建，一个 `<script>` 即可用 |
| **学习曲线平缓** | 会 Vue 就会 Aura，API 高度一致 |
| **模板直观** | HTML 风模板，`{{ }}`、`v-if`、`v-for` |
| **响应式简单** | `ref`、`computed`，逻辑清晰 |
| **灵活** | 小到单页，大到多页，均可胜任 |

---

## ✨ 特性

| 特性 | 说明 |
|------|------|
| 🎯 **Vue 式 API** | `ref`、`computed`、`setup`、`createApp`，会 Vue 就会 Aura |
| 📝 **完整模板语法** | `{{ }}`、`v-if`、`v-show`、`v-for`、`v-model`、`:class`、`:style`、`@event` |
| 🎨 **反 AI 味设计** | 大地色/墨色 palette，非 Inter 字体，克制圆角与阴影 |
| 📦 **零构建零依赖** | 纯 ES 模块，直接 `<script>` 引用或 CDN |
| ⚡ **轻量** | 核心 < 5KB，适合嵌入与快速迭代 |
| 🖥️ **在线 Demo** | [linyixia45.github.io/aura](https://linyixia45.github.io/aura) |

---

## 🚀 快速开始

### CDN（推荐）

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/linyixia45/aura@v0.1.0/src/design-tokens.css" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/linyixia45/aura@v0.1.0/src/components.css" />
<script src="https://cdn.jsdelivr.net/gh/linyixia45/aura@v0.1.0/src/aura.js"></script>

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
    setup() {
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

### Git 克隆

```bash
git clone -b v0.1.0 https://github.com/linyixia45/aura.git
```

---

## 📖 模板指令

| 指令 | 示例 |
|------|------|
| 插值 | `{{ expr }}` |
| 条件 | `v-if="expr"` / `v-show="expr"` |
| 列表 | `v-for="item in list"` / `v-for="(item, idx) in list"` |
| 双向绑定 | `v-model="ref"` |
| 绑定 | `:checked` `:class` `:style` `:href` |
| 事件 | `@click` `@click.prevent` `@click.stop` `@keydown.enter` 等 |

## 📖 响应式 API

| API | 说明 |
|-----|------|
| `ref` / `computed` | 响应式值与计算属性 |
| `watch` / `watchEffect` | 监听变化 |
| `defineComponent` | 组件选项封装（Vue 风格） |
| `toRefs` / `nextTick` | 工具函数 |
| `onMounted` / `onUnmounted` | 生命周期 |

---

## 🎨 设计令牌

避免 AI 味的配色与字体，开箱即用：

```css
--aura-bg / --aura-fg    /* 背景 / 前景 */
--aura-accent            /* 强调色 */
--aura-font-sans         /* DM Sans */
--aura-font-serif        /* Source Serif 4 */
--aura-radius-md         /* 4px 圆角 */
--aura-shadow-md         /* 轻量阴影 */
```

主题：`data-aura-theme="dark"` | `"sharp"`

---

## 📁 项目结构

```
aura/
├── src/
│   ├── aura.js           # 核心
│   ├── aura.min.js       # 压缩版（npm run build）
│   ├── design-tokens.css
│   └── components.css
├── examples/
│   ├── index.html        # 计数器 + 待办
│   ├── demo-full.html    # v-model / v-show / 标签页
│   └── demo-watch.html   # watch / watchEffect
├── docs/
│   └── API.md            # API 参考
└── README.md
```

---

## 🔧 本地运行

```bash
npm run serve
# 或 npx serve .
# 访问 http://localhost:3000/
```

---

## 📚 文档

- [API 参考](docs/API.md)
- [参与贡献](CONTRIBUTING.md)

---

## 📄 License

MIT

---

## <a name="english"></a>English

**Aura** is a Vue-like reactive framework with an **anti-AI-slop** design system. No purple gradients, no Inter font—built-in design tokens and components that steer AI-generated UIs away from the usual clichés. Zero build, zero deps, < 5KB. [Get started](#-快速开始) above.
