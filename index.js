const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let win;

const createWindow = () => {
  win = new BrowserWindow({
    width: 1000,
    height: 800,
    frame: false,
    resizable: true,
    transparent: true,
    icon: __dirname + '/image/logo.png',

    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // Use preload script for security
      nodeIntegration: true,  // Needed for require in renderer (security risk for production)
      contextIsolation: true // Allows access to Node.js APIs directly in renderer !!!! HERE IS THE PROBLEM! 
      // When the contextIsolation is true, we can play the music, but we can not use the require function in the renderer process (windows control buttons).
    }
  });

  win.loadFile('index.html');
  // win.webContents.openDevTools(); // This open the developer tools for debugging, DONT USE IT
};

// Handle file loading from the music folder
ipcMain.handle('get-songs', async () => {
  const musicDir = path.join(__dirname, 'music');
  const files = fs.readdirSync(musicDir);
  return files.filter(file => file.endsWith('.mp3'));
});

// Add this IPC handler to allow folder selection
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(win, {
    properties: ['openDirectory']
  });

  if (result.canceled) {
    return []; // Return an empty array if the user cancels
  }

  const selectedFolder = result.filePaths[0];
  const files = fs.readdirSync(selectedFolder);
  return files
    .filter(file => file.endsWith('.mp3'))
    .map(file => path.join(selectedFolder, file)); // Return full paths
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

