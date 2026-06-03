# Mark Component 组件化项目

本项目是 `D:\Desktop\MarkEasy` 与 `D:\Desktop\NoteEasy` 的组件化重构目录。目标是把 Markdown 文档编辑、文档数据、工作区文件访问拆成可复用组件，让 MarkEasy 单网页和 NoteEasy 笔记应用共享同一套核心能力。

后续新增编辑器功能时，优先修改 `markdata.js`、`markcom.js`、`markcom.css` 这三个公共组件文件。MarkEasy 与 NoteEasy 会同步获得这些能力。

## 目录分区

```text
D:\Desktop\mark-component
|-- markdata.js        # 数据模型：文档数据模型、目录/工作区数据模型、source adapter 接口
|-- markcom.js         # 界面视图：文档编辑视图、文档大纲视图、目录/工作区视图
|-- markcom.css        # 公共样式：编辑器、预览、源码、大纲、导出样式
|-- markeasy.html      # MarkEasy 单网页入口，可直接用浏览器打开
|-- noteeasy.html      # NoteEasy Electron 主页面
|-- noteeasy.css       # NoteEasy 专属三栏布局、工具栏、状态栏
|-- noteeasy.js        # NoteEasy 专属业务：工作区、文件操作、自动保存、宿主通信
|-- main.js            # Electron 主进程：本地/Git/网络工作区 IPC 实现
|-- preload.js         # Electron 安全桥：暴露 NoteEasy 调用接口
|-- vendor/            # 本地化第三方 JS 资源，打包时随应用一起带上
|-- assets/            # 图标资源
```

## 组件分层

当前按 2 个模型对象、3 个界面视图组织：

- 文档数据模型：`MarkDocument` / `DocumentDataModel`
- 目录文件数据模型：`DirectoryFileModel` / `DirectoryFileDataModel`
- 文档编辑视图：`DocumentEditorView`
- 文档大纲视图：`DocumentOutlineView`
- 工作区/目录文件视图：`DirectoryFileView`

`DocumentEditorView` 和 `DocumentOutlineView` 同时服务 MarkEasy 与 NoteEasy；`DirectoryFileView` 是 NoteEasy 左侧工作区视图的公共渲染层。

## 工作区视图

NoteEasy 左侧已从“文件视图”升级为“工作区视图”。一个工作区可以包含多个来源：

- `local`：本地目录，可读写。
- `git`：Git 仓库目录，可读写，当前按本地仓库文件系统访问。
- `network`：网络 Markdown 文件或网络目录清单，只读。

工作区来源通过标准操作接口抽象：

```js
list
read
save
createFile
createFolder
rename
delete
move
show
watch
```

公共接口定义在 `markdata.js`：

```js
window.MarkData.WorkspaceSourceAdapter
window.MarkData.WorkspaceSourceRegistry
window.MarkData.workspaceSourceOperations
```

Electron 实际实现放在 `main.js` 和 `preload.js`。以后要扩展 WebDAV、GitHub API、对象存储、企业知识库等网上文件来源时，应新增 source adapter 或 IPC 实现，并保持上面的操作语义不变，视图层不需要重写。

网络目录清单可以返回一个目录节点或节点数组，基本格式如下：

```json
{
  "name": "Remote Notes",
  "type": "folder",
  "children": [
    {
      "name": "README.md",
      "type": "file",
      "url": "https://example.com/README.md"
    }
  ]
}
```

## MarkEasy 如何使用

MarkEasy 是单网页入口，可直接打开：

```text
D:\Desktop\mark-component\markeasy.html
```

它引用公共组件：

```html
<link rel="stylesheet" href="markcom.css">
<script src="markdata.js"></script>
<script src="markcom.js"></script>
```

适合单文件 Markdown 编辑、预览、源码切换、导出 HTML/PDF/MD。

## NoteEasy 如何使用

NoteEasy 需要 Electron 启动，因为它需要访问本地文件系统：

```bash
npm install
npm start
```

启动链路：

1. `package.json` 执行 `electron .`。
2. `main.js` 创建 Electron 窗口并加载 `noteeasy.html`。
3. `noteeasy.html` 直接引用 `markdata.js`、`markcom.js`、`noteeasy.js`。
4. `noteeasy.js` 挂载公共编辑器组件，并把工作区文件树写入 `DirectoryFileDataModel`。
5. 左栏 `DirectoryFileView` 订阅目录文件数据模型，中栏和右栏由公共 MarkCom 编辑器/大纲组件负责。

所有第三方运行时 JS 已本地化在 `vendor/` 目录，打包时会随应用一起带上，不需要运行时从 CDN 下载。

## 复用关系

公共修改位置：

- 修改 Markdown 解析、文档块对象、标题大纲数据：改 `markdata.js`
- 修改预览编辑、源码编辑、插入图片/表格/公式/流程图等操作：改 `markcom.js`
- 修改 Markdown 渲染、导出、编辑器公共样式：改 `markcom.css`
- 修改工作区树的通用渲染、折叠、选中样式：改 `DirectoryFileView`

宿主专属修改位置：

- MarkEasy 单网页入口：`markeasy.html`
- NoteEasy 三栏布局、工作区业务：`noteeasy.html`、`noteeasy.css`、`noteeasy.js`
- Electron 本地能力：`main.js`、`preload.js`

因此，编辑器公共能力只改一处；NoteEasy 额外的工作区、文件管理、自动保存能力放在宿主层，不污染 MarkEasy 单网页。

## 工作区功能测试用例

建议按下面顺序验证：

1. 启动 NoteEasy：执行 `npm start`，左栏标题应显示“工作区”。
2. 点击工具栏“工作区”，输入 `local`，选择一个本地目录；左栏应出现该目录及其中 Markdown 文件。
3. 再点击“工作区”，输入 `git`，选择一个带 `.git` 的仓库目录；左栏应同时出现两个工作区来源。
4. 再点击“工作区”，输入 `network`，输入一个 `.md` 文件 URL；左栏应出现网络来源，打开后可预览但保存时提示只读。
5. 在本地或 Git 工作区中新建笔记，确认文件出现在对应来源下，并能打开编辑。
6. 修改本地或 Git 工作区中的 Markdown，等待自动保存或按 `Ctrl+S`，关闭重开后内容应保留。
7. 右键本地/Git 工作区中的文件，测试 `rename`、`move`、`delete`、`show`。
8. 右键网络工作区文件执行写操作，应提示只读，不应修改远程内容。
9. 折叠/展开多个工作区来源，刷新后不应出现编辑区、大纲区重叠。
10. 关闭并重新启动 NoteEasy，之前添加的多个工作区来源应从设置中恢复。

## 打包与 Git

常用命令：

```bash
npm start
npm run pack
```

仓库只保存源码和本地 vendor 资源，不应提交：

```text
node_modules/
release/
dist/
*.exe
```
