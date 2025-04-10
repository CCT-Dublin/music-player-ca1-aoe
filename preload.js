// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('musicAPI', {
  controlWindow: (action) => ipcRenderer.send('window-control', action),
  getSongs: () => ipcRenderer.invoke('get-songs'),
  selectFolder: () => ipcRenderer.invoke('select-folder'), // Expose folder selection
});
