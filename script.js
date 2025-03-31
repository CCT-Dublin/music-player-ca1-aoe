const audio = document.getElementById("audio");
const playButton = document.getElementById("play");
const pauseButton = document.getElementById("pause");
const prevButton = document.getElementById("prev");
const nextButton = document.getElementById("next");
const stopButton = document.getElementById("stop");
const songTitle = document.getElementById("song-title");
const songTime = document.getElementById("song-time");
const playlistItems = document.querySelectorAll("#playlist li");
const equalizerBars = document.querySelectorAll(".eq-bar");

let currentSongIndex = 0;
const songs = [];

// Load Songs from Playlist
playlistItems.forEach((item, index) => {
    songs.push(item.getAttribute("data-src"));
    item.addEventListener("click", () => {
        currentSongIndex = index;
        loadSong();
        audio.play();
    });
});

// Load Selected Song
function loadSong() {
    audio.src = songs[currentSongIndex];
    songTitle.textContent = playlistItems[currentSongIndex].textContent;
}

// Play Button
playButton.addEventListener("click", () => {
    if (!audio.src) {
        loadSong();
    }
    audio.play();
    startEqualizer();
});

// Pause Button
pauseButton.addEventListener("click", () => {
    audio.pause();
    stopEqualizer();
});

// Stop Button
stopButton.addEventListener("click", () => {
    audio.pause();
    audio.currentTime = 0;
    stopEqualizer();
});

// Previous Button
prevButton.addEventListener("click", () => {
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    loadSong();
    audio.play();
});

// Next Button
nextButton.addEventListener("click", () => {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    loadSong();
    audio.play();
});

// Update Time Display
audio.addEventListener("timeupdate", () => {
    let minutes = Math.floor(audio.currentTime / 60) || 0;
    let seconds = Math.floor(audio.currentTime % 60) || 0;
    let totalMinutes = Math.floor(audio.duration / 60) || 0;
    let totalSeconds = Math.floor(audio.duration % 60) || 0;
    songTime.textContent = `${minutes}:${seconds.toString().padStart(2, "0")} / ${totalMinutes}:${totalSeconds.toString().padStart(2, "0")}`;
});

// Equalizer Animation
function startEqualizer() {
    equalizerBars.forEach(bar => bar.style.animationPlayState = "running");
}
function stopEqualizer() {
    equalizerBars.forEach(bar => bar.style.animationPlayState = "paused");
}

loadSong();
