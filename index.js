const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let win;

const createWindow = () => {
  win = new BrowserWindow({
    width: 400,
    height: 720,
    frame: false,
    resizable: true,
    transparent: true,
    
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // Use preload script for security
      nodeIntegration: true,  // Needed for require in renderer (security risk for production)
      contextIsolation: true // Allows access to Node.js APIs directly in renderer !!!! HERE IS THE PROBLEM! 
      // When the contextIsolation is true, we can play the music, but we can not use the require function in the renderer process (windows control buttons).
    }
  });

  win.loadFile('index.html');
};

// Handle file loading from the music folder
ipcMain.handle('get-songs', async () => {
  const musicDir = path.join(__dirname, 'music');
  const files = fs.readdirSync(musicDir);
  return files.filter(file => file.endsWith('.mp3'));
});

app.whenReady().then(() => {
  createWindow();
});


// Handle custom window control events
ipcMain.on('window-control', (event, action) => {
  if (!win) return;

  switch (action) {
    case 'close':
      win.close();
      break;
    case 'minimize':
      win.minimize();
      break;
    case 'maximize':
      if (win.isMaximized()) {
        win.restore();
      } else {
        win.maximize();
      }
      break;
  }
});