# NoteEasy

NoteEasy 是一款基于 Electron 的本地 Markdown 笔记客户端。它从早期的 MarkEasy 单页编辑器演进而来，现在的重点是作为桌面应用使用：以本地文件夹作为笔记仓库，提供“文件目录树 - 可视化编辑区 - 大纲视图”的三栏工作区。

NoteEasy 不依赖后端服务，笔记内容完全保存在用户指定的本地文件夹中，适合个人知识库、技术文档、离线笔记和 Markdown 文件整理。

## 主要功能

- 本地笔记仓库：首次启动选择一个文件夹作为笔记仓库，之后自动加载。
- 文件目录树：显示仓库内的 Markdown 文件和子文件夹。
- 文件操作：新建笔记、新建文件夹、重命名、删除、移动、拖拽移动、右键菜单。
- 自动刷新目录：仓库目录中新增或删除文件后，文件树会自动刷新。
- 搜索文件：左侧文件栏支持按笔记标题或文件名搜索。
- 多标签编辑：支持打开多个笔记，标签页切换类似 VS Code 的预览/锁定机制。
- 可视化编辑：保留原 MarkEasy 的 Markdown 可视化编辑能力。
- 源码编辑：可切换到 Markdown 源码模式直接编辑原文。
- 自动保存：编辑停止 3 秒后自动保存到原 `.md` 文件。
- 快捷键：支持 `Ctrl/Cmd + S` 保存、`Ctrl/Cmd + B` 加粗、`Ctrl/Cmd + I` 斜体。
- 文档大纲：右侧自动生成标题大纲，支持折叠、点击跳转、跟随滚动高亮。
- 标题编号：支持按章节、按大写、自动序号和不编号。
- 扩展内容：支持表格、图片、代码高亮、MathJax 公式、Mermaid 图表。
- 导出：支持导出 HTML、PDF、Markdown，导出文件名优先使用当前笔记文件名。
- 主题：支持浅色/深色主题切换。
- 跨平台打包：支持 Windows、macOS、Linux 安装包构建。

## 截图

![NoteEasy 主界面](./docs/screenshot.png)

## 项目结构

```text
.
├── MarkEasy.html              # 渲染进程主界面，包含编辑器、文件树、大纲和核心前端逻辑
├── main.js                    # Electron 主进程，负责窗口、文件 I/O、仓库监听和设置存储
├── preload.js                 # Electron preload，向渲染进程暴露安全 IPC API
├── assets/
│   ├── icon.svg               # 应用图标源文件
│   ├── icon.png               # 窗口和 Linux/macOS 打包图标
│   └── icon.ico               # Windows 打包图标
├── vendor/
│   ├── pdfmake.min.js         # PDF 导出依赖
│   └── pdfmake-chinese-vfs.js # PDF 中文字体支持
├── markdown-test-case.md      # Markdown 功能测试文档
├── package.json               # npm 脚本与 electron-builder 配置
├── package-lock.json          # npm 依赖锁定文件
└── NOTEASY-UPGRADE.md         # 从 MarkEasy 升级到 NoteEasy 的阶段说明
```

## 环境要求

- Node.js 18 或更高版本。
- npm 9 或更高版本。
- Windows/macOS/Linux 桌面系统。

当前项目使用：

- Electron `^34.5.8`
- electron-builder `^25.1.8`
- electron-updater `^6.8.3`

## 安装与本地运行

在项目根目录执行：

```bash
npm install
npm start
```

首次启动后，应用会提示选择一个文件夹作为笔记仓库。之后该路径会保存到 Electron 的 `app.getPath('userData')` 对应目录下，重启后自动加载。

## 打包构建

### Windows

```bash
npm run dist:win
```

输出目录：

```text
release/
```

会生成 Windows NSIS 安装程序。

### macOS

```bash
npm run dist:mac
```

会生成 `.dmg` 应用包。正式分发前建议补充 Apple Developer 签名和 notarization 配置。

### Linux

```bash
npm run dist:linux
```

会生成 `.AppImage` 和 `.deb` 包。

### 本地目录包

```bash
npm run pack
```

用于快速检查未压缩的应用目录。

## Windows 打包常见问题

如果打包时出现 `Cannot create symbolic link` 或“客户端没有所需的特权”，通常是 electron-builder 解压 `winCodeSign` 缓存时没有符号链接权限。

推荐处理：

1. 打开 Windows 开发者模式。
2. 删除 electron-builder 缓存。
3. 重新打包。

```powershell
Remove-Item -Recurse -Force "$env:LOCALAPPDATA\electron-builder\Cache\winCodeSign"
npm run dist:win
```

也可以用管理员身份打开 PowerShell 后重新执行打包命令。

## 数据存储

NoteEasy 采用纯文件系统存储：

- 笔记内容：保存在用户选择的本地仓库文件夹中。
- 文件格式：Markdown，主要支持 `.md`、`.markdown`、`.mdown`、`.mkd`。
- 设置数据：保存在 Electron `app.getPath('userData')` 下，例如默认仓库路径、主题、编号模式、最后打开文件和滚动位置。

## 依赖说明

项目的 PDF 导出依赖位于 `vendor/` 目录。

部分 Markdown 渲染相关前端库仍通过 CDN 加载，例如 markdown-it、highlight.js、Mermaid、MathJax、Turndown、Lucide。桌面客户端可以正常运行，但如果需要完全离线使用，建议后续将这些 CDN 依赖下载到本地并改为本地引用。

## 开发说明

常用命令：

```bash
npm start          # 启动 Electron 客户端
npm run pack       # 生成未压缩应用目录
npm run dist:win   # 构建 Windows 安装包
npm run dist:mac   # 构建 macOS 安装包
npm run dist:linux # 构建 Linux 包
```

主要代码边界：

- `main.js`：文件系统访问、目录监听、Electron 设置、窗口配置。
- `preload.js`：安全暴露主进程能力给页面。
- `MarkEasy.html`：所有界面、编辑器、大纲、标签页、导出和交互逻辑。

## 功能细节

### 文件目录树

- 以用户选择的文件夹作为根目录。
- 递归展示子文件夹和 Markdown 文件。
- 支持展开、折叠、拖拽移动文件或文件夹。
- 支持右键菜单操作，包括新建、重命名、移动、删除和在系统中显示。
- 支持外部文件变化监听，目录中新增或删除 Markdown 文件后会自动刷新。
- 搜索框默认隐藏，可通过文件栏顶部搜索图标显示或隐藏。

### 编辑区

- 中间区域为主要编辑区。
- 支持预览编辑和源码编辑两种模式。
- 预览模式中可以直接修改渲染后的内容，并同步回 Markdown。
- 源码模式中可以直接编辑 Markdown 原文。
- 支持多个笔记标签页切换。
- 支持自动保存和手动保存。
- 底部状态栏显示当前文件名、文件路径、文件大小、标题数、代码块数、图表数和更新时间。

### 大纲视图

- 自动读取 Markdown 标题生成大纲。
- 支持一级到四级标题。
- 支持折叠和展开标题层级。
- 点击大纲项时，编辑区会滚动到对应标题。
- 编辑区滚动时，大纲会自动高亮当前可视区域中的标题。

### Markdown 能力

- GFM 风格表格和任务列表。
- 代码块语法高亮。
- Mermaid 图表渲染。
- MathJax 数学公式渲染。
- 图片插入和图片属性编辑。
- 表格插入、单元格编辑、行列操作。
- 标题自动编号。

### 导出能力

- 导出 HTML。
- 导出 PDF。
- 导出 Markdown。
- 导出文件名优先使用当前笔记文件名，不包含原 `.md` 扩展名。

### 界面与设置

- 左、中、右三栏布局。
- 左侧文件栏和右侧大纲栏支持折叠与拖拽调宽。
- 支持浅色和深色主题。
- 支持保存默认仓库路径、主题、编号模式、最后打开文件和滚动位置。

