# 本地化维护

默认语言为简体中文，支持切回 English。语言只属于 UI 偏好；模拟包、挑战协议、存档结构和英文原文不随语言变化。

## 精校状态

当前词典为可游玩的中文初稿，已经过占位符、批次对齐、常用术语及关键状态检查，尚待完整人工精校。优先在 `scripts/localization/overrides.json` 修改词条，然后运行 `pnpm i18n:compile`，避免直接编辑生成文件后被覆盖。

## 文件

- `apps/web/src/i18n/translate.ts`：纯词典与模板插值翻译。
- `apps/web/src/i18n/html.ts`：Foldkit 显示适配；不翻译 URL、节点键、事件及输入值。
- `apps/web/src/i18n/zh-CN.ts`：随源码发布的中文词典，游戏运行时直接使用。
- `scripts/localization/overrides.json`：人工校对的术语和例外，优先于模型输出。
- `.localization/`：提取列表、模型原始响应、翻译缓存与校验输出，已加入忽略列表。

## 更新词条

使用 Node.js 24.11 以上版本和 pnpm 12，先安装锁文件指定的依赖。翻译工具使用已安装 TypeScript 7 的 AST API。

```sh
pnpm i18n:extract
pnpm i18n:translate
pnpm i18n:compile
pnpm i18n:verify
```

默认翻译服务为本机 `http://127.0.0.1:14514/v1`，模型为 `Index-Translate-2B`；可通过 `TRANSLATION_API`、`TRANSLATION_MODEL` 环境变量修改。只向模型发送公开的游戏文案，不发送存档或凭据。正常构建、测试及游玩均不需要该服务。

模型输出必须人工复核，尤其是繁简体、技术产品名、数据库一致性语义和邮件中的玩笑。将最终校对结果写入 `overrides.json`。`{0}`、`{1}` 等占位符必须保留；仅表示英文复数词尾的可选占位符可以省略。

邮件按段落显示。编译工具会在段落数量和占位符一致时复用整封邮件的译文；无法可靠对齐的段落单独翻译。词典使用英文原文作为键，未命中的新增文案会回退英文。

`scripts/localization/readme.mjs` 从固定的上游 Git 提交生成 README 草稿，产物写入 `.localization/`，经人工校对后再更新正式文档。

## 验证

```sh
pnpm check
pnpm typecheck
pnpm test
pnpm build
```

另外在浏览器核对：标题页及设置中的语言切换、刷新后的语言持久化、画布刷新、中文和英文术语搜索、邮件正文、窄屏布局。`LICENSE` 与 `apps/web/art/kit/LICENSE` 应与基线逐字节一致；说明汉化范围的文件见 [MODIFICATIONS.md](../MODIFICATIONS.md)。
