// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('musicAPI', {
  getSongs: () => ipcRenderer.invoke('get-songs')
});
