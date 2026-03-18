# Mermaid Exporter

一个纯前端的 Mermaid 图表编辑器，支持实时预览、即时复制、多格式导出，无需后端服务。

## 功能特性

- **实时预览** — 基于 CodeMirror 编辑器，输入即渲染
- **多格式导出** — 支持 SVG / PNG 的复制和下载
- **PNG 尺寸控制** — 自动、固定宽度、固定高度三种模式
- **图表主题** — Default / Neutral / Dark / Forest / Base 五种 Mermaid 原生主题
- **绘制风格** — 经典 (Classic) 和手绘 (Hand-drawn) 两种风格
- **明暗主题** — 编辑器和界面的 Light / Dark 切换
- **预览交互** — 鼠标滚轮缩放、拖拽平移、触屏双指缩放、双击重置
- **元素定位** — 预览区元素悬停高亮，双击跳转到对应源码行
- **语法纠错** — 渲染报错时高亮编辑器中的错误行，并提供常见错误自查提示
- **示例图表** — 内置 20+ 种 Mermaid 图表类型示例，一键加载
- **响应式布局** — 适配桌面和移动端
- **零依赖部署** — 纯静态文件，通过 CDN 加载 Mermaid 和 CodeMirror

## 支持的图表类型

Flowchart、Class、Sequence、ER、State、Mindmap、Architecture、Block、C4、Gantt、Git、Kanban、Packet、Pie、Quadrant、Radar、Requirement、Sankey、Timeline、Treemap、User Journey、XY Chart

## 快速开始

项目为纯静态页面，无需构建，直接用浏览器打开或部署到任意静态托管服务即可：

```bash
# 本地预览（任选一种）
npx serve .
python -m http.server 8000
```

打开浏览器访问即可使用。

## 部署到 Cloudflare Pages

1. Fork 或推送本仓库到 GitHub
2. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/) → Workers & Pages → Create → Pages → Connect to Git
3. 选择对应的 GitHub 仓库，构建配置如下：
   - **构建命令**：留空（纯静态，无需构建）
   - **构建输出目录**：`/`（根目录）
4. 点击 Save and Deploy，等待部署完成即可通过 `*.pages.dev` 域名访问

## 技术栈

- [Mermaid.js](https://mermaid.js.org/) v11 — 图表渲染
- [CodeMirror](https://codemirror.net/) v6 — 代码编辑器
- 原生 HTML / CSS / JavaScript — 无框架依赖

## License

MIT
