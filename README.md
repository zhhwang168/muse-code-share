# Muse 邀请码分享站

独立的中文社区分享站。免费提交、先提交先展示、点击复制、提交时间和剩余展示时间；每个号码单独展示 24 小时，提交者可用同一浏览器提前下架。本站不连接 Muse 账户，也无法核实真实兑换次数。

## 网站内容

- AI Style Guide 已链接到 https://ai-style-guild.pages.dev/ 。
- 视频区默认显示「即将上线」。视频发布后，编辑 `public/config.js` 中的 `tutorialUrl`，填写完整的 HTTPS 视频链接即可，无需修改页面。
- 本站 24 小时展示期限与官方新用户加入后 48 小时兑换期限是两个不同概念。
- 不内置虚构邀请码，也不自动将你截图中的号码发布到网站。

## 部署到 GitHub + Cloudflare

使用 **Cloudflare Workers** 项目（支持静态页面和服务端数据库），不是只上传 HTML 的静态 Pages 项目。AI Style Guide 原站无需修改。

1. 将本文件夹的内容上传到一个新的 GitHub 仓库，建议仓库名 `muse-code-share`。如果放在已有仓库的 `muse` 子目录，后续 Cloudflare 根目录设为 `muse`。
2. 在 Cloudflare 控制台进入 **Storage & databases → D1 SQL database**，创建 `muse-codes` 数据库。
3. 复制数据库 ID，替换 `wrangler.jsonc` 中的 `REPLACE_WITH_YOUR_D1_DATABASE_ID`，提交到 GitHub。数据库 ID 是资源标识，不是 API 密钥。
4. 打开该 D1 数据库的 **Console**，执行 `migrations/0001_init.sql` 全部内容，初始化表。只需一次。也可在本地登录 Cloudflare 后执行 `npm run db:remote`。
5. 进入 **Workers & Pages → Create application**，选择连接 GitHub，创建 Worker。Worker 名称须为 `muse-code-share`，与 `wrangler.jsonc` 一致。
6. 根目录：新独立仓库用 `/`；已有仓库用 `/muse`。构建命令留空（无需编译）；部署命令填 `npm run deploy`。Cloudflare 会安装 package.json 依赖。
7. 部署成功后打开 Cloudflare 提供的 `workers.dev` 地址。可在设置中绑定自有域名。之后推送到关联的生产分支会自动部署。

Cloudflare 文档：
- https://developers.cloudflare.com/workers/ci-cd/builds/
- https://developers.cloudflare.com/workers/ci-cd/builds/configuration/
- https://developers.cloudflare.com/d1/get-started/

如果新建应用界面变动，关键是选择支持 Wrangler 配置的 Worker，而不是只部署静态目录。

## 本地运行

需要 Node.js 22 或更新版本：

```sh
npm install
npm run db:local
npm run dev
```

按终端提示打开本地地址。本地 D1 和线上 D1 独立，测试数据不会自动上传。

```sh
npm test
```

## 计时和数据

所有创建和到期时间以服务端为准。列表只返回未到期号码，按提交时间升序；客户端每 30 秒刷新、每 15 秒更新倒计时和移除到期号码。每小时定时清理过期数据库记录，不会影响较新的号码。即使物理清理尚未运行，到期号码也不会被接口返回。

同一有效号码重复提交不会延长展示。到期后重新提交视为新记录。每个 IP 每分钟最多提交一次（午夜的限流标识会切换）。不记录明文 IP；限流使用每日变化的摘要，定期清理。复制不会自动移除号码或推断已兑换。

提交成功会在当前浏览器本地保存专属下架凭证。服务端只保存凭证摘要；其他访客无法通过列表获得凭证。清除浏览器数据或换设备后，不能主动下架旧号码，仍会自动到期。

本版本包含基础限流；如公开推广后出现大量垃圾提交，可在 Cloudflare 增加 Turnstile 和流量规则。当前没有管理员审核后台或官方邀请码校验功能。


## 三语界面

网站右上角支持 English / 中文 / 日本語 切换。首次访问根据浏览器语言选择，之后记住用户设置。页面文案、倒计时、日期、复制提示、提交结果、错误提示和表单验证均随语言切换。翻译集中在 `public/i18n.js`；视频说明的三语内容在 `public/config.js` 中分别维护。
