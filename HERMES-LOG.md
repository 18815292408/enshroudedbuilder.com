# HERMES-LOG（enshroudedbuilder.com）

规则见 `HERMES.md`。每次运行在末尾追加一段。

## 2026-10-26（Claude 建立巡检，处理到 1.0.0.3 为止）
- 已处理的官方公告（以后不要重复处理）：
  - 1846651706679038 Changelog for Hotfix 1.0.0.1（10-15，build 1267041）→ 有平衡改动（Fire Wisp 卷轴固定 27 级），已写进 `/enshrouded-1-0-changes/` 的「Hotfixes since launch」
  - 1846651706681725 Changelog for Hotfix 1.0.0.2（10-16，build 1269579）→ 技能文本翻译 + 崩溃修复，同上
  - 1847286114028297 Changelog for Hotfix 1.0.0.3（10-21，build 1273043）→ 只修崩溃/存档迁移/EA 奖励，同上；`gameVersion` 改为 `1.0 (hotfix 1.0.0.3)`，`lastVerified` 改为 2026-10-26。不建新页
  - 1847286114036918 Enshrouded is Steam Deck verified!（10-23）→ 与 build 无关，不改站
  - 10-15 之前的 1.0 发布公告、Combat 预告、Launch FAQ、Sparkworks、Youtooz 联名 → 发布时已处理或无关
- 游戏数据：上游 `gameSkillData.json` 与本站 vendor 完全一致；`gameProgression.json` 上游已是 build 1269579 的重导出（多了 flame 字段），用它重建 `skilltree.json` 无任何差异，所以暂不替换
- Keen 在 10-23 公告里说「下周会带来更多修复和改进」→ 预计 10-27 ~ 10-31 有新补丁，注意平衡改动
- 新页额度：AdSense 10-24 提交审核，状态 reviewing，每 14 天最多 1 个新页（工具页或版本页）
- 新页候选：无（还没有新数据触发）
- 待核实：无
- 技术待办（交给 Claude）：无

## 2026-10-27（周例行巡检 2026-W44，无新公告）
- 公告：Steam 公告列表与上次一致（最新仍是 10-23「Steam Deck verified」，其次 1.0.0.3 / 1.0.0.2 / 1.0.0.1）。全部已按第三节处理过，本次没有新公告，站点不做改动。Steam RSS（10-26 生成）顶部条目相同，确认没有漏抓。
- 游戏数据：上游 `gameSkillData.json` 与 `locales/en/nodes.json` 和 vendor 文件逐字节一致；`gameProgression.json` 上游已换成 schemaVersion 1.1.0、provenance build 1269579（hotfix 1.0.0.2）的重导出，新增 `flame`（flameLevelCap 11、apPerFlameLevel 1）。把它替换进 vendor 后 `node scripts/build-skill-data.mjs` 重建 `src/data/skilltree.json` **无任何差异**（source.gameBuild 取自 gameSkillData.json，仍为 1267041；leveling 与 biomePoints 数值相同），按第五节不做发布，vendor 改动已 `git checkout --` 撤销，工作树干净。结论：技能数值从 1.0 起未变，1.0.0.2 的「技能文本本地化」没有改动英文节点文本。
- 现有页面核查（只读）：skills 页 178 个技能类型 / 231 节点 / 291 连线 / 满探索 212 点，与数据一致；`npx tsx scripts/check-builds.mts` 8 个 build 全部通过（exit 0）；1.0 changes 页三条热修记录与官方 changelog 原文一致。没有发现需要更正的数字或版本号。
- 新页候选：无新触发。flame 数据只对「Flame 等级参考」工具页有用，而它的触发条件是「Flame 等级 / 祭坛规则变化」，本次规则没变（flame 上限 11 自 1.0 起就是这样，官方 1.0 changelog 已写明），且与加点无关，不建页。
- 待核实：无
- 技术待办（交给 Claude）：无
- AdSense：reviewing（10-24 提交），未满 21 天，按第六节本次不询问
