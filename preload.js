// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('musicAPI', {
  controlWindow: (action) => ipcRenderer.send('window-control', action),
  getSongs: () => ipcRenderer.invoke('get-songs'),
  selectFolder: () => ipcRenderer.invoke('select-folder'),

  // Expose media control listener
  onMediaControl: (callback) => {
    ipcRenderer.on('media-control', (event, action) => {
      callback(action);
    });
  }
});
