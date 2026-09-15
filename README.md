<h1 align="center">十三月工具箱</h1>

<p align="center">
程序员实用在线工具百宝箱 —— 86 款开发者常用工具，中英双语，纯前端运算。
<br />
<a href="https://tools.afeiii.com"><strong>立即使用 tools.afeiii.com »</strong></a>
</p>

## 这是什么

十三月工具箱（[tools.afeiii.com](https://tools.afeiii.com)）汇集了面向开发人员和 IT 从业者的
86 款实用工具，涵盖加密解密、格式转换、网络计算、文本处理、开发速查等场景。

所有工具均在浏览器本地运行，**数据不上传服务器**，可放心处理敏感内容。

本项目基于开源项目 [IT-Tools](https://github.com/CorentinTh/it-tools) 进行汉化与个性化定制，
原作者为 [Corentin Thomasset](https://corentin.tech)。向原作者与开源社区致敬。

## 工具分类

| 分类 | 代表工具 |
| :--- | :--- |
| 加密与安全 | Hash 文本、Bcrypt、对称加密解密、RSA 密钥对、BIP39 助记词、密码强度分析 |
| 转换器 | 日期时间、任意进制、颜色、罗马数字、Base64、大小写、YAML/JSON/TOML/XML 互转 |
| Web 工具 | URL 解析与编解码、JWT 解析、HTTP 状态码、User Agent 解析、Open Graph 元标签 |
| 网络 | IPv4 子网计算、IPv4 范围扩展、MAC 地址查询与生成、IPv6 ULA 生成 |
| 开发辅助 | Crontab 生成、Chmod 计算、Docker Compose 转换、SQL 美化、正则测试、Git 速查 |
| 文本处理 | 文本差异对比、字数统计、脱敏混淆、Lorem Ipsum、ASCII 艺术字、NATO 字母表 |
| 图片与视频 | 二维码生成、WiFi 二维码、SVG 占位图、摄像头录制 |

完整列表见[站点首页](https://tools.afeiii.com)。

## 相比上游的改动

- **全站中英双语**：86 款工具的界面文案、表单标签、占位符、提示信息完整本地化，支持实时切换。
- **构建期预渲染**：为全部 89 个路由生成独立静态页面，带各自的标题、描述与内部链接，便于搜索引擎收录。
- **站点地图自动生成**：构建时扫描工具定义产出 `sitemap.xml`，新增工具无需手工维护。
- **去除第三方运行时依赖**：ASCII 艺术字的字体改由本站托管，不再依赖外部 CDN。
- **中文技术手册**：Git 与正则备忘录提供原生中文版本。

## 本地开发

环境要求 Node 18。

```sh
pnpm install
pnpm dev
```

其他常用命令：

```sh
pnpm build        # 类型检查 + 生产构建
pnpm test:unit    # 单元测试
pnpm test:e2e     # 端到端测试
pnpm lint         # 代码规范检查
pnpm typecheck    # TypeScript 类型检查
```

### 新增一个工具

```sh
pnpm run script:create:tool my-tool-name
```

脚本会在 `src/tools` 下生成样板文件并注册导入，之后把它加入 `src/tools/index.ts`
的对应分类，再补上 `locales/zh.yml` 与 `locales/en.yml` 的词条即可。

### 推荐的编辑器配置

[VSCode](https://code.visualstudio.com/) 搭配以下扩展：

- [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar)（并禁用 Vetur）
- [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin)
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [i18n Ally](https://marketplace.visualstudio.com/items?itemName=lokalise.i18n-ally)

对应设置：

```json
{
  "editor.formatOnSave": false,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "i18n-ally.localesPaths": ["locales", "src/tools/*/locales"],
  "i18n-ally.keystyle": "nested"
}
```

## 技术栈

Vue 3、Vite、TypeScript、UnoCSS、Naive UI，部署于 Cloudflare Pages。

## 反馈与交流

发现 Bug 或有新工具建议，欢迎提交 [Issue](https://github.com/bigzhihui/it-tools/issues)，
也可通过 [support@afeiii.com](mailto:support@afeiii.com) 联系。

## 致谢

本项目基于 [Corentin Thomasset](https://corentin.tech) 创建的
[IT-Tools](https://github.com/CorentinTh/it-tools)，感谢原作者与
[所有贡献者](https://github.com/CorentinTh/it-tools/graphs/contributors)的工作。

## 开源协议

本项目遵循 [GNU GPLv3](LICENSE) 协议，与上游项目保持一致。
