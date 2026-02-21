# Aura 部署指南

## GitHub Pages

### 第一步：在仓库中启用 GitHub Actions 部署

1. 打开 https://github.com/linyixia45/aura/settings/pages
2. 在 **Build and deployment** 下
3. 将 **Source** 设为 **GitHub Actions**（不要选 Deploy from a branch）
4. 保存

### 第二步：推送或手动运行工作流

- 推送到 `master` 或 `main` 后会自动部署
- 或到 https://github.com/linyixia45/aura/actions 手动运行 **Deploy to GitHub Pages**

### 部署地址

- https://linyixia45.github.io/aura/

## 若仍报错

- 确认仓库有 Pages 读写权限
- 若为组织仓库，需管理员在 Settings 中允许 Pages 使用 GitHub Actions 部署
