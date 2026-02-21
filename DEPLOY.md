# 上传到 Git 远程仓库

## 1. 在 GitHub 上创建新仓库

1. 打开 https://github.com/new
2. 仓库名建议：`aura` 或 `aura-framework`
3. 选择 Public，不勾选 "Add a README"
4. 创建后复制仓库 URL，例如：`https://github.com/你的用户名/aura.git`

## 2. 更新 package.json 和 README 中的仓库地址

将 `YOUR_USERNAME` 替换为你的 GitHub 用户名。

## 3. 推送

```bash
git remote add origin https://github.com/你的用户名/aura.git
git branch -M main
git push -u origin main
```

## 4. 他人引用方式

```bash
# 克隆
git clone https://github.com/你的用户名/aura.git

# 作为 submodule 引用
git submodule add https://github.com/你的用户名/aura.git lib/aura
```

在 HTML 中引用（若部署到 jsDelivr）：
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/你的用户名/aura@main/src/design-tokens.css" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/你的用户名/aura@main/src/components.css" />
<script src="https://cdn.jsdelivr.net/gh/你的用户名/aura@main/src/aura.js"></script>
```
