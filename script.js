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
const lyricsDisplay = document.getElementById("lyrics");
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

// EQ
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

// Analyzer
const analyser = audioContext.createAnalyser();
analyser.fftSize = 32;
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

// Connections
source
    .connect(bassEQ)
    .connect(midEQ)
    .connect(trebleEQ)
    .connect(analyser)
    .connect(audioContext.destination);

let songs = [];
let currentSongIndex = 0;
let currentTrackElement = null;
let isPlaying = false;

// Timer actualizado para current-time y total-duration
const currentTimeEl = document.getElementById("current-time");
const totalDurationEl = document.getElementById("total-duration");

function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

audio.addEventListener("loadedmetadata", () => {
    if (!isNaN(audio.duration)) {
        totalDurationEl.textContent = formatTime(audio.duration);
    }
});

audio.addEventListener("timeupdate", () => {
    if (!isNaN(audio.currentTime)) {
        currentTimeEl.textContent = formatTime(audio.currentTime);
    }

    seekBar.max = audio.duration;
    seekBar.value = audio.currentTime;
});

// Equalizer animation
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

// Song controls
function loadSong(index = currentSongIndex) {
    if (!songs.length) return;
    currentSongIndex = index;
    audio.src = songs[currentSongIndex];
    const songName = songs[currentSongIndex].replace(/\\/g, '/').split('/').pop().replace(/\.[^/.]+$/, '');
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

function nextSong() {
    playNextSong();
}

// New next song logic with shuffle and repeat
function playNextSong() {
    const items = [...document.querySelectorAll(".playlist-item")];
    let currentIndex = items.findIndex(btn => btn.classList.contains("playing"));
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

    items[currentIndex]?.classList.remove("playing");
    items[nextIndex].classList.add("playing");
    items[nextIndex].click();
}

audio.addEventListener("ended", () => {
    if (isRepeat || isShuffle || currentSongIndex < songs.length - 1) {
        playNextSong();
    }
});

// Seek & volume
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
        item.classList.remove('active', 'playing');
        if (index === currentSongIndex) {
            item.classList.add('active', 'playing');
            currentTrackElement = item;
        }
    });
}

// Playlist loading
window.musicAPI.getSongs().then(fileList => {
    if (audio && !audio.paused) {
        audio.pause();
        audio.currentTime = 0;
    }

    playlistEl.innerHTML = "";
    songs = fileList.map(name => `music/${name}`);

    songs.forEach((src, index) => {
        const fileName = src.split('/').pop();
        const [artist, title] = fileName.replace('.mp3', '').split(' - ').map(part => part.trim());

        const li = document.createElement("li");
        li.draggable = true;
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

    addDragAndDropListeners();
    loadSong();
});

function addDragAndDropListeners() {
    let draggedItemIndex;

    playlistEl.querySelectorAll("li").forEach((li, index) => {
        li.addEventListener("dragstart", () => {
            draggedItemIndex = index;
        });

        li.addEventListener("dragover", (e) => {
            e.preventDefault();
            li.style.borderTop = "2px solid #4af";
        });

        li.addEventListener("dragleave", () => {
            li.style.borderTop = "";
        });

        li.addEventListener("drop", () => {
            li.style.borderTop = "";
            if (draggedItemIndex === index) return;

            const dragged = songs[draggedItemIndex];
            songs.splice(draggedItemIndex, 1);
            songs.splice(index, 0, dragged);

            const draggedEl = playlistEl.children[draggedItemIndex];
            playlistEl.removeChild(draggedEl);
            playlistEl.insertBefore(draggedEl, playlistEl.children[index]);

            updateActiveTrack();
            addDragAndDropListeners(); // Reattach listeners
        });
    });
}

// Buttons
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

// Lyrics
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
        lyricsDisplay.textContent = "No lyrics available online or external API error";
    }
}

// Add songs
addFolderButton.addEventListener("click", async () => {
    playlistEl.innerHTML = "";
    songs = [];

    const newSongs = await window.musicAPI.selectFolder();
    if (!newSongs.length) {
        alert("No songs were added.");
        return;
    }

    songs = [...songs, ...newSongs];
    playlistEl.innerHTML = "";

    songs.forEach((src, index) => {
        const fileName = src.split('\\').pop();
        const [artist, title] = fileName.replace('.mp3', '').split(' - ').map(part => part.trim());

        const li = document.createElement("li");
        li.draggable = true;
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

    addDragAndDropListeners();
    loadSong();
    alert(`${newSongs.length} songs added to the playlist.`);
});

// Window buttons
document.getElementById('buttonred').addEventListener('click', () => {
    window.musicAPI.controlWindow('close');
});
document.getElementById('buttonyellow').addEventListener('click', () => {
    window.musicAPI.controlWindow('minimize');
});
document.getElementById('buttongreen').addEventListener('click', () => {
    window.musicAPI.controlWindow('maximize');
});

// EQ sliders
document.getElementById("bass").addEventListener("input", (e) => {
    bassEQ.gain.value = e.target.value;
});
document.getElementById("mid").addEventListener("input", (e) => {
    midEQ.gain.value = e.target.value;
});
document.getElementById("treble").addEventListener("input", (e) => {
    trebleEQ.gain.value = e.target.value;
});

// Media control
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
            nextSong();
            playButton.innerHTML = `<i class="fa-solid fa-pause"></i>`;
            isPlaying = true;
            break;
    }
});

// Volume icon mute
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
