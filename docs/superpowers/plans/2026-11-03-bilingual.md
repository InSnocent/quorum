# Quorum 中英双语版实现计划

**目标：** 发布遵循 GPL-3.0-or-later、使用本地小模型辅助翻译的中英双语 Fork。

**架构：** 英文游戏和模拟数据保持原样，客户端通过词典与模板翻译呈现文本。语言是 UI 偏好，显示层和画布都读取该偏好。

**技术栈：** TypeScript、Foldkit、Effect、PixiJS、Vitest、pnpm；本地 Index-Translate-2B 生成初稿。

- [x] 为语言回退、动态插值、技术名称、已有偏好兼容性和切换不改 Game 编写失败测试。
- [x] 在 `apps/web/src/i18n/` 实现纯翻译函数、HTML 显示适配、简体中文词典与模板；在 `scripts/localization/` 提供提取、翻译和校验工具。
- [x] 在 `game/model.ts`、`message.ts`、`update.ts`、`commands.ts` 加入 locale 偏好与切换消息，在 `view.ts`、`title.ts`、`panels.ts` 加入语言入口与许可链接。
- [x] 在 `game/board.ts` 和 `components/lab/glossary.ts` 接入显示翻译及中英搜索，添加中文字体回退。
- [x] 分批调用本地模型生成译文，校对术语、占位符、主要交互与遗漏；不更改模拟数据。
- [x] 新增中文 README 和修改记录，保留上游协议与第三方许可，限制复制来的自动部署任务。
- [x] 运行 `pnpm check`、`pnpm typecheck`、`pnpm test`、`pnpm build`，浏览器核对中英切换、持久化与窄屏。
- [x] 准备提交到 `InSnocent/quorum`，核对提交范围和工作区目录清单。
