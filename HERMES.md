# EnshroudedBuilder: Hermes 游戏更新巡检规则

你负责盯 Enshrouded（雾锁王国）的官方更新，把**可核实**的新信息变成 enshroudedbuilder.com 上对玩家有用的内容。仓库在 `~/Documents/zhongyaoruanjian/enshroudedbuilder.com`。
本站是 build / 技能树 / 加点器站点，不是新闻站。新信息优先让现有工具和页面变准，其次才是新页面；新页面优先做工具页。

## 一、你是怎么被唤醒的

定时任务挂了监控脚本 `scripts/hermes-monitor.py`（不调用模型，几乎零成本）。它每天检查两次：
- Keen Games 在 Steam 的官方公告（标题列表）
- 技能树游戏数据导出上游（rossicler/enshrouded-skill-tree）的数据文件指纹
- 当前周数（所以就算没更新，你每周也至少会被唤醒一次，用来处理「待核实」和「新页候选」）

输出和上次一模一样时你不会被唤醒。你被唤醒时，提示里的 `MONITOR CHANGE DETECTED` 差异就是这次要处理的东西。

## 二、每次运行的流程

1. `git pull -q`，读 `HERMES-LOG.md` 末尾：上次做到哪、「待核实」「新页候选」里有什么。日志里已处理过的公告（按 gid）不要重复处理。
2. `python3 scripts/hermes-page-gate.py status`：看当前 AdSense 状态和新页额度还剩多少。**额度为 0 时这次不建新页**，只做第三节的 ①②。
3. 读新公告全文：`curl -s "https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=1203620&count=10&maxlength=0&feeds=steam_community_announcements&format=json"`，按第三节分类处理。
4. 数据指纹变了：按第五节「游戏数据更新」处理。
5. 按第七节发布，第八节自己处理问题，第九节写日志和汇报。

## 三、更新分类 → 处理方式（按顺序判断，命中即停）

| 更新类型 | 例子 | 处理 | 占新页额度？ |
|---|---|---|---|
| 与 build 无关 | 联名周边、打折、Steam Deck 认证、直播活动、招聘、Sparkworks 冒险编辑器 | 不改站。只在日志记一行「已看过，无关」 | 否 |
| 只修崩溃/联机/存档迁移的热修 | 1.0.0.3 这类 | ① 把补丁写进 `/enshrouded-1-0-changes/` 的「Hotfixes since launch」一条；改 `src/lib/site.ts` 的 `gameVersion`；**不建新页** | 否 |
| 热修里有平衡/数值/技能文本改动 | 1.0.0.1 的 Fire Wisp 固定 27 级 | ① 同上，写进 Hotfixes 一节；② 受影响的 build 页、`/skills/`、加点器数据跟着改；改 `lastVerified` | 否 |
| 带新版本号的内容更新（1.1、1.2…）或一次 ≥5 条与 build 相关的平衡改动 | 新区域、新技能、等级上限变化 | ② 先改现有工具和页面；③ 额度允许时新建版本页 `/enshrouded-<版本>-changes/`（如 `/enshrouded-1-1-changes/`），格式抄 `src/pages/enshrouded-1-0-changes.astro` | 是（version） |
| 新增一类可计算/可比较的数据 | 新食物数值表、新套装加成、技能点规则变化、服务器设置项 | ② 能塞进现有工具就塞；塞不进且过了第四节词量门禁 → ④ 建工具页 | 是（tool） |
| 新机制需要讲清楚、但没法做成工具 | 新职业路线的打法 | 只在 AdSense 通过后才允许，且必须过词量门禁 → ⑤ 指南页 | 是（guide） |

①②不占额度、随时可做，而且是最有价值的部分：**页面上写的版本号、数值、「还没有资料」这类话跟实际不符时，直接改，不要记待办、不要问人。**

### 新页面的形式：能做工具就做工具

判断顺序：
1. **能不能并进现有工具？**（`/builder/` 加点器、`/skills/` 技能表、`/builds/wizard/` 选 build 向导、各 build 页的表格）能就并，不建新页。
2. **能不能做成工具页？** 信息里有「玩家要自己算 / 比 / 筛 / 规划」的东西（输入等级算技能点、选 3 种食物看总加成、按武器筛套装、生成服务器配置），就做工具页。
3. 以上都不行，才考虑版本页或指南页。

工具页候选池（等到对应的更新或数据出现、且过了词量门禁才建，**不要因为额度有剩就硬做**）：

| 触发条件 | 工具页 | 数据来源 |
|---|---|---|
| 等级上限 / 技能点 / Shroud Root / Elixir Well 规则变化 | Skill points calculator（输入等级和已收集的点，算可用技能点） | 游戏数据导出 `gameProgression.json` |
| 1.0 食物数值在 wiki 上被更新 | Food buff calculator（选 3 种食物，看叠加后的属性） | wiki.gg 食物页（≥2 来源一致） |
| 新套装 / 套装加成公布 | Armor set comparison（按职业、等级筛套装，看加成） | wiki.gg + 官方公告 |
| 官方改了专用服务器设置项 | Dedicated server config generator（勾选设置，生成 `enshrouded_server.json`） | Keen 官方服务器文档 |
| Flame 等级 / 祭坛升级规则变化 | Flame level reference（选 Flame 等级看解锁内容） | 游戏数据导出 + 官方公告 |

## 四、词量门禁（建任何新页之前必须过）

一个新页面只主打一个英文关键词。以下两条**同时**满足才建，证据写进日志：
1. **有人在搜**：`curl -s "https://suggestqueries.google.com/complete/search?client=firefox&hl=en&gl=us&q=enshrouded+<词>"` 的联想结果里出现这个词（或几乎一样的说法）。
2. **有人在做**：用浏览器搜这个词，Google 第一页有 ≥3 个结果是专门讲这件事的（wiki、攻略站、Reddit 帖都算；只顺带提一句的不算）。

再加一条：本站现有页面里没有哪个页面已经在主打这个词（有的话改那个页面，不建新页，避免自己和自己抢排名）。
不满足 → 不建，记进日志「新页候选」，写清缺哪条证据，下周再查。

## 五、内容规则

**证据**
- 官方来源（Keen Games 的 Steam 公告、官方文档、游戏数据导出）单独 1 个就够。
- 其他事实（wiki、攻略站、Reddit）必须 ≥2 个相互独立来源一致；互相转引算同一个来源。
- 每条数据在日志里附 `{标题, 网址, 日期 YYYY-MM-DD}`。
- 来源冲突、只有 1 个社区来源、无法核实 → 不写进网站，记进「待核实」。
- 技能名、点数、数值一律取自游戏数据导出或官方原文，**不凭记忆，不推算，不编造**。
- 不复制大段原文，不搬图片。用自己的话写，英文。

**游戏数据更新**（监控里 `constants/` 或 `locales/en/` 的指纹变了）
1. 从上游下载：`constants/gameSkillData.json`、`constants/gameProgression.json` → `vendor/enshrouded-skill-tree/` 同名文件；`locales/en/nodes.json` → `vendor/enshrouded-skill-tree/nodes.en.json`。下载地址形如 `https://raw.githubusercontent.com/rossicler/enshrouded-skill-tree/main/packages/core/src/constants/gameSkillData.json`。
2. `node scripts/build-skill-data.mjs`，看 `git diff --stat src/data/skilltree.json`。没有差异 → 只在日志记一行，不发布。
3. 有差异 → `npx tsx scripts/check-builds.mts` 看各 build 的点数还够不够；不够就按新成本调整 `src/data/builds.ts` 里该 build 的加点（只调数量，不改 build 思路），再在受影响的页面写一句改了什么。
4. 构建报错（上游改了数据格式）→ `git checkout -- vendor/ src/data/skilltree.json` 撤销，日志「技术待办（交给 Claude）」写一条，不要去改脚本。
5. 导出的游戏版本号在 `gameProgression.json` 的 `gameBuild`；页面上提到的 build 号与之对齐。

**能改哪里**
- 可以改：`src/data/`、`src/pages/`、`vendor/enshrouded-skill-tree/`、`drafts/`、`HERMES-LOG.md`；`src/lib/site.ts` 只能改 `lastVerified`、`gameVersion` 和 `SOURCES` 里的 `label`。
- 不要改：`src/layouts/`、`src/components/`、`src/styles/`、`scripts/`、`public/`（尤其 `ads.txt`）、`hermes/`、配置文件。发布脚本会自动撤销。需要改的，写进日志「技术待办（交给 Claude）」。
- `lastVerified` 是全站的「已核实日期」，所有 build 页的更新时间都读它。**只有真的对照新版本核实过数据才改**，不要为了刷新日期改。

**改老页面要克制（防止排名和流量掉）**
已经上线的页面在搜索里已有位置，改得太猛等于让搜索引擎重新认识它，流量可能掉。所以：
- **不改 TDH**：老页面的 title、meta description、H1 一律不动。数据跟着变的数字（比如「All 178 Skills」变成 180）可以变，其他字一个都不改。
- **不大改正文**：一次发布里，老页面原有文字至少保留 70%；超过 200 词的页面一次最多增长到原来的 1.6 倍。要补的内容多，就分几次运行慢慢加。
- 优先「加一条、改一个数、补一句」：在原有小节里追加或更正，不要重写段落、调整小节顺序、改小节标题。
- 不删页、不改网址。
- 这些由 `scripts/hermes-tdh-guard.py` 在发布时强制检查。真觉得某个 TDH 必须改，写进日志「技术待办（交给 Claude）」，说明原因，不要自己改。

**新页面的写法**
- 文件放 `src/pages/<关键词-slug>.astro`，网址里带关键词（如 `/enshrouded-skill-points-calculator/`）。
- 页面主体最外层元素加 `data-page-kind="tool"`（或 `"version"` / `"guide"`），发布门禁靠它判断类型；不写按 guide 算，最严。
- 结构和样式照抄现有页面：工具页参照 `src/pages/builder.astro`、`src/pages/skills.astro`，版本页参照 `src/pages/enshrouded-1-0-changes.astro`。只用站里已有的 class（`wrap`、`prose-game`、`panel`、`table-game`、`chip`、`eyebrow`），不引入新库、不加外部脚本。
- **工具页先把完整数据表直接写在页面上，再用页面内 `<script>` 加计算/筛选**。关掉 JavaScript 也能看到全部数据；这对搜索和广告审核都重要。
- 工具下方写 300 词以上的英文说明：怎么用、数据从哪来、什么时候核实的、常见问题（3~5 条 FAQ）、来源列表。
- 至少从 1 个相关老页面的正文里加一条链接指向新页（不然是孤岛页，门禁会拦）。
- 本地验证：`pnpm run build && npx astro preview --port 4329`，用浏览器打开新页，实际操作一遍工具，确认结果对、手机宽度不溢出、控制台无报错。日志里写「已手动测试」。
- 新页面一律英文。法语页（`/fr/`）不新增。

## 六、上新频率（AdSense 审核期特别重要）

网站正在申请 Google AdSense。审核期间突然冒出一批模板化新页，是被判「低价值内容」最常见的原因。所以：

| AdSense 状态 | 新页额度 | 允许的新页类型 |
|---|---|---|
| `reviewing`（审核中，当前） | 每 14 天最多 1 个 | 工具页、版本页 |
| `approved`（已通过） | 每天最多 1 个、每 7 天最多 3 个、每 30 天最多 8 个 | 工具页、版本页、指南页 |
| `rejected`（被拒） | 0 | 不建新页，只改进现有页 |

这些数字写在 `hermes/config.json`，由 `scripts/hermes-page-gate.py` 在发布时强制执行，你改不了也不要尝试绕过。额外规矩：
- 改现有页面不限次数，但一次运行只做一个主题的改动，并遵守第五节「改老页面要克制」。
- 不删页、不改网址（门禁会拦）。内容过时就改内容。
- 页面里不加任何广告代码、不加其他广告联盟（站内门禁 `verify-site-build.sh` 会拦）。
- 不建「新闻快讯」式短页（比如「Steam Deck 认证了」）、不按关键词批量套模板、不建只换了一个词的近似页。

**AdSense 状态什么时候改**：只有用户告诉你审核结果时，运行 `python3 scripts/hermes-adsense.py approved`（或 `rejected` / `reviewing`）。
如果状态还是 `reviewing` 且距 `adsense_since` 已满 21 天，在汇报最后问一句：「enshroudedbuilder 的 AdSense 审核有结果了吗？（回复"通过"、"没通过"或"还没有"）」。同一个问题 7 天内最多问一次（看日志）。用户回复后照做并在日志记一行。

## 七、发布

`scripts/hermes-publish.sh "Hermes: <一句英文说明>"`
它会依次：撤销越界改动 → 构建 → 点数预算检查 → 站内门禁 → 新页门禁 → 老页面保护（TDH 和正文改动幅度）→ 提交推送 → `wrangler pages deploy` → 检查首页和新页线上 200 → 记录新页日期。
- 输出 `PUBLISHED ... live=200` 就是成功。
- 注意：本站 `git push` **不会**自动部署，只有这个脚本里的 wrangler 才会上线。不要自己跳过脚本发布。

## 八、自己处理清单（照做，不问用户）

| 输出 / 情况 | 你要做的 |
|---|---|
| `PAGE GATE BLOCKED: new-page quota` 或 `kind ... is not allowed` | 把新页文件移到 `drafts/`（保留，不参与构建），其余改动再跑一次发布。日志「新页候选」写上草稿路径和最早可发日期。下次额度恢复时移回 `src/pages/` 再发。 |
| `PAGE GATE BLOCKED: thin page` / `orphan page` / `title` / `description` | 补有来源的内容 / 从相关老页加链接 / 改长改短，再发。最多 3 轮，还不行移到 `drafts/`。 |
| `TDH GUARD BLOCKED: ... title / meta description / H1 changed` | 把老页面的 title、description、H1 改回原样（输出里有线上原文），再发。确实要改的写进「技术待办（交给 Claude）」。 |
| `TDH GUARD BLOCKED: drastic rewrite` / `drastic growth` | 恢复被删改的原文，只保留这次真正需要的增改；内容多就拆到下次运行。 |
| `TDH GUARD BLOCKED: cannot read ...` | 网络问题，下次再发，改动留着。 |
| `PAGE GATE BLOCKED: live URLs would disappear` | 你删了或改名了某个页面，恢复它（`git checkout -- <文件>`）。 |
| `PAGE GATE BLOCKED: cannot read the live sitemap` | 网络问题，下次再发，改动留着。 |
| `PUBLISH BLOCKED: build failed` / `point budgets failed` / `site gate failed` | 读输出修；修不了 `git checkout -- src/ vendor/` 撤销、日志写原因。最多 3 轮。 |
| `edits outside allowed paths` | 脚本已撤销那些文件。确实需要的改动写进「技术待办（交给 Claude）」。 |
| `PUSH FAILED` | 不用管，下次一起推。 |
| `DEPLOY FAILED` | 不用管，下次再部署。连续 3 次运行都失败才在汇报里说一句。 |
| `DEPLOY AUTH EXPIRED` | 唯一需要用户动手的情况：汇报写「需要你在 Mac mini 上重新登录一次 Cloudflare（终端运行 npx wrangler login）」。 |
| `LIVE CHECK FAILED` / `ROLLED BACK` | 脚本已撤回这次改动并重新部署上一版。日志写原因，下次检查后再发。 |
| Steam 接口 / 网页打不开 | 换来源（`store.steampowered.com/news/app/1203620`、浏览器）或等下次，不要报错给用户。 |
| `git pull` 冲突 | `git rebase --abort`（或 `git merge --abort`）→ `git stash` → `git pull` → `git stash pop`；冲突以远端为准，重做你的改动。 |
| 规则没写到的情况 | 选最保守的做法（不写入、不发布、不建页），记进日志，不问用户。 |

## 九、日志和汇报

**日志**：每次运行在 `HERMES-LOG.md` 末尾追加一段（随发布一起提交；这次没有发布就用 `git add HERMES-LOG.md && git commit -m "Hermes: log" && git push`）：
- 日期、处理了哪些公告（gid + 标题）、各归到第三节哪一类
- 改了什么（页面网址 + 一句话）、来源
- 新页候选（关键词、门禁证据、缺什么、草稿路径）
- 待核实
- 技术待办（交给 Claude）

**汇报给用户**（中文、简短、大白话，不说 slug、commit、sitemap 这类术语；游戏名词保留英文原名加中文解释）：
1. **游戏这次更新了什么**：1~3 句。
2. **网站做了什么**：每条一句话说清对玩家有什么用，附页面网址。没建新页时说明原因（例如「这次只是修崩溃，没必要单独做页面」或「审核期间新页额度用完，已存草稿，11 月 9 日后自动发」）。
3. 结尾固定一句：「以上都是自动处理的，你不需要做任何事。」
- 只是周例行唤醒、没有任何新东西时，只回复一句「Enshrouded 本周没有新的官方更新，你不需要做任何事。」
- 汇报里禁止出现「请确认」「要不要」之类的问题。唯二例外：Cloudflare 登录失效；第六节的 AdSense 结果询问。
