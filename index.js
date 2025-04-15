const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let win;

const createWindow = () => {
  win = new BrowserWindow({
    width: 1000,
    height: 1000,
    frame: false,
    resizable: true,
    transparent: true,
    icon: path.join(__dirname, 'image/logo.png'),

    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // Use preload script for security
      nodeIntegration: true,  // Needed for require in renderer (security risk for production)
      contextIsolation: true // Allows access to Node.js APIs directly in renderer
    }
  });

  win.loadFile('index.html');
  // win.webContents.openDevTools(); // This opens the developer tools for debugging
};

// Handle file loading from the music folder
ipcMain.handle('get-songs', async () => {
  const musicDir = path.join(__dirname, 'music');
  const files = fs.readdirSync(musicDir);
  return files.filter(file => file.match(/\.(mp3|wav|ogg)$/i));
});

// Add this IPC handler to allow folder selection
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(win, {
    properties: ['openDirectory']
  });

  if (result.canceled) {
    return [];
  }

  const selectedFolder = result.filePaths[0];
  const files = fs.readdirSync(selectedFolder);

  return files
    .filter(file => file.match(/\.(mp3|wav|ogg)$/i))
    .map(file => path.join(selectedFolder, file));
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
