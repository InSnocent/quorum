# Quorum 双语 Fork 修改说明

本 Fork 由 [InSnocent](https://github.com/InSnocent) 于 **2026-11-03** 修改，基于 [elianiva/quorum](https://github.com/elianiva/quorum) 的提交 `5fd418577ba2b3f1ce22c4d26d877d51a8c232ca`。原作者为 Dicha Zelianivan Arkana（elianiva）。本文件和修改文件中的日期标记用于说明派生修改，未宣称拥有上游代码的原创权利。

## 修改内容

- 简体中文 / English 显示切换，标题页和设置面板提供入口，语言偏好持久化。
- 中文词典覆盖游戏菜单、面板、画布、研究、组件、事件、邮件、教程、挑战与术语表；英文原文保留。
- 支持中文术语搜索，并添加中文字体回退。
- 增加中文 README、本地模型辅助翻译工具与校验，保持游戏模拟规则、存档标识和回放版本不变。
- Fork 的自动部署需要显式启用，自定义域名由维护者配置。

译文初稿由用户本机的 **Index-Translate-2B** 生成，随后校验插值、统一简体字并校对关键术语。游戏运行和构建无需翻译服务。工具原始响应、下载的验证工具链、依赖和本地日志不属于分发的源码。

## 许可与源码

整个派生作品继续采用 **GNU General Public License v3.0 or later（GPL-3.0-or-later）**。原 [LICENSE](LICENSE) 完整保留，许可文本本身未改写。

- [本 Fork 的完整源码](https://github.com/InSnocent/quorum)
- [原项目源码](https://github.com/elianiva/quorum)
- [GNU GPL v3 许可文本](LICENSE)
- 上游引入的 Anatomy 绘图工具保留其 [MIT 许可与版权声明](apps/web/art/kit/LICENSE)。

本软件不提供任何担保，亦不保证适销性或特定用途适用性，完整条款以 GPL 为准。分发修改后的源码或构建产物时，应保留许可、版权和修改说明，并按 GPL 提供相应源码及构建所需文件。
