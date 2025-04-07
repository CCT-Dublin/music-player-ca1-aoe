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
const eqBars = document.querySelectorAll(".eq-bar");
const playlistEl = document.querySelector("#playlist ul");

const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioContext.createAnalyser();
const source = audioContext.createMediaElementSource(audio);
source.connect(analyser);
analyser.connect(audioContext.destination);
analyser.fftSize = 32;
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

let songs = [];
let currentSongIndex = 0;

function startEqualizer() {
    if (audioContext.state === "suspended") {
        audioContext.resume();
    }

    function animateEqualizer() {
        analyser.getByteFrequencyData(dataArray);
        eqBars.forEach((bar, index) => {
            let value = dataArray[index] / 2;
            bar.style.height = `${Math.max(value, 5)}px`;
        });

        if (!audio.paused) {
            requestAnimationFrame(animateEqualizer);
        } else {
            stopEqualizer();
        }
    }

    animateEqualizer();
}

function stopEqualizer() {
    eqBars.forEach(bar => {
        bar.style.height = "10px";
    });
}

function loadSong(index = currentSongIndex) {
    if (!songs.length) return;
    currentSongIndex = index;
    audio.src = songs[currentSongIndex];
    songTitle.textContent = songs[currentSongIndex].split('/').pop();
    loadLyricsForSong(songs[currentSongIndex].split('/').pop());

}

function playSong() {
    if (!audio.src) loadSong();
    audio.play();
    startEqualizer();
}

function pauseSong() {
    audio.pause();
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

audio.addEventListener("timeupdate", () => {
    seekBar.max = audio.duration;
    seekBar.value = audio.currentTime;
});

seekBar.addEventListener("input", () => {
    audio.currentTime = seekBar.value;
});

volumeBar.addEventListener("input", () => {
    audio.volume = volumeBar.value;
});

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
});

// 🎵 Load songs dynamically from music folder
window.musicAPI.getSongs().then(fileList => {
    songs = fileList.map(name => `music/${name}`);
    playlistEl.innerHTML = "";

    songs.forEach((src, index) => {
        const li = document.createElement("li");
        const button = document.createElement("button");
        button.classList.add("playlist-item");
        button.dataset.src = src;
        button.textContent = `🎵 ${src.split('/').pop()}`;
        button.addEventListener("click", () => {
            loadSong(index);
            playSong();
        });
        li.appendChild(button);
        playlistEl.appendChild(li);
    });

    loadSong(); // Load first song
});

// 🎧 Button events with toggle play/pause logic
let isPlaying = false;

playButton.addEventListener("click", () => {
    if (audio.paused) {
        playSong();
        playButton.innerHTML = `<i class="fa-solid fa-pause"></i>`;
        isPlaying = true;
    } else {
        pauseSong();
        playButton.innerHTML = `<i class="fa-solid fa-play"></i>`;
        isPlaying = false;
    }
});

stopButton.addEventListener("click", () => {
    stopSong();
    playButton.innerHTML = `<i class="fa-solid fa-play"></i>`;
    isPlaying = false;
});

prevButton.addEventListener("click", () => {
    prevSong();
    playButton.innerHTML = `<i class="fa-solid fa-pause"></i>`;
    isPlaying = true;
});

nextButton.addEventListener("click", () => {
    nextSong();
    playButton.innerHTML = `<i class="fa-solid fa-pause"></i>`;
    isPlaying = true;
});

const lyricsDisplay = document.getElementById("lyrics");

function loadLyricsForSong(songName) {
    // Normalize the input name
    const normalized = songName.trim().toLowerCase();

    console.log("Normalized song name:", normalized);

    // Normalized lyrics map
    const lyricsMap = {
        "age of empires 2 - soundtrack [jrrr7w4wz18].mp3": `🎶 These are the lyrics\nLine by line\nEnjoy the time`,
        "the weeknd - call out my name (official video).mp3": `🔥 Another song\nFeel the beat\nMove your feet`,
        "the weeknd - save your tears (official music video).mp3": `✨ Calm and slow\nMelodies flow\nLet it grow`
    };

    const lyrics = lyricsMap[normalized] || "No lyrics available.";
    lyricsDisplay.textContent = lyrics;
}

