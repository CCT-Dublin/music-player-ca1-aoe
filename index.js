const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
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
