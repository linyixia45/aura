# 参与贡献

欢迎向 Aura 提交 Issue 和 Pull Request。

## 开发环境

```bash
git clone https://github.com/linyixia45/aura.git
cd aura
npx serve .   # 本地预览 examples
```

## 代码规范

- 核心代码在 `src/aura.js`，保持轻量
- 样式使用设计令牌 `var(--aura-*)`，避免硬编码颜色
- 新增示例放在 `examples/` 目录

## 提交 PR

1. Fork 本仓库
2. 创建分支：`git checkout -b feat/your-feature`
3. 提交更改：`git commit -m "feat: xxx"`
4. 推送分支：`git push origin feat/your-feature`
5. 在 GitHub 创建 Pull Request

## Commit 规范

- `feat:` 新功能
- `fix:` 修复
- `docs:` 文档
- `style:` 格式
- `refactor:` 重构
