# 静态站部署（外地朋友可玩）

发布目录为 **`game/`**（不是仓库根）。试玩入口：**`/play.html`**（一键清档 → 开局问答 → 青石镇）。

---

## 方式 A：GitHub Pages（推荐，已配好 Actions）

### 1. 在 GitHub 新建仓库

例如仓库名：`wuxia-demo`（任意英文名即可）。

### 2. 把本地 `wuxia-demo` 推上去

在 **`wuxia-demo`** 目录（有 `.git` 的那一层）执行：

```powershell
Set-Location "你的路径\wuxia-demo"
git remote add origin https://github.com/<你的GitHub用户名>/wuxia-demo.git
git push -u origin master
```

若 GitHub 默认分支是 `main`，可先 `git branch -M main` 再 push。

### 3. 等 Actions 先跑绿

**Actions** 页 → **Deploy game to GitHub Pages** 成功（会把 `game/` 推到 **`gh-pages`** 分支）。

若失败在 **Setup Pages**：说明曾用旧版 workflow；拉最新代码再 push，或见下方「常见问题」。

### 4. 打开 GitHub Pages

仓库 → **Settings** → **Pages** → **Build and deployment**：

- **Source** 选 **Deploy from a branch**
- **Branch** 选 **`gh-pages`**，文件夹选 **`/ (root)`**，保存

（不要选 GitHub Actions 源；本站由 Actions 更新 `gh-pages` 分支，Pages 只负责托管该分支。）

### 5. 发给朋友的链接

项目站地址一般为：

```text
https://<你的GitHub用户名>.github.io/wuxia-demo/play.html
```

首页：

```text
https://<你的GitHub用户名>.github.io/wuxia-demo/
```

每人用自己浏览器里的存档，互不影响。

### 常见问题

| 现象 | 处理 |
|------|------|
| Actions 在 **Setup Pages** 失败 | 用最新 workflow（推 `gh-pages` 分支）；**Settings → Pages** 改为 **Deploy from branch → gh-pages → /** |
| 404 | Actions 是否成功；Pages 是否指向 **gh-pages** 根目录 |
| 页面无样式/脚本报错 | 必须用 `https://` 打开，且路径里要带仓库名 `/wuxia-demo/` |
| 国内打开慢 | 可改用下方 Gitee Pages，或以后绑自己的域名 + CDN |

---

## 方式 B：Gitee Pages（国内访问往往更顺）

1. 在 [Gitee](https://gitee.com) 新建仓库，把同一套 `wuxia-demo` 代码 push 上去。  
2. 仓库 → **服务** → **Gitee Pages** → 部署目录填 **`game`**，分支选 `master` / `main`。  
3. 启用后地址类似：`https://<用户名>.gitee.io/wuxia-demo/play.html`（以 Gitee 提示为准）。

> Gitee Pages 免费版可能有更新频率限制，以 Gitee 当前说明为准。

---

## 方式 C：Cloudflare Pages

1. 登录 [Cloudflare Pages](https://pages.cloudflare.com/) → Create project → 连接 GitHub 仓库。  
2. **Build settings**：Framework preset = **None**；Build command 留空；**Build output directory** = `game`。  
3. 部署完成后域名类似：`https://wuxia-demo.pages.dev/play.html`。

---

## 本地自测（与线上一致）

```powershell
Set-Location "wuxia-demo\game"
node server.js
```

浏览器打开：`http://127.0.0.1:3000/play.html`

勿用 `file://` 打开。

---

## 更新线上版本

改完代码后：

```powershell
git add -A
git commit -m "你的说明"
git push
```

GitHub / Cloudflare 会自动重新部署；Gitee 需在 Pages 里点更新（若未开自动部署）。
