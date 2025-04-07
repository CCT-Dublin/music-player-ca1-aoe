

// Window control buttons
document.getElementById('buttonred').addEventListener('click', () => {
  window.musicAPI.controlWindow('close');
});

document.getElementById('buttonyellow').addEventListener('click', () => {
  window.musicAPI.controlWindow('minimize');
});

document.getElementById('buttongreen').addEventListener('click', () => {
  window.musicAPI.controlWindow('maximize');
});