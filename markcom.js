(function (global) {
  'use strict';

  const MARKCOM_TEMPLATE = "\u003cdiv class=\"app preview-mode\" id=\"app\"\u003e\n    \u003cheader class=\"toolbar\"\u003e\n      \u003cdiv class=\"brand\"\u003e\n        \u003cdiv class=\"brand-mark\" aria-hidden=\"true\"\u003e\u003ci data-lucide=\"file-text\"\u003e\u003c/i\u003e\u003c/div\u003e\n        \u003cdiv class=\"file-meta\"\u003e\n        \u003cdiv class=\"file-name\" id=\"fileName\"\u003eMarkEasy\u003c/div\u003e\n          \u003cdiv class=\"file-detail\" id=\"fileDetail\"\u003e未加载文件\u003c/div\u003e\n        \u003c/div\u003e\n      \u003c/div\u003e\n\n      \u003cdiv class=\"toolbar-actions\"\u003e\n        \u003cinput type=\"file\" id=\"fileInput\" accept=\".md,.markdown,.mdown,.mkd,.txt,text/markdown,text/plain,image/*\" multiple hidden\u003e\n        \u003cinput type=\"file\" id=\"folderInput\" webkitdirectory directory multiple hidden\u003e\n        \u003cbutton type=\"button\" class=\"primary\" id=\"openFile\" title=\"打开 Markdown 文件\"\u003e\n          \u003ci data-lucide=\"folder-open\"\u003e\u003c/i\u003e\u003cspan\u003e打开\u003c/span\u003e\n        \u003c/button\u003e\n        \u003cbutton type=\"button\" id=\"openFolder\" title=\"打开 Markdown 所在目录\"\u003e\n          \u003ci data-lucide=\"folder\"\u003e\u003c/i\u003e\u003cspan\u003e目录\u003c/span\u003e\n        \u003c/button\u003e\n        \u003cbutton type=\"button\" id=\"exportHtml\" title=\"导出 HTML 文件\"\u003e\n          \u003ci data-lucide=\"file-code-2\"\u003e\u003c/i\u003e\u003cspan\u003eHTML\u003c/span\u003e\n        \u003c/button\u003e\n        \u003cbutton type=\"button\" id=\"exportPdf\" title=\"导出 A4 PDF 文件\"\u003e\n          \u003ci data-lucide=\"file-down\"\u003e\u003c/i\u003e\u003cspan\u003ePDF\u003c/span\u003e\n        \u003c/button\u003e\n        \u003cbutton type=\"button\" id=\"exportMd\" title=\"导出 Markdown 文件\"\u003e\n          \u003ci data-lucide=\"file-text\"\u003e\u003c/i\u003e\u003cspan\u003eMD\u003c/span\u003e\n        \u003c/button\u003e\n        \u003cbutton type=\"button\" id=\"outlineToggle\" title=\"显示或隐藏大纲\"\u003e\n          \u003ci data-lucide=\"list-tree\"\u003e\u003c/i\u003e\u003cspan\u003e大纲\u003c/span\u003e\n        \u003c/button\u003e\n        \u003cselect id=\"numberingMode\" class=\"toolbar-select\" title=\"标题编号方式\" aria-label=\"标题编号方式\"\u003e\n          \u003coption value=\"mode1\"\u003e按章节\u003c/option\u003e\n          \u003coption value=\"mode2\"\u003e按大写\u003c/option\u003e\n          \u003coption value=\"mode3\"\u003e自动序号\u003c/option\u003e\n          \u003coption value=\"none\"\u003e不编号\u003c/option\u003e\n        \u003c/select\u003e\n        \u003cdiv class=\"segmented\" role=\"group\" aria-label=\"编辑模式\"\u003e\n          \u003cbutton type=\"button\" data-view=\"preview\" class=\"active\" title=\"预览编辑\"\u003e\u003ci data-lucide=\"eye\"\u003e\u003c/i\u003e\u003cspan\u003e预览\u003c/span\u003e\u003c/button\u003e\n          \u003cbutton type=\"button\" data-view=\"source\" title=\"源码编辑\"\u003e\u003ci data-lucide=\"braces\"\u003e\u003c/i\u003e\u003cspan\u003e源码\u003c/span\u003e\u003c/button\u003e\n        \u003c/div\u003e\n        \u003cbutton type=\"button\" class=\"icon-only\" id=\"themeToggle\" title=\"切换主题\"\u003e\n          \u003ci data-lucide=\"moon\"\u003e\u003c/i\u003e\n        \u003c/button\u003e\n      \u003c/div\u003e\n    \u003c/header\u003e\n\n    \u003cmain class=\"workspace\" id=\"workspace\"\u003e\n      \u003caside class=\"pane outline-pane\" aria-label=\"文档大纲\"\u003e\n        \u003cdiv class=\"pane-head\"\u003e\n          \u003cdiv class=\"pane-title\"\u003e\u003ci data-lucide=\"list-tree\"\u003e\u003c/i\u003e\u003cspan\u003e大纲\u003c/span\u003e\u003c/div\u003e\n          \u003cdiv class=\"pane-tools\" id=\"outlineStats\"\u003e0 项\u003c/div\u003e\n        \u003c/div\u003e\n        \u003cdiv class=\"outline-list\" id=\"outlineList\"\u003e\n          \u003cdiv class=\"outline-empty\"\u003e暂无一级至四级标题\u003c/div\u003e\n        \u003c/div\u003e\n      \u003c/aside\u003e\n      \u003cdiv class=\"outline-resizer\" id=\"outlineResizer\" role=\"separator\" aria-label=\"调整大纲宽度\" aria-orientation=\"vertical\"\u003e\u003c/div\u003e\n\n      \u003csection class=\"pane document-pane\" aria-label=\"Markdown 文档\"\u003e\n        \u003cdiv class=\"pane-head\"\u003e\n          \u003cdiv class=\"pane-title\" id=\"documentTitle\"\u003e\u003ci data-lucide=\"eye\"\u003e\u003c/i\u003e\u003cspan\u003e预览编辑\u003c/span\u003e\u003c/div\u003e\n          \u003cdiv class=\"pane-tools\" id=\"renderStats\"\u003e0 标题 · 0 代码块 · 0 图表\u003c/div\u003e\n        \u003c/div\u003e\n        \u003cdiv class=\"document-body\"\u003e\n          \u003cdiv class=\"editor-wrap source-panel\" id=\"sourcePanel\"\u003e\n            \u003ctextarea id=\"markdownInput\" spellcheck=\"false\" placeholder=\"在此粘贴 Markdown，或打开 .md 文件\"\u003e\u003c/textarea\u003e\n          \u003c/div\u003e\n          \u003cdiv class=\"preview-scroll preview-panel\" id=\"previewScroll\"\u003e\n            \u003cdiv class=\"preview-shell\"\u003e\n              \u003carticle class=\"markdown-body\" id=\"preview\" contenteditable=\"true\" spellcheck=\"false\"\u003e\n                \u003cdiv class=\"empty-state\"\u003e\n                  \u003cdiv\u003e\n                    \u003ci data-lucide=\"file-search\"\u003e\u003c/i\u003e\n                    \u003cdiv\u003e未加载 Markdown\u003c/div\u003e\n                  \u003c/div\u003e\n                \u003c/div\u003e\n              \u003c/article\u003e\n            \u003c/div\u003e\n          \u003c/div\u003e\n        \u003c/div\u003e\n      \u003c/section\u003e\n      \u003cdiv class=\"drop-overlay\"\u003e释放文件\u003c/div\u003e\n    \u003c/main\u003e\n\n    \u003cfooter class=\"statusbar\"\u003e\n      \u003cdiv class=\"status-list\"\u003e\n        \u003cspan id=\"statusText\"\u003e就绪\u003c/span\u003e\n        \u003cspan id=\"sizeText\"\u003e0 KB\u003c/span\u003e\n        \u003cspan id=\"updatedText\"\u003e本地页面\u003c/span\u003e\n      \u003c/div\u003e\n      \u003cdiv class=\"status-message\" id=\"messageText\"\u003e\u003c/div\u003e\n    \u003c/footer\u003e\n  \u003c/div\u003e\n\n  \u003cdiv class=\"toast\" id=\"toast\"\u003e\u003c/div\u003e\n\n  \u003cdiv class=\"context-menu\" id=\"contextMenu\" role=\"menu\" aria-label=\"预览编辑菜单\"\u003e\n    \u003cbutton type=\"button\" data-command=\"h1\"\u003e\u003ci data-lucide=\"heading-1\"\u003e\u003c/i\u003e\u003cspan\u003e设为一级标题\u003c/span\u003e\u003c/button\u003e\n    \u003cbutton type=\"button\" data-command=\"h2\"\u003e\u003ci data-lucide=\"heading-2\"\u003e\u003c/i\u003e\u003cspan\u003e设为二级标题\u003c/span\u003e\u003c/button\u003e\n    \u003cbutton type=\"button\" data-command=\"h3\"\u003e\u003ci data-lucide=\"heading-3\"\u003e\u003c/i\u003e\u003cspan\u003e设为三级标题\u003c/span\u003e\u003c/button\u003e\n    \u003cbutton type=\"button\" data-command=\"h4\"\u003e\u003ci data-lucide=\"heading-4\"\u003e\u003c/i\u003e\u003cspan\u003e设为四级标题\u003c/span\u003e\u003c/button\u003e\n    \u003cbutton type=\"button\" data-command=\"paragraph\"\u003e\u003ci data-lucide=\"pilcrow\"\u003e\u003c/i\u003e\u003cspan\u003e设为正文\u003c/span\u003e\u003c/button\u003e\n    \u003cdiv class=\"context-separator\"\u003e\u003c/div\u003e\n    \u003cbutton type=\"button\" data-command=\"bold\"\u003e\u003ci data-lucide=\"bold\"\u003e\u003c/i\u003e\u003cspan\u003e加粗\u003c/span\u003e\u003c/button\u003e\n    \u003cbutton type=\"button\" data-command=\"italic\"\u003e\u003ci data-lucide=\"italic\"\u003e\u003c/i\u003e\u003cspan\u003e斜体\u003c/span\u003e\u003c/button\u003e\n    \u003cbutton type=\"button\" data-command=\"underline\"\u003e\u003ci data-lucide=\"underline\"\u003e\u003c/i\u003e\u003cspan\u003e下划线\u003c/span\u003e\u003c/button\u003e\n    \u003cbutton type=\"button\" data-command=\"highlight\"\u003e\u003ci data-lucide=\"highlighter\"\u003e\u003c/i\u003e\u003cspan\u003e高亮\u003c/span\u003e\u003c/button\u003e\n    \u003cdiv class=\"context-separator\"\u003e\u003c/div\u003e\n    \u003cbutton type=\"button\" data-command=\"link\"\u003e\u003ci data-lucide=\"link\"\u003e\u003c/i\u003e\u003cspan\u003e插入链接\u003c/span\u003e\u003c/button\u003e\n    \u003cbutton type=\"button\" data-command=\"image\"\u003e\u003ci data-lucide=\"image\"\u003e\u003c/i\u003e\u003cspan\u003e插入图像\u003c/span\u003e\u003c/button\u003e\n    \u003cbutton type=\"button\" data-command=\"formula\"\u003e\u003ci data-lucide=\"sigma\"\u003e\u003c/i\u003e\u003cspan\u003e插入公式\u003c/span\u003e\u003c/button\u003e\n    \u003cbutton type=\"button\" data-command=\"table\"\u003e\u003ci data-lucide=\"table-2\"\u003e\u003c/i\u003e\u003cspan\u003e插入表格\u003c/span\u003e\u003c/button\u003e\n    \u003cbutton type=\"button\" data-command=\"task-list\"\u003e\u003ci data-lucide=\"list-checks\"\u003e\u003c/i\u003e\u003cspan\u003e插入任务列表\u003c/span\u003e\u003c/button\u003e\n    \u003cbutton type=\"button\" data-command=\"flowchart\"\u003e\u003ci data-lucide=\"workflow\"\u003e\u003c/i\u003e\u003cspan\u003e插入流程图\u003c/span\u003e\u003c/button\u003e\n    \u003cbutton type=\"button\" data-command=\"echarts\"\u003e\u003ci data-lucide=\"chart-column\"\u003e\u003c/i\u003e\u003cspan\u003e插入 ECharts\u003c/span\u003e\u003c/button\u003e\n    \u003cbutton type=\"button\" data-command=\"music-score\"\u003e\u003ci data-lucide=\"music\"\u003e\u003c/i\u003e\u003cspan\u003e插入五线谱\u003c/span\u003e\u003c/button\u003e\n    \u003cbutton type=\"button\" data-command=\"emoji\"\u003e\u003ci data-lucide=\"smile\"\u003e\u003c/i\u003e\u003cspan\u003e插入 Emoji\u003c/span\u003e\u003c/button\u003e\n    \u003cbutton type=\"button\" data-command=\"code\"\u003e\u003ci data-lucide=\"code-2\"\u003e\u003c/i\u003e\u003cspan\u003e插入代码块\u003c/span\u003e\u003c/button\u003e\n    \u003cdiv class=\"context-separator\"\u003e\u003c/div\u003e\n    \u003cbutton type=\"button\" data-command=\"paragraph-before\"\u003e\u003ci data-lucide=\"corner-left-up\"\u003e\u003c/i\u003e\u003cspan\u003e上方插入段落\u003c/span\u003e\u003c/button\u003e\n    \u003cbutton type=\"button\" data-command=\"paragraph-after\"\u003e\u003ci data-lucide=\"corner-left-down\"\u003e\u003c/i\u003e\u003cspan\u003e下方插入段落\u003c/span\u003e\u003c/button\u003e\n  \u003c/div\u003e\n\n  \u003cdiv class=\"table-toolbar\" id=\"tableToolbar\" role=\"toolbar\" aria-label=\"表格编辑工具\"\u003e\n    \u003cbutton type=\"button\" data-table-tool=\"select-row\" title=\"选中当前行\"\u003e\u003ci data-lucide=\"rows-3\"\u003e\u003c/i\u003e\u003cspan\u003e行\u003c/span\u003e\u003c/button\u003e\n    \u003cbutton type=\"button\" data-table-tool=\"select-column\" title=\"选中当前列\"\u003e\u003ci data-lucide=\"columns-3\"\u003e\u003c/i\u003e\u003cspan\u003e列\u003c/span\u003e\u003c/button\u003e\n    \u003cbutton type=\"button\" data-table-tool=\"merge\" title=\"合并选中单元格\"\u003e\u003ci data-lucide=\"combine\"\u003e\u003c/i\u003e\u003cspan\u003e合并\u003c/span\u003e\u003c/button\u003e\n    \u003cbutton type=\"button\" data-table-tool=\"split\" title=\"拆分当前单元格\"\u003e\u003ci data-lucide=\"split-square-horizontal\"\u003e\u003c/i\u003e\u003cspan\u003e拆分\u003c/span\u003e\u003c/button\u003e\n    \u003cbutton type=\"button\" data-table-tool=\"delete-row\" title=\"删除选中行\"\u003e\u003ci data-lucide=\"trash-2\"\u003e\u003c/i\u003e\u003cspan\u003e删行\u003c/span\u003e\u003c/button\u003e\n    \u003cbutton type=\"button\" data-table-tool=\"delete-column\" title=\"删除选中列\"\u003e\u003ci data-lucide=\"trash-2\"\u003e\u003c/i\u003e\u003cspan\u003e删列\u003c/span\u003e\u003c/button\u003e\n    \u003cbutton type=\"button\" data-table-tool=\"equal-columns\" title=\"等分列宽\"\u003e\u003ci data-lucide=\"columns-3\"\u003e\u003c/i\u003e\u003cspan\u003e等列\u003c/span\u003e\u003c/button\u003e\n    \u003cbutton type=\"button\" data-table-tool=\"equal-rows\" title=\"等分行高\"\u003e\u003ci data-lucide=\"rows-3\"\u003e\u003c/i\u003e\u003cspan\u003e等行\u003c/span\u003e\u003c/button\u003e\n  \u003c/div\u003e\n  \u003cbutton type=\"button\" class=\"table-edge-add\" id=\"tableAddRow\" title=\"下方添加行\"\u003e\u003ci data-lucide=\"plus\"\u003e\u003c/i\u003e\u003c/button\u003e\n  \u003cbutton type=\"button\" class=\"table-edge-add\" id=\"tableAddColumn\" title=\"右侧添加列\"\u003e\u003ci data-lucide=\"plus\"\u003e\u003c/i\u003e\u003c/button\u003e\n  \u003cdiv class=\"table-resize-handle table-col-resize\" id=\"tableColumnResize\" aria-hidden=\"true\"\u003e\u003c/div\u003e\n  \u003cdiv class=\"table-resize-handle table-row-resize\" id=\"tableRowResize\" aria-hidden=\"true\"\u003e\u003c/div\u003e\n\n  \u003cdiv class=\"modal-backdrop\" id=\"formulaDialog\" aria-hidden=\"true\"\u003e\n    \u003cdiv class=\"modal\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"formulaTitle\"\u003e\n      \u003cdiv class=\"modal-head\"\u003e\n        \u003cdiv class=\"modal-title\" id=\"formulaTitle\"\u003e插入公式\u003c/div\u003e\n        \u003cbutton type=\"button\" class=\"icon-only\" id=\"formulaClose\" title=\"关闭\"\u003e\u003ci data-lucide=\"x\"\u003e\u003c/i\u003e\u003c/button\u003e\n      \u003c/div\u003e\n      \u003cdiv class=\"modal-body\"\u003e\n        \u003clabel class=\"text-field\" for=\"formulaTemplate\"\u003e\n          \u003cspan class=\"field-label\"\u003e常用公式示例\u003c/span\u003e\n          \u003cselect id=\"formulaTemplate\"\u003e\n            \u003coption value=\"\"\u003e自定义\u003c/option\u003e\n            \u003coption value=\"pythagorean\"\u003e勾股定理\u003c/option\u003e\n            \u003coption value=\"quadratic\"\u003e一元二次方程\u003c/option\u003e\n            \u003coption value=\"integral\"\u003e定积分\u003c/option\u003e\n            \u003coption value=\"matrix\"\u003e矩阵\u003c/option\u003e\n            \u003coption value=\"limit\"\u003e极限\u003c/option\u003e\n            \u003coption value=\"sum\"\u003e求和\u003c/option\u003e\n            \u003coption value=\"bayes\"\u003e贝叶斯公式\u003c/option\u003e\n          \u003c/select\u003e\n        \u003c/label\u003e\n        \u003clabel class=\"field-label\" for=\"formulaInput\"\u003e输入 Markdown / LaTeX 公式，例如 $a^2+b^2=c^2$ 或 $$\\int_0^1 x^2 dx$$\u003c/label\u003e\n        \u003ctextarea id=\"formulaInput\" spellcheck=\"false\" placeholder=\"$E = mc^2$\"\u003e\u003c/textarea\u003e\n        \u003clabel class=\"checkbox-row\"\u003e\n          \u003cinput type=\"checkbox\" id=\"formulaBlock\"\u003e\n          \u003cspan\u003e块级公式\u003c/span\u003e\n        \u003c/label\u003e\n      \u003c/div\u003e\n      \u003cdiv class=\"modal-actions\"\u003e\n        \u003cbutton type=\"button\" id=\"formulaCancel\"\u003e取消\u003c/button\u003e\n        \u003cbutton type=\"button\" class=\"primary\" id=\"formulaConfirm\"\u003e确认\u003c/button\u003e\n      \u003c/div\u003e\n    \u003c/div\u003e\n  \u003c/div\u003e\n\n  \u003cdiv class=\"modal-backdrop\" id=\"tableDialog\" aria-hidden=\"true\"\u003e\n    \u003cdiv class=\"modal\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"tableTitle\"\u003e\n      \u003cdiv class=\"modal-head\"\u003e\n        \u003cdiv class=\"modal-title\" id=\"tableTitle\"\u003e插入表格\u003c/div\u003e\n        \u003cbutton type=\"button\" class=\"icon-only\" id=\"tableClose\" title=\"关闭\"\u003e\u003ci data-lucide=\"x\"\u003e\u003c/i\u003e\u003c/button\u003e\n      \u003c/div\u003e\n      \u003cdiv class=\"modal-body\"\u003e\n        \u003cdiv class=\"number-grid\"\u003e\n          \u003clabel class=\"number-field\" for=\"tableRows\"\u003e\n            \u003cspan class=\"field-label\"\u003e行数（含表头）\u003c/span\u003e\n            \u003cinput type=\"number\" id=\"tableRows\" min=\"1\" max=\"50\" value=\"3\" inputmode=\"numeric\"\u003e\n          \u003c/label\u003e\n          \u003clabel class=\"number-field\" for=\"tableCols\"\u003e\n            \u003cspan class=\"field-label\"\u003e列数\u003c/span\u003e\n            \u003cinput type=\"number\" id=\"tableCols\" min=\"1\" max=\"20\" value=\"3\" inputmode=\"numeric\"\u003e\n          \u003c/label\u003e\n        \u003c/div\u003e\n        \u003cdiv class=\"field-hint\"\u003e生成后可直接在预览区单元格中编辑内容。\u003c/div\u003e\n      \u003c/div\u003e\n      \u003cdiv class=\"modal-actions\"\u003e\n        \u003cbutton type=\"button\" id=\"tableCancel\"\u003e取消\u003c/button\u003e\n        \u003cbutton type=\"button\" class=\"primary\" id=\"tableConfirm\"\u003e确认\u003c/button\u003e\n      \u003c/div\u003e\n    \u003c/div\u003e\n  \u003c/div\u003e\n\n  \u003cdiv class=\"modal-backdrop\" id=\"imageDialog\" aria-hidden=\"true\"\u003e\n    \u003cdiv class=\"modal\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"imageTitle\"\u003e\n      \u003cdiv class=\"modal-head\"\u003e\n        \u003cdiv class=\"modal-title\" id=\"imageTitle\"\u003e插入图像\u003c/div\u003e\n        \u003cbutton type=\"button\" class=\"icon-only\" id=\"imageClose\" title=\"关闭\"\u003e\u003ci data-lucide=\"x\"\u003e\u003c/i\u003e\u003c/button\u003e\n      \u003c/div\u003e\n      \u003cdiv class=\"modal-body\"\u003e\n        \u003cdiv class=\"text-grid\"\u003e\n          \u003clabel class=\"text-field\" for=\"imageUrl\"\u003e\n            \u003cspan class=\"field-label\"\u003e图片地址\u003c/span\u003e\n            \u003cinput type=\"url\" id=\"imageUrl\" placeholder=\"https://example.com/image.png\"\u003e\n          \u003c/label\u003e\n          \u003cdiv class=\"text-field\"\u003e\n            \u003cspan class=\"field-label\"\u003e本地图片\u003c/span\u003e\n            \u003cinput type=\"file\" id=\"imageFile\" accept=\"image/*\" hidden\u003e\n            \u003cbutton type=\"button\" id=\"imageFileButton\"\u003e\u003ci data-lucide=\"image-plus\"\u003e\u003c/i\u003e\u003cspan\u003e选择本地图片\u003c/span\u003e\u003c/button\u003e\n          \u003c/div\u003e\n          \u003clabel class=\"text-field\" for=\"imageAlt\"\u003e\n            \u003cspan class=\"field-label\"\u003e图片说明\u003c/span\u003e\n            \u003cinput type=\"text\" id=\"imageAlt\" placeholder=\"图片\"\u003e\n          \u003c/label\u003e\n          \u003cdiv class=\"number-grid\"\u003e\n            \u003clabel class=\"number-field\" for=\"imageWidth\"\u003e\n              \u003cspan class=\"field-label\"\u003e显示宽度（%）\u003c/span\u003e\n              \u003cinput type=\"number\" id=\"imageWidth\" min=\"5\" max=\"100\" value=\"70\" inputmode=\"numeric\"\u003e\n            \u003c/label\u003e\n            \u003clabel class=\"number-field\" for=\"imageAlign\"\u003e\n              \u003cspan class=\"field-label\"\u003e对齐方式\u003c/span\u003e\n              \u003cselect id=\"imageAlign\"\u003e\n                \u003coption value=\"center\"\u003e居中\u003c/option\u003e\n                \u003coption value=\"left\"\u003e左对齐\u003c/option\u003e\n                \u003coption value=\"right\"\u003e右对齐\u003c/option\u003e\n              \u003c/select\u003e\n            \u003c/label\u003e\n          \u003c/div\u003e\n        \u003c/div\u003e\n      \u003c/div\u003e\n      \u003cdiv class=\"modal-actions\"\u003e\n        \u003cbutton type=\"button\" id=\"imageCancel\"\u003e取消\u003c/button\u003e\n        \u003cbutton type=\"button\" class=\"primary\" id=\"imageConfirm\"\u003e确认\u003c/button\u003e\n      \u003c/div\u003e\n    \u003c/div\u003e\n  \u003c/div\u003e\n\n  \u003cdiv class=\"modal-backdrop\" id=\"flowchartDialog\" aria-hidden=\"true\"\u003e\n    \u003cdiv class=\"modal\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"flowchartTitle\"\u003e\n      \u003cdiv class=\"modal-head\"\u003e\n        \u003cdiv class=\"modal-title\" id=\"flowchartTitle\"\u003e插入流程图\u003c/div\u003e\n        \u003cbutton type=\"button\" class=\"icon-only\" id=\"flowchartClose\" title=\"关闭\"\u003e\u003ci data-lucide=\"x\"\u003e\u003c/i\u003e\u003c/button\u003e\n      \u003c/div\u003e\n      \u003cdiv class=\"modal-body\"\u003e\n        \u003clabel class=\"text-field\" for=\"flowchartTemplate\"\u003e\n          \u003cspan class=\"field-label\"\u003e流程图类型示例\u003c/span\u003e\n          \u003cselect id=\"flowchartTemplate\"\u003e\n            \u003coption value=\"\"\u003e自定义\u003c/option\u003e\n            \u003coption value=\"flowchart\"\u003e基础流程图\u003c/option\u003e\n            \u003coption value=\"sequence\"\u003e时序图\u003c/option\u003e\n            \u003coption value=\"state\"\u003e状态图\u003c/option\u003e\n            \u003coption value=\"class\"\u003e类图\u003c/option\u003e\n            \u003coption value=\"gantt\"\u003e甘特图\u003c/option\u003e\n            \u003coption value=\"pie\"\u003e饼图\u003c/option\u003e\n            \u003coption value=\"er\"\u003eER 图\u003c/option\u003e\n          \u003c/select\u003e\n        \u003c/label\u003e\n        \u003clabel class=\"text-field\" for=\"flowchartInput\"\u003e\n          \u003cspan class=\"field-label\"\u003eMermaid 源码\u003c/span\u003e\n          \u003ctextarea id=\"flowchartInput\" spellcheck=\"false\"\u003eflowchart TD\n  A[开始] --\u003e B{是否通过}\n  B -- 是 --\u003e C[完成]\n  B -- 否 --\u003e D[调整]\n  D --\u003e B\u003c/textarea\u003e\n        \u003c/label\u003e\n      \u003c/div\u003e\n      \u003cdiv class=\"modal-actions\"\u003e\n        \u003cbutton type=\"button\" id=\"flowchartCancel\"\u003e取消\u003c/button\u003e\n        \u003cbutton type=\"button\" class=\"primary\" id=\"flowchartConfirm\"\u003e确认\u003c/button\u003e\n      \u003c/div\u003e\n    \u003c/div\u003e\n  \u003c/div\u003e\n\n  \u003cdiv class=\"modal-backdrop\" id=\"extensionDialog\" aria-hidden=\"true\"\u003e\n    \u003cdiv class=\"modal\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"extensionTitle\"\u003e\n      \u003cdiv class=\"modal-head\"\u003e\n        \u003cdiv class=\"modal-title\" id=\"extensionTitle\"\u003e编辑扩展源码\u003c/div\u003e\n        \u003cbutton type=\"button\" class=\"icon-only\" id=\"extensionClose\" title=\"关闭\"\u003e\u003ci data-lucide=\"x\"\u003e\u003c/i\u003e\u003c/button\u003e\n      \u003c/div\u003e\n      \u003cdiv class=\"modal-body\"\u003e\n        \u003clabel class=\"text-field\" for=\"extensionInput\"\u003e\n          \u003cspan class=\"field-label\" id=\"extensionHint\"\u003e源码\u003c/span\u003e\n          \u003ctextarea id=\"extensionInput\" spellcheck=\"false\"\u003e\u003c/textarea\u003e\n        \u003c/label\u003e\n      \u003c/div\u003e\n      \u003cdiv class=\"modal-actions\"\u003e\n        \u003cbutton type=\"button\" id=\"extensionCancel\"\u003e取消\u003c/button\u003e\n        \u003cbutton type=\"button\" class=\"primary\" id=\"extensionConfirm\"\u003e确认\u003c/button\u003e\n      \u003c/div\u003e\n    \u003c/div\u003e\n  \u003c/div\u003e\n\n  \u003cdiv class=\"modal-backdrop\" id=\"emojiDialog\" aria-hidden=\"true\"\u003e\n    \u003cdiv class=\"modal\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"emojiTitle\"\u003e\n      \u003cdiv class=\"modal-head\"\u003e\n        \u003cdiv class=\"modal-title\" id=\"emojiTitle\"\u003e插入 Emoji\u003c/div\u003e\n        \u003cbutton type=\"button\" class=\"icon-only\" id=\"emojiClose\" title=\"关闭\"\u003e\u003ci data-lucide=\"x\"\u003e\u003c/i\u003e\u003c/button\u003e\n      \u003c/div\u003e\n      \u003cdiv class=\"modal-body\"\u003e\n        \u003cdiv class=\"emoji-grid\" id=\"emojiGrid\" aria-label=\"常用 Emoji\"\u003e\n          \u003cbutton type=\"button\" data-emoji=\"😀\"\u003e😀\u003c/button\u003e\n          \u003cbutton type=\"button\" data-emoji=\"😂\"\u003e😂\u003c/button\u003e\n          \u003cbutton type=\"button\" data-emoji=\"😊\"\u003e😊\u003c/button\u003e\n          \u003cbutton type=\"button\" data-emoji=\"👍\"\u003e👍\u003c/button\u003e\n          \u003cbutton type=\"button\" data-emoji=\"✅\"\u003e✅\u003c/button\u003e\n          \u003cbutton type=\"button\" data-emoji=\"⭐\"\u003e⭐\u003c/button\u003e\n          \u003cbutton type=\"button\" data-emoji=\"🔥\"\u003e🔥\u003c/button\u003e\n          \u003cbutton type=\"button\" data-emoji=\"🎉\"\u003e🎉\u003c/button\u003e\n          \u003cbutton type=\"button\" data-emoji=\"💡\"\u003e💡\u003c/button\u003e\n          \u003cbutton type=\"button\" data-emoji=\"📌\"\u003e📌\u003c/button\u003e\n          \u003cbutton type=\"button\" data-emoji=\"📷\"\u003e📷\u003c/button\u003e\n          \u003cbutton type=\"button\" data-emoji=\"🚀\"\u003e🚀\u003c/button\u003e\n        \u003c/div\u003e\n        \u003clabel class=\"text-field\" for=\"emojiInput\"\u003e\n          \u003cspan class=\"field-label\"\u003e自定义 Emoji\u003c/span\u003e\n          \u003cinput type=\"text\" id=\"emojiInput\" value=\"😀\" maxlength=\"16\"\u003e\n        \u003c/label\u003e\n      \u003c/div\u003e\n      \u003cdiv class=\"modal-actions\"\u003e\n        \u003cbutton type=\"button\" id=\"emojiCancel\"\u003e取消\u003c/button\u003e\n        \u003cbutton type=\"button\" class=\"primary\" id=\"emojiConfirm\"\u003e确认\u003c/button\u003e\n      \u003c/div\u003e\n    \u003c/div\u003e\n  \u003c/div\u003e";

  function ensureMarkComMarkup() {
    if (document.getElementById('app')) return;
    const mount = document.querySelector('[data-markcom-root]') || document.getElementById('markcom-root');
    if (mount) {
      mount.innerHTML = MARKCOM_TEMPLATE;
    } else {
      document.body.insertAdjacentHTML('afterbegin', MARKCOM_TEMPLATE);
    }
  }

  global.MarkComTemplate = MARKCOM_TEMPLATE;
  ensureMarkComMarkup();
})(window);
(function (global) {
  'use strict';

  class ComponentView {
    constructor(options = {}) {
      this.options = options;
      this.root = options.root || null;
      this.model = null;
      this.unsubscribers = [];
    }

    connect(model) {
      this.disconnect();
      this.model = model || null;
      if (this.model && typeof this.model.on === 'function') {
        this.unsubscribers.push(this.model.on('change', (snapshot) => this.render(snapshot)));
      }
      if (this.model && typeof this.model.snapshot === 'function') {
        this.render(this.model.snapshot());
      }
      return this;
    }

    disconnect() {
      this.unsubscribers.forEach((unsubscribe) => {
        if (typeof unsubscribe === 'function') unsubscribe();
      });
      this.unsubscribers = [];
      this.model = null;
      return this;
    }

    destroy() {
      this.disconnect();
      if (this.root) this.root.innerHTML = '';
    }

    render() {}
  }

  class DocumentOutlineView extends ComponentView {
    constructor(options = {}) {
      super(options);
      this.stats = options.stats || null;
      this.emptyText = options.emptyText || '暂无一级至四级标题';
      this.onSelect = options.onSelect || null;
      this.maxLevel = options.maxLevel || 4;
      this.collapsedIds = new Set();
      this.lastItems = [];
      if (this.root) {
        this.root.addEventListener('click', (event) => {
          const toggle = event.target.closest('[data-outline-toggle]');
          if (toggle && this.root.contains(toggle)) {
            event.preventDefault();
            event.stopPropagation();
            this.toggleCollapsed(toggle.dataset.outlineToggle || '');
            return;
          }
          const item = event.target.closest('[data-outline-id]');
          if (!item) return;
          if (typeof this.onSelect === 'function') {
            this.onSelect(item.dataset.outlineId, event);
          }
        });
      }
    }

    connect(model) {
      super.connect(model);
      if (this.model && typeof this.model.on === 'function') {
        this.unsubscribers.push(this.model.on('outline:change', (items) => this.render(items)));
      }
      if (this.model && typeof this.model.getOutline === 'function') {
        this.render(this.model.getOutline({ maxLevel: this.maxLevel }));
      }
      return this;
    }

    render(payload) {
      if (!this.root) return;
      const items = normalizeOutlineItems(payload, this.maxLevel);
      this.lastItems = items;
      if (this.stats) this.stats.textContent = `${items.length} 项`;
      if (!items.length) {
        this.root.innerHTML = `<div class="outline-empty">${escapeViewHtml(this.emptyText)}</div>`;
        return;
      }
      this.root.innerHTML = items.map((item, index) => {
        if (isOutlineItemHidden(items, index, this.collapsedIds)) return '';
        const hasChildren = outlineItemHasChildren(items, index);
        const collapsed = hasChildren && this.collapsedIds.has(item.id);
        return `
        <button type="button" class="outline-item outline-level-${item.level}${hasChildren && !collapsed ? ' expanded' : ''}${collapsed ? ' collapsed' : ''}" data-outline-id="${escapeViewAttr(item.id)}" title="${escapeViewAttr(item.title)}">
          <span class="outline-caret${hasChildren ? '' : ' placeholder'}" ${hasChildren ? `data-outline-toggle="${escapeViewAttr(item.id)}"` : ''} aria-hidden="true"><i data-lucide="chevron-right"></i></span>
          <span class="outline-number">${item.number ? escapeViewHtml(item.number) : ''}</span>
          <span class="outline-title">${escapeViewHtml(item.title)}</span>
        </button>`;
      }).join('');
      if (global.lucide) global.lucide.createIcons({ attrs: { width: 18, height: 18, 'stroke-width': 2 } });
    }

    toggleCollapsed(id) {
      if (!id) return;
      if (this.collapsedIds.has(id)) {
        this.collapsedIds.delete(id);
      } else {
        this.collapsedIds.add(id);
      }
      this.render(this.lastItems);
    }
  }

  class DocumentEditorView extends ComponentView {
    constructor(options = {}) {
      super(options);
      this.sourceInput = options.sourceInput || null;
      this.previewRoot = options.previewRoot || null;
      this.getMarkdownHandler = options.getMarkdown || null;
      this.setMarkdownHandler = options.setMarkdown || null;
      this.setViewHandler = options.setView || null;
      this.renderMarkdownHandler = options.renderMarkdown || null;
    }

    getMarkdown() {
      if (typeof this.getMarkdownHandler === 'function') return this.getMarkdownHandler();
      if (this.sourceInput) return this.sourceInput.value;
      return this.model && typeof this.model.getMarkdown === 'function' ? this.model.getMarkdown() : '';
    }

    setMarkdown(markdown, meta = {}) {
      if (typeof this.setMarkdownHandler === 'function') {
        return this.setMarkdownHandler(markdown, meta);
      }
      if (this.sourceInput) this.sourceInput.value = String(markdown || '');
      if (this.model && typeof this.model.setMarkdown === 'function') {
        this.model.setMarkdown(markdown, meta);
      }
      return this;
    }

    setView(view) {
      if (typeof this.setViewHandler === 'function') return this.setViewHandler(view);
      return this;
    }

    renderMarkdown() {
      if (typeof this.renderMarkdownHandler === 'function') return this.renderMarkdownHandler();
      return null;
    }

    render(snapshot) {
      if (!this.sourceInput || !snapshot || typeof snapshot.markdown !== 'string') return;
      if (document.activeElement === this.sourceInput) return;
      if (this.sourceInput.value !== snapshot.markdown) this.sourceInput.value = snapshot.markdown;
    }
  }

  class DirectoryFileView extends ComponentView {
    constructor(options = {}) {
      super(options);
      this.emptyText = options.emptyText || '暂无文件';
      this.noMatchText = options.noMatchText || '没有匹配的 Markdown 笔记';
      this.onSelect = options.onSelect || null;
      this.getQuery = options.getQuery || (() => '');
      this.getActivePath = options.getActivePath || (() => '');
      this.getSelectedPath = options.getSelectedPath || (() => '');
      this.renderIcons = options.renderIcons || null;
      this.expandedPaths = new Set();
      this.lastRootPath = '';
      if (this.root) {
        this.root.addEventListener('click', (event) => {
          const row = event.target.closest('.tree-row');
          if (!row) return;
          const path = row.dataset.path || '';
          const type = row.dataset.type || '';
          const node = this.model && typeof this.model.findNode === 'function'
            ? this.model.findNode(path)
            : null;
          if (type === 'folder') this.toggleExpanded(path, { render: false });
          if (this.model && typeof this.model.select === 'function') this.model.select(path, type);
          if (typeof this.onSelect === 'function') this.onSelect(node || { path, type }, event);
        });
      }
    }

    connect(model) {
      super.connect(model);
      if (this.model && typeof this.model.on === 'function') {
        this.unsubscribers.push(this.model.on('selection:change', () => this.render(this.model.snapshot())));
      }
      return this;
    }

    render(snapshot) {
      if (!this.root) return;
      const rootNode = snapshot && snapshot.root ? snapshot.root : snapshot;
      if (!rootNode) {
        this.root.innerHTML = `<div class="file-tree-empty">${escapeViewHtml(this.emptyText)}</div>`;
        return;
      }
      const rootPath = String(rootNode.path || rootNode.url || '');
      if (rootPath && rootPath !== this.lastRootPath) {
        this.lastRootPath = rootPath;
        this.expandedPaths = new Set([rootPath]);
      }
      const query = String(this.getQuery() || '').trim().toLowerCase();
      const html = renderDirectoryNode(rootNode, {
        query,
        depth: 0,
        activePath: this.getActivePath(),
        selectedPath: this.getSelectedPath(),
        rootPath,
        expandedPaths: this.expandedPaths
      });
      this.root.innerHTML = html || `<div class="file-tree-empty">${escapeViewHtml(this.noMatchText)}</div>`;
      if (typeof this.renderIcons === 'function') this.renderIcons();
    }

    toggleExpanded(path, options = {}) {
      if (!path) return;
      if (this.expandedPaths.has(path)) {
        this.expandedPaths.delete(path);
      } else {
        this.expandedPaths.add(path);
      }
      if (options.render !== false && this.model && typeof this.model.snapshot === 'function') {
        this.render(this.model.snapshot());
      }
    }
  }

  function normalizeOutlineItems(payload, maxLevel) {
    if (Array.isArray(payload)) {
      return payload
        .filter((item) => item && Number(item.level) <= maxLevel)
        .map((item, index) => ({
          id: item.id || item.anchor || `outline-${index}`,
          level: Number(item.level) || 1,
          title: item.title || item.text || '',
          number: item.number || '',
          line: item.line
        }));
    }
    const blocks = Array.isArray(payload && payload.blocks) ? payload.blocks : [];
    return blocks
      .filter((block) => block.type === 'heading' && Number(block.level) >= 1 && Number(block.level) <= maxLevel)
      .map((block, index) => ({
        id: block.id || `outline-${index}`,
        level: Number(block.level) || 1,
        title: block.text || '',
        number: '',
        line: block.range && block.range.startLine ? block.range.startLine - 1 : undefined
      }));
  }

  function outlineItemHasChildren(items, index) {
    const item = items[index];
    if (!item) return false;
    for (let i = index + 1; i < items.length; i += 1) {
      if (Number(items[i].level) <= Number(item.level)) return false;
      if (Number(items[i].level) > Number(item.level)) return true;
    }
    return false;
  }

  function isOutlineItemHidden(items, index, collapsedIds) {
    const item = items[index];
    if (!item || !collapsedIds || !collapsedIds.size) return false;
    let currentLevel = Number(item.level) || 1;
    for (let i = index - 1; i >= 0; i -= 1) {
      const candidate = items[i];
      const candidateLevel = Number(candidate.level) || 1;
      if (candidateLevel < currentLevel) {
        if (collapsedIds.has(candidate.id)) return true;
        currentLevel = candidateLevel;
        if (currentLevel <= 1) return false;
      }
    }
    return false;
  }

  function renderDirectoryNode(node, context) {
    if (!node) return '';
    const children = Array.isArray(node.children) ? node.children : [];
    const type = node.type === 'folder' ? 'folder' : 'file';
    const path = String(node.path || node.url || '');
    const isFolder = type === 'folder';
    const expanded = isFolder && (context.query || context.depth === 0 || path === context.rootPath || (context.expandedPaths && context.expandedPaths.has(path)));
    const childHtml = (expanded || context.query ? children : [])
      .map((child) => renderDirectoryNode(child, Object.assign({}, context, { depth: context.depth + 1 })))
      .filter(Boolean);
    const name = String(node.name || '');
    const matches = !context.query || name.toLowerCase().includes(context.query) || path.toLowerCase().includes(context.query) || childHtml.length > 0;
    if (!matches) return '';
    const active = context.activePath && context.activePath === path ? ' active' : '';
    const selected = context.selectedPath && context.selectedPath === path ? ' selected' : '';
    const itemIcon = type === 'folder' ? 'folder' : 'file-text';
    const row = `
      <button type="button" class="tree-row ${type}${active}${selected}${expanded ? ' expanded' : ''}" data-path="${escapeViewAttr(path)}" data-type="${escapeViewAttr(type)}" style="padding-left:${8 + context.depth * 14}px">
        <span class="tree-caret"><i data-lucide="chevron-right"></i></span>
        <span class="tree-icon"><i data-lucide="${itemIcon}"></i></span>
        <span class="tree-name">${escapeViewHtml(name)}</span>
      </button>`;
    return `
      <div class="tree-node ${type}${expanded ? ' expanded' : ' collapsed'}" data-node-path="${escapeViewAttr(path)}">
        ${row}
        ${isFolder ? `<div class="tree-children">${expanded ? childHtml.join('') : ''}</div>` : ''}
      </div>`;
  }

  function escapeViewHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escapeViewAttr(value) {
    return escapeViewHtml(value).replace(/`/g, '&#96;');
  }

  global.MarkComViews = Object.assign(global.MarkComViews || {}, {
    ComponentView,
    DocumentOutlineView,
    DocumentEditorView,
    DirectoryFileView
  });
})(window);
(() => {
      const app = document.getElementById('app');
      const markComConfig = window.MarkComConfig || {};
      const getElement = (id) => (app ? app.querySelector(`#${id}`) : null) || document.getElementById(id);
      const input = getElement('markdownInput');
      const preview = getElement('preview');
      const previewScroll = getElement('previewScroll');
      const fileInput = getElement('fileInput');
      const folderInput = getElement('folderInput');
      const openFile = getElement('openFile');
      const openFolder = getElement('openFolder');
      const exportHtmlButton = getElement('exportHtml');
      const exportPdfButton = getElement('exportPdf');
      const exportMdButton = getElement('exportMd');
      const outlineToggle = getElement('outlineToggle');
      const outlineResizer = getElement('outlineResizer');
      const numberingModeSelect = getElement('numberingMode');
      const themeToggle = getElement('themeToggle');
      const fileName = getElement('fileName');
      const fileDetail = getElement('fileDetail');
      const documentTitle = getElement('documentTitle');
      const outlineList = getElement('outlineList');
      const outlineStats = getElement('outlineStats');
      const renderStats = getElement('renderStats');
      const statusText = getElement('statusText');
      const sizeText = getElement('sizeText');
      const updatedText = getElement('updatedText');
      const messageText = getElement('messageText');
      const toast = getElement('toast');
      const contextMenu = getElement('contextMenu');
      const tableToolbar = getElement('tableToolbar');
      const tableAddRow = getElement('tableAddRow');
      const tableAddColumn = getElement('tableAddColumn');
      const tableColumnResize = getElement('tableColumnResize');
      const tableRowResize = getElement('tableRowResize');
      const formulaDialog = getElement('formulaDialog');
      const formulaTemplate = getElement('formulaTemplate');
      const formulaInput = getElement('formulaInput');
      const formulaBlock = getElement('formulaBlock');
      const formulaClose = getElement('formulaClose');
      const formulaCancel = getElement('formulaCancel');
      const formulaConfirm = getElement('formulaConfirm');
      const tableDialog = getElement('tableDialog');
      const tableRows = getElement('tableRows');
      const tableCols = getElement('tableCols');
      const tableClose = getElement('tableClose');
      const tableCancel = getElement('tableCancel');
      const tableConfirm = getElement('tableConfirm');
      const imageDialog = getElement('imageDialog');
      const imageUrl = getElement('imageUrl');
      const imageFile = getElement('imageFile');
      const imageFileButton = getElement('imageFileButton');
      const imageAlt = getElement('imageAlt');
      const imageWidth = getElement('imageWidth');
      const imageAlign = getElement('imageAlign');
      const imageClose = getElement('imageClose');
      const imageCancel = getElement('imageCancel');
      const imageConfirm = getElement('imageConfirm');
      const flowchartDialog = getElement('flowchartDialog');
      const flowchartTemplate = getElement('flowchartTemplate');
      const flowchartInput = getElement('flowchartInput');
      const flowchartClose = getElement('flowchartClose');
      const flowchartCancel = getElement('flowchartCancel');
      const flowchartConfirm = getElement('flowchartConfirm');
      const extensionDialog = getElement('extensionDialog');
      const extensionTitle = getElement('extensionTitle');
      const extensionHint = getElement('extensionHint');
      const extensionInput = getElement('extensionInput');
      const extensionClose = getElement('extensionClose');
      const extensionCancel = getElement('extensionCancel');
      const extensionConfirm = getElement('extensionConfirm');
      const emojiDialog = getElement('emojiDialog');
      const emojiGrid = getElement('emojiGrid');
      const emojiInput = getElement('emojiInput');
      const emojiClose = getElement('emojiClose');
      const emojiCancel = getElement('emojiCancel');
      const emojiConfirm = getElement('emojiConfirm');
      const viewButtons = Array.from(app ? app.querySelectorAll('[data-view]') : document.querySelectorAll('[data-view]'));

      if (!app || !input || !preview) return;
      const hostTabs = ensureHostTabs(documentTitle);

const sampleName = 'MarkEasy';
      const MarkDocumentClass = window.MarkData && window.MarkData.MarkDocument;
      const documentData = MarkDocumentClass ? new MarkDocumentClass({ title: sampleName }) : null;
      const ViewClasses = window.MarkComViews || {};
      const MARKDOWN_FILE_PATTERN = /\.(md|markdown|mdown|mkd|txt)$/i;
      const IMAGE_FILE_PATTERN = /\.(png|jpe?g|gif|webp|bmp|svg)$/i;
      const ECHARTS_SAMPLE = `{
  "title": { "text": "示例图表" },
  "tooltip": {},
  "xAxis": { "type": "category", "data": ["一月", "二月", "三月", "四月"] },
  "yAxis": { "type": "value" },
  "series": [{ "type": "bar", "data": [12, 20, 15, 28] }]
}`;
      const MUSIC_SCORE_SAMPLE = `X:1
T:示例旋律
M:4/4
L:1/4
K:C
C D E F | G A B c |`;
      const PDF_PT_PER_MM = 72 / 25.4;
      const PDF_PAGE_WIDTH = 210 * PDF_PT_PER_MM;
      const PDF_PAGE_HEIGHT = 297 * PDF_PT_PER_MM;
      const PDF_MARGINS = [18 * PDF_PT_PER_MM, 16 * PDF_PT_PER_MM, 18 * PDF_PT_PER_MM, 18 * PDF_PT_PER_MM];
      const PDF_CONTENT_WIDTH = PDF_PAGE_WIDTH - PDF_MARGINS[0] - PDF_MARGINS[2];
      const PDF_CONTENT_HEIGHT = PDF_PAGE_HEIGHT - PDF_MARGINS[1] - PDF_MARGINS[3];
      const PDF_EXPORT_TIMEOUT = 90000;
      const PDF_FONT_NAME = 'ChineseLocalFont';
      let pdfFontFile = '';
      let pdfExportWarnings = [];
      let currentFileName = '';
      let currentView = 'preview';
      let lastRenderId = 0;
      let renderTimer = 0;
      let previewSyncTimer = 0;
      let toastTimer = 0;
      let savedRange = null;
      let contextTarget = null;
      let editingImageBlock = null;
      let editingFlowchartNode = null;
      let editingFormulaNode = null;
      let editingExtensionNode = null;
      let editingExtensionType = '';
      let outlineItems = [];
      let tableSelection = { table: null, anchorCell: null };
      let tableToolbarState = { table: null, x: 0, y: 0 };
      let tableHoverState = { table: null, cell: null, rowIndex: -1, columnIndex: -1 };
      let tableResizeState = null;
      let currentMarkdownDirectory = '';
      let localImageAssets = new Map();
      let localImageBasenames = new Map();
      const fileRelativePaths = new WeakMap();
      let isRendering = false;
      let hostNotifyTimer = 0;
      const editorView = ViewClasses.DocumentEditorView ? new ViewClasses.DocumentEditorView({
        sourceInput: input,
        previewRoot: preview,
        getMarkdown: () => input.value,
        getNumberedMarkdown: () => addHeadingNumberingToMarkdown(input.value),
        async getMarkdownForSave() {
          await flushPreviewEdits();
          return addHeadingNumberingToMarkdown(input.value);
        },
        getNumberingMode: () => numberingModeSelect.value,
        setMarkdown: loadMarkdown,
        setTabs(tabs, activeTabId) {
          setHostTabs({ tabs, activeTabId });
        },
        setView,
        renderMarkdown
      }) : null;
      const outlineView = ViewClasses.DocumentOutlineView ? new ViewClasses.DocumentOutlineView({
        root: outlineList,
        stats: outlineStats,
        onSelect: jumpToHeading
      }) : null;
      if (editorView && documentData) editorView.connect(documentData);

      applyHostConfig();

      if (!window.markdownit) {
        preview.innerHTML = `<div class="empty-state"><div><i data-lucide="file-warning"></i><div>Markdown 渲染库未加载</div></div></div>`;
        statusText.textContent = '依赖未加载';
        messageText.textContent = '请检查网络或 CDN 访问';
        if (window.lucide) {
          window.lucide.createIcons({
            attrs: {
              width: 18,
              height: 18,
              'stroke-width': 2
            }
          });
        }
        return;
      }

      const md = window.markdownit({
        html: true,
        linkify: true,
        typographer: true,
        breaks: false,
        highlight(code, language) {
          const lang = language && language.trim();
          if (lang && window.hljs && window.hljs.getLanguage(lang)) {
            try {
              return `<pre><code class="hljs language-${escapeHtml(lang)}">${window.hljs.highlight(code, { language: lang, ignoreIllegals: true }).value}</code></pre>`;
            } catch (error) {
              return `<pre><code class="hljs">${escapeHtml(code)}</code></pre>`;
            }
          }
          if (window.hljs) {
            try {
              return `<pre><code class="hljs">${window.hljs.highlightAuto(code).value}</code></pre>`;
            } catch (error) {
              return `<pre><code class="hljs">${escapeHtml(code)}</code></pre>`;
            }
          }
          return `<pre><code class="hljs">${escapeHtml(code)}</code></pre>`;
        }
      });

      installMathRules(md);
      installTaskListRules(md);

      const defaultImageRenderer = md.renderer.rules.image || ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options));
      md.renderer.rules.image = (tokens, idx, options, env, self) => {
        const token = tokens[idx];
        const source = token.attrGet('src') || '';
        const resolved = resolveLocalImageSource(source);
        if (resolved && resolved !== source) {
          token.attrSet('data-md-src', source);
          token.attrSet('src', resolved);
        }
        return defaultImageRenderer(tokens, idx, options, env, self);
      };

      const defaultFence = md.renderer.rules.fence;
      md.renderer.rules.fence = (tokens, idx, options, env, self) => {
        const token = tokens[idx];
        const info = token.info ? token.info.trim().split(/\s+/)[0].toLowerCase() : '';
        if (['mermaid', 'flowchart', 'sequence'].includes(info)) {
          const fence = `\`\`\`mermaid\n${token.content.trim()}\n\`\`\``;
          return `<div class="mermaid" data-md="${escapeHtml(fence)}" contenteditable="false">${escapeHtml(token.content)}</div>`;
        }
        if (['echarts', 'chart'].includes(info)) {
          const source = token.content.trim();
          const fence = `\`\`\`echarts\n${source}\n\`\`\``;
          return `<div class="echarts-chart" data-md="${escapeHtml(fence)}" data-option="${escapeHtml(source)}" contenteditable="false">${escapeHtml(source)}</div>`;
        }
        if (['abc', 'staff', 'music', 'score'].includes(info)) {
          const source = token.content.trim();
          const fence = `\`\`\`abc\n${source}\n\`\`\``;
          return `<div class="music-score" data-md="${escapeHtml(fence)}" data-abc="${escapeHtml(source)}" contenteditable="false">${escapeHtml(source)}</div>`;
        }
        return defaultFence(tokens, idx, options, env, self);
      };

      md.renderer.rules.checkbox_open = () => '<input type="checkbox" disabled ';

      const turndownService = createTurndownService();
      if (!turndownService) {
        setMessage('Turndown 未加载，预览编辑无法回写源码', true);
      }

      if (window.mermaid) {
        window.mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'loose',
          theme: getTheme() === 'dark' ? 'dark' : 'default',
          flowchart: {
            useMaxWidth: true,
            htmlLabels: true
          }
        });
      }

      hydrateTheme();
      hydrateLayout();
      createIcons();
      bindEvents();
      bindHostBridge();
      renderMarkdown();
      handleLayoutExportRequest();

      function ensureHostTabs(anchor) {
        if (!anchor || !anchor.parentNode) return null;
        let tabs = getElement('hostTabs');
        if (!tabs) {
          tabs = document.createElement('div');
          tabs.id = 'hostTabs';
          tabs.className = 'host-tabs';
          tabs.hidden = true;
          anchor.parentNode.insertBefore(tabs, anchor);
        }
        return tabs;
      }

      function applyHostConfig() {
        const host = String(markComConfig.host || 'markeasy').replace(/[^a-z0-9_-]/gi, '').toLowerCase() || 'markeasy';
        app.classList.add(`markcom-host-${host}`);
        app.classList.toggle('markcom-embedded', Boolean(markComConfig.embedded));
      }

      function bindHostBridge() {
        window.addEventListener('message', async (event) => {
          const message = event.data || {};
          if (!message || typeof message !== 'object') return;

          if (message.type === 'markcom:setMarkdown') {
            loadMarkdown(message.markdown || '', message.meta || {});
            return;
          }

          if (message.type === 'markcom:setView') {
            await setView(message.view);
            return;
          }

          if (message.type === 'markcom:setTabs') {
            setHostTabs(message);
            return;
          }

          if (message.type === 'markcom:command') {
            runHostCommand(message.command, message);
            return;
          }

          if (message.type === 'markcom:getState') {
            postHostMessage('markcom:state', getMarkComState());
          }
        });
      }

      function runHostCommand(command, payload = {}) {
        if (command === 'exportHtml') return exportHtml();
        if (command === 'exportPdf') return exportPdf();
        if (command === 'exportMarkdown') return exportMarkdown();
        if (command === 'toggleOutline') return toggleOutline();
        if (command === 'toggleTheme') return toggleTheme();
        if (command === 'setNumberingMode') return setNumberingMode(payload.mode);
        return null;
      }

      function bindEvents() {
        openFile.addEventListener('click', () => fileInput.click());
        openFolder.addEventListener('click', () => folderInput.click());
        fileInput.addEventListener('change', async () => {
          await loadMarkdownFileSet(Array.from(fileInput.files || []));
          fileInput.value = '';
        });
        folderInput.addEventListener('change', async () => {
          await loadMarkdownFileSet(Array.from(folderInput.files || []));
          folderInput.value = '';
        });

        input.addEventListener('input', () => {
          currentFileName = currentFileName || sampleName;
          fileName.textContent = currentFileName;
          fileDetail.textContent = '正在编辑';
          syncDocumentData(input.value, { source: 'source' });
          scheduleRender();
        });

        exportHtmlButton.addEventListener('click', exportHtml);
        exportPdfButton.addEventListener('click', exportPdf);
        exportMdButton.addEventListener('click', exportMarkdown);
        outlineToggle.addEventListener('click', toggleOutline);
        outlineResizer.addEventListener('pointerdown', startOutlineResize);
        if (hostTabs) {
          hostTabs.addEventListener('click', handleHostTabsClick);
          hostTabs.addEventListener('dblclick', handleHostTabsDoubleClick);
        }
        numberingModeSelect.addEventListener('change', () => {
          localStorage.setItem('markdown-viewer-numbering-mode', numberingModeSelect.value);
          updateOutlineFromPreview();
        });
        themeToggle.addEventListener('click', toggleTheme);

        viewButtons.forEach((button) => {
          button.addEventListener('click', () => setView(button.dataset.view));
        });

        outlineList.addEventListener('click', (event) => {
          const button = event.target.closest('[data-outline-id]');
          if (button) {
            jumpToHeading(button.dataset.outlineId);
          }
        });

        preview.addEventListener('input', () => {
          if (isRendering || currentView !== 'preview') return;
          preview.removeAttribute('data-empty');
          schedulePreviewSync();
        });

        preview.addEventListener('contextmenu', (event) => {
          if (currentView !== 'preview' || event.target.closest('.code-copy')) return;
          event.preventDefault();
          contextTarget = event.target;
          const tableCell = getTableCellFromNode(contextTarget);
          if (tableCell) {
            prepareTableContext(tableCell);
            closeContextMenu();
            hideTableEdgeControls();
            openTableToolbar(event.clientX, event.clientY);
          } else {
            clearTableSelection();
            closeTableToolbar();
            hideTableEdgeControls();
            openContextMenu(event.clientX, event.clientY);
          }
          saveSelection();
        });

        document.addEventListener('click', (event) => {
          if (!contextMenu.contains(event.target)) {
            closeContextMenu();
          }
          if (!tableToolbar.contains(event.target) && !event.target.closest('.table-edge-add') && !getTableCellFromNode(event.target)) {
            closeTableToolbar();
          }
        });

        document.addEventListener('keydown', (event) => {
          if (event.key === 'Escape') {
            closeContextMenu();
            closeTableToolbar();
            hideTableEdgeControls();
            hideTableResizeHandles();
            closeFormulaDialog();
            closeTableDialog();
            closeImageDialog();
            closeFlowchartDialog();
            closeExtensionDialog();
            closeEmojiDialog();
          }
        });

        contextMenu.addEventListener('click', (event) => {
          const button = event.target.closest('[data-command]');
          if (!button) return;
          event.preventDefault();
          runContextCommand(button.dataset.command);
        });

        tableToolbar.addEventListener('click', (event) => {
          const button = event.target.closest('[data-table-tool]');
          if (!button) return;
          event.preventDefault();
          runTableTool(button.dataset.tableTool);
        });
        tableAddRow.addEventListener('click', () => addTableRowFromEdge());
        tableAddColumn.addEventListener('click', () => addTableColumnFromEdge());
        tableColumnResize.addEventListener('pointerdown', (event) => startTableResize(event, 'column'));
        tableRowResize.addEventListener('pointerdown', (event) => startTableResize(event, 'row'));
        preview.addEventListener('pointermove', updateTableFloatingControls);
        preview.addEventListener('pointerleave', (event) => {
          const next = event.relatedTarget;
          if (next && next.closest && next.closest('.table-edge-add, .table-resize-handle, .table-toolbar')) return;
          hideTableEdgeControls();
          hideTableResizeHandles();
        });
        previewScroll.addEventListener('scroll', () => {
          hideTableEdgeControls();
          hideTableResizeHandles();
          closeTableToolbar();
        });
        window.addEventListener('resize', () => {
          hideTableEdgeControls();
          hideTableResizeHandles();
          closeTableToolbar();
          if (window.echarts) {
            preview.querySelectorAll('.echarts-chart').forEach((node) => {
              const chart = window.echarts.getInstanceByDom(node);
              if (chart) chart.resize();
            });
          }
        });

        formulaClose.addEventListener('click', closeFormulaDialog);
        formulaCancel.addEventListener('click', closeFormulaDialog);
        formulaConfirm.addEventListener('click', confirmFormula);
        formulaTemplate.addEventListener('change', applyFormulaTemplate);
        tableClose.addEventListener('click', closeTableDialog);
        tableCancel.addEventListener('click', closeTableDialog);
        tableConfirm.addEventListener('click', confirmTable);
        imageClose.addEventListener('click', closeImageDialog);
        imageCancel.addEventListener('click', closeImageDialog);
        imageConfirm.addEventListener('click', confirmImage);
        imageFileButton.addEventListener('click', () => imageFile.click());
        imageFile.addEventListener('change', loadLocalImage);
        flowchartClose.addEventListener('click', closeFlowchartDialog);
        flowchartCancel.addEventListener('click', closeFlowchartDialog);
        flowchartConfirm.addEventListener('click', confirmFlowchart);
        flowchartTemplate.addEventListener('change', applyFlowchartTemplate);
        extensionClose.addEventListener('click', closeExtensionDialog);
        extensionCancel.addEventListener('click', closeExtensionDialog);
        extensionConfirm.addEventListener('click', confirmExtensionEdit);
        emojiClose.addEventListener('click', closeEmojiDialog);
        emojiCancel.addEventListener('click', closeEmojiDialog);
        emojiConfirm.addEventListener('click', confirmEmoji);
        emojiGrid.addEventListener('click', (event) => {
          const button = event.target.closest('[data-emoji]');
          if (!button) return;
          emojiInput.value = button.dataset.emoji || '';
          confirmEmoji();
        });

        document.addEventListener('dragover', (event) => {
          event.preventDefault();
          app.classList.add('dragging');
        });

        document.addEventListener('dragleave', (event) => {
          if (!event.relatedTarget || event.relatedTarget === document.documentElement) {
            app.classList.remove('dragging');
          }
        });

        document.addEventListener('drop', async (event) => {
          event.preventDefault();
          app.classList.remove('dragging');
          const files = await collectDroppedFiles(event.dataTransfer);
          await loadMarkdownFileSet(files);
        });

        preview.addEventListener('click', async (event) => {
          if (handleTableCellClick(event)) {
            return;
          }

          const editButton = event.target.closest('.node-edit-button');
          if (editButton) {
            event.preventDefault();
            event.stopPropagation();
            contextTarget = editButton.closest('.image-block, .mermaid, .echarts-chart, .music-score, .contains-task-list, .math-node');
            if (editButton.dataset.edit === 'image') {
              openImageDialog();
            } else if (editButton.dataset.edit === 'flowchart') {
              openFlowchartDialog();
            } else if (editButton.dataset.edit === 'formula') {
              openFormulaDialog();
            } else if (['echarts', 'music-score', 'task-list'].includes(editButton.dataset.edit)) {
              openExtensionDialog(editButton.dataset.edit);
            }
            return;
          }

          const button = event.target.closest('.code-copy');
          if (!button) return;
          const code = button.parentElement.querySelector('code');
          if (!code) return;
          await copyText(code.textContent);
          button.textContent = '已复制';
          setTimeout(() => {
            button.textContent = '复制';
          }, 1200);
        });

        preview.addEventListener('change', (event) => {
          const checkbox = event.target.closest('.task-list-item-checkbox');
          if (!checkbox || !preview.contains(checkbox)) return;
          updateTaskListItemState(checkbox.closest('.task-list-item'));
          syncPreviewToSource(false);
        });
      }

      function schedulePreviewSync() {
        window.clearTimeout(previewSyncTimer);
        previewSyncTimer = window.setTimeout(() => syncPreviewToSource(false), 260);
      }

      async function flushPreviewEdits() {
        window.clearTimeout(previewSyncTimer);
        if (currentView === 'preview' && !isRendering) {
          syncPreviewToSource(false);
        }
      }

      function syncPreviewToSource(rerender) {
        if (!turndownService) {
          setMessage('预览编辑同步需要 Turndown 依赖，请检查 CDN 访问', true);
          return;
        }
        const markdown = htmlToMarkdown(preview);
        input.value = markdown;
        currentFileName = currentFileName || sampleName;
        fileName.textContent = currentFileName;
        fileDetail.textContent = '正在编辑';
        syncDocumentData(markdown, { source: 'preview' });
        updatedText.textContent = '已同步';
        updateSourceStats(input.value);
        updateOutlineFromPreview();
        updateRenderStats();
        statusText.textContent = '就绪';
        if (rerender) {
          scheduleRender(0);
        }
      }

      function htmlToMarkdown(root) {
        const clone = root.cloneNode(true);
        const preserved = [];
        const preserveNode = (node, markdown) => {
          const placeholder = `MDVIEWERPRESERVE${preserved.length}END`;
          preserved.push({ placeholder, markdown });
          node.replaceWith(document.createTextNode(placeholder));
        };
        clone.querySelectorAll('.code-copy, .node-edit-button, .empty-state').forEach((node) => node.remove());
        clone.querySelectorAll('[contenteditable]').forEach((node) => node.removeAttribute('contenteditable'));
        clone.querySelectorAll('.math-node').forEach((node) => {
          if (!node.dataset.md && node.dataset.tex) {
            node.dataset.md = node.classList.contains('math-block') ? `$$\n${node.dataset.tex}\n$$` : `$${node.dataset.tex}$`;
          }
          preserveNode(node, node.classList.contains('math-block') ? `\n\n${node.dataset.md}\n\n` : node.dataset.md);
        });
        clone.querySelectorAll('.mermaid[data-md]').forEach((node) => {
          preserveNode(node, `\n\n${node.dataset.md}\n\n`);
        });
        clone.querySelectorAll('.echarts-chart[data-md], .music-score[data-md]').forEach((node) => {
          preserveNode(node, `\n\n${node.dataset.md}\n\n`);
        });
        clone.querySelectorAll('.image-block').forEach((node) => {
          preserveNode(node, `\n\n${cleanHtmlBlock(node)}\n\n`);
        });
        clone.querySelectorAll('table').forEach((node) => {
          const markdownTable = tableToMarkdown(node);
          preserveNode(node, markdownTable ? `\n\n${markdownTable}\n\n` : `\n\n${cleanHtmlBlock(node)}\n\n`);
        });
        let markdown = turndownService.turndown(clone);
        preserved.forEach((item) => {
          markdown = markdown.split(item.placeholder).join(item.markdown);
        });
        markdown = markdown.replace(/\n{3,}/g, '\n\n').trim();
        return markdown ? `${markdown}\n` : '';
      }

      function tableToMarkdown(table) {
        const rows = Array.from(table.rows || []);
        if (!rows.length) return '';

        const cells = Array.from(table.querySelectorAll('th,td'));
        if (!cells.length) return '';
        if (cells.some((cell) => cell.colSpan > 1 || cell.rowSpan > 1)) {
          return '';
        }

        const columnCount = Math.max(...rows.map((row) => row.cells.length));
        if (!columnCount) return '';

        const firstRow = rows[0];
        const headerRow = table.tHead && table.tHead.rows.length
          ? table.tHead.rows[0]
          : (Array.from(firstRow.cells).some((cell) => cell.tagName.toLowerCase() === 'th') ? firstRow : null);
        if (!headerRow) return '';

        const headerCells = normalizeMarkdownTableRow(headerRow, columnCount);
        const separators = Array.from({ length: columnCount }, (_, index) => {
          const cell = headerRow.cells[index];
          return getMarkdownTableSeparator(cell);
        });
        const bodyRows = rows.filter((row) => row !== headerRow).map((row) => normalizeMarkdownTableRow(row, columnCount));
        const lines = [
          formatMarkdownTableRow(headerCells),
          formatMarkdownTableRow(separators),
          ...bodyRows.map(formatMarkdownTableRow)
        ];

        return lines.join('\n');
      }

      function normalizeMarkdownTableRow(row, columnCount) {
        const cells = Array.from(row.cells || []).map(markdownTableCellContent);
        while (cells.length < columnCount) {
          cells.push('');
        }
        return cells.slice(0, columnCount);
      }

      function markdownTableCellContent(cell) {
        if (!cell) return '';
        const wrapper = document.createElement('div');
        wrapper.innerHTML = cell.innerHTML;
        wrapper.querySelectorAll('[contenteditable], [data-outline-id], [data-outline-number]').forEach((item) => {
          item.removeAttribute('contenteditable');
          item.removeAttribute('data-outline-id');
          item.removeAttribute('data-outline-number');
        });
        wrapper.querySelectorAll('.code-copy, .node-edit-button').forEach((item) => item.remove());
        let markdown = turndownService.turndown(wrapper).trim();
        markdown = markdown
          .replace(/\r/g, '')
          .replace(/\n{2,}/g, '<br>')
          .replace(/\n/g, '<br>')
          .replace(/\s+/g, ' ')
          .trim();
        return escapeMarkdownTablePipes(markdown);
      }

      function escapeMarkdownTablePipes(text) {
        let escaped = '';
        for (let index = 0; index < text.length; index += 1) {
          const char = text[index];
          const previous = index > 0 ? text[index - 1] : '';
          escaped += char === '|' && previous !== '\\' ? '\\|' : char;
        }
        return escaped;
      }

      function cleanMarkdownInline(text) {
        return String(text || '').replace(/\\/g, '\\\\').replace(/]/g, '\\]').replace(/\n+/g, ' ').trim();
      }

      function getMarkdownTableSeparator(cell) {
        const align = String((cell && (cell.getAttribute('align') || cell.style.textAlign)) || '').toLowerCase();
        if (align === 'center') return ':---:';
        if (align === 'right' || align === 'end') return '---:';
        if (align === 'left' || align === 'start') return ':---';
        return '---';
      }

      function formatMarkdownTableRow(cells) {
        return `| ${cells.join(' | ')} |`;
      }

      function cleanHtmlBlock(node) {
        const clone = node.cloneNode(true);
        clone.querySelectorAll('[contenteditable], [data-outline-id], [data-outline-number]').forEach((item) => {
          item.removeAttribute('contenteditable');
          item.removeAttribute('data-outline-id');
          item.removeAttribute('data-outline-number');
        });
        clone.querySelectorAll('.code-copy, .node-edit-button').forEach((item) => item.remove());
        clone.querySelectorAll('img[data-md-src]').forEach((image) => {
          image.setAttribute('src', image.getAttribute('data-md-src'));
          image.removeAttribute('data-md-src');
        });
        cleanTableEditingState(clone);
        return clone.outerHTML;
      }

      function cleanTableEditingState(root) {
        root.querySelectorAll('.table-cell-selected, .table-cell-active').forEach((cell) => {
          cell.classList.remove('table-cell-selected', 'table-cell-active');
          if (!cell.getAttribute('class')) {
            cell.removeAttribute('class');
          }
        });
      }

      function capturePreviewScroll() {
        return {
          top: previewScroll ? previewScroll.scrollTop : 0,
          left: previewScroll ? previewScroll.scrollLeft : 0
        };
      }

      function restorePreviewScroll(state) {
        if (!previewScroll || !state) return;
        requestAnimationFrame(() => {
          previewScroll.scrollTop = state.top;
          previewScroll.scrollLeft = state.left;
        });
      }

      function openContextMenu(x, y) {
        contextMenu.classList.add('show');
        contextMenu.style.left = `${x}px`;
        contextMenu.style.top = `${y}px`;
        const rect = contextMenu.getBoundingClientRect();
        const left = Math.min(x, window.innerWidth - rect.width - 10);
        const top = Math.min(y, window.innerHeight - rect.height - 10);
        contextMenu.style.left = `${Math.max(10, left)}px`;
        contextMenu.style.top = `${Math.max(10, top)}px`;
        createIcons();
      }

      function closeContextMenu() {
        contextMenu.classList.remove('show');
      }

      async function handleLayoutExportRequest() {
        const params = new URLSearchParams(window.location.search);
        if (!params.has('layoutExport')) return;
        document.documentElement.dataset.layoutExport = 'loading';
        window.__MARKDOWN_LAYOUT_EXPORT_READY__ = false;

        try {
          const payload = await readLayoutExportPayload(params);
          if (payload && typeof payload.content === 'string') {
            const normalized = normalizeLoadedMarkdown(payload.content);
            currentFileName = payload.name || sampleName;
            input.value = normalized.content;
            fileName.textContent = currentFileName;
            fileDetail.textContent = 'PDF 布局导出';
            sizeText.textContent = formatBytes(new Blob([normalized.content]).size);
            updatedText.textContent = normalized.changed ? '已接管编号' : '已加载';
          }

          await renderMarkdown();
          await waitForPreviewAssets();
          await waitForLayoutStability();
          document.documentElement.dataset.layoutExport = 'ready';
          window.__MARKDOWN_LAYOUT_EXPORT_READY__ = true;
          setMessage('PDF 布局导出就绪');
        } catch (error) {
          document.documentElement.dataset.layoutExport = 'error';
          window.__MARKDOWN_LAYOUT_EXPORT_ERROR__ = error.message || String(error);
          setMessage(`PDF 布局导出准备失败：${window.__MARKDOWN_LAYOUT_EXPORT_ERROR__}`, true);
        }
      }

      async function readLayoutExportPayload(params) {
        const sourceScript = params.get('sourceScript');
        if (sourceScript) {
          await loadLayoutExportScript(sourceScript);
          return window.__MARKDOWN_EXPORT_SOURCE__ || null;
        }

        const sourceUrl = params.get('md');
        if (sourceUrl) {
          const response = await fetch(sourceUrl, { cache: 'no-store' });
          const content = await response.text();
          return {
            name: decodeURIComponent(sourceUrl.split(/[\\/]/).pop() || sampleName),
            content
          };
        }

        const encoded = params.get('md64');
        if (encoded) {
          return {
            name: params.get('name') || sampleName,
            content: decodeBase64Utf8(encoded)
          };
        }

        return null;
      }

      function loadLayoutExportScript(src) {
        return new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = src;
          script.onload = resolve;
          script.onerror = () => reject(new Error(`无法加载导出数据脚本：${src}`));
          document.head.appendChild(script);
        });
      }

      function decodeBase64Utf8(value) {
        const binary = atob(value);
        const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
        return new TextDecoder().decode(bytes);
      }

      function waitForLayoutStability() {
        return new Promise((resolve) => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              window.setTimeout(resolve, 250);
            });
          });
        });
      }

      function hydrateLayout() {
        const width = localStorage.getItem('markdown-viewer-outline-width') || '30%';
        document.documentElement.style.setProperty('--outline-width', width);
        const collapsed = localStorage.getItem('markdown-viewer-outline-collapsed') === 'true';
        app.classList.toggle('outline-collapsed', collapsed);
        const mode = localStorage.getItem('markdown-viewer-numbering-mode') || 'mode1';
        numberingModeSelect.value = ['mode1', 'mode2', 'mode3', 'none'].includes(mode) ? mode : 'mode1';
      }

      function setNumberingMode(mode) {
        if (!['mode1', 'mode2', 'mode3', 'none'].includes(mode)) return;
        numberingModeSelect.value = mode;
        localStorage.setItem('markdown-viewer-numbering-mode', mode);
        updateOutlineFromPreview();
        notifyHostChange({ source: 'numbering', numberingMode: mode });
      }

      function toggleOutline() {
        const collapsed = !app.classList.contains('outline-collapsed');
        app.classList.toggle('outline-collapsed', collapsed);
        localStorage.setItem('markdown-viewer-outline-collapsed', String(collapsed));
      }

      function setHostTabs(payload = {}) {
        if (!hostTabs) return;
        const tabs = Array.isArray(payload.tabs) ? payload.tabs : [];
        const activeTabId = String(payload.activeTabId || '');
        app.classList.toggle('has-host-tabs', tabs.length > 0);
        hostTabs.hidden = !tabs.length;
        if (!tabs.length) {
          hostTabs.innerHTML = '';
          return;
        }
        hostTabs.innerHTML = tabs.map((tab) => {
          const id = String(tab.id || '');
          const active = id && id === activeTabId ? ' active' : '';
          const dirty = tab.dirty ? ' dirty' : '';
          const previewTab = tab.pinned ? '' : ' preview-tab';
          const title = tab.name || '未命名';
          return `
            <div class="host-tab${active}${dirty}${previewTab}" data-tab-id="${escapeHtml(id)}" title="${escapeHtml(title)}">
              <button type="button" class="host-tab-main" data-tab-select="${escapeHtml(id)}">
              <i data-lucide="${tab.pinned ? 'pin' : 'circle'}"></i>
              <span>${escapeHtml(title)}</span>
              ${tab.dirty ? '<span class="tab-dot" aria-hidden="true"></span>' : ''}
              </button>
              <button type="button" class="host-tab-close" data-tab-close="${escapeHtml(id)}" title="关闭页签"><i data-lucide="x"></i></button>
            </div>`;
        }).join('');
        createIcons();
      }

      function handleHostTabsClick(event) {
        const closeButton = event.target.closest('[data-tab-close]');
        if (closeButton) {
          event.preventDefault();
          event.stopPropagation();
          postHostMessage('markcom:tabClose', { tabId: closeButton.dataset.tabClose || '' });
          return;
        }
        const tabButton = event.target.closest('[data-tab-select]');
        if (tabButton) {
          postHostMessage('markcom:tabSelect', { tabId: tabButton.dataset.tabSelect || '' });
        }
      }

      function handleHostTabsDoubleClick(event) {
        if (event.target.closest('[data-tab-close]')) return;
        const tab = event.target.closest('[data-tab-id]');
        if (!tab) return;
        event.preventDefault();
        postHostMessage('markcom:tabPin', { tabId: tab.dataset.tabId || '' });
      }

      function startOutlineResize(event) {
        if (app.classList.contains('outline-collapsed')) return;
        event.preventDefault();
        outlineResizer.setPointerCapture(event.pointerId);
        app.classList.add('outline-resizing');
        const onMove = (moveEvent) => {
          const workspace = getElement('workspace');
          if (!workspace) return;
          const rect = workspace.getBoundingClientRect();
          const min = 220;
          const max = Math.max(min, rect.width * 0.58);
          const outlineOnRight = app.classList.contains('markcom-embedded') && app.classList.contains('markcom-host-noteeasy');
          const rawWidth = outlineOnRight ? rect.right - moveEvent.clientX : moveEvent.clientX - rect.left;
          const width = Math.min(max, Math.max(min, rawWidth));
          document.documentElement.style.setProperty('--outline-width', `${width}px`);
        };
        const onUp = () => {
          app.classList.remove('outline-resizing');
          localStorage.setItem('markdown-viewer-outline-width', getComputedStyle(document.documentElement).getPropertyValue('--outline-width').trim());
          window.removeEventListener('pointermove', onMove);
          window.removeEventListener('pointerup', onUp);
        };
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp, { once: true });
      }

      function runContextCommand(command) {
        closeContextMenu();
        if (command.startsWith('table-')) {
          runTableCommand(command);
          return;
        }
        if (command === 'formula') {
          openFormulaDialog();
          return;
        }
        if (command === 'table') {
          openTableDialog();
          return;
        }
        if (command === 'flowchart') {
          openFlowchartDialog();
          return;
        }
        if (command === 'image') {
          openImageDialog();
          return;
        }
        if (command === 'emoji') {
          openEmojiDialog();
          return;
        }
        restoreSelection();

        if (command === 'h1' || command === 'h2' || command === 'h3' || command === 'h4') {
          document.execCommand('formatBlock', false, command);
          syncPreviewToSource(true);
          return;
        }
        if (command === 'paragraph') {
          document.execCommand('formatBlock', false, 'p');
          syncPreviewToSource(true);
          return;
        }
        if (command === 'bold') {
          document.execCommand('bold', false);
          syncPreviewToSource(true);
          return;
        }
        if (command === 'italic') {
          document.execCommand('italic', false);
          syncPreviewToSource(true);
          return;
        }
        if (command === 'underline') {
          document.execCommand('underline', false);
          syncPreviewToSource(true);
          return;
        }
        if (command === 'highlight') {
          wrapSelection('mark', '高亮文本');
          syncPreviewToSource(true);
          return;
        }
        if (command === 'link') {
          insertLink();
          syncPreviewToSource(true);
          return;
        }
        if (command === 'task-list') {
          insertTaskList();
          syncPreviewToSource(true);
          return;
        }
        if (command === 'echarts') {
          const node = insertEchartsBlock();
          syncPreviewToSource(false);
          renderEcharts(null, node).then(() => addInlineEditButtons(node));
          return;
        }
        if (command === 'music-score') {
          const node = insertMusicScore();
          syncPreviewToSource(false);
          renderMusicScores(null, node).then(() => addInlineEditButtons(node));
          return;
        }
        if (command === 'code') {
          insertCodeBlock();
          syncPreviewToSource(true);
          return;
        }
        if (command === 'paragraph-before' || command === 'paragraph-after') {
          insertAdjacentParagraph(command === 'paragraph-before');
          syncPreviewToSource(false);
        }
      }

      function openFormulaDialog() {
        restoreSelection();
        editingFormulaNode = findContextFormula();
        getElement('formulaTitle').textContent = editingFormulaNode ? '编辑公式' : '插入公式';
        formulaTemplate.value = '';
        if (editingFormulaNode) {
          formulaInput.value = editingFormulaNode.dataset.md || '';
          formulaBlock.checked = editingFormulaNode.classList.contains('math-block');
        } else {
          const selected = getSelectedText();
          formulaInput.value = selected && selected.length < 300 ? selected : '';
          formulaBlock.checked = /^\s*(\$\$|\\\[)/.test(formulaInput.value);
        }
        formulaDialog.classList.add('show');
        formulaDialog.setAttribute('aria-hidden', 'false');
        setTimeout(() => formulaInput.focus(), 0);
      }

      function closeFormulaDialog() {
        formulaDialog.classList.remove('show');
        formulaDialog.setAttribute('aria-hidden', 'true');
        editingFormulaNode = null;
      }

      async function confirmFormula() {
        const raw = formulaInput.value.trim();
        if (!raw) {
          showToast('请输入公式');
          return;
        }
        const formula = normalizeFormula(raw, formulaBlock.checked);
        const scrollState = capturePreviewScroll();
        const target = editingFormulaNode;
        const mathNode = target && preview.contains(target) ? target : createMathNode(formula);
        let caretTarget = mathNode;
        closeFormulaDialog();
        if (target && preview.contains(target)) {
          updateFormulaNode(mathNode, formula);
        } else if (formula.block) {
          const paragraph = document.createElement('p');
          paragraph.innerHTML = '<br>';
          insertNodesAtSelection([mathNode, paragraph]);
          caretTarget = paragraph;
        } else {
          insertNodesAtSelection([mathNode]);
        }
        syncPreviewToSource(false);
        await renderMath(null, mathNode);
        addInlineEditButtons(mathNode);
        if (!target || !preview.contains(target)) {
          formula.block ? placeCaret(caretTarget) : setCaretAfter(mathNode);
        }
        restorePreviewScroll(scrollState);
      }

      function normalizeFormula(raw, forceBlock) {
        let text = raw.trim();
        let block = forceBlock || text.startsWith('$$') || text.startsWith('\\[');
        if (text.startsWith('$$') && text.endsWith('$$')) {
          text = text.slice(2, -2).trim();
          block = true;
        } else if (text.startsWith('$') && text.endsWith('$')) {
          text = text.slice(1, -1).trim();
        } else if (text.startsWith('\\[') && text.endsWith('\\]')) {
          text = text.slice(2, -2).trim();
          block = true;
        } else if (text.startsWith('\\(') && text.endsWith('\\)')) {
          text = text.slice(2, -2).trim();
        }
        return {
          tex: text,
          block,
          markdown: block ? `$$\n${text}\n$$` : `$${text}$`
        };
      }

      function createMathNode(formula) {
        const node = document.createElement(formula.block ? 'div' : 'span');
        node.className = formula.block ? 'math-node math-block' : 'math-node math-inline';
        node.dataset.md = formula.markdown;
        node.dataset.tex = formula.tex;
        node.setAttribute('contenteditable', 'false');
        node.setAttribute('aria-label', formula.markdown);
        return node;
      }

      function updateFormulaNode(node, formula) {
        node.className = formula.block ? 'math-node math-block' : 'math-node math-inline';
        node.dataset.md = formula.markdown;
        node.dataset.tex = formula.tex;
        node.setAttribute('contenteditable', 'false');
        node.setAttribute('aria-label', formula.markdown);
        node.innerHTML = '';
      }

      function findContextFormula() {
        let node = contextTarget;
        if (node && node.nodeType === Node.TEXT_NODE) node = node.parentElement;
        return node && preview.contains(node) ? node.closest('.math-node') : null;
      }

      function applyFormulaTemplate() {
        const templates = {
          pythagorean: { block: false, text: '$a^2+b^2=c^2$' },
          quadratic: { block: true, text: '$$x=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}$$' },
          integral: { block: true, text: '$$\\int_a^b f(x)\\,dx = F(b)-F(a)$$' },
          matrix: { block: true, text: '$$\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}$$' },
          limit: { block: true, text: '$$\\lim_{x\\to 0}\\frac{\\sin x}{x}=1$$' },
          sum: { block: true, text: '$$\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}$$' },
          bayes: { block: true, text: '$$P(A|B)=\\frac{P(B|A)P(A)}{P(B)}$$' }
        };
        const selected = templates[formulaTemplate.value];
        if (!selected) return;
        formulaInput.value = selected.text;
        formulaBlock.checked = selected.block;
        formulaInput.focus();
      }

      function openImageDialog() {
        restoreSelection();
        const image = findContextImage();
        editingImageBlock = image ? image.closest('.image-block') || image.parentElement : null;
        getElement('imageTitle').textContent = image ? '编辑图像' : '插入图像';
        imageUrl.value = image ? image.getAttribute('src') || '' : '';
        imageAlt.value = image ? image.getAttribute('alt') || '' : '';
        imageWidth.value = image ? parseImageWidth(image) : '70';
        imageAlign.value = editingImageBlock ? parseImageAlign(editingImageBlock) : 'center';
        imageFile.value = '';
        imageDialog.classList.add('show');
        imageDialog.setAttribute('aria-hidden', 'false');
        setTimeout(() => imageUrl.focus(), 0);
      }

      function closeImageDialog() {
        imageDialog.classList.remove('show');
        imageDialog.setAttribute('aria-hidden', 'true');
        editingImageBlock = null;
      }

      function loadLocalImage() {
        const [file] = imageFile.files || [];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          imageUrl.value = String(reader.result || '');
          if (!imageAlt.value.trim()) {
            imageAlt.value = file.name.replace(/\.[^.]+$/, '') || '图片';
          }
          showToast('本地图片已读取');
        };
        reader.onerror = () => showToast('本地图片读取失败');
        reader.readAsDataURL(file);
      }

      function confirmImage() {
        const url = imageUrl.value.trim();
        if (!url) {
          showToast('请输入图片地址');
          return;
        }
        const width = clampNumber(imageWidth.value || '70', 5, 100);
        const align = ['left', 'center', 'right'].includes(imageAlign.value) ? imageAlign.value : 'center';
        const alt = imageAlt.value.trim() || '图片';
        const html = buildImageHtml(url, alt, width, align);
        const target = editingImageBlock;
        closeImageDialog();
        if (target && preview.contains(target)) {
          target.outerHTML = html;
        } else {
          insertHtmlAtSelection(html);
        }
        addInlineEditButtons();
        syncPreviewToSource(false);
      }

      function findContextImage() {
        let node = contextTarget;
        if (node && node.nodeType === Node.TEXT_NODE) node = node.parentElement;
        if (!node || !preview.contains(node)) return null;
        const direct = node.closest('img');
        if (direct) return direct;
        const block = node.closest('.image-block');
        return block ? block.querySelector('img') : null;
      }

      function parseImageWidth(image) {
        const raw = image.style.width || image.getAttribute('width') || '70';
        const match = String(raw).match(/\d+/);
        return match ? match[0] : '70';
      }

      function parseImageAlign(block) {
        if (block.classList.contains('image-align-left')) return 'left';
        if (block.classList.contains('image-align-right')) return 'right';
        return 'center';
      }

      function buildImageHtml(url, alt, width, align) {
        return `<p class="image-block image-align-${escapeHtml(align)}"><img src="${escapeHtml(url)}" alt="${escapeHtml(alt)}" style="width:${width}%;max-width:100%;height:auto;"></p>`;
      }

      function openFlowchartDialog() {
        restoreSelection();
        editingFlowchartNode = findContextMermaid();
        getElement('flowchartTitle').textContent = editingFlowchartNode ? '编辑流程图' : '插入流程图';
        flowchartTemplate.value = '';
        if (editingFlowchartNode) {
          flowchartInput.value = extractMermaidSource(editingFlowchartNode);
        }
        flowchartDialog.classList.add('show');
        flowchartDialog.setAttribute('aria-hidden', 'false');
        setTimeout(() => flowchartInput.focus(), 0);
      }

      function closeFlowchartDialog() {
        flowchartDialog.classList.remove('show');
        flowchartDialog.setAttribute('aria-hidden', 'true');
        editingFlowchartNode = null;
      }

      async function confirmFlowchart() {
        const source = flowchartInput.value.trim();
        if (!source) {
          showToast('请输入 Mermaid 流程图源码');
          return;
        }
        const scrollState = capturePreviewScroll();
        const target = editingFlowchartNode;
        const node = target && preview.contains(target) ? target : createMermaidNode(source);
        const paragraph = document.createElement('p');
        paragraph.innerHTML = '<br>';
        closeFlowchartDialog();
        if (target && preview.contains(target)) {
          node.dataset.md = `\`\`\`mermaid\n${source}\n\`\`\``;
          node.className = 'mermaid';
          node.setAttribute('contenteditable', 'false');
          node.textContent = source;
        } else {
          insertNodesAtSelection([node, paragraph]);
        }
        syncPreviewToSource(false);
        await renderMermaid(null, node);
        addInlineEditButtons(node);
        if (!target || !preview.contains(target)) {
          placeCaret(paragraph);
        }
        restorePreviewScroll(scrollState);
      }

      function createMermaidNode(source) {
        const node = document.createElement('div');
        node.className = 'mermaid';
        node.dataset.md = `\`\`\`mermaid\n${source}\n\`\`\``;
        node.setAttribute('contenteditable', 'false');
        node.textContent = source;
        return node;
      }

      function findContextMermaid() {
        let node = contextTarget;
        if (node && node.nodeType === Node.TEXT_NODE) node = node.parentElement;
        return node && preview.contains(node) ? node.closest('.mermaid') : null;
      }

      function extractMermaidSource(node) {
        const markdown = node.dataset.md || '';
        const match = markdown.match(/^```mermaid\s*([\s\S]*?)\s*```$/);
        if (match) return match[1].trim();
        return node.textContent.trim() || flowchartInput.defaultValue.trim();
      }

      function applyFlowchartTemplate() {
        const templates = {
          flowchart: `flowchart TD
  A[开始] --> B{是否通过}
  B -- 是 --> C[完成]
  B -- 否 --> D[调整]
  D --> B`,
          sequence: `sequenceDiagram
  participant U as 用户
  participant A as 应用
  participant S as 服务
  U->>A: 提交请求
  A->>S: 调用接口
  S-->>A: 返回结果
  A-->>U: 展示结果`,
          state: `stateDiagram-v2
  [*] --> 草稿
  草稿 --> 审核中: 提交
  审核中 --> 已发布: 通过
  审核中 --> 草稿: 驳回
  已发布 --> [*]`,
          class: `classDiagram
  class MarkdownViewer {
    +render()
    +exportPdf()
  }
  class DocumentStore {
    +markdown
    +sync()
  }
  MarkdownViewer --> DocumentStore`,
          gantt: `gantt
  title 项目排期
  dateFormat  YYYY-MM-DD
  section 开发
  编辑器增强 :a1, 2026-05-13, 3d
  导出修复   :a2, after a1, 2d
  section 验证
  测试回归   :2026-05-18, 2d`,
          pie: `pie title 内容类型占比
  "正文" : 45
  "图表" : 25
  "公式" : 15
  "代码" : 15`,
          er: `erDiagram
  DOCUMENT ||--o{ HEADING : contains
  DOCUMENT ||--o{ ASSET : embeds
  HEADING {
    string title
    int level
  }
  ASSET {
    string type
    string source
  }`
        };
        const selected = templates[flowchartTemplate.value];
        if (!selected) return;
        flowchartInput.value = selected;
        flowchartInput.focus();
      }

      function openExtensionDialog(type) {
        restoreSelection();
        editingExtensionType = type;
        editingExtensionNode = findContextExtension(type);
        const config = getExtensionConfig(type);
        extensionTitle.textContent = editingExtensionNode ? `编辑${config.label}` : `插入${config.label}`;
        extensionHint.textContent = config.hint;
        extensionInput.value = getExtensionSource(type, editingExtensionNode) || config.sample;
        extensionDialog.classList.add('show');
        extensionDialog.setAttribute('aria-hidden', 'false');
        setTimeout(() => extensionInput.focus(), 0);
      }

      function closeExtensionDialog() {
        extensionDialog.classList.remove('show');
        extensionDialog.setAttribute('aria-hidden', 'true');
        editingExtensionNode = null;
        editingExtensionType = '';
      }

      async function confirmExtensionEdit() {
        const source = extensionInput.value.trim();
        if (!source) {
          showToast('请输入源码');
          return;
        }
        const type = editingExtensionType;
        const target = editingExtensionNode && preview.contains(editingExtensionNode) ? editingExtensionNode : null;
        closeExtensionDialog();

        if (type === 'task-list') {
          const list = markdownTaskListToNode(source);
          if (!list) {
            showToast('请输入任务列表 Markdown');
            return;
          }
          if (target) {
            target.replaceWith(list);
          } else {
            const paragraph = document.createElement('p');
            paragraph.innerHTML = '<br>';
            insertNodesAtSelection([list, paragraph]);
            placeCaret(paragraph);
          }
          updateTaskListState(list);
          syncPreviewToSource(false);
          addInlineEditButtons(list);
          return;
        }

        if (type === 'echarts') {
          const node = target || createEchartsNode(source);
          updateEchartsNode(node, source);
          if (!target) {
            const paragraph = document.createElement('p');
            paragraph.innerHTML = '<br>';
            insertNodesAtSelection([node, paragraph]);
            placeCaret(paragraph);
          }
          syncPreviewToSource(false);
          await renderEcharts(null, node);
          addInlineEditButtons(node);
          return;
        }

        if (type === 'music-score') {
          const node = target || createMusicScoreNode(source);
          updateMusicScoreNode(node, source);
          if (!target) {
            const paragraph = document.createElement('p');
            paragraph.innerHTML = '<br>';
            insertNodesAtSelection([node, paragraph]);
            placeCaret(paragraph);
          }
          syncPreviewToSource(false);
          await renderMusicScores(null, node);
          addInlineEditButtons(node);
        }
      }

      function getExtensionConfig(type) {
        const configs = {
          echarts: {
            label: 'ECharts 图表',
            hint: 'ECharts option JSON',
            sample: ECHARTS_SAMPLE
          },
          'music-score': {
            label: '五线谱',
            hint: 'ABC 记谱源码',
            sample: MUSIC_SCORE_SAMPLE
          },
          'task-list': {
            label: '任务列表',
            hint: '任务列表 Markdown',
            sample: '- [ ] 待办事项\n- [x] 已完成事项'
          }
        };
        return configs[type] || configs.echarts;
      }

      function findContextExtension(type) {
        let node = contextTarget;
        if (node && node.nodeType === Node.TEXT_NODE) node = node.parentElement;
        if (!node || !preview.contains(node)) return null;
        if (type === 'echarts') return node.closest('.echarts-chart');
        if (type === 'music-score') return node.closest('.music-score');
        if (type === 'task-list') return node.closest('.contains-task-list');
        return null;
      }

      function getExtensionSource(type, node) {
        if (!node) return '';
        if (type === 'echarts') return node.dataset.option || extractFencedBlockSource(node.dataset.md, 'echarts') || node.textContent.trim();
        if (type === 'music-score') return node.dataset.abc || extractFencedBlockSource(node.dataset.md, 'abc') || node.textContent.trim();
        if (type === 'task-list') return taskListToMarkdown(node);
        return '';
      }

      function markdownTaskListToNode(source) {
        const holder = document.createElement('div');
        holder.innerHTML = md.render(source);
        const list = holder.querySelector('ul.contains-task-list, ol.contains-task-list, ul, ol');
        if (!list || !list.querySelector('.task-list-item-checkbox')) return null;
        updateTaskListState(list);
        return list;
      }

      function taskListToMarkdown(list) {
        if (!list) return '';
        return Array.from(list.children)
          .filter((child) => child.tagName && child.tagName.toLowerCase() === 'li')
          .map((item) => {
            const checkbox = item.querySelector(':scope > .task-list-item-checkbox, :scope > input[type="checkbox"]');
            if (!checkbox) return '';
            const clone = item.cloneNode(true);
            clone.querySelectorAll('.task-list-item-checkbox, input[type="checkbox"], .node-edit-button, ul, ol').forEach((node) => node.remove());
            const text = cleanTaskListText(clone.textContent) || '任务';
            return `- [${checkbox.checked ? 'x' : ' '}] ${text}`;
          })
          .filter(Boolean)
          .join('\n');
      }

      function cleanTaskListText(text) {
        return String(text || '')
          .replace(/\s+/g, ' ')
          .trim()
          .replace(/^(?:\[[ xX]\]\s+)+/, '')
          .trim();
      }

      function updateTaskListState(root = preview) {
        const scope = root || preview;
        const lists = Array.from(scope.matches && scope.matches('.contains-task-list') ? [scope] : scope.querySelectorAll('.contains-task-list'));
        lists.forEach((list) => {
          list.querySelectorAll('.task-list-item').forEach(updateTaskListItemState);
        });
      }

      function updateTaskListItemState(item) {
        if (!item) return;
        const checkbox = item.querySelector('.task-list-item-checkbox');
        if (!checkbox) return;
        checkbox.disabled = false;
        checkbox.setAttribute('contenteditable', 'false');
        checkbox.classList.add('task-list-item-checkbox');
        checkbox.toggleAttribute('checked', checkbox.checked);
        item.classList.toggle('task-list-item-completed', checkbox.checked);
      }

      function openEmojiDialog() {
        restoreSelection();
        emojiInput.value = '😀';
        emojiDialog.classList.add('show');
        emojiDialog.setAttribute('aria-hidden', 'false');
        setTimeout(() => emojiInput.focus(), 0);
      }

      function closeEmojiDialog() {
        emojiDialog.classList.remove('show');
        emojiDialog.setAttribute('aria-hidden', 'true');
      }

      function confirmEmoji() {
        const emoji = emojiInput.value.trim();
        if (!emoji) {
          showToast('请输入 Emoji');
          return;
        }
        closeEmojiDialog();
        insertTextAtSelection(emoji);
        syncPreviewToSource(false);
      }

      function insertTaskList() {
        insertHtmlAtSelection([
          '<ul class="contains-task-list">',
          '<li class="task-list-item"><input class="task-list-item-checkbox" type="checkbox" contenteditable="false"> 待办事项</li>',
          '<li class="task-list-item task-list-item-completed"><input class="task-list-item-checkbox" type="checkbox" checked contenteditable="false"> 已完成事项</li>',
          '</ul>'
        ].join(''));
        updateTaskListState(preview);
        addInlineEditButtons(preview);
      }

      function insertEchartsBlock() {
        const node = createEchartsNode(ECHARTS_SAMPLE);
        const paragraph = document.createElement('p');
        paragraph.innerHTML = '<br>';
        insertNodesAtSelection([node, paragraph]);
        placeCaret(paragraph);
        return node;
      }

      function createEchartsNode(source) {
        const node = document.createElement('div');
        node.setAttribute('contenteditable', 'false');
        updateEchartsNode(node, source);
        return node;
      }

      function updateEchartsNode(node, source) {
        node.className = 'echarts-chart';
        node.dataset.md = `\`\`\`echarts\n${source}\n\`\`\``;
        node.dataset.option = source;
        node.setAttribute('contenteditable', 'false');
        node.textContent = source;
      }

      function insertMusicScore() {
        const node = createMusicScoreNode(MUSIC_SCORE_SAMPLE);
        const paragraph = document.createElement('p');
        paragraph.innerHTML = '<br>';
        insertNodesAtSelection([node, paragraph]);
        placeCaret(paragraph);
        return node;
      }

      function createMusicScoreNode(source) {
        const node = document.createElement('div');
        node.setAttribute('contenteditable', 'false');
        updateMusicScoreNode(node, source);
        return node;
      }

      function updateMusicScoreNode(node, source) {
        node.className = 'music-score';
        node.dataset.md = `\`\`\`abc\n${source}\n\`\`\``;
        node.dataset.abc = source;
        node.setAttribute('contenteditable', 'false');
        node.textContent = source;
      }

      function openTableDialog() {
        restoreSelection();
        tableRows.value = tableRows.value || '3';
        tableCols.value = tableCols.value || '3';
        tableDialog.classList.add('show');
        tableDialog.setAttribute('aria-hidden', 'false');
        setTimeout(() => tableRows.focus(), 0);
      }

      function closeTableDialog() {
        tableDialog.classList.remove('show');
        tableDialog.setAttribute('aria-hidden', 'true');
      }

      function confirmTable() {
        const rows = clampNumber(tableRows.value, 1, 50);
        const cols = clampNumber(tableCols.value, 1, 20);
        if (!rows || !cols) {
          showToast('请输入有效的行数和列数');
          return;
        }
        closeTableDialog();
        insertHtmlAtSelection(buildTableHtml(rows, cols));
        syncPreviewToSource(false);
      }

      function buildTableHtml(rows, cols) {
        const headers = Array.from({ length: cols }, (_, col) => `<th>列 ${col + 1}</th>`).join('');
        const bodyRows = Array.from({ length: Math.max(0, rows - 1) }, (_, row) => {
          const cells = Array.from({ length: cols }, (_, col) => `<td>单元格 ${row + 1}-${col + 1}</td>`).join('');
          return `<tr>${cells}</tr>`;
        }).join('');
        return `<table><thead><tr>${headers}</tr></thead><tbody>${bodyRows}</tbody></table><p><br></p>`;
      }

      function handleTableCellClick(event) {
        const cell = getTableCellFromNode(event.target);
        if (!cell) {
          clearTableSelection();
          return false;
        }
        if (event.shiftKey && tableSelection.anchorCell && tableSelection.anchorCell.closest('table') === cell.closest('table')) {
          event.preventDefault();
          selectTableCellRange(tableSelection.anchorCell, cell);
          updateTableToolbar();
          return true;
        }
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          toggleTableCellSelection(cell);
          updateTableToolbar();
          return true;
        }
        setActiveTableCell(cell, false);
        updateTableToolbar();
        return false;
      }

      function prepareTableContext(cell) {
        const table = cell.closest('table');
        const selectedCells = Array.from(table.querySelectorAll('.table-cell-selected'));
        const nativeCells = getNativeSelectedTableCells(table);
        if (selectedCells.length && selectedCells.includes(cell)) {
          setActiveTableCell(cell, true);
          return;
        }
        if (nativeCells.length > 1) {
          markTableCells(table, nativeCells, cell);
          return;
        }
        setActiveTableCell(cell, false);
      }

      function runTableCommand(command) {
        if (command === 'table-select-row') {
          selectTableAxis('row');
          return;
        }
        if (command === 'table-select-column') {
          selectTableAxis('column');
          return;
        }
        if (command === 'table-merge') {
          mergeSelectedTableCells();
          return;
        }
        if (command === 'table-split') {
          splitSelectedTableCells();
          return;
        }
        if (command === 'table-row-before' || command === 'table-row-after') {
          insertTableRow(command === 'table-row-before' ? 'before' : 'after');
          return;
        }
        if (command === 'table-row-delete') {
          deleteSelectedTableRows();
          return;
        }
        if (command === 'table-col-before' || command === 'table-col-after') {
          insertTableColumn(command === 'table-col-before' ? 'before' : 'after');
          return;
        }
        if (command === 'table-col-delete') {
          deleteSelectedTableColumns();
          return;
        }
        if (command === 'table-equal-columns') {
          equalizeTableColumns();
          return;
        }
        if (command === 'table-equal-rows') {
          equalizeTableRows();
        }
      }

      function runTableTool(tool) {
        const commandMap = {
          'select-row': 'table-select-row',
          'select-column': 'table-select-column',
          merge: 'table-merge',
          split: 'table-split',
          'delete-row': 'table-row-delete',
          'delete-column': 'table-col-delete',
          'equal-columns': 'table-equal-columns',
          'equal-rows': 'table-equal-rows'
        };
        const command = commandMap[tool];
        if (!command) return;
        runTableCommand(command);
        updateTableToolbar();
        if (tableToolbar.classList.contains('show')) {
          positionTableToolbar(tableToolbarState.x, tableToolbarState.y);
        }
      }

      function openTableToolbar(x, y) {
        tableToolbarState = {
          table: tableSelection.table,
          x,
          y
        };
        tableToolbar.classList.add('show');
        updateTableToolbar();
        positionTableToolbar(x, y);
        createIcons();
      }

      function closeTableToolbar() {
        tableToolbar.classList.remove('show');
        tableToolbarState = { table: null, x: 0, y: 0 };
      }

      function positionTableToolbar(x, y) {
        tableToolbar.style.left = `${x}px`;
        tableToolbar.style.top = `${y}px`;
        const rect = tableToolbar.getBoundingClientRect();
        const left = Math.min(x, window.innerWidth - rect.width - 10);
        const top = Math.min(y, window.innerHeight - rect.height - 10);
        tableToolbar.style.left = `${Math.max(10, left)}px`;
        tableToolbar.style.top = `${Math.max(10, top)}px`;
      }

      function updateTableToolbar() {
        if (!tableToolbar.classList.contains('show')) return;
        const context = getCurrentTableContext(false);
        if (!context) {
          closeTableToolbar();
          return;
        }
        tableToolbarState.table = context.table;
        setTableToolVisibility('merge', canMergeTableSelection(context));
        setTableToolVisibility('split', hasSplittableTableCell(context));
        setTableToolVisibility('delete-row', isFullTableRowsSelected(context));
        setTableToolVisibility('delete-column', isFullTableColumnsSelected(context));
        setTableToolVisibility('equal-columns', context.model.columnCount > 1);
        setTableToolVisibility('equal-rows', context.model.rows.length > 1);
        createIcons();
      }

      function setTableToolVisibility(tool, visible) {
        const button = tableToolbar.querySelector(`[data-table-tool="${tool}"]`);
        if (button) {
          button.hidden = !visible;
        }
      }

      function canMergeTableSelection(context) {
        return context.cells.length > 1;
      }

      function hasSplittableTableCell(context) {
        return context.cells.some((cell) => {
          const meta = context.model.cellMeta.get(cell);
          return meta && (meta.rowSpan > 1 || meta.colSpan > 1);
        });
      }

      function isFullTableRowsSelected(context) {
        const rect = getTableSelectionRect(context);
        return Boolean(rect && rect.minCol === 0 && rect.maxCol >= context.model.columnCount - 1);
      }

      function isFullTableColumnsSelected(context) {
        const rect = getTableSelectionRect(context);
        return Boolean(rect && rect.minRow === 0 && rect.maxRow >= context.model.rows.length - 1);
      }

      function updateTableFloatingControls(event) {
        if (currentView !== 'preview' || tableResizeState || event.buttons) return;
        if (event.target.closest('.table-toolbar, .table-edge-add, .table-resize-handle')) return;
        const cell = getTableCellFromNode(event.target);
        if (!cell) {
          hideTableEdgeControls();
          hideTableResizeHandles();
          return;
        }
        const table = cell.closest('table');
        const model = buildTableGrid(table);
        const meta = model.cellMeta.get(cell);
        if (!meta) {
          hideTableEdgeControls();
          hideTableResizeHandles();
          return;
        }

        const cellRect = cell.getBoundingClientRect();
        const tableRect = table.getBoundingClientRect();
        const edgeDistance = 10;
        const nearBottom = Math.abs(event.clientY - cellRect.bottom) <= edgeDistance;
        const nearRight = Math.abs(event.clientX - cellRect.right) <= edgeDistance;
        tableHoverState = {
          table,
          cell,
          rowIndex: meta.rowEnd,
          columnIndex: meta.colEnd
        };

        if (nearBottom) {
          showTableEdgeButton(tableAddRow, tableRect.left + 8, cellRect.bottom - 14);
          showTableResizeHandle(tableRowResize, tableRect.left, cellRect.bottom - 3, tableRect.width, 6);
        } else {
          tableAddRow.classList.remove('show');
          tableRowResize.classList.remove('show');
        }

        if (nearRight) {
          showTableEdgeButton(tableAddColumn, cellRect.right - 14, tableRect.top + 8);
          showTableResizeHandle(tableColumnResize, cellRect.right - 3, tableRect.top, 6, tableRect.height);
        } else {
          tableAddColumn.classList.remove('show');
          tableColumnResize.classList.remove('show');
        }
      }

      function showTableEdgeButton(button, left, top) {
        button.style.left = `${clamp(left, 10, window.innerWidth - 38)}px`;
        button.style.top = `${clamp(top, 10, window.innerHeight - 38)}px`;
        button.classList.add('show');
        createIcons();
      }

      function hideTableEdgeControls() {
        tableAddRow.classList.remove('show');
        tableAddColumn.classList.remove('show');
      }

      function showTableResizeHandle(handle, left, top, width, height) {
        handle.style.left = `${clamp(left, 0, window.innerWidth - width)}px`;
        handle.style.top = `${clamp(top, 0, window.innerHeight - height)}px`;
        handle.style.width = `${width}px`;
        handle.style.height = `${height}px`;
        handle.classList.add('show');
      }

      function hideTableResizeHandles() {
        tableColumnResize.classList.remove('show');
        tableRowResize.classList.remove('show');
      }

      function addTableRowFromEdge() {
        if (!tableHoverState.cell || !preview.contains(tableHoverState.cell)) return;
        contextTarget = tableHoverState.cell;
        markTableCells(tableHoverState.table, [tableHoverState.cell], tableHoverState.cell);
        insertTableRow('after');
        hideTableEdgeControls();
        hideTableResizeHandles();
      }

      function addTableColumnFromEdge() {
        if (!tableHoverState.cell || !preview.contains(tableHoverState.cell)) return;
        contextTarget = tableHoverState.cell;
        markTableCells(tableHoverState.table, [tableHoverState.cell], tableHoverState.cell);
        insertTableColumn('after');
        hideTableEdgeControls();
        hideTableResizeHandles();
      }

      function startTableResize(event, type) {
        if (!tableHoverState.table || !preview.contains(tableHoverState.table)) return;
        event.preventDefault();
        event.stopPropagation();
        const model = buildTableGrid(tableHoverState.table);
        const index = type === 'column' ? tableHoverState.columnIndex : tableHoverState.rowIndex;
        if (index < 0) return;
        tableResizeState = {
          type,
          table: tableHoverState.table,
          index,
          startX: event.clientX,
          startY: event.clientY,
          widths: getTableColumnWidths(tableHoverState.table, model),
          heights: getTableRowHeights(model)
        };
        document.body.classList.add('table-resizing');
        document.body.style.cursor = type === 'column' ? 'col-resize' : 'row-resize';
        window.addEventListener('pointermove', updateTableResize);
        window.addEventListener('pointerup', finishTableResize, { once: true });
      }

      function updateTableResize(event) {
        if (!tableResizeState) return;
        if (tableResizeState.type === 'column') {
          const widths = tableResizeState.widths.slice();
          const minWidth = 48;
          const index = tableResizeState.index;
          const nextIndex = index + 1 < widths.length ? index + 1 : -1;
          let delta = event.clientX - tableResizeState.startX;
          const minDelta = minWidth - widths[index];
          const maxDelta = nextIndex > -1 ? widths[nextIndex] - minWidth : Number.POSITIVE_INFINITY;
          delta = clamp(delta, minDelta, maxDelta);
          widths[index] = Math.max(minWidth, widths[index] + delta);
          if (nextIndex > -1) {
            widths[nextIndex] = Math.max(minWidth, widths[nextIndex] - delta);
          }
          applyTableColumnWidths(tableResizeState.table, widths);
          return;
        }

        const heights = tableResizeState.heights.slice();
        const minHeight = 30;
        const index = tableResizeState.index;
        const delta = event.clientY - tableResizeState.startY;
        heights[index] = Math.max(minHeight, heights[index] + delta);
        applyTableRowHeights(tableResizeState.table, heights);
      }

      function finishTableResize() {
        window.removeEventListener('pointermove', updateTableResize);
        document.body.classList.remove('table-resizing');
        document.body.style.cursor = '';
        if (tableResizeState) {
          syncPreviewToSource(false);
        }
        tableResizeState = null;
        hideTableResizeHandles();
        updateTableToolbar();
      }

      function getTableColumnWidths(table, model = buildTableGrid(table)) {
        const tableWidth = Math.max(1, table.getBoundingClientRect().width || model.columnCount * 120);
        const widths = Array(model.columnCount).fill(tableWidth / model.columnCount);
        getUniqueTableMetas(model).forEach((meta) => {
          const rect = meta.cell.getBoundingClientRect();
          if (meta.colSpan === 1 && rect.width) {
            widths[meta.colStart] = rect.width;
          }
        });
        return widths.map((width) => Math.max(48, width));
      }

      function applyTableColumnWidths(table, widths) {
        const model = buildTableGrid(table);
        const totalWidth = widths.reduce((total, width) => total + width, 0);
        table.style.tableLayout = 'fixed';
        table.style.width = `${Math.max(totalWidth, 1)}px`;
        table.style.maxWidth = 'none';
        getUniqueTableMetas(model).forEach((meta) => {
          const width = widths.slice(meta.colStart, meta.colEnd + 1).reduce((total, item) => total + item, 0);
          meta.cell.style.width = `${Math.max(48, width)}px`;
        });
      }

      function getTableRowHeights(model) {
        return model.rows.map((row) => Math.max(30, row.getBoundingClientRect().height || 34));
      }

      function applyTableRowHeights(table, heights) {
        Array.from(table.rows).forEach((row, index) => {
          const height = Math.max(30, heights[index] || 30);
          row.style.height = `${height}px`;
          Array.from(row.cells).forEach((cell) => {
            cell.style.height = `${height}px`;
          });
        });
      }

      function equalizeTableColumns() {
        const context = getCurrentTableContext();
        if (!context) return;
        const width = Math.max(48, (context.table.getBoundingClientRect().width || context.model.columnCount * 120) / context.model.columnCount);
        applyTableColumnWidths(context.table, Array(context.model.columnCount).fill(width));
        syncPreviewToSource(false);
        showToast('列宽已等分');
      }

      function equalizeTableRows() {
        const context = getCurrentTableContext();
        if (!context) return;
        const height = Math.max(30, (context.table.getBoundingClientRect().height || context.model.rows.length * 34) / context.model.rows.length);
        applyTableRowHeights(context.table, Array(context.model.rows.length).fill(height));
        syncPreviewToSource(false);
        showToast('行高已等分');
      }

      function getTableCellFromNode(node) {
        if (!node) return null;
        const element = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
        const cell = element && element.closest ? element.closest('td,th') : null;
        return cell && preview.contains(cell) ? cell : null;
      }

      function getTableCellFromSelection() {
        const selection = window.getSelection();
        if (!selection || !selection.rangeCount) return null;
        return getTableCellFromNode(selection.focusNode) || getTableCellFromNode(selection.anchorNode);
      }

      function getNativeSelectedTableCells(table = null) {
        const selection = window.getSelection();
        if (!selection || !selection.rangeCount || selection.isCollapsed) return [];
        const range = selection.getRangeAt(0);
        const scope = table || preview;
        const cells = Array.from(scope.querySelectorAll('td,th')).filter((cell) => {
          try {
            return range.intersectsNode(cell);
          } catch (error) {
            return false;
          }
        });
        if (table) {
          return cells.filter((cell) => cell.closest('table') === table);
        }
        const tables = new Set(cells.map((cell) => cell.closest('table')));
        return tables.size === 1 ? cells : [];
      }

      function toggleTableCellSelection(cell) {
        const table = cell.closest('table');
        if (tableSelection.table !== table) {
          clearTableSelection();
        }
        cell.classList.remove('table-cell-active');
        const nextSelected = !cell.classList.contains('table-cell-selected');
        cell.classList.toggle('table-cell-selected', nextSelected);
        table.querySelectorAll('.table-cell-active').forEach((item) => item.classList.remove('table-cell-active'));
        cell.classList.add('table-cell-active');
        tableSelection = { table, anchorCell: cell };
      }

      function selectTableCellRange(startCell, endCell) {
        const table = startCell.closest('table');
        const model = buildTableGrid(table);
        const rect = getTableRectForCells(model, [startCell, endCell]);
        if (!rect) return;
        const normalized = normalizeTableRectToSpans(model, rect);
        markTableCells(table, getCellsInTableRect(model, normalized), endCell, startCell);
      }

      function setActiveTableCell(cell, keepSelected) {
        const table = cell.closest('table');
        if (!keepSelected || tableSelection.table !== table) {
          clearTableSelection();
        }
        table.querySelectorAll('.table-cell-active').forEach((item) => item.classList.remove('table-cell-active'));
        cell.classList.add('table-cell-active');
        tableSelection = { table, anchorCell: cell };
      }

      function markTableCells(table, cells, activeCell = null, anchorCell = null) {
        clearTableSelection();
        const uniqueCells = uniqueElements(cells).filter((cell) => cell && cell.closest('table') === table);
        uniqueCells.forEach((cell) => cell.classList.add('table-cell-selected'));
        const active = activeCell && table.contains(activeCell) ? activeCell : uniqueCells[0];
        if (active) {
          active.classList.add('table-cell-active');
        }
        tableSelection = { table, anchorCell: anchorCell || active || null };
      }

      function clearTableSelection(scope = preview) {
        if (scope && scope.querySelectorAll) {
          scope.querySelectorAll('.table-cell-selected, .table-cell-active').forEach((cell) => {
            cell.classList.remove('table-cell-selected', 'table-cell-active');
          });
        }
        if (scope === preview || !scope || scope === tableSelection.table || (scope.contains && tableSelection.table && scope.contains(tableSelection.table))) {
          tableSelection = { table: null, anchorCell: null };
        }
      }

      function getCurrentTableContext(showErrors = true) {
        const contextCell = getTableCellFromNode(contextTarget) || getTableCellFromSelection();
        const table = contextCell ? contextCell.closest('table') : tableSelection.table;
        if (!table || !preview.contains(table)) {
          if (showErrors) showToast('请先在表格单元格中操作');
          return null;
        }
        const model = buildTableGrid(table);
        let cells = Array.from(table.querySelectorAll('.table-cell-selected'));
        const nativeCells = getNativeSelectedTableCells(table);
        if (nativeCells.length > 1) {
          cells = nativeCells;
        }
        if (!cells.length && contextCell && contextCell.closest('table') === table) {
          cells = [contextCell];
        }
        if (!cells.length && tableSelection.anchorCell && table.contains(tableSelection.anchorCell)) {
          cells = [tableSelection.anchorCell];
        }
        cells = uniqueElements(cells).filter((cell) => model.cellMeta.has(cell));
        if (!cells.length) {
          if (showErrors) showToast('请先选中表格单元格');
          return null;
        }
        return {
          table,
          model,
          cells,
          cell: contextCell && model.cellMeta.has(contextCell) ? contextCell : cells[0]
        };
      }

      function buildTableGrid(table) {
        const rows = Array.from(table.rows);
        const grid = [];
        const cellMeta = new Map();
        rows.forEach((row, rowIndex) => {
          grid[rowIndex] = grid[rowIndex] || [];
          let columnIndex = 0;
          Array.from(row.cells).forEach((cell, cellIndex) => {
            while (grid[rowIndex][columnIndex]) {
              columnIndex += 1;
            }
            const rawRowSpan = Number.parseInt(cell.getAttribute('rowspan') || cell.rowSpan || '1', 10);
            const rawColSpan = Number.parseInt(cell.getAttribute('colspan') || cell.colSpan || '1', 10);
            const rowSpan = rawRowSpan === 0 ? Math.max(1, rows.length - rowIndex) : Math.max(1, rawRowSpan || 1);
            const colSpan = Math.max(1, rawColSpan || 1);
            const meta = {
              cell,
              row,
              rowIndex,
              cellIndex,
              rowStart: rowIndex,
              rowEnd: rowIndex + rowSpan - 1,
              colStart: columnIndex,
              colEnd: columnIndex + colSpan - 1,
              rowSpan,
              colSpan
            };
            cellMeta.set(cell, meta);
            for (let r = meta.rowStart; r <= meta.rowEnd; r += 1) {
              grid[r] = grid[r] || [];
              for (let c = meta.colStart; c <= meta.colEnd; c += 1) {
                grid[r][c] = meta;
              }
            }
            columnIndex += colSpan;
          });
        });
        const columnCount = Math.max(1, ...grid.map((row) => row ? row.length : 0));
        return { table, rows, grid, cellMeta, columnCount };
      }

      function getTableRectForCells(model, cells) {
        const metas = uniqueElements(cells).map((cell) => model.cellMeta.get(cell)).filter(Boolean);
        if (!metas.length) return null;
        return {
          minRow: Math.min(...metas.map((meta) => meta.rowStart)),
          maxRow: Math.max(...metas.map((meta) => meta.rowEnd)),
          minCol: Math.min(...metas.map((meta) => meta.colStart)),
          maxCol: Math.max(...metas.map((meta) => meta.colEnd))
        };
      }

      function normalizeTableRectToSpans(model, rect) {
        const normalized = { ...rect };
        let changed = true;
        while (changed) {
          changed = false;
          for (let row = normalized.minRow; row <= normalized.maxRow; row += 1) {
            for (let col = normalized.minCol; col <= normalized.maxCol; col += 1) {
              const meta = model.grid[row] && model.grid[row][col];
              if (!meta) continue;
              if (meta.rowStart < normalized.minRow) {
                normalized.minRow = meta.rowStart;
                changed = true;
              }
              if (meta.rowEnd > normalized.maxRow) {
                normalized.maxRow = meta.rowEnd;
                changed = true;
              }
              if (meta.colStart < normalized.minCol) {
                normalized.minCol = meta.colStart;
                changed = true;
              }
              if (meta.colEnd > normalized.maxCol) {
                normalized.maxCol = meta.colEnd;
                changed = true;
              }
            }
          }
        }
        return normalized;
      }

      function getCellsInTableRect(model, rect) {
        const cells = [];
        const seen = new Set();
        for (let row = rect.minRow; row <= rect.maxRow; row += 1) {
          for (let col = rect.minCol; col <= rect.maxCol; col += 1) {
            const meta = model.grid[row] && model.grid[row][col];
            if (!meta || seen.has(meta.cell)) continue;
            seen.add(meta.cell);
            cells.push(meta.cell);
          }
        }
        return sortTableCells(model, cells);
      }

      function getTableSelectionRect(context) {
        const rect = getTableRectForCells(context.model, context.cells);
        return rect ? normalizeTableRectToSpans(context.model, rect) : null;
      }

      function selectTableAxis(axis) {
        const context = getCurrentTableContext();
        if (!context) return;
        const rect = getTableSelectionRect(context);
        if (!rect) return;
        if (axis === 'row') {
          rect.minCol = 0;
          rect.maxCol = context.model.columnCount - 1;
        } else {
          rect.minRow = 0;
          rect.maxRow = Math.max(0, context.model.rows.length - 1);
        }
        const normalized = normalizeTableRectToSpans(context.model, rect);
        markTableCells(context.table, getCellsInTableRect(context.model, normalized), context.cell);
        showToast(axis === 'row' ? '已选中当前行' : '已选中当前列');
      }

      function mergeSelectedTableCells() {
        const context = getCurrentTableContext();
        if (!context) return;
        let rect = getTableSelectionRect(context);
        if (!rect) return;
        rect = normalizeTableRectToSpans(context.model, rect);
        const rowSpan = rect.maxRow - rect.minRow + 1;
        const colSpan = rect.maxCol - rect.minCol + 1;
        if (rowSpan === 1 && colSpan === 1) {
          showToast('请选择至少两个单元格进行合并');
          return;
        }
        const targetMeta = context.model.grid[rect.minRow] && context.model.grid[rect.minRow][rect.minCol];
        const target = targetMeta && targetMeta.cell;
        if (!target) {
          showToast('无法识别合并区域');
          return;
        }
        const cells = getCellsInTableRect(context.model, rect);
        const mergedHtml = cells.map((cell) => normalizeCellHtmlForMerge(cell)).filter(Boolean).join('<br>');
        target.innerHTML = mergedHtml || '<br>';
        setCellSpan(target, rowSpan, colSpan);
        cells.forEach((cell) => {
          if (cell !== target) {
            cell.remove();
          }
        });
        setActiveTableCell(target, false);
        syncPreviewToSource(false);
        showToast('单元格已合并');
      }

      function splitSelectedTableCells() {
        const context = getCurrentTableContext();
        if (!context) return;
        let changed = false;
        let focusCell = context.cell;
        const targets = context.cells.length > 1 ? context.cells : [context.cell];
        uniqueElements(targets).forEach((cell) => {
          if (!context.table.contains(cell)) return;
          const model = buildTableGrid(context.table);
          const meta = model.cellMeta.get(cell);
          if (!meta || (meta.rowSpan === 1 && meta.colSpan === 1)) return;
          splitTableCell(cell, meta, model);
          focusCell = cell;
          changed = true;
        });
        if (!changed) {
          showToast('当前单元格没有可拆分的合并区域');
          return;
        }
        setActiveTableCell(focusCell, false);
        syncPreviewToSource(false);
        showToast('单元格已拆分');
      }

      function splitTableCell(cell, meta, model) {
        const rowSpan = meta.rowSpan;
        const colSpan = meta.colSpan;
        setCellSpan(cell, 1, 1);
        for (let rowIndex = meta.rowStart; rowIndex <= meta.rowEnd; rowIndex += 1) {
          const row = model.rows[rowIndex];
          if (!row) continue;
          const firstCol = rowIndex === meta.rowStart ? meta.colStart + 1 : meta.colStart;
          for (let col = firstCol; col <= meta.colEnd; col += 1) {
            const newCell = document.createElement(getTableCellTag(row));
            newCell.innerHTML = '<br>';
            insertCellAtLogicalColumn(row, newCell, col, model);
          }
        }
        if (rowSpan > 1 || colSpan > 1) {
          cell.innerHTML = cell.innerHTML || '<br>';
        }
      }

      function insertTableRow(position) {
        const context = getCurrentTableContext();
        if (!context) return;
        const rect = getTableSelectionRect(context);
        if (!rect) return;
        const insertIndex = position === 'before' ? rect.minRow : rect.maxRow + 1;
        const previousHeights = getTableRowHeights(context.model);
        const newRow = document.createElement('tr');
        const referenceRow = context.model.rows[insertIndex] || null;
        const parent = referenceRow
          ? referenceRow.parentNode
          : (context.model.rows[context.model.rows.length - 1] && context.model.rows[context.model.rows.length - 1].parentNode) || context.table.tBodies[0] || context.table;
        const occupiedColumns = new Set();
        getUniqueTableMetas(context.model).forEach((meta) => {
          if (meta.rowStart < insertIndex && meta.rowEnd >= insertIndex) {
            setCellSpan(meta.cell, meta.rowSpan + 1, meta.colSpan);
            for (let col = meta.colStart; col <= meta.colEnd; col += 1) {
              occupiedColumns.add(col);
            }
          }
        });
        for (let col = 0; col < context.model.columnCount; col += 1) {
          if (occupiedColumns.has(col)) continue;
          const cell = document.createElement(getTableSectionCellTag(parent));
          cell.innerHTML = '<br>';
          newRow.appendChild(cell);
        }
        if (referenceRow) {
          parent.insertBefore(newRow, referenceRow);
        } else {
          parent.appendChild(newRow);
        }
        const nextHeights = previousHeights.slice();
        const inheritedHeight = previousHeights[Math.min(insertIndex, previousHeights.length - 1)] || 34;
        nextHeights.splice(Math.min(insertIndex, nextHeights.length), 0, inheritedHeight);
        applyTableRowHeights(context.table, nextHeights);
        const focusCell = newRow.cells[0] || selectNearestTableCell(context.table, insertIndex, 0);
        if (focusCell) {
          setActiveTableCell(focusCell, false);
        }
        syncPreviewToSource(false);
        showToast(position === 'before' ? '已在上方添加行' : '已在下方添加行');
      }

      function deleteSelectedTableRows() {
        const context = getCurrentTableContext();
        if (!context) return;
        const rect = getTableSelectionRect(context);
        if (!rect) return;
        const previousHeights = getTableRowHeights(context.model);
        if (rect.maxRow - rect.minRow + 1 >= context.model.rows.length) {
          context.table.remove();
          clearTableSelection();
          syncPreviewToSource(false);
          showToast('表格已删除');
          return;
        }
        getUniqueTableMetas(context.model).forEach((meta) => {
          if (meta.rowStart < rect.minRow && meta.rowEnd >= rect.minRow) {
            const overlap = Math.min(meta.rowEnd, rect.maxRow) - rect.minRow + 1;
            setCellSpan(meta.cell, Math.max(1, meta.rowSpan - overlap), meta.colSpan);
          }
        });
        for (let row = rect.maxRow; row >= rect.minRow; row -= 1) {
          if (context.model.rows[row]) {
            context.model.rows[row].remove();
          }
        }
        const nextHeights = previousHeights.slice();
        nextHeights.splice(rect.minRow, rect.maxRow - rect.minRow + 1);
        applyTableRowHeights(context.table, nextHeights);
        const focusCell = selectNearestTableCell(context.table, Math.min(rect.minRow, context.table.rows.length - 1), rect.minCol);
        if (focusCell) {
          setActiveTableCell(focusCell, false);
        }
        syncPreviewToSource(false);
        showToast('已删除选中行');
      }

      function insertTableColumn(position) {
        const context = getCurrentTableContext();
        if (!context) return;
        const rect = getTableSelectionRect(context);
        if (!rect) return;
        const insertIndex = position === 'before' ? rect.minCol : rect.maxCol + 1;
        const previousWidths = getTableColumnWidths(context.table, context.model);
        const occupiedRows = new Set();
        getUniqueTableMetas(context.model).forEach((meta) => {
          if (meta.colStart < insertIndex && meta.colEnd >= insertIndex) {
            setCellSpan(meta.cell, meta.rowSpan, meta.colSpan + 1);
            for (let row = meta.rowStart; row <= meta.rowEnd; row += 1) {
              occupiedRows.add(row);
            }
          }
        });
        context.model.rows.forEach((row, rowIndex) => {
          if (occupiedRows.has(rowIndex)) return;
          const cell = document.createElement(getTableCellTag(row));
          cell.innerHTML = '<br>';
          insertCellAtLogicalColumn(row, cell, insertIndex, context.model);
        });
        let nextWidths = previousWidths.slice();
        const inheritedWidth = previousWidths[Math.min(insertIndex, previousWidths.length - 1)] || 96;
        nextWidths.splice(Math.min(insertIndex, nextWidths.length), 0, inheritedWidth);
        const previousTotalWidth = previousWidths.reduce((total, width) => total + width, 0);
        const nextTotalWidth = nextWidths.reduce((total, width) => total + width, 0);
        if (previousTotalWidth && nextTotalWidth) {
          nextWidths = nextWidths.map((width) => Math.max(48, width * (previousTotalWidth / nextTotalWidth)));
        }
        applyTableColumnWidths(context.table, nextWidths);
        const focusCell = selectNearestTableCell(context.table, rect.minRow, insertIndex);
        if (focusCell) {
          setActiveTableCell(focusCell, false);
        }
        syncPreviewToSource(false);
        showToast(position === 'before' ? '已在左侧添加列' : '已在右侧添加列');
      }

      function deleteSelectedTableColumns() {
        const context = getCurrentTableContext();
        if (!context) return;
        const rect = getTableSelectionRect(context);
        if (!rect) return;
        const previousWidths = getTableColumnWidths(context.table, context.model);
        const removeCount = rect.maxCol - rect.minCol + 1;
        if (removeCount >= context.model.columnCount) {
          context.table.remove();
          clearTableSelection();
          syncPreviewToSource(false);
          showToast('表格已删除');
          return;
        }
        getUniqueTableMetas(context.model).forEach((meta) => {
          const overlap = Math.max(0, Math.min(meta.colEnd, rect.maxCol) - Math.max(meta.colStart, rect.minCol) + 1);
          if (!overlap) return;
          if (overlap >= meta.colSpan) {
            meta.cell.remove();
            return;
          }
          setCellSpan(meta.cell, meta.rowSpan, meta.colSpan - overlap);
        });
        const nextWidths = previousWidths.slice();
        nextWidths.splice(rect.minCol, removeCount);
        if (nextWidths.length) {
          applyTableColumnWidths(context.table, nextWidths);
        }
        const focusCell = selectNearestTableCell(context.table, rect.minRow, Math.min(rect.minCol, context.model.columnCount - removeCount - 1));
        if (focusCell) {
          setActiveTableCell(focusCell, false);
        }
        syncPreviewToSource(false);
        showToast('已删除选中列');
      }

      function insertCellAtLogicalColumn(row, cell, column, model) {
        const before = Array.from(row.cells).find((existing) => {
          const meta = model.cellMeta.get(existing);
          return meta && meta.colStart >= column;
        });
        if (before) {
          row.insertBefore(cell, before);
        } else {
          row.appendChild(cell);
        }
      }

      function selectNearestTableCell(table, preferredRow = 0, preferredCol = 0) {
        if (!table || !table.rows.length) return null;
        const model = buildTableGrid(table);
        const row = clamp(preferredRow, 0, Math.max(0, model.grid.length - 1));
        const col = clamp(preferredCol, 0, Math.max(0, model.columnCount - 1));
        const direct = model.grid[row] && model.grid[row][col] && model.grid[row][col].cell;
        return direct || table.querySelector('td,th');
      }

      function getUniqueTableMetas(model) {
        const metas = [];
        const seen = new Set();
        model.cellMeta.forEach((meta, cell) => {
          if (seen.has(cell)) return;
          seen.add(cell);
          metas.push(meta);
        });
        return metas;
      }

      function sortTableCells(model, cells) {
        return uniqueElements(cells).sort((a, b) => {
          const metaA = model.cellMeta.get(a);
          const metaB = model.cellMeta.get(b);
          if (!metaA || !metaB) return 0;
          return metaA.rowStart - metaB.rowStart || metaA.colStart - metaB.colStart;
        });
      }

      function uniqueElements(items) {
        return Array.from(new Set(items.filter(Boolean)));
      }

      function setCellSpan(cell, rowSpan, colSpan) {
        if (rowSpan > 1) {
          cell.setAttribute('rowspan', String(rowSpan));
        } else {
          cell.removeAttribute('rowspan');
        }
        if (colSpan > 1) {
          cell.setAttribute('colspan', String(colSpan));
        } else {
          cell.removeAttribute('colspan');
        }
      }

      function getTableCellTag(row) {
        return row && row.parentElement && row.parentElement.tagName.toLowerCase() === 'thead' ? 'th' : 'td';
      }

      function getTableSectionCellTag(section) {
        return section && section.tagName && section.tagName.toLowerCase() === 'thead' ? 'th' : 'td';
      }

      function normalizeCellHtmlForMerge(cell) {
        const html = cell.innerHTML.trim();
        return html === '<br>' ? '' : html;
      }

      function clampNumber(value, min, max) {
        const number = Number.parseInt(value, 10);
        if (Number.isNaN(number)) return 0;
        return Math.min(max, Math.max(min, number));
      }

      function insertLink() {
        const selected = getSelectedText();
        const url = window.prompt('链接地址', 'https://');
        if (!url) return;
        if (selected) {
          document.execCommand('createLink', false, url);
          return;
        }
        const text = window.prompt('链接文字', url) || url;
        insertHtmlAtSelection(`<a href="${escapeHtml(url)}">${escapeHtml(text)}</a>`);
      }

      function insertImage() {
        const url = window.prompt('图像地址', 'https://');
        if (!url) return;
        const alt = window.prompt('图像说明', '图片') || '图片';
        insertHtmlAtSelection(`<p><img src="${escapeHtml(url)}" alt="${escapeHtml(alt)}"></p>`);
      }

      function insertCodeBlock() {
        const language = (window.prompt('代码语言', 'javascript') || '').trim();
        const code = window.prompt('代码内容', 'console.log("hello");') || '';
        const className = language ? ` class="language-${escapeHtml(language)}"` : '';
        insertHtmlAtSelection(`<pre><code${className}>${escapeHtml(code)}</code></pre><p><br></p>`);
      }

      function insertAdjacentParagraph(before) {
        const block = findCurrentBlock();
        const paragraph = document.createElement('p');
        paragraph.textContent = '新段落';
        if (block && block !== preview) {
          block.insertAdjacentElement(before ? 'beforebegin' : 'afterend', paragraph);
        } else {
          preview.appendChild(paragraph);
        }
        selectNodeContents(paragraph);
      }

      function findCurrentBlock() {
        const selection = window.getSelection();
        let node = contextTarget || (selection && selection.anchorNode);
        if (node && node.nodeType === Node.TEXT_NODE) {
          node = node.parentElement;
        }
        if (!node || !preview.contains(node)) return preview;
        return node.closest('h1,h2,h3,h4,h5,h6,p,li,blockquote,pre,table,ul,ol,div') || preview;
      }

      function wrapSelection(tagName, placeholder) {
        const range = getCurrentRange();
        if (!range) {
          insertHtmlAtSelection(`<${tagName}>${escapeHtml(placeholder)}</${tagName}>`);
          return;
        }
        if (range.collapsed) {
          const node = document.createElement(tagName);
          node.textContent = placeholder;
          range.insertNode(node);
          placeCaret(node);
          return;
        }
        const wrapper = document.createElement(tagName);
        try {
          range.surroundContents(wrapper);
        } catch (error) {
          wrapper.appendChild(range.extractContents());
          range.insertNode(wrapper);
        }
        placeCaret(wrapper);
      }

      function insertHtmlAtSelection(html) {
        restoreSelection();
        if (!getCurrentRange()) {
          preview.focus();
          const range = document.createRange();
          range.selectNodeContents(preview);
          range.collapse(false);
          const selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(range);
        }
        document.execCommand('insertHTML', false, html);
        saveSelection();
      }

      function insertTextAtSelection(text) {
        restoreSelection();
        if (!getCurrentRange()) {
          preview.focus();
          const range = document.createRange();
          range.selectNodeContents(preview);
          range.collapse(false);
          const selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(range);
        }
        document.execCommand('insertText', false, text);
        saveSelection();
      }

      function insertNodesAtSelection(nodes) {
        restoreSelection();
        let range = getCurrentRange();
        if (!range) {
          preview.focus();
          range = document.createRange();
          range.selectNodeContents(preview);
          range.collapse(false);
        }
        range.deleteContents();
        const fragment = document.createDocumentFragment();
        nodes.forEach((node) => fragment.appendChild(node));
        range.insertNode(fragment);
        saveSelection();
      }

      function getCurrentRange() {
        const selection = window.getSelection();
        if (!selection || !selection.rangeCount) return null;
        const range = selection.getRangeAt(0);
        return preview.contains(range.commonAncestorContainer) ? range : null;
      }

      function saveSelection() {
        const selection = window.getSelection();
        if (selection && selection.rangeCount && preview.contains(selection.anchorNode)) {
          savedRange = selection.getRangeAt(0).cloneRange();
        }
      }

      function restoreSelection() {
        preview.focus();
        if (!savedRange) return;
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(savedRange);
      }

      function getSelectedText() {
        const selection = window.getSelection();
        if (!selection || !selection.rangeCount || !preview.contains(selection.anchorNode)) return '';
        return selection.toString().trim();
      }

      function placeCaret(node) {
        const range = document.createRange();
        range.selectNodeContents(node);
        range.collapse(false);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        savedRange = range.cloneRange();
        preview.focus();
      }

      function setCaretAfter(node) {
        const range = document.createRange();
        range.setStartAfter(node);
        range.collapse(true);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        savedRange = range.cloneRange();
        preview.focus();
      }

      function selectNodeContents(node) {
        const range = document.createRange();
        range.selectNodeContents(node);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        savedRange = range.cloneRange();
        preview.focus();
      }

      function assignHeadingIds() {
        const sourceHeadings = collectSourceHeadings();
        const state = createNumberingState();
        const headings = Array.from(preview.querySelectorAll('h1,h2,h3,h4'));
        outlineItems = headings.map((heading, index) => {
          const level = Number(heading.tagName.slice(1));
          const number = nextHeadingNumber(level, state);
          const id = `heading-${index + 1}`;
          const title = heading.textContent.trim() || '未命名标题';
          heading.id = id;
          heading.dataset.outlineId = id;
          if (number) {
            heading.dataset.outlineNumber = number;
          } else {
            heading.removeAttribute('data-outline-number');
          }
          return {
            id,
            level,
            number,
            title,
            line: sourceHeadings[index] ? sourceHeadings[index].line : -1
          };
        });
        return outlineItems;
      }

      function createNumberingState(mode = numberingModeSelect.value || 'mode1') {
        return {
          mode,
          h2: 0,
          h3: 0,
          h4: 0
        };
      }

      function nextHeadingNumber(level, state) {
        if (state.mode === 'none') {
          return '';
        }
        if (level === 1) {
          state.h2 = 0;
          state.h3 = 0;
          state.h4 = 0;
          return '';
        }
        if (level === 2) {
          state.h2 += 1;
          state.h3 = 0;
          state.h4 = 0;
          if (state.mode === 'mode1') return `第${toChineseNumber(state.h2)}章`;
          if (state.mode === 'mode2') return `${toChineseNumber(state.h2)}、`;
          return `${state.h2}.`;
        }
        if (level === 3) {
          if (!state.h2) state.h2 = 1;
          state.h3 += 1;
          state.h4 = 0;
          if (state.mode === 'mode1') return `${toChineseNumber(state.h3)}、`;
          if (state.mode === 'mode2') return `${state.h3}、`;
          return `${state.h2}.${state.h3}.`;
        }
        if (level === 4) {
          if (!state.h2) state.h2 = 1;
          if (!state.h3) state.h3 = 1;
          state.h4 += 1;
          if (state.mode === 'mode1') return `${state.h4}、`;
          if (state.mode === 'mode3') return `${state.h2}.${state.h3}.${state.h4}.`;
        }
        return '';
      }

      function toChineseNumber(number) {
        const digits = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
        if (number <= 10) return number === 10 ? '十' : digits[number];
        if (number < 20) return `十${digits[number - 10]}`;
        if (number < 100) {
          const tens = Math.floor(number / 10);
          const ones = number % 10;
          return `${digits[tens]}十${digits[ones]}`;
        }
        return String(number);
      }

      function updateOutlineFromPreview() {
        updateOutline(assignHeadingIds());
      }

      function updateOutline(items) {
        outlineItems = items;
        if (outlineView) {
          outlineView.render(items);
          return;
        }
        outlineStats.textContent = `${items.length} 项`;
        if (!items.length) {
          outlineList.innerHTML = '<div class="outline-empty">暂无一级至四级标题</div>';
          return;
        }
        outlineList.innerHTML = items.map((item) => `
          <button type="button" class="outline-item outline-level-${item.level}" data-outline-id="${escapeHtml(item.id)}" title="${escapeHtml(item.title)}">
            ${item.number ? `<span class="outline-number">${escapeHtml(item.number)}</span>` : ''}
            <span class="outline-title">${escapeHtml(item.title)}</span>
          </button>
        `).join('');
      }

      function collectSourceHeadings() {
        return parseMarkdownHeadingLines(input.value)
          .filter((heading) => heading.level >= 1 && heading.level <= 4)
          .map((heading) => ({
            level: heading.level,
            title: heading.title.replace(/[`*_~[\]()]/g, '').trim(),
            line: heading.line
          }));
      }

      function jumpToHeading(id) {
        const item = outlineItems.find((entry) => entry.id === id);
        if (!item) return;
        if (currentView === 'source') {
          jumpToSourceLine(item.line);
          return;
        }
        const target = preview.querySelector(`#${CSS.escape(id)}`);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }

      function jumpToSourceLine(line) {
        if (line < 0) return;
        const lines = input.value.split(/\r?\n/);
        const start = lines.slice(0, line).join('\n').length + (line ? 1 : 0);
        const end = start + lines[line].length;
        input.focus();
        input.setSelectionRange(start, end);
        const lineHeight = Number.parseFloat(getComputedStyle(input).lineHeight) || 22;
        input.scrollTop = Math.max(0, line * lineHeight - input.clientHeight * 0.35);
      }

      function createTurndownService() {
        if (!window.TurndownService) return null;
        const service = new window.TurndownService({
          headingStyle: 'atx',
          codeBlockStyle: 'fenced',
          emDelimiter: '*',
          bulletListMarker: '-'
        });
        if (window.turndownPluginGfm) {
          service.use(window.turndownPluginGfm.gfm);
        }
        service.remove((node) => node.classList && (node.classList.contains('code-copy') || node.classList.contains('empty-state')));
        service.addRule('mathNode', {
          filter: (node) => node.nodeType === 1 && node.classList && node.classList.contains('math-node') && node.dataset.md,
          replacement: (content, node) => node.classList.contains('math-block') ? `\n\n${node.dataset.md}\n\n` : node.dataset.md
        });
        service.addRule('mermaidNode', {
          filter: (node) => node.nodeType === 1 && node.classList && node.classList.contains('mermaid') && node.dataset.md,
          replacement: (content, node) => `\n\n${node.dataset.md}\n\n`
        });
        service.addRule('extensionFenceNode', {
          filter: (node) => node.nodeType === 1 && node.classList && (node.classList.contains('echarts-chart') || node.classList.contains('music-score')) && node.dataset.md,
          replacement: (content, node) => `\n\n${node.dataset.md}\n\n`
        });
        service.addRule('preserveOriginalImageSource', {
          filter: (node) => node.nodeName === 'IMG' && node.getAttribute('data-md-src'),
          replacement: (content, node) => {
            const alt = cleanMarkdownInline(node.getAttribute('alt') || '');
            const src = node.getAttribute('data-md-src') || node.getAttribute('src') || '';
            const title = node.getAttribute('title');
            return title ? `![${alt}](${src} "${cleanMarkdownInline(title)}")` : `![${alt}](${src})`;
          }
        });
        service.addRule('taskListItem', {
          filter: (node) => node.nodeName === 'LI' && node.classList && node.classList.contains('task-list-item') && node.querySelector('.task-list-item-checkbox'),
          replacement: (content, node, options) => {
            const checkbox = node.querySelector('.task-list-item-checkbox');
            const checked = checkbox && checkbox.checked;
            const text = cleanTaskListText(content.replace(/\n{2,}/g, '\n'));
            return `${options.bulletListMarker || '-'} [${checked ? 'x' : ' '}] ${text}\n`;
          }
        });
        service.addRule('underline', {
          filter: ['u'],
          replacement: (content) => `<u>${content}</u>`
        });
        service.addRule('mark', {
          filter: ['mark'],
          replacement: (content) => `==${content}==`
        });
        service.addRule('fencedCode', {
          filter: (node) => node.nodeName === 'PRE' && node.querySelector('code'),
          replacement: (content, node) => {
            const code = node.querySelector('code');
            const languageClass = Array.from(code.classList).find((name) => name.startsWith('language-'));
            const language = languageClass ? languageClass.replace('language-', '') : '';
            return `\n\n\`\`\`${language}\n${code.textContent.replace(/\n+$/g, '')}\n\`\`\`\n\n`;
          }
        });
        return service;
      }

      function installTaskListRules(instance) {
        instance.core.ruler.after('inline', 'task_list', (state) => {
          const tokens = state.tokens;
          for (let index = 2; index < tokens.length; index += 1) {
            if (tokens[index].type !== 'inline') continue;
            if (!tokens[index].content.match(/^\s*\[[ xX]\]\s+/)) continue;
            if (tokens[index - 1].type !== 'paragraph_open') continue;
            if (tokens[index - 2].type !== 'list_item_open') continue;

            const checkbox = tokens[index].content.match(/^\s*\[([ xX])\]\s+/);
            const checked = checkbox && checkbox[1].toLowerCase() === 'x';
            tokens[index].content = tokens[index].content.replace(/^\s*\[[ xX]\]\s+/, '');
            if (tokens[index].children && tokens[index].children.length) {
              tokens[index].children[0].content = tokens[index].children[0].content.replace(/^\s*\[[ xX]\]\s+/, '');
              const token = new state.Token('html_inline', '', 0);
              token.content = `<input class="task-list-item-checkbox" type="checkbox"${checked ? ' checked' : ''} contenteditable="false"> `;
              tokens[index].children.unshift(token);
            }
            addTokenClass(tokens[index - 2], 'task-list-item');
            if (checked) addTokenClass(tokens[index - 2], 'task-list-item-completed');
            const parent = findParentListToken(tokens, index - 2);
            if (parent) addTokenClass(parent, 'contains-task-list');
          }
        });
      }

      function addTokenClass(token, className) {
        const index = token.attrIndex('class');
        if (index < 0) {
          token.attrPush(['class', className]);
          return;
        }
        const classes = token.attrs[index][1].split(/\s+/);
        if (!classes.includes(className)) {
          classes.push(className);
          token.attrs[index][1] = classes.join(' ');
        }
      }

      function findParentListToken(tokens, itemIndex) {
        for (let index = itemIndex - 1; index >= 0; index -= 1) {
          if (tokens[index].type === 'bullet_list_open' || tokens[index].type === 'ordered_list_open') {
            return tokens[index];
          }
        }
        return null;
      }

      function installMathRules(instance) {
        instance.block.ruler.before('fence', 'math_block', (state, startLine, endLine, silent) => {
          const start = state.bMarks[startLine] + state.tShift[startLine];
          const max = state.eMarks[startLine];
          const firstLine = state.src.slice(start, max).trim();
          if (!firstLine.startsWith('$$')) return false;
          if (silent) return true;

          let content = '';
          let nextLine = startLine + 1;
          const rest = firstLine.slice(2);
          const inlineClose = rest.lastIndexOf('$$');
          if (rest && inlineClose > -1) {
            content = rest.slice(0, inlineClose).trim();
          } else {
            if (rest) content += `${rest}\n`;
            while (nextLine < endLine) {
              const lineStart = state.bMarks[nextLine] + state.tShift[nextLine];
              const lineMax = state.eMarks[nextLine];
              const line = state.src.slice(lineStart, lineMax);
              const closeIndex = line.indexOf('$$');
              if (closeIndex > -1) {
                content += line.slice(0, closeIndex);
                nextLine += 1;
                break;
              }
              content += `${line}\n`;
              nextLine += 1;
            }
          }

          const token = state.push('math_block', 'math', 0);
          token.block = true;
          token.content = content.trim();
          state.line = nextLine;
          return true;
        });

        instance.inline.ruler.before('escape', 'math_inline', (state, silent) => {
          if (state.src.charCodeAt(state.pos) !== 0x24) return false;
          if (state.src.charCodeAt(state.pos + 1) === 0x24) return false;
          if (state.pos > 0 && state.src.charAt(state.pos - 1) === '\\') return false;
          let end = state.pos + 1;
          while ((end = state.src.indexOf('$', end)) !== -1) {
            if (state.src.charAt(end - 1) !== '\\') break;
            end += 1;
          }
          if (end === -1) return false;
          const content = state.src.slice(state.pos + 1, end);
          if (!content.trim() || content.includes('\n')) return false;
          if (!silent) {
            const token = state.push('math_inline', 'math', 0);
            token.content = content;
          }
          state.pos = end + 1;
          return true;
        }, { alt: ['$'] });

        instance.inline.ruler.before('emphasis', 'mark_inline', (state, silent) => {
          if (state.src.slice(state.pos, state.pos + 2) !== '==') return false;
          const end = state.src.indexOf('==', state.pos + 2);
          if (end === -1) return false;
          const content = state.src.slice(state.pos + 2, end);
          if (!content.trim()) return false;
          if (!silent) {
            const token = state.push('mark_inline', 'mark', 0);
            token.content = content;
          }
          state.pos = end + 2;
          return true;
        }, { alt: ['='] });

        instance.renderer.rules.math_inline = (tokens, idx) => {
          const content = tokens[idx].content;
          const markdown = `$${content}$`;
          return `<span class="math-node math-inline" data-md="${escapeHtml(markdown)}" data-tex="${escapeHtml(content)}" aria-label="${escapeHtml(markdown)}" contenteditable="false"></span>`;
        };

        instance.renderer.rules.math_block = (tokens, idx) => {
          const content = tokens[idx].content;
          const markdown = `$$\n${content}\n$$`;
          return `<div class="math-node math-block" data-md="${escapeHtml(markdown)}" data-tex="${escapeHtml(content)}" aria-label="${escapeHtml(markdown)}" contenteditable="false"></div>`;
        };

        instance.renderer.rules.mark_inline = (tokens, idx) => `<mark>${escapeHtml(tokens[idx].content)}</mark>`;
      }

      async function loadMarkdownFileSet(files) {
        const fileList = Array.from(files || []);
        if (!fileList.length) return;
        const markdownFile = fileList
          .filter(isMarkdownFile)
          .sort((left, right) => getFileRelativePath(left).localeCompare(getFileRelativePath(right), 'zh-CN'))[0];
        if (!markdownFile) {
          showToast('未找到 Markdown 文件');
          return;
        }

        currentMarkdownDirectory = getDirectoryName(normalizeAssetPath(getFileRelativePath(markdownFile)));
        await indexLocalImageAssets(fileList);
        await readMarkdownFile(markdownFile);
      }

      async function readMarkdownFile(file) {
        try {
          const raw = await readFileAsText(file);
          const normalized = normalizeLoadedMarkdown(raw);
          currentFileName = file.name;
          input.value = normalized.content;
          syncDocumentData(normalized.content, { fileName: file.name, source: 'file' });
          fileName.textContent = file.name;
          fileDetail.textContent = `${formatBytes(file.size)} · ${formatTime(new Date(file.lastModified || Date.now()))}`;
          sizeText.textContent = formatBytes(new Blob([normalized.content]).size);
          updatedText.textContent = normalized.changed ? '已接管编号' : '已加载';
          statusText.textContent = '渲染中';
          setMessage(getLoadMessage(normalized));
          scheduleRender(0);
        } catch (error) {
          showToast('文件读取失败');
          setMessage(error.message || '文件读取失败', true);
        }
      }

      function readFileAsText(file) {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result || ''));
          reader.onerror = () => reject(new Error('文件读取失败'));
          reader.readAsText(file, 'utf-8');
        });
      }

      function readFileAsDataUrl(file) {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result || ''));
          reader.onerror = () => reject(new Error(`图片读取失败：${file.name}`));
          reader.readAsDataURL(file);
        });
      }

      function isMarkdownFile(file) {
        return MARKDOWN_FILE_PATTERN.test(file.name || '') || /^(text\/markdown|text\/plain)$/i.test(file.type || '');
      }

      function isImageFile(file) {
        return /^image\//i.test(file.type || '') || IMAGE_FILE_PATTERN.test(file.name || '');
      }

      async function indexLocalImageAssets(files) {
        localImageAssets = new Map();
        localImageBasenames = new Map();
        const imageFiles = Array.from(files || []).filter(isImageFile);
        await Promise.all(imageFiles.map(async (file) => {
          try {
            const dataUrl = await readFileAsDataUrl(file);
            const path = normalizeAssetPath(getFileRelativePath(file));
            if (path) {
              localImageAssets.set(path, dataUrl);
              if (documentData && typeof documentData.setAsset === 'function') {
                documentData.setAsset(path, dataUrl);
              }
            }
            const basename = getBaseName(path || file.name);
            if (basename) {
              const previous = localImageBasenames.get(basename);
              localImageBasenames.set(basename, previous && previous !== dataUrl ? null : dataUrl);
            }
          } catch (error) {
            setMessage(error.message || String(error), true);
          }
        }));
      }

      function getFileRelativePath(file) {
        return fileRelativePaths.get(file) || file.webkitRelativePath || file.name || '';
      }

      async function collectDroppedFiles(dataTransfer) {
        const items = Array.from(dataTransfer && dataTransfer.items ? dataTransfer.items : []);
        const entries = items
          .map((item) => item.webkitGetAsEntry ? item.webkitGetAsEntry() : null)
          .filter(Boolean);
        if (!entries.length) {
          return Array.from(dataTransfer && dataTransfer.files ? dataTransfer.files : []);
        }

        const files = [];
        for (const entry of entries) {
          const collected = await collectFilesFromEntry(entry, '');
          files.push(...collected);
        }
        return files;
      }

      async function collectFilesFromEntry(entry, parentPath) {
        if (!entry) return [];
        const path = parentPath ? `${parentPath}/${entry.name}` : entry.name;
        if (entry.isFile) {
          const file = await new Promise((resolve, reject) => entry.file(resolve, reject));
          fileRelativePaths.set(file, path);
          return [file];
        }
        if (!entry.isDirectory) return [];
        const reader = entry.createReader();
        const files = [];
        let batch = [];
        do {
          batch = await new Promise((resolve, reject) => reader.readEntries(resolve, reject));
          for (const child of batch) {
            files.push(...await collectFilesFromEntry(child, path));
          }
        } while (batch.length);
        return files;
      }

      function resolveLocalImageSource(source) {
        if (!source || isExternalImageSource(source)) return source;
        const [pathOnly] = splitAssetSuffix(source);
        const normalized = normalizeAssetPath(pathOnly);
        if (!normalized) return source;
        const candidates = uniqueValues([
          resolveAssetPath(currentMarkdownDirectory, pathOnly),
          normalized,
          getBaseName(normalized)
        ]);
        for (const candidate of candidates) {
          if (localImageAssets.has(candidate)) {
            return localImageAssets.get(candidate);
          }
        }
        const basenameMatch = localImageBasenames.get(getBaseName(normalized));
        return basenameMatch || source;
      }

      function resolveLocalImages(root) {
        root.querySelectorAll('img').forEach((image) => {
          const original = image.getAttribute('data-md-src') || image.getAttribute('src') || '';
          const resolved = resolveLocalImageSource(original);
          if (resolved && resolved !== original) {
            image.dataset.mdSrc = original;
            image.setAttribute('src', resolved);
          }
        });
      }

      function isExternalImageSource(source) {
        return /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(String(source || ''));
      }

      function splitAssetSuffix(path) {
        const match = String(path || '').match(/^([^?#]*)([?#].*)?$/);
        return [match ? match[1] : path, match && match[2] ? match[2] : ''];
      }

      function normalizeAssetPath(path) {
        let value = String(path || '').replace(/\\/g, '/').trim();
        try {
          value = decodeURIComponent(value);
        } catch (error) {
          // 保留原始路径。
        }
        value = value.replace(/^file:\/+/i, '').replace(/^\/+/, '').replace(/^\.\//, '');
        const parts = [];
        value.split('/').forEach((part) => {
          if (!part || part === '.') return;
          if (part === '..') {
            parts.pop();
            return;
          }
          parts.push(part);
        });
        return parts.join('/');
      }

      function resolveAssetPath(baseDir, relativePath) {
        const path = normalizeAssetPath(relativePath);
        if (!baseDir || path.startsWith(`${baseDir}/`)) return path;
        return normalizeAssetPath(`${baseDir}/${relativePath}`);
      }

      function getDirectoryName(path) {
        const normalized = normalizeAssetPath(path);
        const index = normalized.lastIndexOf('/');
        return index > -1 ? normalized.slice(0, index) : '';
      }

      function getBaseName(path) {
        return normalizeAssetPath(path).split('/').filter(Boolean).pop() || '';
      }

      function uniqueValues(values) {
        return Array.from(new Set(values.filter(Boolean)));
      }

      function normalizeLoadedMarkdown(content) {
        const detection = detectHeadingNumberingMode(content);
        const hasNumberableHeadings = parseMarkdownHeadingLines(content).some((heading) => heading.level >= 2 && heading.level <= 4);
        const inferredMode = detection.mode === 'none' && !detection.hasNumbering && hasNumberableHeadings
          ? 'mode1'
          : detection.mode;
        numberingModeSelect.value = inferredMode;
        localStorage.setItem('markdown-viewer-numbering-mode', inferredMode);
        if (detection.mode === 'none') {
          return {
            content,
            mode: inferredMode,
            changed: false,
            reason: detection.hasNumbering ? 'unmatched' : (inferredMode === 'none' ? 'none' : 'inferred')
          };
        }
        return {
          content: stripHeadingNumbering(content, detection.mode),
          mode: detection.mode,
          changed: true,
          reason: 'matched'
        };
      }

      function getLoadMessage(normalized) {
        if (!normalized) return '';
        if (normalized.reason === 'matched') {
          return `已识别并接管标题编号：${getNumberingModeLabel(normalized.mode)}`;
        }
        if (normalized.reason === 'unmatched') {
          return '检测到标题编号不符合内置规则，已切换为不编号';
        }
        if (normalized.reason === 'inferred') {
          return `未检测到现有编号，已使用默认编号：${getNumberingModeLabel(normalized.mode)}`;
        }
        return '';
      }

      function getNumberingModeLabel(mode) {
        const labels = {
          mode1: '按章节',
          mode2: '按大写',
          mode3: '自动序号',
          none: '不编号'
        };
        return labels[mode] || labels.none;
      }

      function detectHeadingNumberingMode(content) {
        const headings = parseMarkdownHeadingLines(content).filter((heading) => heading.level >= 2 && heading.level <= 4);
        const hasNumbering = headings.some((heading) => Boolean(extractKnownHeadingPrefix(heading.title)));
        if (!headings.length || !hasNumbering) {
          return { mode: 'none', hasNumbering };
        }

        const candidates = ['mode1', 'mode2', 'mode3']
          .map((mode) => scoreHeadingNumberingMode(headings, mode))
          .filter((result) => result.valid && result.matched > 0)
          .sort((left, right) => right.matched - left.matched);

        return candidates.length
          ? { mode: candidates[0].mode, hasNumbering: true }
          : { mode: 'none', hasNumbering: true };
      }

      function scoreHeadingNumberingMode(headings, mode) {
        const state = createNumberingState(mode);
        let matched = 0;
        for (const heading of headings) {
          const expected = nextHeadingNumber(heading.level, state);
          const actual = extractKnownHeadingPrefix(heading.title);
          if (expected) {
            if (!actual || actual !== expected) {
              return { mode, valid: false, matched };
            }
            matched += 1;
          } else if (actual) {
            return { mode, valid: false, matched };
          }
        }
        return { mode, valid: true, matched };
      }

      function stripHeadingNumbering(content, mode) {
        const state = createNumberingState(mode);
        return transformMarkdownHeadingLines(content, (line) => {
          const parsed = parseMarkdownHeadingLine(line);
          if (!parsed || parsed.level < 2 || parsed.level > 4) return line;
          const expected = nextHeadingNumber(parsed.level, state);
          if (!expected || extractKnownHeadingPrefix(parsed.title) !== expected) return line;
          const title = stripExpectedHeadingPrefix(parsed.title, expected);
          return `${parsed.prefix}${title || parsed.title}${parsed.suffix}`;
        });
      }

      function parseMarkdownHeadingLines(content) {
        const headings = [];
        transformMarkdownHeadingLines(content, (line, index) => {
          const parsed = parseMarkdownHeadingLine(line);
          if (parsed) {
            headings.push({ ...parsed, line: index });
          }
          return line;
        });
        return headings;
      }

      function transformMarkdownHeadingLines(content, transform) {
        let inFence = false;
        let fenceMarker = '';
        return String(content || '').split(/\r?\n/).map((line, index) => {
          const fence = line.match(/^\s{0,3}(`{3,}|~{3,})/);
          if (fence) {
            const marker = fence[1][0];
            if (!inFence) {
              inFence = true;
              fenceMarker = marker;
            } else if (marker === fenceMarker) {
              inFence = false;
              fenceMarker = '';
            }
            return line;
          }
          return inFence ? line : transform(line, index);
        }).join('\n');
      }

      function parseMarkdownHeadingLine(line) {
        const match = String(line || '').match(/^(\s{0,3})(#{1,6})(\s+)(.+?)(\s+#*\s*)?$/);
        if (!match) return null;
        return {
          level: match[2].length,
          prefix: `${match[1]}${match[2]}${match[3]}`,
          title: match[4].trim(),
          suffix: match[5] || ''
        };
      }

      function extractKnownHeadingPrefix(title) {
        const text = String(title || '').trim();
        const patterns = [
          /^第[零〇一二三四五六七八九十百千万两\d]+章/,
          /^[零〇一二三四五六七八九十百千万两]+、/,
          /^\d+(?:\.\d+)*\./,
          /^\d+、/,
          /^\d+[)）]/,
          /^[A-Z][.、)）]/
        ];
        const match = patterns.map((pattern) => text.match(pattern)).find(Boolean);
        return match ? match[0] : '';
      }

      function stripExpectedHeadingPrefix(title, expected) {
        const escaped = expected.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return String(title || '').replace(new RegExp(`^${escaped}\\s*`), '').trim();
      }

      function addHeadingNumberingToMarkdown(content, mode = numberingModeSelect.value || 'none') {
        if (mode === 'none') return content;
        const state = createNumberingState(mode);
        return transformMarkdownHeadingLines(content, (line) => {
          const parsed = parseMarkdownHeadingLine(line);
          if (!parsed || parsed.level < 1 || parsed.level > 4) return line;
          const number = nextHeadingNumber(parsed.level, state);
          if (!number) return line;
          const cleanTitle = stripExpectedHeadingPrefix(parsed.title, number);
          return `${parsed.prefix}${number} ${cleanTitle || parsed.title}${parsed.suffix}`;
        });
      }

      function scheduleRender(delay = 180) {
        window.clearTimeout(renderTimer);
        renderTimer = window.setTimeout(renderMarkdown, delay);
      }

      async function renderMarkdown() {
        const renderId = ++lastRenderId;
        const source = input.value;
        syncDocumentData(source, { source: 'render' });
        isRendering = true;
        clearTableSelection();
        closeTableToolbar();
        hideTableEdgeControls();
        hideTableResizeHandles();
        updateSourceStats(source);

        if (!source.trim()) {
          preview.innerHTML = '<p><br></p>';
          preview.dataset.empty = 'true';
          preview.setAttribute('contenteditable', 'true');
          renderStats.textContent = '0 标题 · 0 代码块 · 0 图表';
          updateOutline([]);
          statusText.textContent = '就绪';
          setMessage('');
          isRendering = false;
          return;
        }

        statusText.textContent = '渲染中';
        setMessage('');

        try {
          preview.removeAttribute('data-empty');
          preview.innerHTML = md.render(source);
          resolveLocalImages(preview);
          updateTaskListState(preview);
          addCodeCopyButtons();
          await renderMermaid(renderId);
          await renderEcharts(renderId);
          await renderMusicScores(renderId);
          await renderMath(renderId);
          if (renderId !== lastRenderId) return;
          preview.setAttribute('contenteditable', 'true');
          assignHeadingIds();
          updateOutlineFromPreview();
          addInlineEditButtons();
          updateRenderStats();
          statusText.textContent = '就绪';
        } catch (error) {
          statusText.textContent = '渲染失败';
          setMessage(error.message || String(error), true);
        } finally {
          isRendering = false;
        }
      }

      async function renderMermaid(renderId, root = preview) {
        const diagrams = Array.from(root.matches && root.matches('.mermaid') ? [root] : root.querySelectorAll('.mermaid'));
        if (!diagrams.length || !window.mermaid) return;

        diagrams.forEach((node, index) => {
          node.removeAttribute('data-processed');
          node.id = `mermaid-${Date.now()}-${renderId}-${index}`;
        });

        try {
          await window.mermaid.run({ nodes: diagrams });
        } catch (error) {
          diagrams.forEach((node) => {
            if (!node.querySelector('svg')) {
              node.classList.add('render-error');
              node.textContent = `${node.textContent.trim()}\n\nMermaid 渲染失败：${error.message || error}`;
            }
          });
          setMessage('部分流程图渲染失败', true);
        }
      }

      async function renderEcharts(renderId, root = preview) {
        const charts = Array.from(root.matches && root.matches('.echarts-chart') ? [root] : root.querySelectorAll('.echarts-chart'));
        if (!charts.length) return;
        charts.forEach((node, index) => {
          if (renderId !== null && renderId !== lastRenderId) return;
          const source = node.dataset.option || extractFencedBlockSource(node.dataset.md, 'echarts') || node.textContent.trim();
          node.id = node.id || `echarts-${Date.now()}-${index}`;
          if (!window.echarts) {
            node.classList.add('render-error');
            node.textContent = `${source}\n\nECharts 渲染库未加载`;
            return;
          }
          try {
            const option = JSON.parse(source);
            const existed = window.echarts.getInstanceByDom(node);
            if (existed) existed.dispose();
            node.classList.remove('render-error');
            node.innerHTML = '';
            node.style.minHeight = node.style.minHeight || '320px';
            const chart = window.echarts.init(node, getTheme() === 'dark' ? 'dark' : null, { renderer: 'svg' });
            chart.setOption(option);
          } catch (error) {
            node.classList.add('render-error');
            node.textContent = `${source}\n\nECharts 渲染失败：${error.message || error}`;
            setMessage('部分 ECharts 图表渲染失败', true);
          }
        });
      }

      async function renderMusicScores(renderId, root = preview) {
        const scores = Array.from(root.matches && root.matches('.music-score') ? [root] : root.querySelectorAll('.music-score'));
        if (!scores.length) return;
        scores.forEach((node, index) => {
          if (renderId !== null && renderId !== lastRenderId) return;
          const source = node.dataset.abc || extractFencedBlockSource(node.dataset.md, 'abc') || node.textContent.trim();
          node.id = node.id || `music-score-${Date.now()}-${index}`;
          if (!window.ABCJS || !window.ABCJS.renderAbc) {
            node.classList.add('render-error');
            node.textContent = `${source}\n\nABCJS 五线谱渲染库未加载`;
            return;
          }
          try {
            node.classList.remove('render-error');
            node.innerHTML = '';
            window.ABCJS.renderAbc(node.id, source, {
              responsive: 'resize',
              add_classes: true
            });
          } catch (error) {
            node.classList.add('render-error');
            node.textContent = `${source}\n\n五线谱渲染失败：${error.message || error}`;
            setMessage('部分五线谱渲染失败', true);
          }
        });
      }

      function extractFencedBlockSource(markdown, language) {
        if (!markdown) return '';
        const pattern = new RegExp(`^\`\`\`${language}\\s*([\\s\\S]*?)\\s*\`\`\`$`, 'i');
        const match = String(markdown).trim().match(pattern);
        return match ? match[1].trim() : '';
      }

      async function renderMath(renderId, root = preview) {
        if (!window.MathJax || !window.MathJax.tex2svgPromise) return;
        await window.MathJax.startup.promise;
        if (renderId !== null && renderId !== lastRenderId) return;
        const nodes = Array.from(root.matches && root.matches('.math-node') ? [root] : root.querySelectorAll('.math-node'));
        for (const node of nodes) {
          const tex = node.dataset.tex || extractFormulaTex(node.dataset.md) || node.textContent.replace(/^\\\(|\\\)$/g, '').replace(/^\\\[|\\\]$/g, '').trim();
          if (!tex) continue;
          try {
            const output = await window.MathJax.tex2svgPromise(tex, {
              display: node.classList.contains('math-block')
            });
            if (renderId !== null && renderId !== lastRenderId) return;
            node.dataset.tex = tex;
            node.setAttribute('contenteditable', 'false');
            output.querySelectorAll('mjx-assistive-mml').forEach((item) => item.remove());
            node.replaceChildren(output);
          } catch (error) {
            node.classList.add('render-error');
            node.textContent = node.dataset.md || tex;
            setMessage('部分公式渲染失败', true);
          }
        }
      }

      function extractFormulaTex(markdown) {
        if (!markdown) return '';
        const value = markdown.trim();
        if (value.startsWith('$$') && value.endsWith('$$')) {
          return value.slice(2, -2).trim();
        }
        if (value.startsWith('$') && value.endsWith('$')) {
          return value.slice(1, -1).trim();
        }
        return value;
      }

      function addCodeCopyButtons() {
        preview.querySelectorAll('pre').forEach((pre) => {
          if (pre.querySelector('.code-copy')) return;
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'code-copy';
          button.textContent = '复制';
          button.setAttribute('aria-label', '复制代码');
          button.setAttribute('contenteditable', 'false');
          pre.appendChild(button);
        });
      }

      function addInlineEditButtons(root = preview) {
        const scope = root || preview;
        const imageBlocks = Array.from(scope.matches && scope.matches('.image-block') ? [scope] : scope.querySelectorAll('.image-block'));
        const diagrams = Array.from(scope.matches && scope.matches('.mermaid') ? [scope] : scope.querySelectorAll('.mermaid'));
        const charts = Array.from(scope.matches && scope.matches('.echarts-chart') ? [scope] : scope.querySelectorAll('.echarts-chart'));
        const scores = Array.from(scope.matches && scope.matches('.music-score') ? [scope] : scope.querySelectorAll('.music-score'));
        const taskLists = Array.from(scope.matches && scope.matches('.contains-task-list') ? [scope] : scope.querySelectorAll('.contains-task-list'));
        const formulas = Array.from(scope.matches && scope.matches('.math-node') ? [scope] : scope.querySelectorAll('.math-node'));
        imageBlocks.forEach((block) => addNodeEditButton(block, 'image', '编辑图片'));
        diagrams.forEach((diagram) => addNodeEditButton(diagram, 'flowchart', '编辑流程图'));
        charts.forEach((chart) => addNodeEditButton(chart, 'echarts', '编辑 ECharts 图表'));
        scores.forEach((score) => addNodeEditButton(score, 'music-score', '编辑五线谱'));
        taskLists.forEach((list) => addNodeEditButton(list, 'task-list', '编辑任务列表'));
        formulas.forEach((formula) => addNodeEditButton(formula, 'formula', '编辑公式'));
        createIcons();
      }

      function addNodeEditButton(node, type, label) {
        if (!node || node.querySelector(`.node-edit-button[data-edit="${type}"]`)) return;
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'node-edit-button';
        button.dataset.edit = type;
        button.setAttribute('contenteditable', 'false');
        button.setAttribute('aria-label', label);
        button.title = label;
        button.innerHTML = '<i data-lucide="pencil"></i>';
        node.appendChild(button);
      }

      async function exportHtml() {
        await flushPreviewEdits();
        await renderMarkdown();
        if (!input.value.trim()) {
          showToast('没有可导出的 Markdown 内容');
          return;
        }

        const title = getExportTitle();
        const clone = buildExportClone();
        const css = getExportContentStyleCss();
        const themeVars = getExportThemeVariables();
        const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>
    :root {
${themeVars}
      --mono: "Cascadia Code", "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
      --sans: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", sans-serif;
    }
    body {
      margin: 0;
      padding: 28px;
      background: #f5f7fb;
      color: #172033;
      font-family: var(--sans);
    }
    main.markdown-body {
      max-width: 960px;
      margin: 0 auto;
      border: 1px solid #d9e0ea;
      border-radius: 8px;
      box-shadow: 0 14px 40px rgba(25, 38, 68, 0.12);
    }
    .code-copy { display: none !important; }
${css}
  </style>
</head>
<body>
  <main class="markdown-body">
${indentHtml(clone.innerHTML, 4)}
  </main>
</body>
</html>`;

        downloadBlob(`${sanitizeFileName(title)}.html`, html, 'text/html;charset=utf-8');
        showToast('HTML 已导出');
      }

      async function exportPdf() {
        exportPdfButton.disabled = true;
        statusText.textContent = '导出 PDF';
        setMessage('正在生成 A4 PDF（本地生成，不下载字体，不调用后台服务）');
        pdfExportWarnings = [];

        try {
          await flushPreviewEdits();
          await renderMarkdown();
          if (!input.value.trim()) {
            showToast('没有可导出的 Markdown 内容');
            setMessage('');
            return;
          }
          if (!window.pdfMake) {
            showToast('PDF 生成库未加载');
            setMessage('本地 vendor/pdfmake.min.js 未加载', true);
            return;
          }
          if (!hasPdfChineseFont()) {
            showToast('PDF 本地字体文件缺失');
            setMessage('本地 vendor/pdfmake-chinese-vfs.js 未加载或字体缺失', true);
            return;
          }

          const title = getExportTitle();
          configurePdfMakeFonts();
          await waitForPreviewAssets();
          const documentDefinition = await buildPdfDocumentDefinition(title);
          await downloadPdfDocument(documentDefinition, `${sanitizeFileName(title)}.pdf`);
          showToast('PDF 已导出');
          setMessage(pdfExportWarnings.length ? `PDF 已导出，${pdfExportWarnings.length} 个图片未能本地嵌入` : '');
        } catch (error) {
          setMessage(`PDF 导出失败：${error.message || error}`, true);
          showToast('PDF 导出失败');
        } finally {
          exportPdfButton.disabled = false;
          statusText.textContent = '就绪';
        }
      }

      async function exportMarkdown() {
        await flushPreviewEdits();
        const markdown = addHeadingNumberingToMarkdown(input.value);
        if (!markdown.trim()) {
          showToast('没有可导出的 Markdown 内容');
          return;
        }
        const title = getMarkdownTitle();
        downloadBlob(`${sanitizeFileName(title)}.md`, markdown, 'text/markdown;charset=utf-8');
        showToast('Markdown 已导出');
      }

      function buildExportClone() {
        const clone = preview.cloneNode(true);
        clone.querySelectorAll('.code-copy, .node-edit-button').forEach((node) => node.remove());
        clone.querySelectorAll('[contenteditable]').forEach((node) => node.removeAttribute('contenteditable'));
        cleanTableEditingState(clone);
        return clone;
      }

      function configurePdfMakeFonts() {
        const fontFile = getPdfChineseFontFile();
        if (!fontFile) {
          throw new Error('本地 vendor/pdfmake-chinese-vfs.js 未加载或未包含 TTF 字体');
        }
        window.pdfMake.fonts = {
          ...(window.pdfMake.fonts || {}),
          [PDF_FONT_NAME]: {
            normal: fontFile,
            bold: fontFile,
            italics: fontFile,
            bolditalics: fontFile
          }
        };
      }

      function hasPdfChineseFont() {
        return Boolean(getPdfChineseFontFile());
      }

      function getPdfChineseFontFile() {
        if (!window.pdfMake || !window.pdfMake.vfs) return '';
        if (pdfFontFile && window.pdfMake.vfs[pdfFontFile]) return pdfFontFile;
        const keys = Object.keys(window.pdfMake.vfs);
        pdfFontFile = keys.find((key) => /\.ttf$/i.test(key)) || '';
        return pdfFontFile;
      }

      function downloadPdfDocument(documentDefinition, filename) {
        return new Promise((resolve, reject) => {
          let settled = false;
          const timeout = window.setTimeout(() => {
            settled = true;
            reject(new Error('PDF 生成超时：可能是复杂公式、流程图或图片让 PDF 引擎处理时间过长；当前导出为本地生成，不会下载字体或调用后台服务'));
          }, PDF_EXPORT_TIMEOUT);
          try {
            const pdf = window.pdfMake.createPdf(documentDefinition);
            pdf.getBlob((blob) => {
              if (settled) return;
              settled = true;
              window.clearTimeout(timeout);
              downloadBlobFile(filename, blob);
              resolve();
            });
          } catch (error) {
            if (settled) return;
            settled = true;
            window.clearTimeout(timeout);
            reject(error);
          }
        });
      }

      function downloadBlobFile(filename, blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
      }

      async function waitForPreviewAssets() {
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        const images = Array.from(preview.querySelectorAll('img'));
        await Promise.all(images.map((img) => {
          if (img.complete && img.naturalWidth) return Promise.resolve();
          return new Promise((resolve) => {
            img.addEventListener('load', resolve, { once: true });
            img.addEventListener('error', resolve, { once: true });
          });
        }));
      }

      async function buildPdfDocumentDefinition(title) {
        const content = await buildPdfContent(preview);
        return {
          info: {
            title,
            subject: 'Markdown 导出 PDF'
          },
          pageSize: 'A4',
          pageMargins: PDF_MARGINS,
          defaultStyle: {
            font: PDF_FONT_NAME,
            fontSize: 10.5,
            lineHeight: 1.32,
            color: '#172033'
          },
          styles: {
            h1: { fontSize: 20, bold: true, alignment: 'center', margin: [0, 4, 0, 14] },
            h2: { fontSize: 16, bold: true, color: '#0e5fc4', margin: [0, 14, 0, 8] },
            h3: { fontSize: 13.5, bold: true, margin: [0, 10, 0, 6] },
            h4: { fontSize: 11.5, bold: true, margin: [0, 8, 0, 5] },
            paragraph: { margin: [0, 0, 0, 8] },
            blockquote: { color: '#667085', margin: [10, 2, 0, 10] },
            codeBlock: {
              fontSize: 8.8,
              lineHeight: 1.42,
              color: '#d6e4ff',
              margin: [0, 0, 0, 0]
            },
            tableHeader: { bold: true, fillColor: '#f9fbff' },
            tableCell: { fontSize: 9.5, lineHeight: 1.22 }
          },
          content: content.length ? content : [{ text: '' }]
        };
      }

      async function buildPdfContent(root) {
        const content = [];
        const nodes = Array.from(root.children).filter((node) => !node.classList.contains('empty-state'));
        for (const node of nodes) {
          const block = await domNodeToPdfBlock(node);
          if (Array.isArray(block)) {
            content.push(...block);
          } else if (block) {
            content.push(block);
          }
        }
        return content;
      }

      async function domNodeToPdfBlock(node) {
        if (node.nodeType !== Node.ELEMENT_NODE) return null;
        if (node.matches('.mermaid')) return buildPdfSvgBlock(node, 'mermaid');
        if (node.matches('.echarts-chart')) return buildPdfSvgBlock(node, 'chart');
        if (node.matches('.music-score')) return buildPdfSvgBlock(node, 'score');
        if (node.matches('.math-block')) return buildPdfSvgBlock(node, 'formula');
        if (node.matches('.image-block')) return buildPdfImageBlock(node);
        if (node.matches('table')) return buildPdfTable(node);

        const tag = node.tagName.toLowerCase();
        if (/^h[1-4]$/.test(tag)) {
          const number = node.dataset.outlineNumber ? `${node.dataset.outlineNumber} ` : '';
          return {
            text: `${number}${normalizePdfText(node.textContent) || '未命名标题'}`,
            style: tag
          };
        }
        if (tag === 'p') {
          const inlineFormula = await buildPdfInlineFormulaRow(node);
          if (inlineFormula) return inlineFormula;
          const runs = collectPdfTextRuns(node);
          return runs.length ? { text: runs, style: 'paragraph' } : null;
        }
        if (tag === 'ul' || tag === 'ol') {
          const items = Array.from(node.children)
            .filter((child) => child.tagName && child.tagName.toLowerCase() === 'li')
            .map((child) => {
              const runs = collectPdfTextRuns(child);
              const checkbox = child.querySelector('input[type="checkbox"]');
              if (checkbox) {
                const prefix = { text: checkbox.checked ? '[x] ' : '[ ] ', bold: true };
                return { text: [prefix, ...runs], margin: [0, 1, 0, 1] };
              }
              return runs.length ? { text: runs, margin: [0, 1, 0, 1] } : { text: normalizePdfText(child.textContent) };
            });
          return items.length ? { [tag]: items, margin: [12, 0, 0, 8] } : null;
        }
        if (tag === 'blockquote') {
          const runs = collectPdfTextRuns(node);
          return runs.length
            ? {
                table: {
                  widths: [3, '*'],
                  body: [[
                    { text: '', fillColor: '#1b74e4', border: [false, false, false, false] },
                    { text: runs, style: 'blockquote', fillColor: '#f9fbff', border: [false, false, false, false] }
                  ]]
                },
                layout: 'noBorders',
                margin: [0, 2, 0, 10]
              }
            : null;
        }
        if (tag === 'pre') {
          return buildPdfCodeBlock(node);
        }
        if (tag === 'hr') {
          return {
            canvas: [{ type: 'line', x1: 0, y1: 0, x2: PDF_CONTENT_WIDTH, y2: 0, lineWidth: 0.6, lineColor: '#d9e0ea' }],
            margin: [0, 8, 0, 12]
          };
        }
        if (tag === 'img') return buildPdfImageBlock(node);

        const childBlocks = [];
        for (const child of Array.from(node.children)) {
          const childBlock = await domNodeToPdfBlock(child);
          if (childBlock) childBlocks.push(childBlock);
        }
        if (childBlocks.length) return childBlocks;

        const text = normalizePdfText(node.textContent);
        return text ? { text, style: 'paragraph' } : null;
      }

      function collectPdfTextRuns(node, inherited = {}) {
        const runs = [];
        node.childNodes.forEach((child) => {
          if (child.nodeType === Node.TEXT_NODE) {
            const text = normalizePdfInlineText(child.textContent);
            if (text.trim()) runs.push({ text, ...inherited });
            return;
          }
          if (child.nodeType !== Node.ELEMENT_NODE) return;
          const element = child;
          const tag = element.tagName.toLowerCase();
          if (tag === 'br') {
            runs.push({ text: '\n', ...inherited });
            return;
          }
          if (element.classList.contains('math-node')) {
            const formula = element.dataset.md || element.dataset.tex || normalizePdfText(element.textContent);
            if (formula) runs.push({ text: formula, color: '#0e5fc4', ...inherited });
            return;
          }
          const next = { ...inherited };
          if (tag === 'strong' || tag === 'b') next.bold = true;
          if (tag === 'em' || tag === 'i') next.italics = true;
          if (tag === 'u') next.decoration = 'underline';
          if (tag === 'a') {
            next.color = '#0e5fc4';
            next.decoration = 'underline';
            const href = element.getAttribute('href');
            if (href) next.link = href;
          }
          if (tag === 'mark') {
            next.background = '#fff3a3';
          }
          if (tag === 'code') {
            next.color = '#c2413b';
            next.background = '#eef2f7';
          }
          runs.push(...collectPdfTextRuns(element, next));
        });
        return mergePdfTextRuns(runs);
      }

      function mergePdfTextRuns(runs) {
        const merged = [];
        runs.forEach((run) => {
          const previous = merged[merged.length - 1];
          const sameStyle = previous
            && previous.bold === run.bold
            && previous.italics === run.italics
            && previous.decoration === run.decoration
            && previous.color === run.color
            && previous.background === run.background
            && previous.link === run.link;
          if (sameStyle) {
            previous.text += run.text;
          } else {
            merged.push({ ...run });
          }
        });
        return merged;
      }

      function buildPdfCodeBlock(pre) {
        const code = pre.querySelector('code') || pre;
        const runs = collectPdfCodeRuns(code);
        trimPdfCodeRuns(runs);
        return {
          table: {
            widths: ['*'],
            body: [[{
              text: runs.length ? runs : [{ text: '' }],
              style: 'codeBlock',
              preserveLeadingSpaces: true,
              margin: [9, 8, 9, 8],
              border: [true, true, true, true]
            }]]
          },
          layout: {
            hLineColor: () => '#1e293b',
            vLineColor: () => '#1e293b',
            hLineWidth: () => 0.6,
            vLineWidth: () => 0.6,
            paddingLeft: () => 0,
            paddingRight: () => 0,
            paddingTop: () => 0,
            paddingBottom: () => 0,
            fillColor: () => '#0f172a'
          },
          margin: [0, 2, 0, 11]
        };
      }

      function collectPdfCodeRuns(node, inherited = {}) {
        const runs = [];
        node.childNodes.forEach((child) => {
          if (child.nodeType === Node.TEXT_NODE) {
            runs.push({ text: child.textContent, ...inherited });
            return;
          }
          if (child.nodeType !== Node.ELEMENT_NODE) return;
          const next = { ...inherited, ...getPdfCodeTokenStyle(child) };
          runs.push(...collectPdfCodeRuns(child, next));
        });
        return mergePdfTextRuns(runs);
      }

      function getPdfCodeTokenStyle(element) {
        const classes = Array.from(element.classList || []);
        const has = (...names) => names.some((name) => classes.includes(name));
        const style = {};
        if (has('hljs-comment', 'hljs-quote')) {
          style.color = '#8b949e';
          style.italics = true;
        } else if (has('hljs-keyword', 'hljs-selector-tag', 'hljs-subst')) {
          style.color = '#ff7b72';
        } else if (has('hljs-number', 'hljs-literal', 'hljs-variable', 'hljs-template-variable')) {
          style.color = '#79c0ff';
        } else if (has('hljs-string', 'hljs-doctag', 'hljs-regexp', 'hljs-link')) {
          style.color = '#a5d6ff';
        } else if (has('hljs-title', 'hljs-section', 'hljs-selector-id')) {
          style.color = '#d2a8ff';
          style.bold = true;
        } else if (has('hljs-type')) {
          style.color = '#ffa657';
        } else if (has('hljs-tag', 'hljs-name', 'hljs-attribute')) {
          style.color = '#7ee787';
        } else if (has('hljs-symbol', 'hljs-bullet')) {
          style.color = '#f2cc60';
        } else if (has('hljs-built_in', 'hljs-builtin-name')) {
          style.color = '#ffa657';
        } else if (has('hljs-meta')) {
          style.color = '#8b949e';
        }
        if (has('hljs-deletion')) style.background = '#4a1d24';
        if (has('hljs-addition')) style.background = '#173f2a';
        return style;
      }

      function trimPdfCodeRuns(runs) {
        while (runs.length) {
          const last = runs[runs.length - 1];
          last.text = String(last.text || '').replace(/\n+$/g, '');
          if (last.text) break;
          runs.pop();
        }
      }

      async function buildPdfInlineFormulaRow(paragraph) {
        const formulas = Array.from(paragraph.querySelectorAll('.math-inline svg'));
        if (!formulas.length) return null;
        const parts = [];
        paragraph.childNodes.forEach((child) => {
          if (child.nodeType === Node.TEXT_NODE) {
            const text = normalizePdfText(child.textContent);
            if (text) parts.push({ type: 'text', text });
            return;
          }
          if (child.nodeType !== Node.ELEMENT_NODE) return;
          if (child.classList.contains('math-inline')) {
            const svg = child.querySelector('svg');
            if (svg) parts.push({ type: 'svg', svg });
            return;
          }
          const text = normalizePdfText(child.textContent);
          if (text) parts.push({ type: 'text', text });
        });
        const textLength = parts.filter((part) => part.type === 'text').reduce((total, part) => total + part.text.length, 0);
        if (!parts.length || parts.length > 7 || textLength > 80) return null;

        const columns = parts.map((part) => {
          if (part.type === 'text') {
            return { text: part.text, width: 'auto' };
          }
          const size = getSvgNaturalSize(part.svg);
          const rendered = getRenderedPdfSize(part.svg, size);
          const height = clamp(rendered.height || 12, 9, 15);
          const width = Math.min(95, Math.max(16, height * (size.width / size.height)));
          return {
            svg: getSvgMarkup(part.svg),
            fit: [width, height],
            width
          };
        });
        return {
          columns,
          columnGap: 2,
          margin: [0, 0, 0, 8]
        };
      }

      async function buildPdfSvgBlock(node, type) {
        let svgMarkup = '';
        let size = null;
        let renderedSize = null;
        if (type === 'mermaid') {
          const renderedMermaid = await getMermaidSvgForPdf(node);
          if (renderedMermaid) {
            svgMarkup = renderedMermaid.markup;
            size = renderedMermaid.size;
            renderedSize = renderedMermaid.renderedSize;
          }
        }
        if (!svgMarkup) {
          const svg = node.querySelector('svg');
          if (!svg) return { text: node.dataset.md || normalizePdfText(node.textContent), style: 'paragraph' };
          svgMarkup = getSvgMarkup(svg);
          size = getSvgNaturalSize(svg);
          renderedSize = getRenderedPdfSize(svg, size);
        }
        if (!size) size = getSvgMarkupSize(svgMarkup);
        if (!renderedSize) renderedSize = { width: 0, height: 0 };

        const visualRatio = getPreviewWidthRatio(node, type === 'formula' ? 0.32 : 0.86);
        const fallbackWidth = PDF_CONTENT_WIDTH * visualRatio;
        const maxWidth = PDF_CONTENT_WIDTH * (type === 'formula' ? 0.72 : 0.96);
        const maxHeight = PDF_CONTENT_HEIGHT * (type === 'formula' ? 0.18 : 0.42);
        const naturalRatio = size.width / size.height || 1.6;
        let width = renderedSize.width || fallbackWidth;
        let height = renderedSize.height || (width / naturalRatio);
        if (width > maxWidth) {
          width = maxWidth;
          height = width / naturalRatio;
        }
        if (height > maxHeight) {
          height = maxHeight;
          width = height * naturalRatio;
        }
        width = Math.max(24, width);
        height = Math.max(12, height);

        // 公式仍然保留 pdfmake 的 SVG 矢量输出，保证文字和公式清晰可缩放。
        if (type !== 'mermaid') {
          return {
            svg: svgMarkup,
            fit: [width, height],
            alignment: 'center',
            margin: [0, 2, 0, 10]
          };
        }

        // Mermaid 图不要再交给 pdfmake 解析 SVG 形状，而是先按预览结果栅格化成 PNG。
        // 这样可以避开 foreignObject、marker、clipPath、复杂 path 等 SVG 兼容性问题。
        const raster = await svgMarkupToPngDataUrl(svgMarkup, size, 2.2);
        const diagramBlock = raster
          ? { image: raster, fit: [width, height], alignment: 'center' }
          : { text: node.dataset.md || normalizePdfText(node.textContent), style: 'paragraph', color: '#667085' };
        if (!raster) pdfExportWarnings.push('Mermaid 流程图未能栅格化');
        return {
          table: {
            widths: ['*'],
            body: [[{
              stack: [diagramBlock],
              fillColor: '#f9fbff',
              margin: [10, 10, 10, 10],
              border: [true, true, true, true]
            }]]
          },
          layout: {
            hLineColor: () => '#d9e0ea',
            vLineColor: () => '#d9e0ea',
            hLineWidth: () => 0.6,
            vLineWidth: () => 0.6,
            paddingLeft: () => 0,
            paddingRight: () => 0,
            paddingTop: () => 0,
            paddingBottom: () => 0
          },
          margin: [0, 6, 0, 12]
        };
      }

      async function getMermaidSvgForPdf(node) {
        const source = extractMermaidSource(node);
        if (!source || !window.mermaid || !window.mermaid.render) return null;
        const previousTheme = getTheme() === 'dark' ? 'dark' : 'default';
        const host = document.createElement('div');
        host.style.position = 'fixed';
        host.style.left = '-10000px';
        host.style.top = '0';
        host.style.width = `${Math.max(320, getPreviewContentWidth())}px`;
        host.style.visibility = 'hidden';
        host.style.pointerEvents = 'none';
        document.body.appendChild(host);
        try {
          window.mermaid.initialize({
            startOnLoad: false,
            securityLevel: 'loose',
            theme: previousTheme,
            themeVariables: {
              fontFamily: `${PDF_FONT_NAME}, Microsoft YaHei, sans-serif`
            },
            flowchart: {
              useMaxWidth: true,
              htmlLabels: false
            }
          });
          const result = await window.mermaid.render(`pdf-mermaid-${Date.now()}-${Math.random().toString(36).slice(2)}`, source);
          host.innerHTML = result.svg;
          const svg = host.querySelector('svg');
          if (!svg) return null;
          const size = getSvgNaturalSize(svg);
          return {
            markup: getSvgMarkup(svg),
            size,
            renderedSize: getRenderedPdfSize(svg, size)
          };
        } finally {
          host.remove();
          window.mermaid.initialize({
            startOnLoad: false,
            securityLevel: 'loose',
            theme: previousTheme,
            flowchart: {
              useMaxWidth: true,
              htmlLabels: true
            }
          });
        }
      }

      async function buildPdfImageBlock(node) {
        const image = node.matches('img') ? node : node.querySelector('img');
        if (!image) return null;
        const source = await getPdfImageSource(image);
        const size = await getImageNaturalSize(image);
        const visualRatio = getImageWidthRatio(image);
        const width = Math.min(PDF_CONTENT_WIDTH * visualRatio, PDF_CONTENT_WIDTH);
        const maxHeight = PDF_CONTENT_HEIGHT * 0.36;
        const height = size.width && size.height ? width * (size.height / size.width) : width * 0.42;
        const block = node.matches('img') ? image.closest('.image-block') : node;
        if (!source) {
          return buildPdfImagePlaceholder(image, block);
        }
        return {
          image: source.dataUrl,
          fit: [width, Math.min(maxHeight, Math.max(40, height))],
          alignment: block ? parseImageAlign(block) : 'center',
          margin: [0, 6, 0, 12]
        };
      }

      async function getPdfImageSource(image) {
        const src = image.currentSrc || image.src || image.getAttribute('src');
        if (!src) throw new Error('图片地址为空，无法导出 PDF');

        // pdfmake 对 SVG 形状解析不够稳，这里统一把 SVG 图片先转成 PNG。
        if (/^data:image\/svg\+xml/i.test(src)) {
          const svgMarkup = decodeSvgDataUrl(src);
          const size = getSvgMarkupSize(svgMarkup);
          const dataUrl = await svgMarkupToPngDataUrl(svgMarkup, size, 2.2);
          if (dataUrl) return { type: 'image', dataUrl };
          pdfExportWarnings.push(src);
          return null;
        }

        // PNG/JPEG 可以直接写入；WEBP 和其他可绘制图片则转成 PNG，提高 pdfmake 兼容性。
        if (/^data:image\/(png|jpe?g);/i.test(src)) {
          return { type: 'image', dataUrl: src };
        }
        const dataUrl = await imageElementToDataUrl(image);
        if (dataUrl) return { type: 'image', dataUrl };
        pdfExportWarnings.push(src);
        return null;
      }

      async function imageElementToDataUrl(image) {
        try {
          if (!image.complete || !image.naturalWidth || !image.naturalHeight) return '';
          const canvas = document.createElement('canvas');
          canvas.width = image.naturalWidth;
          canvas.height = image.naturalHeight;
          const context = canvas.getContext('2d');
          context.drawImage(image, 0, 0);
          return canvas.toDataURL('image/png');
        } catch (_) {
          return '';
        }
      }

      function svgMarkupToPngDataUrl(markup, size = null, scale = 2) {
        return new Promise((resolve) => {
          try {
            const naturalSize = size || getSvgMarkupSize(markup);
            const width = Math.max(1, Math.ceil(naturalSize.width || 1));
            const height = Math.max(1, Math.ceil(naturalSize.height || 1));
            const ratio = Math.max(1, Math.min(4, scale || 2));
            const svgBlob = new Blob([markup], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(svgBlob);
            const image = new Image();
            image.onload = () => {
              try {
                const canvas = document.createElement('canvas');
                canvas.width = Math.ceil(width * ratio);
                canvas.height = Math.ceil(height * ratio);
                const context = canvas.getContext('2d');
                context.setTransform(ratio, 0, 0, ratio, 0, 0);
                context.clearRect(0, 0, width, height);
                context.drawImage(image, 0, 0, width, height);
                URL.revokeObjectURL(url);
                resolve(canvas.toDataURL('image/png'));
              } catch (_) {
                URL.revokeObjectURL(url);
                resolve('');
              }
            };
            image.onerror = () => {
              URL.revokeObjectURL(url);
              resolve('');
            };
            image.src = url;
          } catch (_) {
            resolve('');
          }
        });
      }

      function decodeSvgDataUrl(src) {
        const commaIndex = src.indexOf(',');
        if (commaIndex < 0) throw new Error('SVG 图片 data URL 格式不正确');
        const meta = src.slice(0, commaIndex);
        const payload = src.slice(commaIndex + 1);
        const svg = /;base64/i.test(meta) ? atob(payload) : decodeURIComponent(payload);
        return normalizeSvgMarkup(svg);
      }

      function buildPdfImagePlaceholder(image, block) {
        const alt = image.getAttribute('alt') || '图片';
        const src = image.getAttribute('src') || image.currentSrc || '';
        const label = isRemoteUrl(src) ? '外链图片未嵌入' : '图片未能嵌入';
        const hint = isRemoteUrl(src)
          ? '为保证 PDF 导出完全本地化，未把远程图片地址交给 PDF 引擎。请改用本地图片插入或 data URL。'
          : '浏览器未允许读取该图片像素，无法写入 PDF。';
        return {
          table: {
            widths: ['*'],
            body: [[{
              text: [
                { text: label, bold: true, color: '#667085' },
                { text: `\n${alt}`, color: '#172033' },
                { text: `\n${hint}`, color: '#667085', fontSize: 8.5 }
              ],
              fillColor: '#f9fbff',
              margin: [10, 9, 10, 9],
              border: [true, true, true, true]
            }]]
          },
          layout: {
            hLineColor: () => '#d9e0ea',
            vLineColor: () => '#d9e0ea',
            hLineWidth: () => 0.6,
            vLineWidth: () => 0.6,
            paddingLeft: () => 0,
            paddingRight: () => 0,
            paddingTop: () => 0,
            paddingBottom: () => 0
          },
          alignment: block ? parseImageAlign(block) : 'center',
          margin: [0, 6, 0, 12]
        };
      }

      function isRemoteUrl(src) {
        return /^https?:\/\//i.test(String(src || ''));
      }

      function getImageNaturalSize(image) {
        if (image.naturalWidth && image.naturalHeight) {
          return Promise.resolve({ width: image.naturalWidth, height: image.naturalHeight });
        }
        const src = image.currentSrc || image.src || image.getAttribute('src');
        const attrWidth = Number.parseFloat(image.getAttribute('width')) || 1;
        const attrHeight = Number.parseFloat(image.getAttribute('height')) || 1;
        if (isRemoteUrl(src)) {
          return Promise.resolve({ width: attrWidth, height: attrHeight });
        }
        return new Promise((resolve) => {
          const probe = new Image();
          probe.onload = () => resolve({ width: probe.naturalWidth || 1, height: probe.naturalHeight || 1 });
          probe.onerror = () => resolve({ width: 1, height: 1 });
          probe.src = src;
        });
      }

      function getImageWidthRatio(image) {
        const raw = image.style.width || image.getAttribute('width') || '';
        const percent = String(raw).match(/([\d.]+)\s*%/);
        if (percent) return clamp(Number.parseFloat(percent[1]) / 100, 0.12, 1);
        return getPreviewWidthRatio(image, 0.7);
      }

      function buildPdfTable(table) {
        const model = buildTableGrid(table);
        const columnCount = model.columnCount;
        const columnWidths = getTableColumnWidths(table, model);
        const totalColumnWidth = columnWidths.reduce((total, width) => total + width, 0) || columnCount;
        const pdfColumnWidths = columnWidths.map((width) => Math.max(24, (width / totalColumnWidth) * PDF_CONTENT_WIDTH));
        const body = model.rows.map(() => Array(columnCount).fill(null));
        getUniqueTableMetas(model).forEach((meta) => {
          const cellDefinition = {
            text: collectPdfTextRuns(meta.cell),
            style: meta.cell.tagName.toLowerCase() === 'th' ? 'tableHeader' : 'tableCell',
            margin: [0, 2, 0, 2]
          };
          if (meta.colSpan > 1) {
            cellDefinition.colSpan = meta.colSpan;
          }
          if (meta.rowSpan > 1) {
            cellDefinition.rowSpan = meta.rowSpan;
          }
          if (body[meta.rowStart]) {
            body[meta.rowStart][meta.colStart] = cellDefinition;
          }
          for (let row = meta.rowStart; row <= meta.rowEnd; row += 1) {
            for (let col = meta.colStart; col <= meta.colEnd; col += 1) {
              if (row === meta.rowStart && col === meta.colStart) continue;
              if (body[row]) {
                body[row][col] = {};
              }
            }
          }
        });
        body.forEach((row) => {
          for (let col = 0; col < columnCount; col += 1) {
            if (!row[col]) {
              row[col] = { text: '', style: 'tableCell' };
            }
          }
        });
        const headerRows = table.tHead ? Math.min(table.tHead.rows.length, body.length) : 0;
        return {
          table: {
            headerRows,
            widths: pdfColumnWidths,
            body
          },
          layout: {
            hLineColor: () => '#d9e0ea',
            vLineColor: () => '#d9e0ea',
            hLineWidth: () => 0.6,
            vLineWidth: () => 0.6,
            paddingLeft: () => 5,
            paddingRight: () => 5,
            paddingTop: () => 4,
            paddingBottom: () => 4,
            fillColor: (rowIndex) => rowIndex === 0 && table.querySelector('thead') ? '#f9fbff' : null
          },
          margin: [0, 4, 0, 12]
        };
      }

      function getPreviewWidthRatio(node, fallback) {
        const contentWidth = getPreviewContentWidth();
        const nodeRect = node.getBoundingClientRect();
        if (contentWidth && nodeRect.width) {
          return clamp(nodeRect.width / contentWidth, 0.12, 1);
        }
        return fallback;
      }

      function getRenderedPdfSize(element, naturalSize = null) {
        if (element && element.getBoundingClientRect) {
          const rect = element.getBoundingClientRect();
          if (rect.width && rect.height) {
            return {
              width: pxToPdfPoints(rect.width),
              height: pxToPdfPoints(rect.height)
            };
          }
        }
        if (naturalSize && naturalSize.width && naturalSize.height) {
          const width = Math.min(PDF_CONTENT_WIDTH * 0.7, naturalSize.width * 0.72);
          return {
            width,
            height: width * (naturalSize.height / naturalSize.width)
          };
        }
        return { width: 0, height: 0 };
      }

      function pxToPdfPoints(px) {
        return px * (PDF_CONTENT_WIDTH / getPreviewContentWidth());
      }

      function getPreviewContentWidth() {
        const rect = preview.getBoundingClientRect();
        if (!rect.width) return 980;
        const style = window.getComputedStyle(preview);
        const paddingLeft = Number.parseFloat(style.paddingLeft) || 0;
        const paddingRight = Number.parseFloat(style.paddingRight) || 0;
        return Math.max(1, rect.width - paddingLeft - paddingRight);
      }

      function getSvgMarkup(svg) {
        const clone = svg.cloneNode(true);
        inlineSvgComputedStyles(svg, clone);
        clone.querySelectorAll('script, foreignObject, style').forEach((item) => item.remove());
        clone.querySelectorAll('text, tspan').forEach((item) => {
          if (!item.getAttribute('font-family')) item.setAttribute('font-family', PDF_FONT_NAME);
        });
        if (!clone.getAttribute('xmlns')) clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        const size = getSvgNaturalSize(clone);
        if (!clone.getAttribute('viewBox')) clone.setAttribute('viewBox', `0 0 ${size.width} ${size.height}`);
        clone.setAttribute('width', String(size.width));
        clone.setAttribute('height', String(size.height));
        return new XMLSerializer().serializeToString(clone);
      }

      function inlineSvgComputedStyles(sourceSvg, cloneSvg) {
        if (!sourceSvg || !cloneSvg || !window.getComputedStyle) return;
        const sourceNodes = [sourceSvg, ...sourceSvg.querySelectorAll('*')];
        const cloneNodes = [cloneSvg, ...cloneSvg.querySelectorAll('*')];
        sourceNodes.forEach((sourceNode, index) => {
          const cloneNode = cloneNodes[index];
          if (!cloneNode || cloneNode.nodeType !== Node.ELEMENT_NODE) return;
          const style = window.getComputedStyle(sourceNode);
          if (!style) return;
          inlineSvgStyleProperty(cloneNode, style, 'fill');
          inlineSvgStyleProperty(cloneNode, style, 'stroke');
          inlineSvgStyleProperty(cloneNode, style, 'stroke-width');
          inlineSvgStyleProperty(cloneNode, style, 'stroke-opacity');
          inlineSvgStyleProperty(cloneNode, style, 'fill-opacity');
          inlineSvgStyleProperty(cloneNode, style, 'opacity');
          inlineSvgStyleProperty(cloneNode, style, 'text-anchor');
          inlineSvgStyleProperty(cloneNode, style, 'dominant-baseline');
          inlineSvgStyleProperty(cloneNode, style, 'font-size');
          inlineSvgStyleProperty(cloneNode, style, 'font-weight');
          inlineSvgStyleProperty(cloneNode, style, 'font-style');
          if (/^(text|tspan)$/i.test(cloneNode.tagName)) {
            cloneNode.setAttribute('font-family', PDF_FONT_NAME);
          }
        });
      }

      function inlineSvgStyleProperty(node, computedStyle, property) {
        const value = computedStyle.getPropertyValue(property);
        if (!value || value === 'auto' || value === 'normal') return;
        if (node.hasAttribute(property) && !String(node.getAttribute('class') || '').trim()) return;
        if ((property === 'fill' || property === 'stroke') && value === 'none') {
          node.setAttribute(property, 'none');
          return;
        }
        node.setAttribute(property, normalizeSvgColor(value));
      }

      function normalizeSvgColor(value) {
        const color = String(value || '').trim();
        const match = color.match(/^rgba?\(([^)]+)\)$/i);
        if (!match) return color;
        const parts = match[1].split(',').map((part) => Number.parseFloat(part.trim()));
        if (parts.length >= 4 && parts[3] === 0) return 'none';
        if (parts.length < 3 || parts.slice(0, 3).some((part) => !Number.isFinite(part))) return color;
        return `#${parts.slice(0, 3).map((part) => clamp(Math.round(part), 0, 255).toString(16).padStart(2, '0')).join('')}`;
      }

      function normalizeSvgMarkup(markup) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(markup, 'image/svg+xml');
        const svg = doc.documentElement;
        return getSvgMarkup(svg);
      }

      function getSvgMarkupSize(markup) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(markup, 'image/svg+xml');
        return getSvgNaturalSize(doc.documentElement);
      }

      function getSvgNaturalSize(svg) {
        const viewBox = svg.getAttribute('viewBox');
        if (viewBox) {
          const parts = viewBox.trim().split(/[\s,]+/).map(Number);
          if (parts.length >= 4 && parts[2] && parts[3]) {
            return { width: Math.abs(parts[2]), height: Math.abs(parts[3]) };
          }
        }
        const width = Number.parseFloat(svg.getAttribute('width')) || Number.parseFloat(svg.style.width) || 240;
        const height = Number.parseFloat(svg.getAttribute('height')) || Number.parseFloat(svg.style.height) || 120;
        return {
          width: Math.max(width, 1),
          height: Math.max(height, 1)
        };
      }

      function normalizePdfText(text) {
        return String(text || '').replace(/\u00a0/g, ' ').replace(/[ \t\r\n]+/g, ' ').trim();
      }

      function normalizePdfInlineText(text) {
        return String(text || '').replace(/\u00a0/g, ' ').replace(/[ \t\r\n]+/g, ' ');
      }

      function clamp(value, min, max) {
        return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
      }

      function syncDocumentData(markdown, meta = {}) {
        if (!documentData || typeof documentData.setMarkdown !== 'function') return;
        documentData.setMarkdown(markdown, Object.assign({
          title: getMarkdownTitle(),
          fileName: currentFileName || sampleName,
          view: currentView
        }, meta));
        notifyHostChange(meta);
      }

      function loadMarkdown(markdown, meta = {}) {
        const normalized = meta.normalize === false
          ? { content: String(markdown || ''), mode: numberingModeSelect.value || 'none', changed: false, reason: 'raw' }
          : normalizeLoadedMarkdown(markdown);
        if ((normalized.mode === 'none' || normalized.reason === 'inferred') && ['mode1', 'mode2', 'mode3', 'none'].includes(meta.numberingMode)) {
          normalized.mode = meta.numberingMode;
          numberingModeSelect.value = normalized.mode;
          localStorage.setItem('markdown-viewer-numbering-mode', normalized.mode);
        }
        currentFileName = meta.fileName || meta.name || currentFileName || sampleName;
        input.value = normalized.content;
        fileName.textContent = currentFileName;
        fileDetail.textContent = meta.detail || '外部载入';
        updatedText.textContent = meta.updatedText || (normalized.changed ? '已接管编号' : '已载入');
        setMessage(getLoadMessage(normalized));
        syncDocumentData(input.value, Object.assign({}, meta, {
          source: meta.source || 'api',
          normalized,
          numberingMode: normalized.mode
        }));
        scheduleRender(0);
      }

      function notifyHostChange(meta = {}) {
        window.clearTimeout(hostNotifyTimer);
        hostNotifyTimer = window.setTimeout(() => {
          postHostMessage('markcom:change', Object.assign(getMarkComState(), { meta }));
        }, 80);
      }

      function postHostMessage(type, payload) {
        const message = Object.assign({ type }, payload || {});
        window.dispatchEvent(new CustomEvent(type, { detail: message }));
        if (window.parent && window.parent !== window) {
          window.parent.postMessage(message, '*');
        }
      }

      function getMarkComState() {
        return {
          view: currentView,
          fileName: currentFileName,
          numberingMode: numberingModeSelect.value,
          markdown: input.value,
          document: documentData ? documentData.snapshot() : null
        };
      }

      async function setView(view) {
        if (!['preview', 'source'].includes(view)) return;
        if (currentView === 'preview' && view === 'source') {
          await flushPreviewEdits();
        }
        currentView = view;
        syncDocumentData(input.value, { source: 'view', view });
        app.classList.toggle('preview-mode', view === 'preview');
        app.classList.toggle('source-mode', view === 'source');
        documentTitle.innerHTML = view === 'preview'
          ? '<i data-lucide="eye"></i><span>预览编辑</span>'
          : '<i data-lucide="braces"></i><span>源码编辑</span>';
        viewButtons.forEach((button) => {
          button.classList.toggle('active', button.dataset.view === view);
        });
        if (view === 'preview') {
          await renderMarkdown();
        } else {
          updateSourceStats(input.value);
        }
        createIcons();
      }

      function toggleTheme() {
        const next = getTheme() === 'dark' ? 'light' : 'dark';
        document.documentElement.dataset.theme = next;
        localStorage.setItem('markdown-viewer-theme', next);
        if (window.mermaid) {
          window.mermaid.initialize({
            startOnLoad: false,
            securityLevel: 'loose',
            theme: next === 'dark' ? 'dark' : 'default',
            flowchart: {
              useMaxWidth: true,
              htmlLabels: true
            }
          });
        }
        themeToggle.innerHTML = next === 'dark' ? '<i data-lucide="sun"></i>' : '<i data-lucide="moon"></i>';
        createIcons();
        scheduleRender(0);
      }

      function hydrateTheme() {
        const saved = localStorage.getItem('markdown-viewer-theme');
        const theme = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        document.documentElement.dataset.theme = theme;
        themeToggle.innerHTML = theme === 'dark' ? '<i data-lucide="sun"></i>' : '<i data-lucide="moon"></i>';
      }

      function getTheme() {
        return document.documentElement.dataset.theme || 'light';
      }

      function updateSourceStats(source) {
        const chars = source.length;
        const words = source.trim() ? source.trim().split(/\s+/).length : 0;
        const bytes = new Blob([source]).size;
        sizeText.textContent = formatBytes(bytes);
        if (currentView === 'source') {
          renderStats.textContent = `${chars} 字符 · ${words} 词`;
        }
      }

      function updateRenderStats() {
        if (currentView === 'source') {
          updateSourceStats(input.value);
          return;
        }
        const headings = preview.querySelectorAll('h1,h2,h3,h4,h5,h6').length;
        const blocks = preview.querySelectorAll('pre').length;
        const diagrams = preview.querySelectorAll('.mermaid, .echarts-chart, .music-score').length;
        renderStats.textContent = `${headings} 标题 · ${blocks} 代码块 · ${diagrams} 图表`;
      }

      function setMessage(message, isError = false) {
        messageText.textContent = message;
        messageText.style.color = isError ? 'var(--danger)' : 'var(--muted)';
      }

      function showToast(message) {
        toast.textContent = message;
        toast.classList.add('show');
        window.clearTimeout(toastTimer);
        toastTimer = window.setTimeout(() => toast.classList.remove('show'), 2200);
      }

      function getExportTitle() {
        const firstHeading = preview.querySelector('h1,h2,h3');
        const fromHeading = firstHeading ? firstHeading.textContent.trim() : '';
        const fromFile = currentFileName ? currentFileName.replace(/\.[^.]+$/, '') : '';
        return fromHeading || fromFile || 'markdown-preview';
      }

      function getMarkdownTitle() {
        const heading = input.value.split(/\r?\n/).map((line) => line.match(/^\s{0,3}#{1,6}\s+(.+?)\s*#*\s*$/)).find(Boolean);
        const fromHeading = heading ? heading[1].replace(/[`*_~[\]()]/g, '').trim() : '';
        const fromFile = currentFileName ? currentFileName.replace(/\.[^.]+$/, '') : '';
        return fromHeading || fromFile || 'markdown-preview';
      }

      function getExportThemeVariables() {
        return [
          '      --panel: #ffffff;',
          '      --panel-soft: #f9fbff;',
          '      --text: #172033;',
          '      --muted: #667085;',
          '      --line: #d9e0ea;',
          '      --inline-code-bg: #eef2f7;',
          '      --accent: #1b74e4;',
          '      --accent-strong: #0e5fc4;',
          '      --danger: #c2413b;'
        ].join('\n');
      }

      function getExportContentStyleCss() {
        const inlineStyle = document.getElementById('content-style');
        if (inlineStyle) return inlineStyle.textContent;

        return Array.from(document.styleSheets)
          .map((sheet) => {
            try {
              return Array.from(sheet.cssRules || []).map((rule) => rule.cssText).join('\n');
            } catch (error) {
              return '';
            }
          })
          .filter(Boolean)
          .join('\n');
      }

      function downloadBlob(filename, content, type) {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
      }

      async function copyText(text) {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
          return;
        }
        const helper = document.createElement('textarea');
        helper.value = text;
        helper.setAttribute('readonly', '');
        helper.style.position = 'fixed';
        helper.style.left = '-9999px';
        document.body.appendChild(helper);
        helper.select();
        document.execCommand('copy');
        helper.remove();
      }

      function formatBytes(bytes) {
        if (!bytes) return '0 KB';
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let index = 0;
        while (size >= 1024 && index < units.length - 1) {
          size /= 1024;
          index += 1;
        }
        return `${size.toFixed(index ? 1 : 0)} ${units[index]}`;
      }

      function formatTime(date) {
        return new Intl.DateTimeFormat('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }).format(date);
      }

      function sanitizeFileName(name) {
        return (name || 'markdown-preview')
          .replace(/[\\/:*?"<>|]+/g, '-')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 90) || 'markdown-preview';
      }

      function escapeHtml(value) {
        return String(value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
      }

      function indentHtml(html, spaces) {
        const pad = ' '.repeat(spaces);
        return html.split('\n').map((line) => `${pad}${line}`).join('\n');
      }

      function createIcons() {
        if (window.lucide) {
          window.lucide.createIcons({
            attrs: {
              width: 18,
              height: 18,
              'stroke-width': 2
            }
          });
        }
      }

      window.MarkCom = Object.assign(window.MarkCom || {}, {
        data: documentData,
        views: {
          editor: editorView,
          outline: outlineView,
          classes: ViewClasses
        },
        getMarkdown: () => input.value,
        getNumberedMarkdown: () => addHeadingNumberingToMarkdown(input.value),
        async getMarkdownForSave() {
          await flushPreviewEdits();
          return addHeadingNumberingToMarkdown(input.value);
        },
        getNumberingMode: () => numberingModeSelect.value,
        setMarkdown: loadMarkdown,
        setView,
        setTabs(tabs, activeTabId) {
          setHostTabs({ tabs, activeTabId });
        },
        setNumberingMode,
        toggleOutline,
        toggleTheme,
        render: renderMarkdown,
        exportHtml,
        exportPdf,
        exportMarkdown,
        registerBlockType(definition) {
          if (!documentData || typeof documentData.registerBlockType !== 'function') return null;
          documentData.registerBlockType(definition);
          documentData.reparse();
          return documentData;
        },
        connect(adapter) {
          if (!documentData || typeof documentData.connect !== 'function') return null;
          return documentData.connect(adapter);
        },
        getState() {
          return getMarkComState();
        }
      });
    })();
