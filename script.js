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

const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const source = audioContext.createMediaElementSource(audio);

// 🎛 Equalizer filters
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

// 🔊 Analyzer (for visual bars)
const analyser = audioContext.createAnalyser();
analyser.fftSize = 32;
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

// 🔗 Connect everything: source → EQs → analyser → destination
source
    .connect(bassEQ)
    .connect(midEQ)
    .connect(trebleEQ)
    .connect(analyser)
    .connect(audioContext.destination);


let songs = [];
let currentSongIndex = 0;
let currentTrackElement = null; // Keep track of the currently active playlist item


// Initialize the track
window.addEventListener('DOMContentLoaded', () => {
    const audio = document.getElementById('audio');
    const seekBar = document.getElementById('seek-bar');
    const songTime = document.getElementById('song-time');

    const formatTime = (sec) => {
        const m = Math.floor(sec / 60).toString().padStart(2, '0');
        const s = Math.floor(sec % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const updateTime = () => {
        if (!isNaN(audio.duration)) {
            songTime.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
            seekBar.max = audio.duration;
            seekBar.value = audio.currentTime;
        }
    };

    // Update time every second
    audio.addEventListener('timeupdate', updateTime);

});

// 🎵 Initialize the equalizer bars
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

// 🎵 Load the song and update the title
function loadSong(index = currentSongIndex) {
    if (!songs.length) return;
    currentSongIndex = index;
    audio.src = songs[currentSongIndex];
    const songName = songs[currentSongIndex].replace(/\\/g, '/').split('/').pop();
    songTitle.textContent = songName;
    loadLyricsForSong(songName); // Fetch lyrics for the current song

    // Update active class in playlist
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

// Function to update the active track in the playlist
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

// 🎵 Load songs dynamically from music folder
window.musicAPI.getSongs().then(fileList => {
    // Pause any currently playing audio if applicable
    if (audio && !audio.paused) {
        audio.pause();
        audio.currentTime = 0;
    }

    // Clear playlist and any active indicators
    playlistEl.innerHTML = "";
    songs = [];

    // Build new playlist
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

    loadSong(); // Load the first song and set active class
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


// Lyrics display
const lyricsDisplay = document.getElementById("lyrics");

// Function to fetch lyrics from an external API
async function loadLyricsForSong(songName) {
    // Extract artist and title from the song name
    const [artist, title] = songName.replace('.mp3', '').split(' - ').map(part => part.trim());

    if (!artist || !title) {
        lyricsDisplay.textContent = "Unable to fetch lyrics. Invalid song format.";
        return;
    }

    try {
        const response = await fetch(`https://api.lyrics.ovh/v1/${artist}/${title}`);
        if (!response.ok) {
            throw new Error("Lyrics not found");
        }
        const data = await response.json();
        lyricsDisplay.textContent = data.lyrics || "No lyrics available.";
    } catch (error) {
        console.error("Error fetching lyrics:", error);
        lyricsDisplay.textContent = "No lyrics available online or external API error";
    }
}

// Function to add songs from a selected folder
async function addSongsFromFolder() {
    // Clear playlist and any active indicators
    playlistEl.innerHTML = "";
    songs = [];

    const newSongs = await window.musicAPI.selectFolder();
    if (newSongs.length === 0) {
        alert("No songs were added.");
        return;
    }

    // Add new songs to the playlist
    songs = [...songs, ...newSongs];
    playlistEl.innerHTML = ""; // Clear the playlist

    songs.forEach((src, index) => {
        const fileName = src.split('\\').pop(); // Extract file name from the path
        const [artist, title] = fileName.replace('.mp3','').split(' - ').map(part => part.trim()); // Extract artist and title

        const li = document.createElement("li");
        const button = document.createElement("button");
        button.classList.add("playlist-item");
        button.dataset.src = src;
        button.textContent = artist && title ? `🎵 ${artist} - ${title}` : `🎵 ${fileName}`; // Fallback to file name if format is invalid
        button.addEventListener("click", () => {
            loadSong(index); // Use index here
            playSong();
        });
        li.appendChild(button);
        playlistEl.appendChild(li);
    });

    loadSong(); // Load the first song and set active class
    alert(`${newSongs.length} songs added to the playlist.`);
}

addFolderButton.addEventListener("click", () => {
    addSongsFromFolder();
});

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

// 🎚 Equalizer controls listeners
document.getElementById("bass").addEventListener("input", (e) => {
    bassEQ.gain.value = e.target.value;
});

document.getElementById("mid").addEventListener("input", (e) => {
    midEQ.gain.value = e.target.value;
});

document.getElementById("treble").addEventListener("input", (e) => {
    trebleEQ.gain.value = e.target.value;
});

// 🎛 Handle media control events from Windows taskbar buttons
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