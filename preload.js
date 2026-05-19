const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('noteEasyApi', {
  isElectron: true,
  getSettings: () => ipcRenderer.invoke('noteeasy:get-settings'),
  setSettings: (patch) => ipcRenderer.invoke('noteeasy:set-settings', patch),
  chooseRepository: () => ipcRenderer.invoke('noteeasy:choose-repository'),
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
  }
});
