const audio = document.getElementById("audio"); 
const playButton = document.getElementById("play");
const pauseButton = document.getElementById("pause");
const prevButton = document.getElementById("prev");
const nextButton = document.getElementById("next");
const stopButton = document.getElementById("stop");
const songTitle = document.getElementById("song-title");
const songTime = document.getElementById("song-time");
const playlistItems = document.querySelectorAll("#playlist .playlist-item");
const equalizerBars = document.querySelectorAll(".eq-bar");

let currentSongIndex = 0;
const songs = Array.from(playlistItems).map(item => item.dataset.src);

// Load Selected Song
function loadSong(index = currentSongIndex) {
    if (!songs.length) return;
    currentSongIndex = index;
    audio.src = songs[currentSongIndex];
    songTitle.textContent = playlistItems[currentSongIndex].textContent.trim();
}

// Play Song
function playSong() {
    if (!audio.src) loadSong();
    audio.play().then(startEqualizer).catch(err => console.error("Playback failed:", err));
}

// Pause Song
function pauseSong() {
    audio.pause();
    stopEqualizer();
}

// Stop Song
function stopSong() {
    audio.pause();
    audio.currentTime = 0;
    stopEqualizer();
}

// Play Previous Song
function prevSong() {
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    loadSong();
    playSong();
}

// Play Next Song
function nextSong() {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    loadSong();
    playSong();
}

// Update Time Display
function updateTime() {
    let minutes = Math.floor(audio.currentTime / 60) || 0;
    let seconds = Math.floor(audio.currentTime % 60) || 0;
    let totalMinutes = Math.floor(audio.duration / 60) || 0;
    let totalSeconds = Math.floor(audio.duration % 60) || 0;

    if (!isNaN(totalMinutes) && !isNaN(totalSeconds)) {
        songTime.textContent = `${minutes}:${seconds.toString().padStart(2, "0")} / ${totalMinutes}:${totalSeconds.toString().padStart(2, "0")}`;
    } else {
        songTime.textContent = "00:00 / 00:00";
    }
}

// Equalizer Animation
function startEqualizer() {
    equalizerBars.forEach(bar => bar.style.animationPlayState = "running");
}
function stopEqualizer() {
    equalizerBars.forEach(bar => bar.style.animationPlayState = "paused");
}

// Event Listeners
playButton.addEventListener("click", playSong);
pauseButton.addEventListener("click", pauseSong);
stopButton.addEventListener("click", stopSong);
prevButton.addEventListener("click", prevSong);
nextButton.addEventListener("click", nextSong);
audio.addEventListener("timeupdate", updateTime);
audio.addEventListener("ended", stopEqualizer); // Stops equalizer when song ends

// Playlist Click Event
playlistItems.forEach((item, index) => {
    item.addEventListener("click", () => {
        loadSong(index);
        playSong();
    });
});

// Initialize First Song
loadSong();
