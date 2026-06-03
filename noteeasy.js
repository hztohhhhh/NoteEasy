(function () {
  'use strict';

  const AUTOSAVE_DELAY = 3000;
  const api = window.noteEasyApi || null;

  const app = document.getElementById('noteeasyApp');
  const editorFrame = document.getElementById('editorFrame');
  const fileName = document.getElementById('fileName');
  const fileDetail = document.getElementById('fileDetail');
  const fileInput = document.getElementById('fileInput');
  const openFileButton = document.getElementById('openFile');
  const openRepositoryButton = document.getElementById('openRepository');
  const explorerToggle = document.getElementById('explorerToggle');
  const explorerResizer = document.getElementById('explorerResizer');
  const exportHtmlButton = document.getElementById('exportHtml');
  const exportPdfButton = document.getElementById('exportPdf');
  const exportMdButton = document.getElementById('exportMd');
  const outlineToggle = document.getElementById('outlineToggle');
  const numberingMode = document.getElementById('numberingMode');
  const themeToggle = document.getElementById('themeToggle');
  const viewButtons = Array.from(app ? app.querySelectorAll(':scope > .toolbar [data-view]') : document.querySelectorAll('[data-view]'));
  const newNoteButton = document.getElementById('newNoteButton');
  const newFolderButton = document.getElementById('newFolderButton');
  const refreshTreeButton = document.getElementById('refreshTreeButton');
  const treeSearchToggle = document.getElementById('treeSearchToggle');
  const explorerPane = document.querySelector('.explorer-pane');
  const treeSearch = document.getElementById('treeSearch');
  const fileTree = document.getElementById('fileTree');
  const statusText = document.getElementById('noteStatusText');
  const currentFileText = document.getElementById('currentFileText');
  const currentPathText = document.getElementById('currentPathText');
  const sizeText = document.getElementById('noteSizeText');
  const statsText = document.getElementById('statsText');
  const updatedText = document.getElementById('noteUpdatedText');
  const messageText = document.getElementById('noteMessageText');
  const toast = document.getElementById('noteToast');

  let rootPath = '';
  let workspaceSources = [];
  let workspaceRoot = null;
  let treeRoot = null;
  let selectedSourceId = '';
  let selectedPath = '';
  let selectedType = '';
  let expandedTreePaths = new Set();
  let tabs = [];
  let activeTabId = '';
  let editorReady = Boolean(window.MarkCom);
  let autoSaveTimer = 0;
  let toastTimer = 0;
  let workspaceMenu = null;
  let workspaceMenuCloseHandler = null;
  let currentView = 'preview';
  const DirectoryFileModelClass = window.MarkData && window.MarkData.DirectoryFileDataModel;
  const DirectoryFileViewClass = window.MarkComViews && window.MarkComViews.DirectoryFileView;
  const directoryFileModel = DirectoryFileModelClass
    ? new DirectoryFileModelClass({ source: api && api.isElectron ? 'workspace' : 'storage' })
    : null;
  const directoryFileView = DirectoryFileViewClass ? new DirectoryFileViewClass({
    root: fileTree,
    emptyText: '请选择一个文件夹作为笔记仓库',
    noMatchText: '没有匹配的 Markdown 笔记',
    getQuery: () => treeSearch.value,
    getActivePath: () => {
      const tab = getActiveTab();
      return tab ? tab.path : '';
    },
    getSelectedPath: () => selectedPath,
    onSelect: handleDirectoryFileSelect,
    renderIcons: createIcons
  }) : null;
  if (directoryFileView) {
    directoryFileView.emptyText = '请选择或添加一个工作区';
    directoryFileView.noMatchText = '没有匹配的工作区项目';
  }
  if (directoryFileView && directoryFileModel) directoryFileView.connect(directoryFileModel);

  init();

  function init() {
    bindEvents();
    createIcons();
    hydrate();
  }

  function bindEvents() {
    openFileButton.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', openLocalMarkdownFile);
    openRepositoryButton.addEventListener('click', openWorkspaceMenu);
    explorerToggle.addEventListener('click', toggleExplorer);
    explorerResizer.addEventListener('pointerdown', startExplorerResize);
    exportHtmlButton.addEventListener('click', () => runEditorCommand('exportHtml'));
    exportPdfButton.addEventListener('click', () => runEditorCommand('exportPdf'));
    exportMdButton.addEventListener('click', () => runEditorCommand('exportMarkdown'));
    outlineToggle.addEventListener('click', () => runEditorCommand('toggleOutline'));
    numberingMode.addEventListener('change', () => {
      const tab = getActiveTab();
      if (tab && tab.numberingMode !== numberingMode.value) {
        tab.numberingMode = numberingMode.value;
        tab.dirty = true;
        renderTabs();
        setSaveState('自动保存等待中');
        scheduleAutoSave();
      }
      runEditorCommand('setNumberingMode', { mode: numberingMode.value });
    });
    themeToggle.addEventListener('click', toggleTheme);
    viewButtons.forEach((button) => {
      button.addEventListener('click', () => setEditorView(button.dataset.view));
    });
    refreshTreeButton.addEventListener('click', () => refreshFileTree());
    newNoteButton.addEventListener('click', () => createItem('file'));
    newFolderButton.addEventListener('click', () => createItem('folder'));
    treeSearchToggle.addEventListener('click', () => {
      explorerPane.classList.toggle('search-visible');
      if (explorerPane.classList.contains('search-visible')) treeSearch.focus();
    });
    treeSearch.addEventListener('input', renderFileTree);
    if (!directoryFileView) fileTree.addEventListener('click', handleFileTreeClick);
    fileTree.addEventListener('contextmenu', handleFileTreeContextMenu);
    if (editorFrame) {
      editorFrame.addEventListener('load', () => {
        editorReady = true;
        applyActiveTabToEditor();
        renderTabs();
      });

      window.addEventListener('message', async (event) => {
        if (event.source !== editorFrame.contentWindow) return;
        await handleMarkComEvent(event.data || {});
      });
    } else {
      editorReady = Boolean(window.MarkCom);
      window.addEventListener('markcom:change', (event) => handleEditorChange(event.detail || {}));
      window.addEventListener('markcom:tabSelect', (event) => activateTab((event.detail || {}).tabId));
      window.addEventListener('markcom:tabClose', (event) => closeTab((event.detail || {}).tabId));
      window.addEventListener('markcom:tabPin', (event) => pinTab((event.detail || {}).tabId));
      window.setTimeout(() => {
        applyActiveTabToEditor();
        renderTabs();
      }, 0);
    }

    document.addEventListener('keydown', (event) => {
      const saveShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's';
      if (saveShortcut) {
        event.preventDefault();
        saveActiveTab();
      }
    });

    if (api && typeof api.onRepositoryChanged === 'function') {
      api.onRepositoryChanged(() => refreshFileTree(false));
    }
    if (api && typeof api.onWorkspaceChanged === 'function') {
      api.onWorkspaceChanged(() => refreshFileTree(false));
    }
  }

  async function handleMarkComEvent(message) {
    if (!message || typeof message !== 'object') return;
    if (message.type === 'markcom:tabSelect') {
      await activateTab(message.tabId);
      return;
    }
    if (message.type === 'markcom:tabClose') {
      await closeTab(message.tabId);
      return;
    }
    if (message.type === 'markcom:tabPin') {
      pinTab(message.tabId);
      return;
    }
    if (message.type === 'markcom:change') {
      handleEditorChange(message);
    }
  }

  async function hydrate() {
    if (!api || !api.isElectron) {
      fileDetail.textContent = '浏览器模式：文件管理不可用';
      fileTree.innerHTML = '<div class="file-tree-empty">请通过 Electron 启动 NoteEasy 以使用本地仓库</div>';
      setSaveState('浏览器模式');
      return;
    }

    try {
      const settings = await api.getSettings();
      workspaceSources = normalizeWorkspaceSources(settings.workspaceSources, settings);
      if (workspaceSources.length) {
        const lastSource = findSourceById(settings.lastSourceId) || findSourceForPath(settings.lastFilePath) || workspaceSources[0];
        selectedSourceId = lastSource ? lastSource.id : '';
        updateRootPathFromSources(lastSource);
        selectedPath = 'workspace:';
        selectedType = 'folder';
        expandedTreePaths = new Set(['workspace:'].concat(workspaceSources.map(getSourceRootPath)));
        fileDetail.textContent = getWorkspaceDetail();
        await refreshFileTree();
        if (settings.lastFilePath) {
          await openNote(settings.lastFilePath, { sourceId: selectedSourceId, preview: false });
        }
        if (!Array.isArray(settings.workspaceSources)) {
          await persistWorkspaceSources({ lastFilePath: settings.lastFilePath || '', lastSourceId: selectedSourceId });
        }
        return;
      }
      rootPath = settings.rootPath || '';
      if (rootPath) {
        fileDetail.textContent = rootPath;
        await refreshFileTree();
        if (settings.lastFilePath) {
          await openNote(settings.lastFilePath);
        }
      } else {
        setSaveState('请选择仓库');
      }
    } catch (error) {
      showToast(error.message || '初始化失败');
    }
  }

  async function openWorkspaceMenu(event) {
    if (event && typeof event.preventDefault === 'function') event.preventDefault();
    if (!api || !api.isElectron) {
      showToast('工作区需要通过 Electron 启动 NoteEasy');
      return;
    }
    if (workspaceMenu) {
      closeWorkspaceMenu();
      return;
    }
    renderWorkspaceMenu();
  }

  function renderWorkspaceMenu() {
    closeWorkspaceMenu();
    const rect = openRepositoryButton.getBoundingClientRect();
    workspaceMenu = document.createElement('div');
    workspaceMenu.className = 'workspace-menu';
    workspaceMenu.setAttribute('role', 'menu');
    workspaceMenu.innerHTML = `
      <div class="workspace-menu-section">
        <div class="workspace-menu-title">添加工作区</div>
        <button type="button" data-workspace-action="local"><i data-lucide="folder-plus"></i><span>本地目录</span></button>
        <button type="button" data-workspace-action="git"><i data-lucide="git-branch"></i><span>Git 仓库</span></button>
      </div>
      <form class="workspace-menu-section workspace-network-form" data-workspace-network>
        <div class="workspace-menu-title">网络文件</div>
        <input name="url" type="url" placeholder="https://example.com/readme.md" autocomplete="off" required>
        <input name="name" type="text" placeholder="名称（可选）" autocomplete="off">
        <button type="submit" class="primary"><i data-lucide="cloud"></i><span>添加网络来源</span></button>
      </form>
      <div class="workspace-menu-section">
        <div class="workspace-menu-title">当前工作区</div>
        <div class="workspace-source-list">
          ${renderWorkspaceSourceMenuItems()}
        </div>
      </div>`;
    document.body.appendChild(workspaceMenu);
    const menuRect = workspaceMenu.getBoundingClientRect();
    const left = Math.min(window.innerWidth - menuRect.width - 12, Math.max(12, rect.left));
    const top = Math.min(window.innerHeight - menuRect.height - 12, rect.bottom + 8);
    workspaceMenu.style.left = `${left}px`;
    workspaceMenu.style.top = `${top}px`;
    workspaceMenu.addEventListener('click', handleWorkspaceMenuClick);
    workspaceMenu.addEventListener('submit', handleWorkspaceMenuSubmit);
    workspaceMenuCloseHandler = (closeEvent) => {
      if (!workspaceMenu) return;
      if (workspaceMenu.contains(closeEvent.target) || openRepositoryButton.contains(closeEvent.target)) return;
      closeWorkspaceMenu();
    };
    window.setTimeout(() => document.addEventListener('pointerdown', workspaceMenuCloseHandler), 0);
    createIcons();
  }

  function renderWorkspaceSourceMenuItems() {
    if (!workspaceSources.length) return '<div class="workspace-menu-empty">暂无工作区</div>';
    return workspaceSources.map((source) => `
      <div class="workspace-source-item">
        <div>
          <div class="workspace-source-name">${escapeHtml(source.name)}</div>
          <div class="workspace-source-meta">${escapeHtml(source.type)} · ${escapeHtml(source.rootPath || source.url || '')}</div>
        </div>
        <button type="button" data-workspace-remove="${escapeAttr(source.id)}" title="移除工作区"><i data-lucide="x"></i></button>
      </div>
    `).join('');
  }

  async function handleWorkspaceMenuClick(event) {
    const actionButton = event.target.closest('[data-workspace-action]');
    if (actionButton) {
      const action = actionButton.dataset.workspaceAction;
      await addWorkspaceFolder(action);
      return;
    }
    const removeButton = event.target.closest('[data-workspace-remove]');
    if (removeButton) {
      await removeWorkspaceSource(removeButton.dataset.workspaceRemove);
    }
  }

  async function handleWorkspaceMenuSubmit(event) {
    const form = event.target.closest('[data-workspace-network]');
    if (!form) return;
    event.preventDefault();
    const url = String((new FormData(form)).get('url') || '').trim();
    const name = String((new FormData(form)).get('name') || '').trim();
    if (!url) return;
    try {
      const source = await api.createNetworkWorkspace(url, name);
      await addWorkspaceSource(source);
      closeWorkspaceMenu();
    } catch (error) {
      showToast(error.message || '网络工作区添加失败');
    }
  }

  async function addWorkspaceFolder(type) {
    if (!['local', 'git'].includes(type)) return;
    try {
      const result = await api.chooseWorkspaceFolder(type);
      if (!result || result.canceled || !result.source) return;
      await addWorkspaceSource(result.source);
      closeWorkspaceMenu();
    } catch (error) {
      showToast(error.message || '工作区添加失败');
    }
  }

  function closeWorkspaceMenu() {
    if (workspaceMenuCloseHandler) {
      document.removeEventListener('pointerdown', workspaceMenuCloseHandler);
      workspaceMenuCloseHandler = null;
    }
    if (workspaceMenu) {
      workspaceMenu.removeEventListener('click', handleWorkspaceMenuClick);
      workspaceMenu.removeEventListener('submit', handleWorkspaceMenuSubmit);
      workspaceMenu.remove();
      workspaceMenu = null;
    }
  }

  async function addWorkspaceSource(sourceInput) {
    const source = normalizeWorkspaceSource(sourceInput);
    const sourceKey = getWorkspaceSourceKey(source);
    const existingIndex = workspaceSources.findIndex((item) => getWorkspaceSourceKey(item) === sourceKey || item.id === source.id);
    if (existingIndex >= 0) {
      workspaceSources[existingIndex] = Object.assign({}, workspaceSources[existingIndex], source, {
        id: workspaceSources[existingIndex].id || source.id
      });
    } else {
      workspaceSources.push(source);
    }
    workspaceSources = dedupeWorkspaceSources(workspaceSources);
    const activeSource = workspaceSources.find((item) => getWorkspaceSourceKey(item) === sourceKey) || source;
    selectedSourceId = activeSource.id;
    selectedPath = getSourceRootPath(activeSource);
    selectedType = 'folder';
    expandedTreePaths.add('workspace:');
    expandedTreePaths.add(selectedPath);
    updateRootPathFromSources(activeSource);
    await persistWorkspaceSources({ lastSourceId: activeSource.id, lastFilePath: '' });
    await refreshFileTree(false);
    setSaveState('已添加工作区');
  }

  async function removeWorkspaceSource(sourceId = '') {
    if (!workspaceSources.length) {
      showToast('当前没有可移除的工作区');
      return;
    }
    const current = findSourceById(sourceId) || findSourceById(selectedSourceId) || workspaceSources[0];
    const index = workspaceSources.findIndex((source) => source.id === current.id);
    if (index < 0 || index >= workspaceSources.length) {
      showToast('工作区序号无效');
      return;
    }
    const [removed] = workspaceSources.splice(index, 1);
    closeTabsBySource(removed.id);
    selectedSourceId = workspaceSources[0] ? workspaceSources[0].id : '';
    selectedPath = workspaceSources[0] ? getSourceRootPath(workspaceSources[0]) : '';
    selectedType = selectedPath ? 'folder' : '';
    updateRootPathFromSources();
    await persistWorkspaceSources({ lastSourceId: selectedSourceId, lastFilePath: '' });
    await refreshFileTree(false);
    if (workspaceMenu) renderWorkspaceMenu();
    setSaveState('已移除工作区');
  }

  async function chooseRepository() {
    if (!api) return;
    const result = await api.chooseRepository();
    if (!result || result.canceled || !result.rootPath) return;
    rootPath = result.rootPath;
    selectedPath = rootPath;
    selectedType = 'folder';
    expandedTreePaths = new Set([rootPath]);
    tabs = [];
    activeTabId = '';
    fileDetail.textContent = rootPath;
    renderTabs();
    await refreshFileTree();
    await api.setSettings({ rootPath, lastFilePath: '' });
    setSaveState('已选择仓库');
  }

  async function openLocalMarkdownFile() {
    const file = fileInput.files && fileInput.files[0];
    fileInput.value = '';
    if (!file) return;
    try {
      const content = await readFileAsText(file);
      const replacement = getReusablePreviewTab();
      const tab = replacement || {
        id: createId()
      };
      Object.assign(tab, {
        path: '',
        name: file.name,
        content,
        savedContent: content,
        dirty: false,
        pinned: false,
        preview: true,
        modifiedAt: file.lastModified || Date.now(),
        numberingMode: ''
      });
      if (!replacement) tabs.push(tab);
      activeTabId = tab.id;
      selectedPath = '';
      selectedType = '';
      applyActiveTabToEditor();
      renderTabs();
      setSaveState('已加载本地文件');
    } catch (error) {
      showToast(error.message || '文件读取失败');
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

  function createWorkspaceSourceId(type, key) {
    const text = `${type}:${key || Date.now()}`;
    let hash = 0;
    for (let index = 0; index < text.length; index += 1) {
      hash = ((hash << 5) - hash) + text.charCodeAt(index);
      hash |= 0;
    }
    return `${type}-${Math.abs(hash).toString(36)}`;
  }

  function normalizeWorkspaceType(type, source = {}) {
    const value = String(type || source.type || '').toLowerCase();
    if (['local', 'git', 'network'].includes(value)) return value;
    return source.url ? 'network' : 'local';
  }

  function normalizeWorkspaceSource(source = {}) {
    const type = normalizeWorkspaceType(source.type, source);
    const root = String(source.rootPath || '');
    const url = String(source.url || '');
    const key = root || url || source.id || type;
    const fallbackName = root ? getBaseName(root) || root : url.split(/[/?#]/).filter(Boolean).pop() || '网络文件';
    return {
      id: source.id || createWorkspaceSourceId(type, key),
      type,
      name: source.name || fallbackName,
      rootPath: root,
      url,
      writable: source.writable !== false && (type === 'local' || type === 'git'),
      meta: Object.assign({}, source.meta || {})
    };
  }

  function normalizeWorkspaceSources(sources, settings = {}) {
    const normalized = [];
    const input = Array.isArray(sources) ? sources : [];
    input.forEach((source) => {
      const next = normalizeWorkspaceSource(source);
      if (next.rootPath || next.url) normalized.push(next);
    });
    if (!normalized.length && settings.rootPath) {
      normalized.push(normalizeWorkspaceSource({
        type: 'local',
        name: getBaseName(settings.rootPath) || settings.rootPath,
        rootPath: settings.rootPath
      }));
    }
    return dedupeWorkspaceSources(normalized);
  }

  function dedupeWorkspaceSources(sources) {
    const seen = new Set();
    return sources.map(normalizeWorkspaceSource).filter((source) => {
      const key = getWorkspaceSourceKey(source);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function getWorkspaceSourceKey(source) {
    const value = source && (source.rootPath || source.url || source.id) ? (source.rootPath || source.url || source.id) : '';
    return String(value || '').replace(/\\/g, '/').toLowerCase();
  }

  function getSourceRootPath(source) {
    if (!source) return '';
    return source.rootPath || `workspace:${source.id}`;
  }

  function isWritableSource(source) {
    return Boolean(source && source.writable && source.rootPath && (source.type === 'local' || source.type === 'git'));
  }

  function findSourceById(sourceId) {
    return workspaceSources.find((source) => source.id === sourceId) || null;
  }

  function findSourceForPath(targetPath) {
    const value = String(targetPath || '');
    if (!value || value === 'workspace:') return null;
    return workspaceSources.find((source) => {
      const sourceRoot = getSourceRootPath(source);
      if (value === sourceRoot || value === source.url) return true;
      if (source.rootPath && (value.startsWith(`${source.rootPath}\\`) || value.startsWith(`${source.rootPath}/`))) return true;
      return false;
    }) || null;
  }

  function getNodeSource(node) {
    const meta = node && node.meta ? node.meta : {};
    return findSourceById(meta.workspaceId) || findSourceForPath(node && node.path);
  }

  function updateRootPathFromSources(preferredSource = null) {
    const source = preferredSource || findSourceById(selectedSourceId) || workspaceSources.find((item) => item.rootPath) || workspaceSources[0] || null;
    rootPath = source && source.rootPath ? source.rootPath : '';
    if (source) selectedSourceId = source.id;
    return source;
  }

  function getWorkspaceDetail() {
    if (!workspaceSources.length) return '未加载工作区';
    const localCount = workspaceSources.filter((source) => source.type === 'local').length;
    const gitCount = workspaceSources.filter((source) => source.type === 'git').length;
    const networkCount = workspaceSources.filter((source) => source.type === 'network').length;
    return `工作区 ${workspaceSources.length} 个 · 本地 ${localCount} · Git ${gitCount} · 网络 ${networkCount}`;
  }

  function getSourceLabel(source) {
    if (!source) return getWorkspaceDetail();
    if (source.type === 'network') return `${source.name} · 网络只读`;
    if (source.type === 'git') return `${source.name} · Git 仓库`;
    return `${source.name} · 本地目录`;
  }

  async function persistWorkspaceSources(extra = {}) {
    if (!api || typeof api.setSettings !== 'function') return;
    updateRootPathFromSources();
    await api.setSettings(Object.assign({
      workspaceSources,
      rootPath
    }, extra));
  }

  function getSelectedSource() {
    return findSourceById(selectedSourceId) || findSourceForPath(selectedPath) || workspaceSources[0] || null;
  }

  function getSelectedWritableSource() {
    const source = getSelectedSource() || workspaceSources.find(isWritableSource) || null;
    if (!isWritableSource(source)) return null;
    return source;
  }

  async function refreshFileTree(showError = true) {
    if (api && typeof api.listWorkspace === 'function') {
      if (!workspaceSources.length) {
        workspaceRoot = null;
        treeRoot = null;
        if (directoryFileModel) directoryFileModel.setRoot(null);
        fileTree.innerHTML = '<div class="file-tree-empty">请选择或添加一个工作区</div>';
        fileDetail.textContent = '未加载工作区';
        return;
      }
      try {
        workspaceRoot = await api.listWorkspace(workspaceSources);
        treeRoot = workspaceRoot;
        if (!expandedTreePaths.size) expandedTreePaths = new Set(['workspace:'].concat(workspaceSources.map(getSourceRootPath)));
        if (directoryFileModel) {
          directoryFileModel.setSource('workspace', { workspaceSources });
          directoryFileModel.setTree(workspaceRoot, { workspaceSources });
          if (directoryFileView && directoryFileView.expandedPaths) {
            directoryFileView.expandedPaths.add('workspace:');
            workspaceSources.forEach((source) => directoryFileView.expandedPaths.add(getSourceRootPath(source)));
          }
        }
        fileDetail.textContent = getWorkspaceDetail();
        renderFileTree();
      } catch (error) {
        if (showError) showToast(error.message || '工作区加载失败');
        fileTree.innerHTML = '<div class="file-tree-empty">工作区加载失败</div>';
      }
      return;
    }
    if (!api || !rootPath) {
      if (directoryFileModel) directoryFileModel.setRoot(null);
      fileTree.innerHTML = '<div class="file-tree-empty">请选择一个文件夹作为笔记仓库</div>';
      return;
    }
    try {
      treeRoot = await api.listTree(rootPath);
      if (treeRoot && treeRoot.path && !expandedTreePaths.size) expandedTreePaths.add(treeRoot.path);
      if (directoryFileModel) {
        directoryFileModel.setSource('local', { rootPath });
        directoryFileModel.setTree(treeRoot, { rootPath });
      }
      fileDetail.textContent = rootPath;
      renderFileTree();
    } catch (error) {
      if (showError) showToast(error.message || '目录加载失败');
      fileTree.innerHTML = '<div class="file-tree-empty">目录加载失败</div>';
    }
  }

  function renderFileTree() {
    if (directoryFileView && directoryFileModel) {
      directoryFileView.render(directoryFileModel.snapshot());
      return;
    }
    if (!treeRoot) {
      fileTree.innerHTML = '<div class="file-tree-empty">请选择一个文件夹作为笔记仓库</div>';
      return;
    }

    const query = treeSearch.value.trim().toLowerCase();
    const html = renderTreeNode(treeRoot, 0, query);
    fileTree.innerHTML = html || '<div class="file-tree-empty">没有匹配的 Markdown 笔记</div>';
    createIcons();
  }

  function renderTreeNode(node, depth, query) {
    if (!node) return '';
    const children = Array.isArray(node.children) ? node.children : [];
    const isFolder = node.type === 'folder';
    const expanded = isFolder && (query || depth === 0 || node.path === rootPath || expandedTreePaths.has(node.path));
    const visibleChildren = (expanded || query ? children : [])
      .map((child) => renderTreeNode(child, depth + 1, query))
      .filter(Boolean);
    const matches = !query || node.name.toLowerCase().includes(query) || String(node.path || '').toLowerCase().includes(query) || visibleChildren.length > 0;
    if (!matches) return '';

    const active = getActiveTab() && getActiveTab().path === node.path ? ' active' : '';
    const selected = selectedPath === node.path ? ' selected' : '';
    const itemIcon = isFolder ? 'folder' : 'file-text';
    const row = `
      <button type="button" class="tree-row ${node.type}${active}${selected}${expanded ? ' expanded' : ''}" data-path="${escapeAttr(node.path)}" data-type="${escapeAttr(node.type)}" style="padding-left:${8 + depth * 14}px">
        <span class="tree-caret"><i data-lucide="chevron-right"></i></span>
        <span class="tree-icon"><i data-lucide="${itemIcon}"></i></span>
        <span class="tree-name">${escapeHtml(node.name)}</span>
      </button>`;
    return `
      <div class="tree-node ${node.type}${expanded ? ' expanded' : ' collapsed'}" data-node-path="${escapeAttr(node.path)}">
        ${row}
        ${isFolder ? `<div class="tree-children">${expanded ? visibleChildren.join('') : ''}</div>` : ''}
      </div>`;
  }

  async function handleFileTreeClick(event) {
    const row = event.target.closest('.tree-row');
    if (!row) return;
    if (row.dataset.type === 'folder') {
      toggleFallbackFolder(row.dataset.path || '');
    }
    await selectDirectoryFile(row.dataset.path || '', row.dataset.type || '');
  }

  async function handleDirectoryFileSelect(node) {
    await selectDirectoryFile(node && node.path ? node.path : '', node && node.type ? node.type : '', node);
  }

  function toggleFallbackFolder(path) {
    if (!path) return;
    if (expandedTreePaths.has(path)) {
      expandedTreePaths.delete(path);
    } else {
      expandedTreePaths.add(path);
    }
  }

  async function selectDirectoryFile(path, type, node = null) {
    selectedPath = path || '';
    selectedType = type || '';
    const source = getNodeSource(node) || findSourceForPath(selectedPath) || findSourceById(selectedSourceId);
    if (source) {
      selectedSourceId = source.id;
      updateRootPathFromSources(source);
    }
    if (directoryFileModel && selectedPath) directoryFileModel.select(selectedPath, selectedType);
    renderFileTree();
    if (selectedType === 'file') {
      await openNote(selectedPath, { sourceId: selectedSourceId });
    }
  }

  async function handleFileTreeContextMenu(event) {
    const row = event.target.closest('.tree-row');
    if (!row) return;
    event.preventDefault();
    selectedPath = row.dataset.path || '';
    selectedType = row.dataset.type || '';
    const node = directoryFileModel && typeof directoryFileModel.findNode === 'function'
      ? directoryFileModel.findNode(selectedPath)
      : null;
    const source = getNodeSource(node) || findSourceForPath(selectedPath);
    if (source) {
      selectedSourceId = source.id;
      updateRootPathFromSources(source);
    }
    renderFileTree();
    const command = window.prompt('输入操作：rename / move / delete / show', 'rename');
    if (command === 'rename') await renameSelectedItem();
    if (command === 'move') await moveSelectedItem();
    if (command === 'delete') await deleteSelectedItem();
    if (command === 'show') showSelectedItem();
  }

  async function createItem(type) {
    if (api && typeof api.createWorkspaceNote === 'function') {
      if (!workspaceSources.length) {
        await openWorkspaceMenu();
        if (!workspaceSources.length) return;
      }
      const source = getSelectedWritableSource();
      if (!source) {
        showToast('请选择一个可写的本地目录或 Git 工作区');
        return;
      }
      selectedSourceId = source.id;
      updateRootPathFromSources(source);
      const parentDir = getSelectedDirectory();
      const name = window.prompt(type === 'file' ? '新建笔记名称' : '新建文件夹名称', type === 'file' ? 'Untitled.md' : 'New Folder');
      if (!name) return;
      try {
        const result = type === 'file'
          ? await api.createWorkspaceNote(source, parentDir, name)
          : await api.createWorkspaceFolder(source, parentDir, name);
        selectedPath = result.path;
        selectedType = type === 'file' ? 'file' : 'folder';
        if (parentDir) expandedTreePaths.add(parentDir);
        await refreshFileTree(false);
        if (type === 'file') await openNote(result.path, { sourceId: source.id });
      } catch (error) {
        showToast(error.message || '创建失败');
      }
      return;
    }
    if (!api || !rootPath) {
      await chooseRepository();
      if (!rootPath) return;
    }
    const parentDir = getSelectedDirectory();
    const name = window.prompt(type === 'file' ? '新建笔记名称' : '新建文件夹名称', type === 'file' ? 'Untitled.md' : 'New Folder');
    if (!name) return;
    try {
      const result = type === 'file'
        ? await api.createNote(parentDir, name, rootPath)
        : await api.createFolder(parentDir, name, rootPath);
      selectedPath = result.path;
      selectedType = type === 'file' ? 'file' : 'folder';
      if (parentDir) expandedTreePaths.add(parentDir);
      if (options.refresh !== false) await refreshFileTree(false);
      if (type === 'file') await openNote(result.path);
    } catch (error) {
      showToast(error.message || '创建失败');
    }
  }

  async function renameSelectedItem() {
    if (api && typeof api.renameWorkspaceItem === 'function') {
      const source = getSelectedSource();
      if (!selectedPath || selectedPath === 'workspace:' || selectedPath === getSourceRootPath(source)) return;
      if (!isWritableSource(source)) {
        showToast('当前工作区来源只读，不能重命名');
        return;
      }
      const currentName = getBaseName(selectedPath);
      const nextName = window.prompt('重命名', currentName);
      if (!nextName || nextName === currentName) return;
      try {
        const result = await api.renameWorkspaceItem(source, selectedPath, nextName);
        updateTabsAfterPathChange(result.oldPath, result.path, result.name);
        selectedPath = result.path;
        await refreshFileTree(false);
      } catch (error) {
        showToast(error.message || '重命名失败');
      }
      return;
    }
    if (!api || !selectedPath || selectedPath === rootPath) return;
    const currentName = getBaseName(selectedPath);
    const nextName = window.prompt('重命名', currentName);
    if (!nextName || nextName === currentName) return;
    try {
      const result = await api.renameItem(selectedPath, nextName, rootPath);
      updateTabsAfterPathChange(result.oldPath, result.path, result.name);
      selectedPath = result.path;
      if (options.refresh !== false) await refreshFileTree(false);
    } catch (error) {
      showToast(error.message || '重命名失败');
    }
  }

  async function moveSelectedItem() {
    if (api && typeof api.moveWorkspaceItem === 'function') {
      const source = getSelectedSource();
      if (!selectedPath || selectedPath === 'workspace:' || selectedPath === getSourceRootPath(source)) return;
      if (!isWritableSource(source)) {
        showToast('当前工作区来源只读，不能移动');
        return;
      }
      const target = window.prompt('移动到工作区内相对目录，例如 docs 或 docs/spec', '');
      if (target === null) return;
      try {
        const result = await api.moveWorkspaceItem(source, selectedPath, target || source.rootPath);
        updateTabsAfterPathChange(result.oldPath || selectedPath, result.path, getBaseName(result.path));
        selectedPath = result.path;
        await refreshFileTree(false);
      } catch (error) {
        showToast(error.message || '移动失败');
      }
      return;
    }
    if (!api || !selectedPath || selectedPath === rootPath) return;
    const target = window.prompt('移动到仓库内相对目录，例如 docs 或 docs/spec', '');
    if (target === null) return;
    try {
      const result = await api.moveItem(selectedPath, target || rootPath, rootPath);
      updateTabsAfterPathChange(result.oldPath || selectedPath, result.path, getBaseName(result.path));
      selectedPath = result.path;
      await refreshFileTree(false);
    } catch (error) {
      showToast(error.message || '移动失败');
    }
  }

  async function deleteSelectedItem() {
    if (api && typeof api.deleteWorkspaceItem === 'function') {
      const source = getSelectedSource();
      if (!selectedPath || selectedPath === 'workspace:' || selectedPath === getSourceRootPath(source)) return;
      if (!isWritableSource(source)) {
        showToast('当前工作区来源只读，不能删除');
        return;
      }
      if (!window.confirm(`确定删除 ${getBaseName(selectedPath)}？`)) return;
      try {
        await api.deleteWorkspaceItem(source, selectedPath);
        closeTabsUnderPath(selectedPath);
        selectedPath = getSourceRootPath(source);
        selectedType = 'folder';
        await refreshFileTree(false);
      } catch (error) {
        showToast(error.message || '删除失败');
      }
      return;
    }
    if (!api || !selectedPath || selectedPath === rootPath) return;
    if (!window.confirm(`确定删除 ${getBaseName(selectedPath)}？`)) return;
    try {
      await api.deleteItem(selectedPath, rootPath);
      closeTabsUnderPath(selectedPath);
      selectedPath = rootPath;
      selectedType = 'folder';
      await refreshFileTree(false);
    } catch (error) {
      showToast(error.message || '删除失败');
    }
  }

  function showSelectedItem() {
    const source = getSelectedSource();
    if (!selectedPath || selectedPath === 'workspace:') return;
    if (source && source.type === 'network') {
      showToast('网络工作区文件没有本地目录可显示');
      return;
    }
    if (api && selectedPath) {
      api.showItem(selectedPath);
    }
  }

  async function openNote(path, options = {}) {
    if (!api || !path) return;
    captureActiveEditorContent();
    const source = findSourceById(options.sourceId) || getNodeSource(options.node) || findSourceForPath(path) || findSourceById(selectedSourceId);
    if (api.readWorkspaceNote && !source) {
      showToast('找不到文件所属的工作区来源');
      return;
    }
    if (source) {
      selectedSourceId = source.id;
      updateRootPathFromSources(source);
    }

    const existing = tabs.find((tab) => tab.path === path && (!source || !tab.sourceId || tab.sourceId === source.id));
    if (existing) {
      activeTabId = existing.id;
      selectedSourceId = existing.sourceId || selectedSourceId;
      if (source && !existing.sourceId) {
        existing.sourceId = source.id;
        existing.sourceType = source.type;
        existing.readonly = !isWritableSource(source);
      }
      if (options.pin) {
        existing.pinned = true;
        existing.preview = false;
      }
      applyActiveTabToEditor();
      renderTabs();
      renderFileTree();
      return;
    }

    try {
      const note = api.readWorkspaceNote && source
        ? await api.readWorkspaceNote(source, path)
        : await api.readNote(path, rootPath);
      if (!note || note.missing) {
        showToast('文件不存在或已被删除');
        await refreshFileTree(false);
        return;
      }
      const replacement = options.preview !== false
        ? getReusablePreviewTab()
        : null;
      if (replacement && replacement.dirty && !replacement.readonly && replacement.id === activeTabId) {
        await saveActiveTab({ refresh: false, render: false });
      }
      const tab = replacement || {
        id: createId(),
      };
      Object.assign(tab, {
        path: note.path,
        name: note.name,
        content: note.content || '',
        savedContent: note.content || '',
        dirty: false,
        pinned: Boolean(options.pin),
        preview: !options.pin,
        modifiedAt: note.modifiedAt || Date.now(),
        numberingMode: '',
        sourceId: note.workspaceId || (source && source.id) || '',
        sourceType: note.sourceType || (source && source.type) || '',
        readonly: Boolean(note.readonly || (source && !isWritableSource(source)))
      });
      if (!replacement) tabs.push(tab);
      activeTabId = tab.id;
      selectedPath = tab.path;
      selectedType = 'file';
      applyActiveTabToEditor();
      renderTabs();
      renderFileTree();
      updateFileMeta(tab);
      await api.setSettings({ lastFilePath: tab.path, lastSourceId: tab.sourceId || selectedSourceId });
    } catch (error) {
      showToast(error.message || '文件读取失败');
    }
  }

  function applyActiveTabToEditor() {
    const tab = getActiveTab();
    if (!editorReady || !tab) return;
    const source = findSourceById(tab.sourceId) || findSourceForPath(tab.path);
    updateFileMeta(tab);
    postEditorMessage('markcom:setMarkdown', {
      markdown: tab.content,
      meta: {
        fileName: tab.name,
        path: tab.path,
        rootPath: source && source.rootPath ? source.rootPath : rootPath,
        detail: getSourceLabel(source),
        updatedText: tab.dirty ? '未保存' : '已保存',
        numberingMode: tab.numberingMode || undefined
      }
    });
    setSaveState(tab.dirty ? '未保存' : '已保存');
  }

  function handleEditorChange(message) {
    const tab = getActiveTab();
    if (!tab || typeof message.markdown !== 'string') return;
    const incomingMode = normalizeNumberingMode(message.numberingMode || (message.meta && message.meta.numberingMode));
    if (incomingMode && numberingMode.value !== incomingMode) {
      numberingMode.value = incomingMode;
    }
    if (incomingMode) {
      tab.numberingMode = incomingMode;
    }
    if (message.meta && message.meta.source === 'api') {
      tab.content = message.markdown;
      tab.savedContent = message.markdown;
      tab.dirty = false;
      renderTabs();
      updateFileMeta(tab);
      updateEditorStats(message.document);
      setSaveState('已保存');
      return;
    }
    if (message.markdown === tab.content) return;

    tab.content = message.markdown;
    tab.dirty = tab.content !== tab.savedContent;
    renderTabs();
    updateFileMeta(tab);
    updateEditorStats(message.document);
    setSaveState(tab.dirty ? '自动保存等待中' : '已保存');
    scheduleAutoSave();
  }

  function captureActiveEditorContent() {
    const tab = getActiveTab();
    if (!tab) return;
    try {
      const markCom = getMarkCom();
      if (markCom && typeof markCom.getMarkdown === 'function') {
        const markdown = markCom.getMarkdown();
        tab.content = markdown;
        tab.dirty = markdown !== tab.savedContent;
      }
    } catch (error) {
      // Cross-context access can fail in strict browser file mode; postMessage keeps autosave updated.
    }
  }

  async function getEditorMarkdownForSave(tab) {
    captureActiveEditorContent();
    let content = tab ? tab.content : '';
    try {
      const markCom = getMarkCom();
      if (markCom && typeof markCom.getMarkdownForSave === 'function') {
        content = await markCom.getMarkdownForSave();
        if (tab) {
          const raw = typeof markCom.getMarkdown === 'function' ? markCom.getMarkdown() : tab.content;
          tab.content = raw;
          tab.numberingMode = typeof markCom.getNumberingMode === 'function' ? markCom.getNumberingMode() : tab.numberingMode;
        }
      } else if (markCom && typeof markCom.getNumberedMarkdown === 'function') {
        content = markCom.getNumberedMarkdown();
      }
    } catch (error) {
      // 跨上下文访问失败时使用外层已同步的内容。
    }
    return content;
  }

  function scheduleAutoSave() {
    window.clearTimeout(autoSaveTimer);
    const tab = getActiveTab();
    if (!tab || !tab.dirty || tab.readonly || !api) return;
    autoSaveTimer = window.setTimeout(saveActiveTab, AUTOSAVE_DELAY);
  }

  async function saveActiveTab(options = {}) {
    const tab = getActiveTab();
    if (!tab || !api) return;
    captureActiveEditorContent();
    if (tab.readonly) {
      setSaveState('只读文件不能保存');
      showToast('当前工作区来源只读，请导出 MD 后另存');
      return;
    }
    if (!tab.path) {
      setSaveState('本地文件需用 MD 导出保存');
      return;
    }
    try {
      setSaveState('保存中');
      const saveContent = await getEditorMarkdownForSave(tab);
      const source = findSourceById(tab.sourceId) || findSourceForPath(tab.path) || getSelectedSource();
      const result = api.saveWorkspaceNote && source
        ? await api.saveWorkspaceNote(source, tab.path, saveContent)
        : await api.saveNote(tab.path, saveContent, rootPath);
      tab.savedContent = tab.content;
      tab.dirty = false;
      tab.modifiedAt = result.modifiedAt || Date.now();
      if (options.render !== false) {
        renderTabs();
        updateFileMeta(tab);
      }
      setSaveState('已保存');
      await api.setSettings({ lastFilePath: tab.path, lastSourceId: tab.sourceId || (source && source.id) || '' });
      await refreshFileTree(false);
    } catch (error) {
      setSaveState('保存失败');
      showToast(error.message || '保存失败');
    }
  }

  function renderTabs() {
    const tab = getActiveTab();
    if (tab) updateFileMeta(tab);
    if (!editorReady) return;
    postEditorMessage('markcom:setTabs', {
      activeTabId,
      tabs: tabs.map((item) => ({
        id: item.id,
        name: item.name,
        path: item.path,
        dirty: item.dirty,
        pinned: Boolean(item.pinned),
        preview: !item.pinned,
        sourceId: item.sourceId || '',
        readonly: Boolean(item.readonly),
        numberingMode: item.numberingMode || ''
      }))
    });
  }

  async function handleTabClick(event) {
    event.preventDefault();
  }

  async function activateTab(tabId) {
    const tab = tabs.find((item) => item.id === tabId);
    if (!tab) return;
    if (activeTabId === tab.id) return;
    captureActiveEditorContent();
    activeTabId = tab.id;
    selectedPath = tab.path;
    selectedType = tab.path ? 'file' : '';
    selectedSourceId = tab.sourceId || selectedSourceId;
    updateRootPathFromSources(findSourceById(selectedSourceId));
    if (tab.numberingMode) numberingMode.value = tab.numberingMode;
    applyActiveTabToEditor();
    renderTabs();
    renderFileTree();
    if (api && tab.path) {
      await api.setSettings({ lastFilePath: tab.path, lastSourceId: tab.sourceId || selectedSourceId });
    }
  }

  async function closeTab(tabId) {
    const tab = tabs.find((item) => item.id === tabId);
    if (!tab) return;
    if (tab.dirty && !window.confirm(`${tab.name} 尚未保存，仍要关闭？`)) return;
    const index = tabs.findIndex((item) => item.id === tabId);
    tabs.splice(index, 1);
    if (activeTabId === tabId) {
      activeTabId = tabs[Math.max(0, index - 1)] ? tabs[Math.max(0, index - 1)].id : '';
      applyActiveTabToEditor();
    }
    renderTabs();
    renderFileTree();
  }

  function pinTab(tabId, options = {}) {
    const tab = tabs.find((item) => item.id === tabId);
    if (!tab || tab.pinned) return;
    tab.pinned = true;
    tab.preview = false;
    if (options.render !== false) renderTabs();
  }

  function closeTabsUnderPath(path) {
    tabs = tabs.filter((tab) => !(tab.path === path || tab.path.startsWith(`${path}\\`) || tab.path.startsWith(`${path}/`)));
    activeTabId = tabs[0] ? tabs[0].id : '';
    renderTabs();
    applyActiveTabToEditor();
  }

  function closeTabsBySource(sourceId) {
    if (!sourceId) return;
    tabs = tabs.filter((tab) => tab.sourceId !== sourceId);
    activeTabId = tabs[0] ? tabs[0].id : '';
    renderTabs();
    applyActiveTabToEditor();
  }

  function updateTabsAfterPathChange(oldPath, nextPath, nextName) {
    tabs.forEach((tab) => {
      if (tab.path === oldPath || tab.path.startsWith(`${oldPath}\\`) || tab.path.startsWith(`${oldPath}/`)) {
        tab.path = tab.path.replace(oldPath, nextPath);
        if (tab.path === nextPath) tab.name = nextName || getBaseName(nextPath);
      }
    });
    renderTabs();
  }

  function getActiveTab() {
    return tabs.find((tab) => tab.id === activeTabId) || null;
  }

  function getReusablePreviewTab() {
    const active = getActiveTab();
    if (active && !active.pinned) return active;
    return tabs.find((tab) => !tab.pinned) || null;
  }

  function getSelectedDirectory() {
    const source = getSelectedWritableSource() || getSelectedSource();
    const sourceRoot = source && source.rootPath ? source.rootPath : rootPath;
    if (!selectedPath || selectedPath === 'workspace:' || selectedPath === sourceRoot || selectedPath === getSourceRootPath(source)) return sourceRoot;
    return selectedType === 'folder' ? selectedPath : getDirectoryName(selectedPath);
  }

  function getMarkCom() {
    if (editorFrame && editorFrame.contentWindow) return editorFrame.contentWindow.MarkCom || null;
    return window.MarkCom || null;
  }

  function postEditorMessage(type, payload) {
    const message = Object.assign({ type }, payload || {});
    if (editorFrame && editorFrame.contentWindow) {
      editorFrame.contentWindow.postMessage(message, '*');
      return;
    }
    const markCom = getMarkCom();
    if (!markCom) return;
    if (type === 'markcom:setMarkdown' && typeof markCom.setMarkdown === 'function') {
      markCom.setMarkdown(message.markdown || '', message.meta || {});
      return;
    }
    if (type === 'markcom:setView' && typeof markCom.setView === 'function') {
      markCom.setView(message.view);
      return;
    }
    if (type === 'markcom:setTabs' && typeof markCom.setTabs === 'function') {
      markCom.setTabs(message.tabs || [], message.activeTabId || '');
      return;
    }
    if (type === 'markcom:command') {
      runInlineEditorCommand(markCom, message.command, message);
    }
  }

  function runInlineEditorCommand(markCom, command, payload = {}) {
    if (!markCom || !command) return;
    if (command === 'exportHtml' && typeof markCom.exportHtml === 'function') markCom.exportHtml();
    if (command === 'exportPdf' && typeof markCom.exportPdf === 'function') markCom.exportPdf();
    if (command === 'exportMarkdown' && typeof markCom.exportMarkdown === 'function') markCom.exportMarkdown();
    if (command === 'toggleOutline' && typeof markCom.toggleOutline === 'function') markCom.toggleOutline();
    if (command === 'toggleTheme' && typeof markCom.toggleTheme === 'function') markCom.toggleTheme();
    if (command === 'setNumberingMode' && typeof markCom.setNumberingMode === 'function') markCom.setNumberingMode(payload.mode);
  }

  function runEditorCommand(command, payload = {}) {
    postEditorMessage('markcom:command', Object.assign({ command }, payload));
  }

  function setEditorView(view) {
    if (!['preview', 'source'].includes(view)) return;
    currentView = view;
    app.classList.toggle('preview-mode', view === 'preview');
    app.classList.toggle('source-mode', view === 'source');
    viewButtons.forEach((button) => {
      button.classList.toggle('active', button.dataset.view === view);
    });
    postEditorMessage('markcom:setView', { view });
    createIcons();
  }

  function toggleTheme() {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    themeToggle.innerHTML = next === 'dark' ? '<i data-lucide="sun"></i>' : '<i data-lucide="moon"></i>';
    runEditorCommand('toggleTheme');
    createIcons();
  }

  function toggleExplorer() {
    app.classList.toggle('explorer-collapsed');
  }

  function startExplorerResize(event) {
    if (app.classList.contains('explorer-collapsed')) return;
    event.preventDefault();
    explorerResizer.setPointerCapture(event.pointerId);
    app.classList.add('explorer-resizing');
    const onMove = (moveEvent) => {
      const rect = document.getElementById('workspace').getBoundingClientRect();
      const min = 220;
      const max = Math.max(min, rect.width * 0.48);
      const width = Math.min(max, Math.max(min, moveEvent.clientX - rect.left));
      document.documentElement.style.setProperty('--explorer-width', `${width}px`);
    };
    const onUp = () => {
      app.classList.remove('explorer-resizing');
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp, { once: true });
  }

  function updateFileMeta(tab) {
    const source = tab ? (findSourceById(tab.sourceId) || findSourceForPath(tab.path)) : getSelectedSource();
    fileName.textContent = tab ? tab.name : 'NoteEasy';
    fileDetail.textContent = tab ? getSourceLabel(source) : getWorkspaceDetail();
    currentFileText.textContent = tab ? tab.name : '未加载文件';
    currentPathText.textContent = tab ? tab.path : (rootPath || '本地页面');
    sizeText.textContent = formatBytes(new Blob([tab ? tab.content : '']).size);
    updatedText.textContent = tab && tab.readonly ? '只读' : (tab && tab.dirty ? '未保存' : '本地页面');
    return;
    fileName.textContent = tab ? tab.name : 'NoteEasy';
    fileDetail.textContent = rootPath || '未加载文件';
    currentFileText.textContent = tab ? tab.name : '未加载文件';
    currentPathText.textContent = tab ? tab.path : (rootPath || '本地页面');
    sizeText.textContent = formatBytes(new Blob([tab ? tab.content : '']).size);
    updatedText.textContent = tab && tab.dirty ? '未保存' : '本地页面';
  }

  function updateEditorStats(documentSnapshot) {
    const blocks = Array.isArray(documentSnapshot && documentSnapshot.blocks) ? documentSnapshot.blocks : [];
    const headings = blocks.filter((block) => block.type === 'heading').length;
    const codeBlocks = blocks.filter((block) => block.type === 'code').length;
    const diagrams = blocks.filter((block) => ['flowchart', 'chart', 'music'].includes(block.type)).length;
    statsText.textContent = `${headings} 标题 · ${codeBlocks} 代码块 · ${diagrams} 图表`;
  }

  function setSaveState(text) {
    statusText.textContent = text;
    messageText.textContent = '';
  }

  function showToast(message) {
    toast.textContent = message;
    messageText.textContent = message;
    toast.classList.add('show');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('show'), 2400);
  }

  function createId() {
    return `tab-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
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

  function normalizeNumberingMode(mode) {
    return ['mode1', 'mode2', 'mode3', 'none'].includes(mode) ? mode : '';
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

  function getDirectoryName(path) {
    return String(path || '').replace(/[\\/][^\\/]*$/, '') || rootPath;
  }

  function getBaseName(path) {
    return String(path || '').split(/[\\/]/).filter(Boolean).pop() || '';
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, '&#96;');
  }
})();
