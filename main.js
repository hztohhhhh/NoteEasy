const { app, BrowserWindow, Menu, dialog, ipcMain, shell } = require('electron');
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

const MARKDOWN_EXTENSIONS = new Set(['.md', '.markdown', '.mdown', '.mkd']);

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
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

function registerIpcHandlers() {
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
