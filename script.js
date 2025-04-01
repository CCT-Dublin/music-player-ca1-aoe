const audio = document.getElementById("audio"); 
const playButton = document.getElementById("play");
const pauseButton = document.getElementById("pause");
const prevButton = document.getElementById("prev");
const nextButton = document.getElementById("next");
const stopButton = document.getElementById("stop");
const songTitle = document.getElementById("song-title");
const songTime = document.getElementById("song-time");
const seekBar = document.getElementById("seek-bar");
const volumeBar = document.getElementById("volume-bar");
const themeToggle = document.getElementById("theme-toggle");
const playlistItems = document.querySelectorAll("#playlist .playlist-item");
const equalizerBars = document.querySelectorAll(".eq-bar");

let currentSongIndex = 0;
const songs = Array.from(playlistItems).map(item => item.dataset.src);

// Load and Play Song
function loadSong(index = currentSongIndex) {
    if (!songs.length) return;
    currentSongIndex = index;
    audio.src = songs[currentSongIndex];
    songTitle.textContent = playlistItems[currentSongIndex].textContent.trim();
}

function playSong() {
    if (!audio.src) loadSong();
    audio.play();
    startEqualizer();
}

function pauseSong() {
    audio.pause();
    stopEqualizer();
}

function stopSong() {
    audio.pause();
    audio.currentTime = 0;
    stopEqualizer();
}

function prevSong() {
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    loadSong();
    playSong();
}

function nextSong() {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    loadSong();
    playSong();
}

// Update Time and Seek Bar
audio.addEventListener("timeupdate", () => {
    seekBar.max = audio.duration;
    seekBar.value = audio.currentTime;
});

// Theme Toggle
themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
});

// Playlist Click Event
playlistItems.forEach((item, index) => {
    item.addEventListener("click", () => {
        loadSong(index);
        playSong();
    });
});

loadSong();
