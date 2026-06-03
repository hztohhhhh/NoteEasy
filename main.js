const { app, BrowserWindow, Menu, dialog, ipcMain, shell, net } = require('electron');
const nodeFs = require('fs');
const fs = require('fs/promises');
const path = require('path');

let autoUpdater = null;
try {
  ({ autoUpdater } = require('electron-updater'));
} catch (error) {
  autoUpdater = null;
}

let mainWindow = null;
let repositoryWatcher = null;
let repositoryWatchRoot = '';
let repositoryWatchTimer = null;
let repositoryPollTimer = null;
const workspaceWatchers = new Map();

const MARKDOWN_EXTENSIONS = new Set(['.md', '.markdown', '.mdown', '.mkd']);
const WRITABLE_WORKSPACE_TYPES = new Set(['local', 'git']);
const NETWORK_TIMEOUT_MS = 25000;
const NETWORK_RETRY_COUNT = 2;
const NETWORK_RETRY_DELAY_MS = 900;

function createWorkspaceId(type = 'local') {
  const random = Math.random().toString(36).slice(2, 8);
  return `${type}-${Date.now().toString(36)}-${random}`;
}

function normalizeWorkspaceType(type) {
  return ['local', 'git', 'network'].includes(type) ? type : 'local';
}

function normalizeWorkspaceSource(source = {}) {
  const type = normalizeWorkspaceType(source.type || source.sourceType);
  const rootPath = source.rootPath || '';
  const url = source.url || '';
  const fallbackName = rootPath ? path.basename(rootPath) || rootPath : url.split(/[/?#]/).filter(Boolean).pop() || '网络文件';
  return {
    id: source.id || createWorkspaceId(type),
    type,
    name: source.name || fallbackName,
    rootPath,
    url,
    writable: WRITABLE_WORKSPACE_TYPES.has(type),
    meta: Object.assign({}, source.meta || {})
  };
}

function isNetworkMarkdownUrl(url) {
  return /\.(md|markdown|mdown|mkd|txt)(?:[?#].*)?$/i.test(String(url || ''));
}

function normalizeNetworkUrl(input) {
  const value = String(input || '').trim();
  if (!value) return '';
  let parsed = null;
  try {
    parsed = new URL(value);
  } catch (error) {
    return value;
  }
  if (parsed.hostname.toLowerCase() === 'github.com') {
    const parts = parsed.pathname.split('/').filter(Boolean);
    if (parts.length >= 5 && ['blob', 'raw'].includes(parts[2])) {
      const [owner, repo] = parts;
      const branch = parts[3];
      const filePath = parts.slice(4).join('/');
      return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}${parsed.search || ''}`;
    }
  }
  return value;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatNetworkError(error, url) {
  const cause = error && error.cause ? error.cause : null;
  const code = (cause && cause.code) || error.code || error.name || '';
  const message = (cause && cause.message) || error.message || String(error || '');
  if (code === 'UND_ERR_CONNECT_TIMEOUT' || code === 'AbortError' || /timeout/i.test(message)) {
    return `网络文件读取超时：${url}。请确认网络或代理能访问该地址。`;
  }
  if (code === 'ECONNRESET') {
    return `网络连接被重置：${url}。请重试，或检查代理/网络稳定性。`;
  }
  if (code === 'ENOTFOUND' || code === 'EAI_AGAIN') {
    return `网络域名解析失败：${url}。请检查地址或 DNS。`;
  }
  return `网络文件读取失败：${url}。${message}`;
}

async function fetchNetworkResponse(url, options = {}) {
  const targetUrl = normalizeNetworkUrl(url);
  let lastError = null;
  for (let attempt = 0; attempt <= NETWORK_RETRY_COUNT; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), options.timeout || NETWORK_TIMEOUT_MS);
    try {
      const headers = Object.assign({
        'accept': options.accept || 'text/markdown,text/plain,application/json,*/*',
        'cache-control': 'no-cache',
        'user-agent': 'NoteEasy/1.0'
      }, options.headers || {});
      const fetchOptions = {
        method: 'GET',
        headers,
        signal: controller.signal
      };
      return net && typeof net.fetch === 'function'
        ? await net.fetch(targetUrl, fetchOptions)
        : await fetch(targetUrl, fetchOptions);
    } catch (error) {
      lastError = error;
      if (attempt < NETWORK_RETRY_COUNT) {
        await delay(NETWORK_RETRY_DELAY_MS * (attempt + 1));
      }
    } finally {
      clearTimeout(timer);
    }
  }
  throw new Error(formatNetworkError(lastError, targetUrl));
}

function getSettingsPath() {
  return path.join(app.getPath('userData'), 'settings.json');
}

async function readSettings() {
  try {
    const raw = await fs.readFile(getSettingsPath(), 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    return {};
  }
}

async function writeSettings(patch) {
  const current = await readSettings();
  const next = { ...current, ...patch };
  await fs.mkdir(path.dirname(getSettingsPath()), { recursive: true });
  await fs.writeFile(getSettingsPath(), `${JSON.stringify(next, null, 2)}\n`, 'utf8');
  return next;
}

function isMarkdownFile(filePath) {
  return MARKDOWN_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch (error) {
    return false;
  }
}

async function getAvailablePath(targetPath) {
  if (!await pathExists(targetPath)) return targetPath;
  const directory = path.dirname(targetPath);
  const extension = path.extname(targetPath);
  const base = path.basename(targetPath, extension);
  for (let index = 2; index < 1000; index += 1) {
    const candidate = path.join(directory, `${base} ${index}${extension}`);
    if (!await pathExists(candidate)) return candidate;
  }
  throw new Error('无法生成可用名称，请手动输入其他名称');
}

async function assertInsideRoot(targetPath, rootPath) {
  if (!rootPath) return;
  const resolvedRoot = path.resolve(rootPath);
  const resolvedTarget = path.resolve(targetPath);
  const relative = path.relative(resolvedRoot, resolvedTarget);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('目标路径不在当前笔记仓库内');
  }
}

async function buildTree(rootPath, currentPath = rootPath) {
  await assertInsideRoot(currentPath, rootPath);
  const stat = await fs.stat(currentPath);
  const name = currentPath === rootPath ? path.basename(rootPath) || rootPath : path.basename(currentPath);
  const node = {
    name,
    path: currentPath,
    type: stat.isDirectory() ? 'folder' : 'file',
    modifiedAt: stat.mtimeMs,
    size: stat.size
  };

  if (!stat.isDirectory()) return node;

  const entries = await fs.readdir(currentPath, { withFileTypes: true });
  const children = [];
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const entryPath = path.join(currentPath, entry.name);
    if (entry.isDirectory()) {
      children.push(await buildTree(rootPath, entryPath));
    } else if (entry.isFile() && isMarkdownFile(entryPath)) {
      const childStat = await fs.stat(entryPath);
      children.push({
        name: entry.name,
        path: entryPath,
        type: 'file',
        modifiedAt: childStat.mtimeMs,
        size: childStat.size
      });
    }
  }

  children.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
    return a.name.localeCompare(b.name, 'zh-CN', { numeric: true });
  });
  node.children = children;
  return node;
}

function attachWorkspaceMeta(node, source) {
  if (!node) return null;
  const next = Object.assign({}, node, {
    source: source.type,
    meta: Object.assign({}, node.meta || {}, {
      workspaceId: source.id,
      workspaceName: source.name,
      sourceType: source.type,
      rootPath: source.rootPath || '',
      url: source.url || '',
      writable: source.writable
    })
  });
  if (Array.isArray(node.children)) {
    next.children = node.children.map((child) => attachWorkspaceMeta(child, source));
  }
  return next;
}

async function fetchJson(url) {
  const response = await fetchNetworkResponse(url, {
    accept: 'application/json,text/json,*/*'
  });
  if (response.ok) return response.json();
  throw new Error(`网络工作区加载失败：HTTP ${response.status} ${response.statusText || ''}`.trim());
}

async function fetchText(url) {
  const response = await fetchNetworkResponse(url, {
    accept: 'text/markdown,text/plain,text/*,*/*'
  });
  if (response.ok) return response.text();
  throw new Error(`网络文件读取失败：HTTP ${response.status} ${response.statusText || ''}`.trim());
}

function normalizeNetworkTreePayload(payload, source) {
  const root = Array.isArray(payload)
    ? { name: source.name, path: `workspace:${source.id}`, type: 'folder', children: payload }
    : payload;
  return attachWorkspaceMeta(normalizeNetworkNode(root, source), source);
}

function normalizeNetworkNode(node, source) {
  const type = node.type === 'folder' ? 'folder' : 'file';
  const nodeUrl = node.url || node.path || source.url || '';
  const name = node.name || String(nodeUrl).split(/[/?#]/).filter(Boolean).pop() || source.name;
  return {
    name,
    path: type === 'folder' ? (node.path || nodeUrl || `workspace:${source.id}`) : nodeUrl,
    url: nodeUrl,
    type,
    size: node.size || 0,
    modifiedAt: node.modifiedAt || 0,
    children: Array.isArray(node.children)
      ? node.children.map((child) => normalizeNetworkNode(child, source))
      : []
  };
}

async function buildWorkspaceSourceTree(sourceInput) {
  const source = normalizeWorkspaceSource(sourceInput);
  if (source.type === 'network') {
    if (!source.url) throw new Error('网络工作区缺少 URL');
    if (isNetworkMarkdownUrl(source.url)) {
      return attachWorkspaceMeta({
        name: source.name,
        path: `workspace:${source.id}`,
        type: 'folder',
        children: [{
          name: source.name,
          path: source.url,
          url: source.url,
          type: 'file'
        }]
      }, source);
    }
    return normalizeNetworkTreePayload(await fetchJson(source.url), source);
  }

  if (!source.rootPath) throw new Error('本地工作区缺少目录路径');
  const tree = await buildTree(source.rootPath);
  tree.name = source.name || tree.name;
  tree.meta = Object.assign({}, tree.meta || {}, { workspaceRoot: true });
  return attachWorkspaceMeta(tree, source);
}

async function buildWorkspaceTree(sourcesInput = []) {
  const sources = Array.isArray(sourcesInput) ? sourcesInput.map(normalizeWorkspaceSource) : [];
  const children = [];
  for (const source of sources) {
    try {
      children.push(await buildWorkspaceSourceTree(source));
    } catch (error) {
      children.push(attachWorkspaceMeta({
        name: source.name,
        path: source.rootPath || source.url || `workspace:${source.id}`,
        url: source.url || '',
        type: 'folder',
        children: [],
        meta: { error: String(error.message || error) }
      }, source));
    }
  }
  return {
    name: '工作区',
    path: 'workspace:',
    type: 'folder',
    source: 'workspace',
    meta: { workspaceRoot: true },
    children
  };
}

function normalizeNoteName(name) {
  const cleaned = String(name || '').replace(/[\\/:*?"<>|]+/g, '-').trim();
  if (!cleaned) throw new Error('名称不能为空');
  return MARKDOWN_EXTENSIONS.has(path.extname(cleaned).toLowerCase()) ? cleaned : `${cleaned}.md`;
}

function normalizeFolderName(name) {
  const cleaned = String(name || '').replace(/[\\/:*?"<>|]+/g, '-').trim();
  if (!cleaned) throw new Error('名称不能为空');
  return cleaned;
}

function assertWritableWorkspace(sourceInput) {
  const source = normalizeWorkspaceSource(sourceInput);
  if (!WRITABLE_WORKSPACE_TYPES.has(source.type)) {
    throw new Error('当前工作区来源是只读的，不能执行写入操作');
  }
  if (!source.rootPath) throw new Error('工作区缺少本地根目录');
  return source;
}

async function readWorkspaceNote(sourceInput, filePath) {
  const source = normalizeWorkspaceSource(sourceInput);
  if (source.type === 'network') {
    const targetUrl = filePath || source.url;
    const content = await fetchText(targetUrl);
    return {
      path: targetUrl,
      url: targetUrl,
      name: String(targetUrl).split(/[/?#]/).filter(Boolean).pop() || source.name,
      content,
      modifiedAt: Date.now(),
      size: Buffer.byteLength(content, 'utf8'),
      readonly: true,
      sourceType: source.type,
      workspaceId: source.id
    };
  }

  await assertInsideRoot(filePath, source.rootPath);
  if (!isMarkdownFile(filePath)) throw new Error('仅支持打开 Markdown 文件');
  try {
    const stat = await fs.stat(filePath);
    const content = await fs.readFile(filePath, 'utf8');
    return {
      path: filePath,
      name: path.basename(filePath),
      content,
      modifiedAt: stat.mtimeMs,
      size: stat.size,
      readonly: false,
      sourceType: source.type,
      workspaceId: source.id
    };
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      return { missing: true, path: filePath, name: path.basename(filePath) };
    }
    throw error;
  }
}

async function saveWorkspaceNote(sourceInput, filePath, content) {
  const source = assertWritableWorkspace(sourceInput);
  await assertInsideRoot(filePath, source.rootPath);
  if (!isMarkdownFile(filePath)) throw new Error('仅支持保存 Markdown 文件');
  await fs.writeFile(filePath, String(content || ''), 'utf8');
  const stat = await fs.stat(filePath);
  return {
    path: filePath,
    name: path.basename(filePath),
    modifiedAt: stat.mtimeMs,
    size: stat.size,
    workspaceId: source.id,
    sourceType: source.type
  };
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1040,
    minHeight: 680,
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'assets', 'icon.png'),
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.once('ready-to-show', () => mainWindow.show());
  await mainWindow.loadFile(path.join(__dirname, 'noteeasy.html'));
}

function startRepositoryWatcher(rootPath) {
  if (!rootPath || repositoryWatchRoot === rootPath) return;
  stopRepositoryWatcher();
  repositoryWatchRoot = rootPath;
  const notifyRepositoryChanged = () => {
    clearTimeout(repositoryWatchTimer);
    repositoryWatchTimer = setTimeout(() => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('noteeasy:repository-changed', { rootPath });
      }
    }, 350);
  };
  try {
    repositoryWatcher = nodeFs.watch(rootPath, { recursive: true }, notifyRepositoryChanged);
  } catch (error) {
    repositoryWatcher = null;
    repositoryPollTimer = setInterval(notifyRepositoryChanged, 5000);
  }
}

function stopRepositoryWatcher() {
  clearTimeout(repositoryWatchTimer);
  repositoryWatchTimer = null;
  clearInterval(repositoryPollTimer);
  repositoryPollTimer = null;
  repositoryWatchRoot = '';
  if (repositoryWatcher) {
    repositoryWatcher.close();
    repositoryWatcher = null;
  }
}

function startWorkspaceWatcher(sourceInput) {
  const source = normalizeWorkspaceSource(sourceInput);
  const rootPath = source.rootPath;
  if (!rootPath || !WRITABLE_WORKSPACE_TYPES.has(source.type) || workspaceWatchers.has(source.id)) return;
  const notifyWorkspaceChanged = () => {
    const record = workspaceWatchers.get(source.id);
    if (!record) return;
    clearTimeout(record.timer);
    record.timer = setTimeout(() => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('noteeasy:workspace-changed', { sourceId: source.id, rootPath });
      }
    }, 350);
  };
  try {
    const watcher = nodeFs.watch(rootPath, { recursive: true }, notifyWorkspaceChanged);
    workspaceWatchers.set(source.id, { watcher, timer: null, pollTimer: null, rootPath });
  } catch (error) {
    const pollTimer = setInterval(notifyWorkspaceChanged, 5000);
    workspaceWatchers.set(source.id, { watcher: null, timer: null, pollTimer, rootPath });
  }
}

function startWorkspaceWatchers(sources = []) {
  stopWorkspaceWatchers();
  sources.map(normalizeWorkspaceSource).forEach(startWorkspaceWatcher);
}

function stopWorkspaceWatchers() {
  workspaceWatchers.forEach((record) => {
    clearTimeout(record.timer);
    clearInterval(record.pollTimer);
    if (record.watcher) record.watcher.close();
  });
  workspaceWatchers.clear();
}

app.whenReady().then(async () => {
  Menu.setApplicationMenu(null);
  registerIpcHandlers();
  await createWindow();

  if (autoUpdater && app.isPackaged) {
    autoUpdater.checkForUpdatesAndNotify().catch(() => {});
  }
});

app.on('activate', async () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    await createWindow();
  }
});

app.on('window-all-closed', () => {
  stopRepositoryWatcher();
  stopWorkspaceWatchers();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

function registerIpcHandlers() {
  ipcMain.on('noteeasy:resolve-existing-path', (event, candidates = []) => {
    try {
      event.returnValue = Array.isArray(candidates)
        ? candidates.find((item) => typeof item === 'string' && item && nodeFs.existsSync(item)) || ''
        : '';
    } catch (error) {
      event.returnValue = '';
    }
  });

  ipcMain.handle('noteeasy:get-settings', () => readSettings());

  ipcMain.handle('noteeasy:set-settings', async (event, patch) => {
    return writeSettings(patch && typeof patch === 'object' ? patch : {});
  });

  ipcMain.handle('noteeasy:choose-repository', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: '选择一个文件夹作为笔记仓库',
      properties: ['openDirectory', 'createDirectory']
    });
    if (result.canceled || !result.filePaths[0]) {
      return { canceled: true };
    }
    const rootPath = result.filePaths[0];
    await writeSettings({ rootPath });
    startRepositoryWatcher(rootPath);
    return { canceled: false, rootPath };
  });

  ipcMain.handle('noteeasy:choose-workspace-folder', async (event, type = 'local') => {
    const sourceType = normalizeWorkspaceType(type);
    const result = await dialog.showOpenDialog(mainWindow, {
      title: sourceType === 'git' ? '选择一个 Git 仓库目录' : '添加本地目录到工作区',
      properties: ['openDirectory', 'createDirectory']
    });
    if (result.canceled || !result.filePaths[0]) return { canceled: true };
    const rootPath = result.filePaths[0];
    const source = normalizeWorkspaceSource({
      type: sourceType === 'git' ? 'git' : 'local',
      name: path.basename(rootPath) || rootPath,
      rootPath,
      meta: {
        addedAs: sourceType === 'git' ? 'git' : 'local'
      }
    });
    startWorkspaceWatcher(source);
    return { canceled: false, source };
  });

  ipcMain.handle('noteeasy:create-network-workspace', async (event, url, name = '') => {
    const value = String(url || '').trim();
    if (!/^https?:\/\//i.test(value)) throw new Error('网络工作区 URL 必须以 http:// 或 https:// 开头');
    return normalizeWorkspaceSource({
      type: 'network',
      name: String(name || '').trim() || value.split(/[/?#]/).filter(Boolean).pop() || '网络文件',
      url: value
    });
  });

  ipcMain.handle('noteeasy:list-workspace', async (event, sources) => {
    const normalized = Array.isArray(sources) ? sources.map(normalizeWorkspaceSource) : [];
    startWorkspaceWatchers(normalized);
    return await buildWorkspaceTree(normalized);
  });

  ipcMain.handle('noteeasy:list-workspace-source', async (event, source) => {
    const normalized = normalizeWorkspaceSource(source);
    startWorkspaceWatcher(normalized);
    return await buildWorkspaceSourceTree(normalized);
  });

  ipcMain.handle('noteeasy:read-workspace-note', async (event, source, filePath) => {
    return await readWorkspaceNote(source, filePath);
  });

  ipcMain.handle('noteeasy:save-workspace-note', async (event, source, filePath, content) => {
    return await saveWorkspaceNote(source, filePath, content);
  });

  ipcMain.handle('noteeasy:create-workspace-note', async (event, sourceInput, parentDir, name) => {
    const source = assertWritableWorkspace(sourceInput);
    await assertInsideRoot(parentDir, source.rootPath);
    const fileName = normalizeNoteName(name);
    const filePath = await getAvailablePath(path.join(parentDir, fileName));
    await assertInsideRoot(filePath, source.rootPath);
    const title = path.basename(filePath, path.extname(filePath));
    await fs.writeFile(filePath, `# ${title}\n\n`, 'utf8');
    return { path: filePath, name: path.basename(filePath), workspaceId: source.id, sourceType: source.type };
  });

  ipcMain.handle('noteeasy:create-workspace-folder', async (event, sourceInput, parentDir, name) => {
    const source = assertWritableWorkspace(sourceInput);
    await assertInsideRoot(parentDir, source.rootPath);
    const folderName = normalizeFolderName(name);
    const folderPath = await getAvailablePath(path.join(parentDir, folderName));
    await assertInsideRoot(folderPath, source.rootPath);
    await fs.mkdir(folderPath);
    return { path: folderPath, name: path.basename(folderPath), workspaceId: source.id, sourceType: source.type };
  });

  ipcMain.handle('noteeasy:rename-workspace-item', async (event, sourceInput, itemPath, nextName) => {
    const source = assertWritableWorkspace(sourceInput);
    await assertInsideRoot(itemPath, source.rootPath);
    const stat = await fs.stat(itemPath);
    const finalName = stat.isDirectory() ? normalizeFolderName(nextName) : normalizeNoteName(nextName);
    const targetPath = path.join(path.dirname(itemPath), finalName);
    await assertInsideRoot(targetPath, source.rootPath);
    if (targetPath !== itemPath && await pathExists(targetPath)) throw new Error('目标名称已存在');
    await fs.rename(itemPath, targetPath);
    return { oldPath: itemPath, path: targetPath, name: finalName, workspaceId: source.id, sourceType: source.type };
  });

  ipcMain.handle('noteeasy:delete-workspace-item', async (event, sourceInput, itemPath) => {
    const source = assertWritableWorkspace(sourceInput);
    await assertInsideRoot(itemPath, source.rootPath);
    await fs.rm(itemPath, { recursive: true, force: false });
    return { path: itemPath, workspaceId: source.id, sourceType: source.type };
  });

  ipcMain.handle('noteeasy:move-workspace-item', async (event, sourceInput, itemPath, targetDir) => {
    const source = assertWritableWorkspace(sourceInput);
    await assertInsideRoot(itemPath, source.rootPath);
    const resolvedTargetDir = path.isAbsolute(String(targetDir || ''))
      ? String(targetDir || '')
      : path.join(source.rootPath, String(targetDir || ''));
    await assertInsideRoot(resolvedTargetDir, source.rootPath);
    const targetStat = await fs.stat(resolvedTargetDir);
    if (!targetStat.isDirectory()) throw new Error('目标路径不是文件夹');
    const targetPath = path.join(resolvedTargetDir, path.basename(itemPath));
    await assertInsideRoot(targetPath, source.rootPath);
    if (path.resolve(itemPath) === path.resolve(targetPath)) return { path: itemPath };
    if ((await fs.stat(itemPath)).isDirectory()) {
      const relative = path.relative(path.resolve(itemPath), path.resolve(targetPath));
      if (!relative.startsWith('..') && relative !== '') {
        throw new Error('不能将文件夹移动到自身内部');
      }
    }
    if (await pathExists(targetPath)) throw new Error('目标目录中已存在同名项目');
    await fs.rename(itemPath, targetPath);
    return { oldPath: itemPath, path: targetPath, workspaceId: source.id, sourceType: source.type };
  });

  ipcMain.handle('noteeasy:list-tree', async (event, rootPath) => {
    if (!rootPath) return null;
    try {
      startRepositoryWatcher(rootPath);
      return await buildTree(rootPath);
    } catch (error) {
      if (error && error.code === 'ENOENT') {
        stopRepositoryWatcher();
        const settings = await readSettings();
        if (settings.rootPath === rootPath) {
          await writeSettings({ rootPath: '', lastFilePath: '', lastPosition: null });
        }
        return null;
      }
      throw error;
    }
  });

  ipcMain.handle('noteeasy:read-note', async (event, filePath, rootPath) => {
    await assertInsideRoot(filePath, rootPath);
    if (!isMarkdownFile(filePath)) throw new Error('仅支持打开 Markdown 文件');
    try {
      const stat = await fs.stat(filePath);
      const content = await fs.readFile(filePath, 'utf8');
      return {
        path: filePath,
        name: path.basename(filePath),
        content,
        modifiedAt: stat.mtimeMs,
        size: stat.size
      };
    } catch (error) {
      if (error && error.code === 'ENOENT') {
        const settings = await readSettings();
        if (settings.lastFilePath === filePath) {
          await writeSettings({ lastFilePath: '', lastPosition: null });
        }
        return {
          missing: true,
          path: filePath,
          name: path.basename(filePath)
        };
      }
      throw error;
    }
  });

  ipcMain.handle('noteeasy:save-note', async (event, filePath, content, rootPath) => {
    await assertInsideRoot(filePath, rootPath);
    if (!isMarkdownFile(filePath)) throw new Error('仅支持保存 Markdown 文件');
    await fs.writeFile(filePath, String(content || ''), 'utf8');
    const stat = await fs.stat(filePath);
    await writeSettings({ lastFilePath: filePath });
    return {
      path: filePath,
      name: path.basename(filePath),
      modifiedAt: stat.mtimeMs,
      size: stat.size
    };
  });

  ipcMain.handle('noteeasy:create-note', async (event, parentDir, name, rootPath) => {
    await assertInsideRoot(parentDir, rootPath);
    const fileName = normalizeNoteName(name);
    const filePath = await getAvailablePath(path.join(parentDir, fileName));
    await assertInsideRoot(filePath, rootPath);
    const title = path.basename(filePath, path.extname(filePath));
    await fs.writeFile(filePath, `# ${title}\n\n`, 'utf8');
    return { path: filePath, name: path.basename(filePath) };
  });

  ipcMain.handle('noteeasy:create-folder', async (event, parentDir, name, rootPath) => {
    await assertInsideRoot(parentDir, rootPath);
    const folderName = normalizeFolderName(name);
    const folderPath = await getAvailablePath(path.join(parentDir, folderName));
    await assertInsideRoot(folderPath, rootPath);
    await fs.mkdir(folderPath);
    return { path: folderPath, name: path.basename(folderPath) };
  });

  ipcMain.handle('noteeasy:rename-item', async (event, itemPath, nextName, rootPath) => {
    await assertInsideRoot(itemPath, rootPath);
    const stat = await fs.stat(itemPath);
    const finalName = stat.isDirectory() ? normalizeFolderName(nextName) : normalizeNoteName(nextName);
    const targetPath = path.join(path.dirname(itemPath), finalName);
    await assertInsideRoot(targetPath, rootPath);
    if (targetPath !== itemPath && await pathExists(targetPath)) throw new Error('目标名称已存在');
    await fs.rename(itemPath, targetPath);
    return { oldPath: itemPath, path: targetPath, name: finalName };
  });

  ipcMain.handle('noteeasy:delete-item', async (event, itemPath, rootPath) => {
    await assertInsideRoot(itemPath, rootPath);
    await fs.rm(itemPath, { recursive: true, force: false });
    return { path: itemPath };
  });

  ipcMain.handle('noteeasy:move-item', async (event, itemPath, targetDir, rootPath) => {
    await assertInsideRoot(itemPath, rootPath);
    const resolvedTargetDir = path.isAbsolute(String(targetDir || ''))
      ? String(targetDir || '')
      : path.join(rootPath, String(targetDir || ''));
    await assertInsideRoot(resolvedTargetDir, rootPath);
    const targetStat = await fs.stat(resolvedTargetDir);
    if (!targetStat.isDirectory()) throw new Error('目标路径不是文件夹');
    const targetPath = path.join(resolvedTargetDir, path.basename(itemPath));
    await assertInsideRoot(targetPath, rootPath);
    if (path.resolve(itemPath) === path.resolve(targetPath)) return { path: itemPath };
    if ((await fs.stat(itemPath)).isDirectory()) {
      const relative = path.relative(path.resolve(itemPath), path.resolve(targetPath));
      if (!relative.startsWith('..') && relative !== '') {
        throw new Error('不能将文件夹移动到自身内部');
      }
    }
    if (await pathExists(targetPath)) throw new Error('目标目录中已存在同名项目');
    await fs.rename(itemPath, targetPath);
    return { oldPath: itemPath, path: targetPath };
  });

  ipcMain.handle('noteeasy:show-item', async (event, itemPath) => {
    shell.showItemInFolder(itemPath);
  });
}
