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

## 4. 推送标签

```bash
# 推送所有标签
git push origin --tags

# 或只推送单个标签
git push origin v0.1.0
```

## 5. 他人引用方式

```bash
# 克隆（指定标签）
git clone -b v0.1.0 https://github.com/你的用户名/aura.git

# 作为 submodule 引用
git submodule add -b v0.1.0 https://github.com/你的用户名/aura.git lib/aura
```

在 HTML 中引用（jsDelivr CDN，推荐用标签更稳定）：
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/linyixia45/aura@v0.1.0/src/design-tokens.css" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/linyixia45/aura@v0.1.0/src/components.css" />
<script src="https://cdn.jsdelivr.net/gh/linyixia45/aura@v0.1.0/src/aura.js"></script>
```
