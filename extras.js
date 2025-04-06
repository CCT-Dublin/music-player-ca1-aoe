const { ipcRenderer } = require('electron');

// Window control buttons
document.getElementById('buttonred').addEventListener('click', () => {
    ipcRenderer.send('window-control', 'close');
  });
document.getElementById('buttonyellow').addEventListener('click', () => {
    ipcRenderer.send('window-control', 'minimize');
  });
document.getElementById('buttongreen').addEventListener('click', () => {
    ipcRenderer.send('window-control', 'maximize');
  });