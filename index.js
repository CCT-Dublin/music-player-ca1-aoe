const { app, BrowserWindow, ipcMain, dialog, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');

let win;

const createWindow = () => {
  win = new BrowserWindow({
    width: 1000,
    height: 850,
    frame: false,
    resizable: true,
    transparent: true,
    icon: path.join(__dirname, 'image/logo.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: true
    }
  });

  win.loadFile('index.html');

  // --- Add media control buttons to Windows taskbar ---
  win.setThumbarButtons([
    {
      tooltip: 'Previous',
      icon: nativeImage.createFromPath(path.join(__dirname, 'assets', 'prev.png')),
      click: () => win.webContents.send('media-control', 'previous')
    },
    {
      tooltip: 'Play/Pause',
      icon: nativeImage.createFromPath(path.join(__dirname, 'assets', 'play.png')),
      click: () => win.webContents.send('media-control', 'play-pause')
    },
    {
      tooltip: 'Next',
      icon: nativeImage.createFromPath(path.join(__dirname, 'assets', 'next.png')),
      click: () => win.webContents.send('media-control', 'next')
    }
  ]);
  
};

// Handle file loading from the music folder
ipcMain.handle('get-songs', async () => {
  const musicDir = path.join(__dirname, 'music');
  const files = fs.readdirSync(musicDir);
  return files.filter(file => file.match(/\.(mp3|wav|ogg)$/i));
});

// Allow folder selection
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(win, {
    properties: ['openFile', 'multiSelections'], // Allow selecting files and multiple selections
    filters: [
      { name: 'Audio Files', extensions: ['mp3', 'wav', 'ogg'] } // Filter for audio files
    ]
  });

  if (result.canceled) {
    return [];
  }

  return result.filePaths; // Return the selected file paths
});

app.whenReady().then(() => {
  createWindow();
});

// Custom window controls
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
      win.isMaximized() ? win.restore() : win.maximize();
      break;
  }
});
