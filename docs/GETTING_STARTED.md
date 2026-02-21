# Aura 新手指南

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

在 template 里加一行：
```html
<button class="aura-btn" @click="count++">+1</button>
```
保存刷新。

## 遇到问题？

- 空白页：确认用 `npm start` 或本地服务，不要直接双击 HTML（examples 需要）
- 脚本加载失败：starter.html 用 CDN，需联网
- mount 失败：检查 `#app` 元素是否存在
