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
const addFolderButton = document.getElementById("add-folder");
const volumeIcon = document.querySelector('.volume-icon');

const shuffleBtn = document.getElementById("shuffle");
const repeatBtn = document.getElementById("repeat");

let isMuted = false;
let previousVolume = 0.5;
let isShuffle = false;
let isRepeat = false;

shuffleBtn.addEventListener("click", () => {
  isShuffle = !isShuffle;
  shuffleBtn.classList.toggle("active", isShuffle);
});

repeatBtn.addEventListener("click", () => {
  isRepeat = !isRepeat;
  repeatBtn.classList.toggle("active", isRepeat);
});

const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const source = audioContext.createMediaElementSource(audio);

const bassEQ = audioContext.createBiquadFilter();
bassEQ.type = "lowshelf";
bassEQ.frequency.value = 200;

const midEQ = audioContext.createBiquadFilter();
midEQ.type = "peaking";
midEQ.frequency.value = 1000;
midEQ.Q.value = 1;

const trebleEQ = audioContext.createBiquadFilter();
trebleEQ.type = "highshelf";
trebleEQ.frequency.value = 3000;

const analyser = audioContext.createAnalyser();
analyser.fftSize = 32;
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

source
    .connect(bassEQ)
    .connect(midEQ)
    .connect(trebleEQ)
    .connect(analyser)
    .connect(audioContext.destination);

let songs = [];
let currentSongIndex = 0;
let currentTrackElement = null;

window.addEventListener('DOMContentLoaded', () => {
    const songTime = document.getElementById('song-time');

    const formatTime = (sec) => {
        const m = Math.floor(sec / 60).toString().padStart(2, '0');
        const s = Math.floor(sec % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    audio.addEventListener("loadedmetadata", () => {
        seekBar.max = audio.duration || 0;
    });

    audio.addEventListener("timeupdate", () => {
        if (!isNaN(audio.duration)) {
            songTime.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
            seekBar.value = audio.currentTime;
        }
    });
});

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
        bar.style.height = "5px";
    });
}

function loadSong(index = currentSongIndex) {
    if (!songs.length) return;
    currentSongIndex = index;
    audio.src = songs[currentSongIndex];
    const songName = songs[currentSongIndex].replace(/\\/g, '/').split('/').pop();
    songTitle.textContent = songName;
    loadLyricsForSong(songName);
    updateActiveTrack();
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

function playNextSong() {
    const items = [...document.querySelectorAll(".playlist-item")];
    let currentIndex = items.findIndex(btn => btn.classList.contains("active"));
    let nextIndex;

    if (isShuffle) {
        do {
            nextIndex = Math.floor(Math.random() * items.length);
        } while (nextIndex === currentIndex);
    } else {
        nextIndex = currentIndex + 1;
        if (nextIndex >= items.length) {
            if (isRepeat) {
                nextIndex = 0;
            } else {
                return;
            }
        }
    }

    items[currentIndex]?.classList.remove("active");
    items[nextIndex]?.classList.add("active");
    items[nextIndex]?.click();
}

audio.addEventListener("ended", playNextSong);

seekBar.addEventListener("input", () => {
    audio.currentTime = seekBar.value;
});

volumeBar.addEventListener("input", () => {
    audio.volume = volumeBar.value;
    isMuted = false;
    updateVolumeIcon(audio.volume);
});

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
});

function updateActiveTrack() {
    const playlistItems = document.querySelectorAll('.playlist-item');
    playlistItems.forEach((item, index) => {
        item.classList.remove('active');
        if (index === currentSongIndex) {
            item.classList.add('active');
            currentTrackElement = item;
        }
    });
}

window.musicAPI.getSongs().then(fileList => {
    if (audio && !audio.paused) {
        audio.pause();
        audio.currentTime = 0;
    }

    playlistEl.innerHTML = "";
    songs = [];

    songs = fileList.map(name => `music/${name}`);

    songs.forEach((src, index) => {
        const fileName = src.split('/').pop();
        const [artist, title] = fileName.replace('.mp3', '').split(' - ').map(part => part.trim());

        const li = document.createElement("li");
        const button = document.createElement("button");
        button.classList.add("playlist-item");
        button.dataset.src = src;
        button.textContent = artist && title ? `🎵 ${artist} - ${title}` : `🎵 ${fileName}`;
        button.addEventListener("click", () => {
            loadSong(index);
            playSong();
        });

        li.appendChild(button);
        playlistEl.appendChild(li);
    });

    loadSong();
});

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
    playNextSong();
    playButton.innerHTML = `<i class="fa-solid fa-pause"></i>`;
    isPlaying = true;
});

const lyricsDisplay = document.getElementById("lyrics");

async function loadLyricsForSong(songName) {
    const [artist, title] = songName.replace('.mp3', '').split(' - ').map(part => part.trim());

    if (!artist || !title) {
        lyricsDisplay.textContent = "Unable to fetch lyrics. Invalid song format.";
        return;
    }

    try {
        const response = await fetch(`https://api.lyrics.ovh/v1/${artist}/${title}`);
        if (!response.ok) throw new Error("Lyrics not found");
        const data = await response.json();
        lyricsDisplay.textContent = data.lyrics || "No lyrics available.";
    } catch (error) {
        console.error("Error fetching lyrics:", error);
        lyricsDisplay.textContent = "No lyrics available online or external API error";
    }
}

async function addSongsFromFolder() {
    playlistEl.innerHTML = "";
    songs = [];

    const newSongs = await window.musicAPI.selectFolder();
    if (newSongs.length === 0) {
        alert("No songs were added.");
        return;
    }

    songs = [...songs, ...newSongs];
    playlistEl.innerHTML = "";

    songs.forEach((src, index) => {
        const fileName = src.split('\\').pop();
        const [artist, title] = fileName.replace('.mp3','').split(' - ').map(part => part.trim());

        const li = document.createElement("li");
        const button = document.createElement("button");
        button.classList.add("playlist-item");
        button.dataset.src = src;
        button.textContent = artist && title ? `🎵 ${artist} - ${title}` : `🎵 ${fileName}`;
        button.addEventListener("click", () => {
            loadSong(index);
            playSong();
        });
        li.appendChild(button);
        playlistEl.appendChild(li);
    });

    loadSong();
    alert(`${newSongs.length} songs added to the playlist.`);
}

addFolderButton.addEventListener("click", () => {
    addSongsFromFolder();
});

document.getElementById('buttonred').addEventListener('click', () => {
    window.musicAPI.controlWindow('close');
});

document.getElementById('buttonyellow').addEventListener('click', () => {
    window.musicAPI.controlWindow('minimize');
});

document.getElementById('buttongreen').addEventListener('click', () => {
    window.musicAPI.controlWindow('maximize');
});

document.getElementById("bass").addEventListener("input", (e) => {
    bassEQ.gain.value = e.target.value;
});
document.getElementById("mid").addEventListener("input", (e) => {
    midEQ.gain.value = e.target.value;
});
document.getElementById("treble").addEventListener("input", (e) => {
    trebleEQ.gain.value = e.target.value;
});

window.musicAPI.onMediaControl((action) => {
    switch (action) {
        case 'previous':
            prevSong();
            playButton.innerHTML = `<i class="fa-solid fa-pause"></i>`;
            isPlaying = true;
            break;
        case 'play-pause':
            if (audio.paused) {
                playSong();
                playButton.innerHTML = `<i class="fa-solid fa-pause"></i>`;
                isPlaying = true;
            } else {
                pauseSong();
                playButton.innerHTML = `<i class="fa-solid fa-play"></i>`;
                isPlaying = false;
            }
            break;
        case 'next':
            playNextSong();
            playButton.innerHTML = `<i class="fa-solid fa-pause"></i>`;
            isPlaying = true;
            break;
    }
});

volumeIcon.addEventListener('click', () => {
    isMuted = !isMuted;

    if (isMuted) {
        previousVolume = audio.volume;
        audio.volume = 0;
        volumeBar.value = 0;
        volumeIcon.classList.remove('fa-volume-low', 'fa-volume-high', 'fa-volume-off');
        volumeIcon.classList.add('fa-volume-mute');
    } else {
        audio.volume = previousVolume;
        volumeBar.value = previousVolume;
        updateVolumeIcon(previousVolume);
    }
});

function updateVolumeIcon(volume) {
    volumeIcon.classList.remove('fa-volume-mute', 'fa-volume-low', 'fa-volume-high', 'fa-volume-off');
    if (volume === 0) {
        volumeIcon.classList.add('fa-volume-off');
    } else if (volume < 0.5) {
        volumeIcon.classList.add('fa-volume-low');
    } else {
        volumeIcon.classList.add('fa-volume-high');
    }
}

updateVolumeIcon(audio.volume);
