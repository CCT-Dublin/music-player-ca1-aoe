// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('musicAPI', {
  controlMedia: (action, state) => ipcRenderer.send(action, state),
  controlWindow: (action) => ipcRenderer.send('window-control', action),
  // shrinkWindow: () => ipcRenderer.send('window-control', 'shrink'),


  getSongs: () => ipcRenderer.invoke('get-songs'),
  selectFolder: () => ipcRenderer.invoke('select-folder'),

  // Expose media control listener
  onMediaControl: (callback) => {
    ipcRenderer.on('media-control', (event, action) => {
      callback(action);
    });
  },

  // Expose track change listener
  onTrackChanged: (callback) => {
    ipcRenderer.on('track-changed', (event, trackInfo) => {
      callback(trackInfo);
    });
  },

  // Expose track change event sender
  changeTrack: (trackInfo) => {
    ipcRenderer.send('track-changed', trackInfo);
  },
  
  notifySong: (title) => ipcRenderer.send("notify-song", title)
});

