# 游戏更新 → 新内页 监控方案（未实施）

状态：**已实施（2026-10-26）**。执行规则以根目录 `HERMES.md` 为准，本文只保留当初的设计思路。
实施要点：Hermes 任务 `b0a60cb2c4c7`（早 11 / 晚 11，监控脚本无变化不唤醒模型）；新页门禁 `scripts/hermes-page-gate.py` + `hermes/config.json`（审核期每 14 天最多 1 个工具页/版本页）；AdSense 状态用 `scripts/hermes-adsense.py` 切换。与本文的差异：不用 cadence 脚本（monitor 模式已免去空跑成本）；量级来源暂只用「联想词 + SERP ≥3 个专门页面」两道信号。

目标：Enshrouded 每次官方更新后，自动发现变更、判断有没有值得做的搜索词、按站点数据模型生成内页，并经过门禁发布。
参照对象是同一台 Mac mini 上的 `loadoutvault.com`（`HERMES.md` + `scripts/hermes-publish.sh` + `scripts/hermes-cadence.py` + Hermes cron 任务 `cd7592e96d2e`）。

## 为什么现在不做

站点的 AdSense 审核还在进行中（2026-10-24 21:31 提交，状态「正在准备」）。审核窗口内批量新增自动生成页面，是「低价值内容」判定最常见的触发方式。**建议等审核结果出来再实施**，或者在实施时先只跑草稿模式。

## 一、触发源

| 源 | 接口 | 用途 |
| --- | --- | --- |
| Steam 新闻 | `api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=1203620` | 主触发，官方公告与 hotfix 都在这里 |
| Keen 官方 changelog | Steam 公告正文 + `store.steampowered.com/news/app/1203620` | 交叉确认版本号与改动清单 |
| 游戏数据导出 | `vendor/enshrouded-skill-tree` 上游仓库 | 判断技能/数值是否真的变了 |

判定逻辑：记录上次处理过的 `gid`（Steam news id）与 `contentHash`（游戏数据导出哈希）。任一变化 → 触发一次运行。**同一 `gid` 只处理一次**，状态存 `state/update-monitor.json`。

现有站点已经有 `scripts/build-skill-data.mjs`，它会把 vendored 导出转成 `src/data/skilltree.json`，并打印 `231 nodes, 178 skills, max points 212`——这就是天然的数据变更指纹。

## 二、产出分三类

### 1. 版本页（时效性最强，优先）

新补丁发布当天生成 `/enshrouded-<version>-changes/`，例如 `1-1-changes`。
现状已有 `/enshrouded-1-0-changes/`（902 词，GSC 有真实点击），说明这类页面本身是有效的。
内容结构固定：等级上限/数值变化 → 新增技能与法术 → 受影响最大的 build → 来源链接。数据来自官方 changelog，不推断。

### 2. 存量页更新

技能数值、点数成本、效果文本变化 → 直接改 `src/data/builds.ts` / `src/data/gear.ts` 里受影响的条目，并把对应页面的 `dateModified` 与页脚「Last verified」推到当天。
站点已有机制：`SITE.lastVerified` 被所有 build 页引用，改一处即可全站生效。

### 3. 新机制 / 新 build 页

只有当关键词过了词量门禁才建。典型候选：新职业线、新武器类型、新机制（如 1.0 的 Eternal 法术）。

## 三、词量门禁（硬性，三级）

这是「确保新内页都是主打一个有搜索量的词」的落地点。任一级不过 → 不建页，只写进队列。

| 级别 | 判据 | 处置 |
| --- | --- | --- |
| A | 关键词在量级数据集里（Semrush / Keyword Planner 导出）且 `volume >= 阈值`（建议 100/月） | 自动建页 |
| B | 无数据集，但三条信号同时成立：① Google 自动补全命中该词；② Google SERP 有 ≥3 个竞品页在讲同一件事；③ 同类旧页近 28 天 GSC 点击 ≥ 5 | 建草稿，等人审 |
| C | 其余情况 | 只记录候选词与缺失的证据，不建页 |

实现要点：

- 数据集读取复用 zyseo 的 `provider_keywords` 表与 `scripts/kp_import.py` 的导入格式，不另造一套。
- 自动补全走 `suggestqueries.google.com/complete/search?client=firefox&hl=en&gl=us`，法语页用 `hl=fr&gl=fr`。这是**需求信号不是量级**，只能用于 B 级。
- GSC 数据走已有的 service account（`laptop-gsc-reader.json` 同款），只读。
- 阈值写进配置，不硬编码在脚本里。

## 四、证据门禁

沿用 loadoutvault 已验证的规矩：

- 同一条事实必须有 **≥2 个相互独立来源**一致；官方来源单独 1 个即可。
- 每条数据附 `{title, url, date}`，日期 `YYYY-MM-DD`。
- 来源冲突、只有单一社区来源、无法核实的 → **不写进站点**，记入 `HERMES-LOG.md` 的「待核实」。
- 不编造数值、技能名、点数成本。技能名与成本一律取自游戏数据导出，不靠模型记忆。
- 不复制大段原文，不搬运图片。

## 五、发布门禁

直接复用 `loadoutvault.com/scripts/hermes-publish.sh` 的结构，按本站差异调整：

| 环节 | 本站差异 |
| --- | --- |
| 允许改动路径 | `src/data/`、`src/pages/`、`HERMES-LOG.md`；额外允许 `src/lib/site.ts` 的 `lastVerified` |
| 构建 | Node ≥ 22.22（本机 26.7.0 可用），`node scripts/build-skill-data.mjs && astro build` |
| 站内门禁 | 必须先跑 `bash scripts/verify-site-build.sh`（当前 19 项），不过就不发 |
| 部署 | `wrangler pages deploy dist --project-name enshroudedbuilder --branch main`（mini 上 wrangler 已登录） |
| 线上校验 | 新页返回 200 且正文含预期关键词，否则回滚到上一版 |
| 失败处理 | 构建失败保留改动供修复；推送/部署失败下次重试；连续 3 次失败才上报 |

注意：**`git push` 不会触发自动部署**（2026-10-24 实测），必须显式跑 `wrangler pages deploy`，否则会出现「以为发了其实没发」。

## 六、节奏

对齐 loadoutvault 的 cadence 思路，用独立脚本控制而不是手改 cron：

- 常规：每天 1 次（建议 10:30，错开 10:00 的 zyseo 任务）。
- 检测到大版本（等级上限变化、新职业线、新地图）→ boost 7 天，每天 2 次。
- 连续 6 次「无可核实新内容」→ 降一级，最低每周 1 次。
- 版本页发布后 7 天内保持每天 1 次，捕捉 hotfix。

## 七、前置条件（实施时需要补）

1. **把仓库 clone 到 mini**：目前 `~/Documents/zhongyaoruanjian/enshroudedbuilder.com` 不存在，仓库只在这台 MacBook 上。
2. **GSC 只读凭据放到 mini**：现在只有 MacBook 上有 `laptop-gsc-reader.json`。
3. **确认量级数据来源**：mini 上目前没有 Enshrouded 相关关键词的量级数据，A 级门禁需要先有数据，否则所有候选都会落到 B/C。
4. **HERMES.md 落地**：把本方案第三、四、五节改写成 agent 可执行的规则，格式对齐 `loadoutvault.com/HERMES.md`。

## 八、分阶段实施

| 阶段 | 内容 | 产出 |
| --- | --- | --- |
| P0 | 只读监控：Steam 新闻 + 数据哈希比对，发现更新后写日志并发通知 | 能知道「什么时候更新了」，不改站 |
| P1 | 存量页更新：数值变化时自动改 `src/data/` 并发布 | 更新当天页面就同步，不需要人盯 |
| P2 | 版本页自动生成 + 发布 | 补丁当天就有新页面承接搜索 |
| P3 | 新机制页 + 完整词量门禁 | 按 A/B/C 三级自动判断是否建页 |

建议从 P0 开始跑两周，确认触发准确率（不误报、不漏报）再往上做。

## 九、风险

| 风险 | 影响 | 缓解 |
| --- | --- | --- |
| AdSense 审核期自动上新页 | 被判低价值内容 | 审核通过前只出草稿，或整条链路不启用 |
| 自动生成的页面质量不足 | 拉低整站评分 | 词量门禁 + 证据门禁 + build 门禁三重拦截；B 级必须人审 |
| Steam 新闻抓取被限流 | 漏掉更新 | 每日 1 次低频请求 + 失败重试，不做高频轮询 |
| 部署凭据过期 | 改了没上线 | 沿用 loadoutvault 的 `DEPLOY AUTH EXPIRED` 处理：明确提示重新登录，不静默失败 |
| 与 Adsterra/AdSense 政策冲突 | 站点被拒 | 新页不加任何第三方广告网络 |

## 待决策

1. **发布方式**：全自动发布 / 只出草稿 / 仅版本页自动发布。取决于 AdSense 审核结果。
2. **量级来源**：只用 GSC + 自动补全 + SERP 三道信号（零成本，但新词无历史数据）／引入 Semrush 或 Keyword Planner 导出（更准，需要定期供数据）／两者结合。
