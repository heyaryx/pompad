class MusicPlayer {
    constructor() {
        this.audio = new Audio();
        this.playlist = [];
        this.currentTrack = 0;
        this.isPlaying = false;

        this.initializeElements();
        this.setupEventListeners();
        this.setupHoldButtons();
        this.setupPlayButtonHold();

          
        this.menuOverlay = document.querySelector('.menu-overlay');
        this.menuButton = document.querySelector('.btn.menu');

          
        this.setupMenuToggle();
    }

    initializeElements() {
        this.fileInput = document.getElementById('file-input');
        this.playlistElement = document.querySelector('.playlist');
        this.titleElement = document.querySelector('.title');
        this.artistElement = document.querySelector('.artist');
        this.progressBar = document.querySelector('.progress-bar');
        this.currentTimeElement = document.querySelector('.current');
        this.totalTimeElement = document.querySelector('.total');

          
        this.prevBtn = document.querySelector('.btn.prev');
        this.nextBtn = document.querySelector('.btn.next');
        this.playBtn = document.querySelector('.btn.play-pause');
        this.menuButton = document.querySelector('.btn.menu');

          
        this.uploadBtn = document.querySelector('.btn.upload');

          
        this.progressContainer = document.getElementById('progress-container');
    }

    setupEventListeners() {
        if (this.fileInput) {
            this.fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        } else {
            console.error('File input element not found');
        }

          
          

        if (this.uploadBtn) {
            this.uploadBtn.addEventListener('click', () => this.fileInput.click());
        } else {
            console.error('Upload button not found');
        }

          
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('ended', () => this.playNext());

          
        if (this.progressContainer) {
            this.progressContainer.addEventListener('click', (e) => this.seek(e));
        }
    }

      
    seek(e) {
        const rect = this.progressContainer.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const duration = this.audio.duration;
        if (duration) {
            this.audio.currentTime = (clickX / width) * duration;
        }
    }

    setupMenuToggle() {
        if (this.menuButton) {
            this.menuButton.addEventListener('click', () => {
                this.toggleMenu();
            });
        }

        const menuItems = document.querySelectorAll('.menu-content li');
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                this.handleMenuItemClick(item.textContent);
            });
        });
    }

    toggleMenu() {
        if (this.menuOverlay) {
            this.menuOverlay.style.display =
                this.menuOverlay.style.display === 'flex' ? 'none' : 'flex';
        }
    }

    handleMenuItemClick(item) {
        switch (item) {
            case 'Home':
                const homeNowPlayingSection = document.querySelector('.now-playing');
                const homePlaylist = document.querySelector('.playlist');
                if (homeNowPlayingSection && homePlaylist) {
                    homeNowPlayingSection.style.display = 'block';
                    homePlaylist.style.height = '120px';
                }
                this.toggleMenu();
                break;
            case 'Now Playing':
                const nowPlayingSection = document.querySelector('.now-playing');
                const playlist = document.querySelector('.playlist');
                if (nowPlayingSection && playlist) {
                    nowPlayingSection.style.display = 'block';
                    playlist.style.height = '120px';
                }
                this.toggleMenu();
                break;
            case 'Playlists':
                const nowPlayingSection2 = document.querySelector('.now-playing');
                const playlist2 = document.querySelector('.playlist');
                if (nowPlayingSection2 && playlist2) {
                    nowPlayingSection2.style.display = 'none';
                    playlist2.style.height = '180px';
                }
                this.toggleMenu();
                break;
            case 'Upload Music':
                this.fileInput.click();
                this.toggleMenu();
                break;
            default:
                this.toggleMenu();
        }
    }

    handleFileUpload(event) {
        const files = Array.from(event.target.files);

        files.forEach(file => {
            const song = {
                file: file,
                name: file.name.replace(/\.[^/.]+$/, ""),
                url: URL.createObjectURL(file)
            };
            this.playlist.push(song);
        });

        const nowPlayingSection = document.querySelector('.now-playing');
        const playlist = document.querySelector('.playlist');
        if (nowPlayingSection && playlist) {
            nowPlayingSection.style.display = 'none';
            playlist.style.height = '180px';
        }

        this.updatePlaylist();

        if (this.titleElement.textContent === 'No song playing') {
            this.titleElement.textContent = 'Select a song to play';
            this.artistElement.textContent = 'Click on a song from the list';
        }
    }

    updatePlaylist() {
        this.playlistElement.innerHTML = '';
        this.playlist.forEach((song, index) => {
            const item = document.createElement('div');
            item.className = `playlist-item ${index === this.currentTrack ? 'active' : ''}`;

            const number = document.createElement('span');
            number.className = 'song-number';
            number.textContent = `${index + 1}.`;

            const name = document.createElement('span');
            name.className = 'song-name';
            name.textContent = song.name;

            item.appendChild(number);
            item.appendChild(name);
            item.addEventListener('click', () => this.playTrack(index));
            this.playlistElement.appendChild(item);
        });
    }

    playTrack(index) {
        if (index >= 0 && index < this.playlist.length) {
            this.currentTrack = index;
            this.audio.src = this.playlist[index].url;
            this.titleElement.textContent = this.playlist[index].name;
            this.artistElement.textContent = 'Now Playing';
            this.updatePlaylist();
            this.togglePlay(true);
        }
    }

    togglePlay(forcePlay = false) {
        if (!this.playlist.length) return;

        if (forcePlay || !this.isPlaying) {
            this.audio.play();
            this.isPlaying = true;
              
            this.playBtn.textContent = this.audio.loop ? '🔁' : '⏸';
        } else {
            this.audio.pause();
            this.isPlaying = false;
            this.playBtn.textContent = '⏯';
        }
    }

    playNext() {
        let nextTrack = this.currentTrack + 1;
        if (nextTrack >= this.playlist.length) {
            nextTrack = 0;
        }
        this.playTrack(nextTrack);
    }

    playPrevious() {
        let prevTrack = this.currentTrack - 1;
        if (prevTrack < 0) {
            prevTrack = this.playlist.length - 1;
        }
        this.playTrack(prevTrack);
    }

    updateProgress() {
        const current = this.audio.currentTime;
        const total = this.audio.duration;
        const percentage = (current / total) * 100;

        this.progressBar.style.width = percentage + '%';
        this.currentTimeElement.textContent = this.formatTime(current);
        this.totalTimeElement.textContent = this.formatTime(total);
    }

    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const minutes = Math.floor(seconds / 60);
        seconds = Math.floor(seconds % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

      
    setupHoldButtons() {
          
        let prevHoldTimeout, prevInterval;
        this.prevBtn.addEventListener('mousedown', () => {
            prevHoldTimeout = setTimeout(() => {
                prevInterval = setInterval(() => {
                    this.audio.currentTime = Math.max(this.audio.currentTime - 5, 0);
                }, 300);
            }, 500);
        });
        this.prevBtn.addEventListener('mouseup', () => {
            if (prevHoldTimeout) {
                clearTimeout(prevHoldTimeout);
                prevHoldTimeout = null;
                if (!prevInterval) {
                    this.playPrevious();
                }
            }
            if (prevInterval) {
                clearInterval(prevInterval);
                prevInterval = null;
            }
        });
        this.prevBtn.addEventListener('mouseleave', () => {
            if (prevHoldTimeout) {
                clearTimeout(prevHoldTimeout);
                prevHoldTimeout = null;
            }
            if (prevInterval) {
                clearInterval(prevInterval);
                prevInterval = null;
            }
        });

          
        let nextHoldTimeout, nextInterval;
        this.nextBtn.addEventListener('mousedown', () => {
            nextHoldTimeout = setTimeout(() => {
                nextInterval = setInterval(() => {
                      
                    const newTime = this.audio.currentTime + 5;
                    this.audio.currentTime = (this.audio.duration)
                        ? Math.min(newTime, this.audio.duration)
                        : newTime;
                }, 300);
            }, 500);
        });
        this.nextBtn.addEventListener('mouseup', () => {
            if (nextHoldTimeout) {
                clearTimeout(nextHoldTimeout);
                nextHoldTimeout = null;
                if (!nextInterval) {
                    this.playNext();
                }
            }
            if (nextInterval) {
                clearInterval(nextInterval);
                nextInterval = null;
            }
        });
        this.nextBtn.addEventListener('mouseleave', () => {
            if (nextHoldTimeout) {
                clearTimeout(nextHoldTimeout);
                nextHoldTimeout = null;
            }
            if (nextInterval) {
                clearInterval(nextInterval);
                nextInterval = null;
            }
        });
    }

      
    setupPlayButtonHold() {
        let playHoldTimeout;
        let playHeld = false;
        this.playBtn.addEventListener('mousedown', () => {
            playHeld = false;
            playHoldTimeout = setTimeout(() => {
                  
                this.audio.loop = !this.audio.loop;
                playHeld = true;
                  
                this.playBtn.textContent = this.audio.loop ? '🔁' : '⏯';
            }, 1000);
        });
        this.playBtn.addEventListener('mouseup', () => {
            if (playHoldTimeout) {
                clearTimeout(playHoldTimeout);
                playHoldTimeout = null;
                if (!playHeld) {
                    this.togglePlay();
                }
            }
        });
        this.playBtn.addEventListener('mouseleave', () => {
            if (playHoldTimeout) {
                clearTimeout(playHoldTimeout);
                playHoldTimeout = null;
            }
        });
    }
}

  
window.addEventListener('DOMContentLoaded', () => {
    new MusicPlayer();
});

function invertFavicon() {
    const darkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const favicon = document.querySelector("link[rel='icon']");

    if (!favicon) return;   

    const img = new Image();
    img.crossOrigin = "anonymous";   
    img.src = favicon.href;

    img.onload = function () {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;

        ctx.drawImage(img, 0, 0);

        if (darkMode) {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            for (let i = 0; i < data.length; i += 4) {
                  
                data[i] = 255 - data[i];       
                data[i + 1] = 255 - data[i + 1];   
                data[i + 2] = 255 - data[i + 2];   
                  
            }

            ctx.putImageData(imageData, 0, 0);
        }

        favicon.href = canvas.toDataURL("image/png");
    };
}

  
invertFavicon();

  
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", invertFavicon);


