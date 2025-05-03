// Smooth Preloader with Loading Bar
document.addEventListener('DOMContentLoaded', function() {
    const preloader = document.querySelector('.preloader');
    const loadingBar = document.querySelector('.loading-bar');
    
    // Start loading animation
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 500; // Reduced from 15 to 8
        if(progress >= 100) {
            progress = 100;
            clearInterval(interval);
        }
        loadingBar.style.width = `${progress}%`;
    }, 1050); // Increased from 100ms to 150ms

    // Hide when fully loaded
    window.addEventListener('load', function() {
        loadingBar.style.width = '100%';
        setTimeout(() => {
            preloader.style.opacity = '0';
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 500);
        }, 500);
    });

    // Fallback
    setTimeout(() => {
        preloader.style.display = 'none';
    }, 3000);
});



console.log("Welcome to Spotify");

// Initialize the Variables
let songIndex = 0;
let audioElement = new Audio('songs/1.mp3');
let masterPlay = document.getElementById('masterPlay');
let myProgressBar = document.getElementById('myProgressBar');
let gif = document.getElementById('gif');
let masterSongName = document.getElementById('masterSongName');
let songItems = Array.from(document.getElementsByClassName('songItem'));

// ===== Audio Analyzer Setup =====
let audioContext, analyser, dataArray;

// Initialize audio context when page loads
document.addEventListener('DOMContentLoaded', function () {
    setupAudioAnalyzer();
});

function setupAudioAnalyzer() {
    // Create audio context if not already created
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 64; // Smaller FFT size for smoother animation

        // Connect audio source to analyzer
        const source = audioContext.createMediaElementSource(audioElement);
        source.connect(analyser);
        analyser.connect(audioContext.destination);

        dataArray = new Uint8Array(analyser.frequencyBinCount);
    }
}

// ===== Update Visualizer Bars =====
function updateVisualizer() {
    if (!analyser) return;

    analyser.getByteFrequencyData(dataArray);
    const bars = document.querySelectorAll('.visualizer .bar');

    bars.forEach((bar, i) => {
        // Map frequency data to bar scale (0.3 to 1.5)
        const freqValue = dataArray[i % bars.length] / 255;
        const scale = 0.3 + (freqValue * 1.2); // Scale between 0.3 and 1.5
        bar.style.transform = `scale(${scale})`;

        // Optional: Change opacity dynamically
        bar.style.opacity = 0.6 + (freqValue * 0.4);
    });

    requestAnimationFrame(updateVisualizer);
}

// ===== Initialize on Play =====
audioElement.addEventListener('play', () => {
    setupAudioAnalyzer();
    updateVisualizer();
});

let songs = [
    { songName: "Pehle Bhi Mein - ANIMAL", filePath: "songs/1.mp3", coverPath: "covers/1.jpg" },
    { songName: "Kuch Is Tarah", filePath: "songs/2.mp3", coverPath: "covers/2.jpg" },
    { songName: "Her - Shubh", filePath: "songs/3.mp3", coverPath: "covers/3.jpg" },
    { songName: "War - AP Dhillon", filePath: "songs/4.mp3", coverPath: "covers/4.jpg" },
    { songName: "Regrets - Jevin Gill, Talha Anjum", filePath: "songs/5.mp3", coverPath: "covers/5.jpg" },
    { songName: "On Top - Karan Aujla", filePath: "songs/6.mp3", coverPath: "covers/6.jpg" },
    { songName: "LIMITS - Perfectly Slowed", filePath: "songs/7.mp3", coverPath: "covers/7.jpg" },
    { songName: "Mi Amor - Perfectly Slowed", filePath: "songs/8.mp3", coverPath: "covers/8.jpg" },
    { songName: "Rubicon Drill - Parmish Verma", filePath: "songs/9.mp3", coverPath: "covers/9.jpg" },
    { songName: "Unbreakable - Tarna", filePath: "songs/10.mp3", coverPath: "covers/10.jpg" },
];


// Set images and song names
songItems.forEach((element, i) => {
    element.getElementsByTagName("img")[0].src = songs[i].coverPath;
    element.getElementsByClassName("songName")[0].innerText = songs[i].songName;
});

function playSong(index) {
    songIndex = index;
    audioElement.src = songs[songIndex].filePath;
    masterSongName.innerText = songs[songIndex].songName;
    audioElement.currentTime = 0;

    // Play the audio directly
    audioElement.play()
        .then(() => {
            gif.style.opacity = 1;
            masterPlay.classList.replace('fa-play-circle', 'fa-pause-circle');

            // Initialize audio analyzer if not already done
            if (!audioContext) {
                setupAudioAnalyzer();
                updateVisualizer();
            }
        })
        .catch(error => {
            console.error("Playback failed:", error);
            // Fallback: Try resuming audio context if paused
            if (audioContext && audioContext.state === 'suspended') {
                audioContext.resume().then(() => {
                    audioElement.play();
                });
            }
        });
}

masterPlay.addEventListener('click', () => {
    if (audioElement.paused || audioElement.currentTime <= 0) {
        // Play the song
        playSong(songIndex);
        masterPlay.classList.replace('fa-play-circle', 'fa-pause-circle'); // Instant switch
    } else {
        // Pause the song
        audioElement.pause();
        masterPlay.classList.replace('fa-pause-circle', 'fa-play-circle'); // Instant switch
        gif.style.opacity = 0;
    }
});

// Update progress bar
audioElement.addEventListener('timeupdate', () => {
    let progress = parseInt((audioElement.currentTime / audioElement.duration) * 100);
    myProgressBar.value = progress;
});

// Seek audio
myProgressBar.addEventListener('change', () => {
    audioElement.currentTime = myProgressBar.value * audioElement.duration / 100;
});

// Reset all play buttons
const makeAllPlays = () => {
    Array.from(document.getElementsByClassName('songItemPlay')).forEach((element) => {
        element.classList.remove('fa-pause-circle');
        element.classList.add('fa-play-circle');
    });
};

// Play selected song from list
Array.from(document.getElementsByClassName('songItemPlay')).forEach((element) => {
    element.addEventListener('click', (e) => {
        makeAllPlays();
        let index = parseInt(e.target.id);
        e.target.classList.remove('fa-play-circle');
        e.target.classList.add('fa-pause-circle');
        playSong(index);
    });
});

// Next song
document.getElementById('next').addEventListener('click', () => {
    songIndex = (songIndex + 1) % songs.length;
    playSong(songIndex);
});

// Previous song
document.getElementById('previous').addEventListener('click', () => {
    songIndex = (songIndex - 1 + songs.length) % songs.length;
    playSong(songIndex);
});

// Volume Control Functionality
const volumeControl = document.getElementById('volumeControl');
const volumeIcon = document.getElementById('volumeIcon');

// Set default volume to 70%
audioElement.volume = 0.7;

// Volume slider change event
volumeControl.addEventListener('input', function () {
    audioElement.volume = this.value;
    updateVolumeIcon();
});

// Volume icon click event (mute/unmute)
volumeIcon.addEventListener('click', function () {
    if (audioElement.volume > 0) {
        // Mute karo
        audioElement.dataset.previousVolume = audioElement.volume;
        audioElement.volume = 0;
        volumeControl.value = 0;
    } else {
        // Unmute karo - pichle volume pe lautao
        audioElement.volume = audioElement.dataset.previousVolume || 0.7;
        volumeControl.value = audioElement.volume;
    }
    updateVolumeIcon();
});

// Volume icon update function
function updateVolumeIcon() {
    if (audioElement.volume === 0) {
        volumeIcon.className = 'fas fa-volume-mute';
    } else if (audioElement.volume < 0.5) {
        volumeIcon.className = 'fas fa-volume-down';
    } else {
        volumeIcon.className = 'fas fa-volume-up';
    }
}


// Auto-numbering and artist extraction (will work with above HTML)
document.querySelectorAll('.songItem').forEach((item, index) => {
    const num = (index + 1).toString().padStart(2, '0');
    const numberDiv = item.querySelector('.songNumber') || document.createElement('div');
    numberDiv.className = 'songNumber';
    numberDiv.textContent = num;
    item.prepend(numberDiv);

    // Extract artist if not already set
    if (!item.querySelector('.songArtist')) {
        const songName = item.querySelector('.songName').textContent;
        if (songName.includes('-')) {
            const parts = songName.split('-');
            item.querySelector('.songName').textContent = parts[0].trim();
            const artistSpan = document.createElement('span');
            artistSpan.className = 'songArtist';
            artistSpan.textContent = parts[1].trim();
            item.querySelector('.songDetails').appendChild(artistSpan);
        }
    }
});

// Highlight current page (add to script.js)
const currentPage = window.location.pathname;
document.querySelectorAll('nav ul li').forEach(link => {
    if (link.textContent.includes('Home') && currentPage.includes('index.html')) {
        link.classList.add('active');
    }
    if (link.textContent.includes('About') && currentPage.includes('about.html')) {
        link.classList.add('active');
    }
});


// ===== Button Click Handlers =====
document.querySelector('.btn-login').addEventListener('click', () => {
    // Replace with your login logic
    alert('Login clicked! Redirect to login page.');
});

document.querySelector('.btn-signup').addEventListener('click', () => {
    // Replace with your signup logic
    alert('Signup clicked! Redirect to signup page.');
});





// ===== Enhanced Search Functionality =====
const searchInput = document.querySelector('.search-box input');
const songItemsContainer = document.querySelector('.songItemContainer');
const allSongItems = Array.from(document.querySelectorAll('.songItem'));

searchInput.addEventListener('input', function() {
    const searchTerm = this.value.trim().toLowerCase();
    
    if (searchTerm === '') {
        // Show all items when search is empty
        allSongItems.forEach(item => {
            item.classList.remove('hidden');
        });
        return;
    }

    allSongItems.forEach(item => {
        const songName = item.querySelector('.songName').textContent.toLowerCase();
        const songArtist = item.querySelector('.songArtist')?.textContent.toLowerCase() || '';
        
        if (songName.includes(searchTerm) || songArtist.includes(searchTerm)) {
            item.classList.remove('hidden');
        } else {
            item.classList.add('hidden');
        }
    });
});

// Clear search when clicking the search icon
document.querySelector('.search-box i').addEventListener('click', function() {
    searchInput.value = '';
    allSongItems.forEach(item => {
        item.classList.remove('hidden');
    });
    searchInput.focus();
});





// Cache the search elements more efficiently
const searchElements = {
    input: document.querySelector('.search-box input'),
    icon: document.querySelector('.search-box i'),
    container: document.querySelector('.songItemContainer'),
    items: Array.from(document.querySelectorAll('.songItem'))
};

searchElements.input.addEventListener('input', handleSearch);
searchElements.icon.addEventListener('click', clearSearch);

function handleSearch() {
    const term = this.value.trim().toLowerCase();
    
    searchElements.items.forEach(item => {
        const name = item.querySelector('.songName').textContent.toLowerCase();
        const artist = item.querySelector('.songArtist')?.textContent.toLowerCase() || '';
        item.classList.toggle('hidden', term && !name.includes(term) && !artist.includes(term));
    });
}

function clearSearch() {
    searchElements.input.value = '';
    searchElements.items.forEach(item => item.classList.remove('hidden'));
    searchElements.input.focus();
}



















// Smoother progress bar updates
audioElement.addEventListener('timeupdate', () => {
    const progress = (audioElement.currentTime / audioElement.duration) * 100;
    myProgressBar.value = progress;
    myProgressBar.style.background = `linear-gradient(90deg, #ff8c00 ${progress}%, rgba(255,255,255,0.2) ${progress}%)`;
});

// Click anywhere on progress bar to seek
myProgressBar.addEventListener('input', () => {
    const seekTime = (myProgressBar.value / 100) * audioElement.duration;
    audioElement.currentTime = seekTime;
});

// Dark/Light Mode Toggle
function toggleDarkMode() {
    const body = document.body;
    const isDark = body.classList.toggle('dark-mode');

    // Save preference to localStorage
    localStorage.setItem('darkMode', isDark);

    // Update icon and text
    const themeIcons = document.querySelectorAll('.fa-moon, .fa-sun');
    const themeTexts = document.querySelectorAll('.theme-toggle-text');

    themeIcons.forEach(icon => {
        if (isDark) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    });

    themeTexts.forEach(text => {
        text.textContent = isDark ? 'Light Mode' : 'Dark Mode';
    });
}

// Initialize theme from localStorage
function initTheme() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedMode = localStorage.getItem('darkMode');

    if (savedMode === 'true' || (savedMode === null && prefersDark)) {
        document.body.classList.add('dark-mode');
    }

    // Set correct icons
    const isDark = document.body.classList.contains('dark-mode');
    const themeIcons = document.querySelectorAll('.fa-moon, .fa-sun');

    themeIcons.forEach(icon => {
        if (isDark) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        }
    });

    const themeTexts = document.querySelectorAll('.theme-toggle-text');
    themeTexts.forEach(text => {
        text.textContent = isDark ? 'Light Mode' : 'Dark Mode';
    });
}

// Add event listeners
document.addEventListener('DOMContentLoaded', function () {
    initTheme();

    // Desktop theme toggle
    const themeToggle = document.querySelector('.profile-dropdown a:nth-child(3)');
    if (themeToggle) {
        themeToggle.addEventListener('click', function (e) {
            e.preventDefault();
            toggleDarkMode();
        });
    }

    // Mobile theme toggle
    const mobileToggle = document.querySelector('.theme-toggle-mobile');
    if (mobileToggle) {
        mobileToggle.addEventListener('click', function () {
            toggleDarkMode();
        });
    }
});


// Dark/Light Mode Toggle
function toggleDarkMode() {
    const body = document.body;
    const isDark = body.classList.toggle('dark-mode');

    // Save preference
    localStorage.setItem('darkMode', isDark);

    // Update all theme toggles
    document.querySelectorAll('.theme-toggle i, .theme-toggle-mobile').forEach(icon => {
        if (isDark) {
            icon.classList.replace('fa-moon', 'fa-sun');
        } else {
            icon.classList.replace('fa-sun', 'fa-moon');
        }
    });

    // Update text if exists
    const themeTexts = document.querySelectorAll('.theme-toggle span');
    themeTexts.forEach(text => {
        text.textContent = isDark ? 'Light Mode' : 'Dark Mode';
    });
}

// Initialize theme
function initTheme() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedMode = localStorage.getItem('darkMode');

    if (savedMode === 'true' || (savedMode === null && prefersDark)) {
        document.body.classList.add('dark-mode');
    }

    // Set correct icons
    const isDark = document.body.classList.contains('dark-mode');
    const themeIcons = document.querySelectorAll('.theme-toggle i, .theme-toggle-mobile');

    themeIcons.forEach(icon => {
        if (isDark) {
            icon.classList.replace('fa-moon', 'fa-sun');
        }
    });

    // Update text if exists
    const themeTexts = document.querySelectorAll('.theme-toggle span');
    themeTexts.forEach(text => {
        if (isDark) {
            text.textContent = 'Light Mode';
        }
    });
}

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', function () {
    initTheme();

    // Desktop theme toggle
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function (e) {
            e.preventDefault();
            toggleDarkMode();
        });
    }

    // Mobile theme toggle
    const mobileToggle = document.querySelector('.theme-toggle-mobile');
    if (mobileToggle) {
        mobileToggle.addEventListener('click', function () {
            toggleDarkMode();
        });
    }

    // Use random user image if no profile image exists
    const profileImg = document.querySelector('.profile img');
    if (profileImg && !profileImg.src.includes('randomuser.me')) {
        const randomId = Math.floor(Math.random() * 100);
        profileImg.src = `https://randomuser.me/api/portraits/men/${randomId}.jpg`;
    }
});

// Preloader Functionality
window.addEventListener('load', function() {
    setTimeout(function() {
        const preloader = document.querySelector('.preloader');
        preloader.style.opacity = '0';
        
        setTimeout(function() {
            preloader.style.display = 'none';
        }, 500);
    }, 1500); // Adjust this time (in milliseconds) as needed
});// Preloader Functionality
document.addEventListener('DOMContentLoaded', function() {
    const preloader = document.querySelector('.preloader');
    
    // Show website content immediately (but keep preloader visible)
    document.body.style.visibility = 'visible';
    
    // Hide preloader when everything is loaded
    window.addEventListener('load', function() {
        setTimeout(function() {
            preloader.classList.add('hidden');
            
            // Enable scrolling after preloader hides
            document.body.style.overflow = 'auto';
        }, 1000); // 1 second minimum show time
    });
    
    // Fallback - hide preloader after max 4 seconds even if page doesn't fully load
    setTimeout(function() {
        preloader.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }, 4000);
});











