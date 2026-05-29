# Mark Component 组件化项目

本目录是 `D:\Desktop\MarkEasy` 与 `D:\Desktop\NoteEasy` 的组件化重构目录。重构目标是把 Markdown 编辑器能力、文档数据能力、目录文件数据能力拆成公共组件，让 MarkEasy 单网页和 NoteEasy 笔记应用共用同一套核心代码。

后续新增编辑器功能时，应优先修改公共组件文件。这样 MarkEasy 和 NoteEasy 都能同步获得更新。

## 文件分区

```text
D:\Desktop\mark-component
|-- markdata.js        # 模型数据对象：文档数据模型、目录文件数据模型、适配器
|-- markcom.js         # 界面视图对象：文档编辑视图、文档大纲视图、目录文件视图
|-- markcom.css        # 公共样式：编辑器、预览、Markdown 渲染、大纲、导出样式
|-- markeasy.html      # MarkEasy 单网页入口，可直接用浏览器打开
|-- noteeasy.html      # NoteEasy 笔记主网页，由 Electron 加载
|-- noteeasy.css       # NoteEasy 专属布局样式：三栏、工具栏、文件树、状态栏
|-- noteeasy.js        # NoteEasy 专属业务：仓库、文件操作、自动保存、宿主通信
|-- main.js            # Electron 主进程
|-- preload.js         # Electron IPC 安全桥
|-- assets/            # 图标资源
|-- vendor/            # PDF 等本地依赖
```

## 组件分层

当前按 2 个模型对象、3 个界面视图组织。

模型对象在 `markdata.js`：

- `DocumentDataModel` / `MarkDocument`
- `DirectoryFileDataModel` / `DirectoryFileModel`

界面视图在 `markcom.js`：

- `DocumentEditorView`
- `DocumentOutlineView`
- `DirectoryFileView`

公共样式在 `markcom.css`。

## 文档数据模型

文档数据模型负责 Markdown 文档内容和文档大纲数据服务。

主要能力：

- 保存当前 Markdown 内容。
- 解析文档结构。
- 提供文档大纲数据。
- 发布 `change`、`outline:change`、`block:create`、`block:update`、`block:remove` 等事件。
- 支持块对象增删改。
- 支持连接服务端或协同编辑适配器。

文档子对象包括：

- 标题
- 正文
- 链接
- 图片
- 表格
- 代码块
- 公式
- 流程图
- 任务列表
- 统计图
- 五线谱
- 自定义块

子对象由 `MarkBlock` 表示，具备扩展能力：

```js
block.setRenderer((block, context) => {
  return document.createElement('div');
});

block.setDom(domNode);
block.render(context);
```

新增块类型：

```js
window.MarkCom.registerBlockType({
  type: 'callout',
  label: '提示块',
  pattern: /^::callout/,
  renderer(block) {
    const node = document.createElement('div');
    node.textContent = block.text;
    return node;
  }
});
```

## 目录文件数据模型

目录文件数据模型负责文件目录树数据，不直接负责界面渲染。

模型名称：

```js
window.MarkData.DirectoryFileDataModel
```

支持三类来源：

- `local`：本地文件来源，NoteEasy 通过 Electron 文件系统接入。
- `network`：网络文件来源，可通过接口加载目录树。
- `storage`：浏览器内部存储来源，可用 `localStorage` 保存目录树。

对应适配器：

```js
window.MarkData.LocalDirectoryFileAdapter
window.MarkData.NetworkDirectoryFileAdapter
window.MarkData.StorageDirectoryFileAdapter
```

基本用法：

```js
const model = new window.MarkData.DirectoryFileDataModel({ source: 'local' });

model.on('change', (snapshot) => {
  console.log(snapshot.root);
});

model.setTree({
  type: 'folder',
  name: 'Notes',
  path: 'D:\\Notes',
  children: []
});
```

## 三个界面视图

### 文档编辑视图

`DocumentEditorView` 连接订阅文档数据模型，负责编辑区和源码区的显示协调。

在当前 MarkEasy 编辑器中，已有编辑器功能通过该视图对象暴露：

```js
window.MarkCom.views.editor
```

常用能力：

```js
window.MarkCom.views.editor.getMarkdown();
window.MarkCom.views.editor.setMarkdown('# 标题');
window.MarkCom.views.editor.setView('preview');
window.MarkCom.views.editor.renderMarkdown();
```

### 文档大纲视图

`DocumentOutlineView` 连接订阅文档数据模型的大纲数据，负责右侧大纲显示。

当前实例：

```js
window.MarkCom.views.outline
```

文档重新渲染后，大纲视图由公共组件统一刷新。MarkEasy 和 NoteEasy 内嵌编辑器使用同一套大纲视图。

### 目录文件视图

`DirectoryFileView` 连接订阅目录文件数据模型，负责左侧目录文件树显示。

NoteEasy 当前已接入：

```js
const directoryFileModel = new window.MarkData.DirectoryFileDataModel({ source: 'local' });
const directoryFileView = new window.MarkComViews.DirectoryFileView(...);
directoryFileView.connect(directoryFileModel);
```

NoteEasy 从 Electron 获取本地目录树后，只写入 `DirectoryFileDataModel`，视图会订阅模型变化并刷新文件树。

## 主界面三栏

NoteEasy 主界面为左、中、右三栏：

- 左栏：目录文件视图 `DirectoryFileView`
- 中栏：文档编辑视图 `DocumentEditorView`
- 右栏：文档大纲视图 `DocumentOutlineView`

实现方式：

- `noteeasy.html` 提供外层三栏壳。
- 左栏由 NoteEasy 页面中的 `DirectoryFileView` 渲染。
- 中栏和右栏通过 iframe 复用 `markeasy.html?host=noteeasy&embedded=1` 中的公共编辑器和大纲。

## MarkEasy 如何使用

MarkEasy 是单网页入口，可以直接运行。

打开：

```text
D:\Desktop\mark-component\markeasy.html
```

浏览器直接打开即可。

它加载：

```html
<link rel="stylesheet" href="markcom.css">
<script src="markdata.js"></script>
<script src="markcom.js"></script>
```

适用场景：

- 单文件 Markdown 编辑
- Markdown 预览
- 源码/预览切换
- 打开 Markdown 文件
- 导出 HTML、PDF、MD

## NoteEasy 如何使用

NoteEasy 是笔记主网页，需要 Electron 启动，因为它要访问本地文件系统。

安装依赖：

```bash
npm install
```

启动：

```bash
npm start
```

启动链路：

1. `package.json` 执行 `electron .`。
2. `main.js` 创建 Electron 窗口。
3. `main.js` 加载 `noteeasy.html`。
4. `noteeasy.html` 加载公共模型和视图：

   ```html
   <script src="markdata.js"></script>
   <script src="markcom.js"></script>
   <script src="noteeasy.js"></script>
   ```

5. `noteeasy.js` 管理仓库、文件树、本地保存。
6. 中间编辑器通过 iframe 复用 MarkEasy：

   ```html
   <iframe
     id="editorFrame"
     src="markeasy.html?host=noteeasy&embedded=1">
   </iframe>
   ```

## 两个项目如何同步复用

公共能力只改这三个文件：

```text
markdata.js
markcom.js
markcom.css
```

例如：

- 修改 Markdown 解析：改 `markdata.js`
- 新增文档块类型：改 `markdata.js` 和 `markcom.js`
- 修改插入图片、表格、公式、流程图等编辑操作：改 `markcom.js`
- 修改预览样式或导出样式：改 `markcom.css`
- 修改大纲显示：改 `DocumentOutlineView`
- 修改文件树通用渲染：改 `DirectoryFileView`

MarkEasy 和 NoteEasy 会同步使用这些改动。

宿主专属能力分开维护：

- `markeasy.html`：只处理 MarkEasy 单网页入口。
- `noteeasy.html`、`noteeasy.css`、`noteeasy.js`：只处理 NoteEasy 笔记壳、文件管理、三栏布局。
- `main.js`、`preload.js`：只处理 Electron 本地能力。

## 通信方式

NoteEasy 外层页面通过 `postMessage` 与内嵌编辑器通信。

加载文档：

```js
editorFrame.contentWindow.postMessage({
  type: 'markcom:setMarkdown',
  markdown,
  meta: {
    fileName,
    path
  }
}, '*');
```

编辑器回传变化：

```js
{
  type: 'markcom:change',
  markdown,
  fileName,
  document
}
```

其中 `document` 是文档数据模型快照，NoteEasy 用它更新底部统计信息并触发自动保存。

## 打包

开发启动：

```bash
npm start
```

打包目录版本：

```bash
npm run pack
```

构建安装包：

```bash
npm run dist
```

Windows 安装包：

```bash
npm run dist:win
```

## 维护原则

1. 共有编辑器能力只放在 `markdata.js`、`markcom.js`、`markcom.css`。
2. MarkEasy 保持单网页可直接打开。
3. NoteEasy 保持 Electron 笔记主网页，专注文件管理和三栏布局。
4. 文档内容变化通过文档数据模型通知视图。
5. 文件目录变化通过目录文件数据模型通知目录文件视图。
6. 新功能先判断是否属于公共组件；属于公共组件就不要写进 NoteEasy 专属文件。

