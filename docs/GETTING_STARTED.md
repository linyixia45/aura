# Aura 新手指南

欢迎试试 Aura。下面几步就能跑起来。

## Aura 的三种用法（渐进式，像 Vue）

| 用法 | 适合场景 |
|------|----------|
| **CDN 单页** | 复制 starter.html，一个文件就能跑 |
| **增强现有 HTML** | 无 template，用挂载点 innerHTML 作为模板（类似 jQuery） |
| **多组件** | 注册组件，用 `<MyButton>` 复用 |

无 template 时，Aura 会用挂载点的 innerHTML 作为模板，适合在已有页面里局部增强。

## 第一步：获取文件

**方式 A**（推荐）— 直接下载：
```
https://raw.githubusercontent.com/linyixia45/aura/main/starter.html
```
保存为 `index.html`。

**方式 B** — 克隆项目：
```bash
git clone https://github.com/linyixia45/aura.git
cd aura
```

## 第二步：运行

**starter.html** 使用 CDN，可直接用浏览器打开，无需本地服务。

若使用项目内 `examples/` 下的页面，需先启动服务：
```bash
npm start
# 或 npx serve .
```
然后访问 http://localhost:3333/

## 第三步：改第一个字

打开 `starter.html`，找到 `count: ref(0)`，改成 `count: ref(99)`，刷新页面即可看到效果。

## 第四步：加一个按钮

在 template 里随手加一行：
```html
<button class="aura-btn" @click="count++">+1</button>
```
保存刷新。

## 遇到问题？

- **空白页**：examples 需要本地服务，试试 `npm start`，别直接双击 HTML
- **脚本加载失败**：starter 用 CDN，要联网；examples 用 `/src/` 路径，需要先起服务
- **mount 失败**：看看页面上有没有 `id="app"` 的容器，可能是选择器写错了
