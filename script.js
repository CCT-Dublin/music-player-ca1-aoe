const audio = document.getElementById("audio"); 
const playButton = document.getElementById("play");
const pauseButton = document.getElementById("pause");
const prevButton = document.getElementById("prev");
const nextButton = document.getElementById("next");
const stopButton = document.getElementById("stop");
const songTitle = document.getElementById("song-title");
const seekBar = document.getElementById("seek-bar");
const volumeBar = document.getElementById("volume-bar");
const themeToggle = document.getElementById("theme-toggle");
const playlistItems = document.querySelectorAll("#playlist .playlist-item");

let currentSongIndex = 0;
const songs = Array.from(playlistItems).map(item => item.dataset.src);

function loadSong(index = currentSongIndex) {
    if (!songs.length) return;
    currentSongIndex = index;
    audio.src = songs[currentSongIndex];
    songTitle.textContent = playlistItems[currentSongIndex].textContent.trim();
}

function playSong() {
    if (!audio.src) loadSong();
    audio.play();
}

function pauseSong() {
    audio.pause();
}

function stopSong() {
    audio.pause();
    audio.currentTime = 0;
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

audio.addEventListener("timeupdate", () => {
    seekBar.max = audio.duration;
    seekBar.value = audio.currentTime;
});

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
});

playlistItems.forEach((item, index) => {
    item.addEventListener("click", () => {
        loadSong(index);
        playSong();
    });
});

loadSong();
