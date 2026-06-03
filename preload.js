const { contextBridge, ipcRenderer, webUtils } = require('electron');

contextBridge.exposeInMainWorld('noteEasyApi', {
  isElectron: true,
  getPathForFile: (file) => {
    try {
      return webUtils.getPathForFile(file);
    } catch (error) {
      return '';
    }
  },
  resolveExistingPath: (paths) => {
    try {
      return ipcRenderer.sendSync('noteeasy:resolve-existing-path', Array.isArray(paths) ? paths : []);
    } catch (error) {
      return '';
    }
  },
  getSettings: () => ipcRenderer.invoke('noteeasy:get-settings'),
  setSettings: (patch) => ipcRenderer.invoke('noteeasy:set-settings', patch),
  chooseRepository: () => ipcRenderer.invoke('noteeasy:choose-repository'),
  chooseWorkspaceFolder: (type) => ipcRenderer.invoke('noteeasy:choose-workspace-folder', type),
  createNetworkWorkspace: (url, name) => ipcRenderer.invoke('noteeasy:create-network-workspace', url, name),
  listWorkspace: (sources) => ipcRenderer.invoke('noteeasy:list-workspace', sources),
  listWorkspaceSource: (source) => ipcRenderer.invoke('noteeasy:list-workspace-source', source),
  readWorkspaceNote: (source, filePath) => ipcRenderer.invoke('noteeasy:read-workspace-note', source, filePath),
  saveWorkspaceNote: (source, filePath, content) => ipcRenderer.invoke('noteeasy:save-workspace-note', source, filePath, content),
  createWorkspaceNote: (source, parentDir, name) => ipcRenderer.invoke('noteeasy:create-workspace-note', source, parentDir, name),
  createWorkspaceFolder: (source, parentDir, name) => ipcRenderer.invoke('noteeasy:create-workspace-folder', source, parentDir, name),
  renameWorkspaceItem: (source, itemPath, nextName) => ipcRenderer.invoke('noteeasy:rename-workspace-item', source, itemPath, nextName),
  deleteWorkspaceItem: (source, itemPath) => ipcRenderer.invoke('noteeasy:delete-workspace-item', source, itemPath),
  moveWorkspaceItem: (source, itemPath, targetDir) => ipcRenderer.invoke('noteeasy:move-workspace-item', source, itemPath, targetDir),
  listTree: (rootPath) => ipcRenderer.invoke('noteeasy:list-tree', rootPath),
  readNote: (filePath, rootPath) => ipcRenderer.invoke('noteeasy:read-note', filePath, rootPath),
  saveNote: (filePath, content, rootPath) => ipcRenderer.invoke('noteeasy:save-note', filePath, content, rootPath),
  createNote: (parentDir, name, rootPath) => ipcRenderer.invoke('noteeasy:create-note', parentDir, name, rootPath),
  createFolder: (parentDir, name, rootPath) => ipcRenderer.invoke('noteeasy:create-folder', parentDir, name, rootPath),
  renameItem: (itemPath, nextName, rootPath) => ipcRenderer.invoke('noteeasy:rename-item', itemPath, nextName, rootPath),
  deleteItem: (itemPath, rootPath) => ipcRenderer.invoke('noteeasy:delete-item', itemPath, rootPath),
  moveItem: (itemPath, targetDir, rootPath) => ipcRenderer.invoke('noteeasy:move-item', itemPath, targetDir, rootPath),
  showItem: (itemPath) => ipcRenderer.invoke('noteeasy:show-item', itemPath),
  onRepositoryChanged: (callback) => {
    const listener = (event, payload) => callback(payload);
    ipcRenderer.on('noteeasy:repository-changed', listener);
    return () => ipcRenderer.removeListener('noteeasy:repository-changed', listener);
  },
  onWorkspaceChanged: (callback) => {
    const listener = (event, payload) => callback(payload);
    ipcRenderer.on('noteeasy:workspace-changed', listener);
    return () => ipcRenderer.removeListener('noteeasy:workspace-changed', listener);
  }
});
