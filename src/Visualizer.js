import { shuffleArray } from './Utility';
import jsmediatags from 'jsmediatags/dist/jsmediatags';

class Bar {
    constructor(x, y, width, height) {
        this._x = x;
        this._y = y;
        this._width = width;
        this._height = height;
        this._radians;
    }

    //style 1 recs outwards/inwards
    render(ctx, coords) {
        ctx.fillStyle = 'rgba(14, 28, 20, 0.8)'
        ctx.strokeStyle = 'rgba(14, 28, 20, 0.8)';

        const rad = (Math.atan2(this._y - coords.y, this._x - coords.x))
        ctx.save();
        ctx.translate(this._x, this._y);

        ctx.rotate(rad)

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(40, 0)
        ctx.stroke();

        ctx.lineWidth = this._width;

        //roundcaps
        ctx.lineCap = 'round';
        if (Math.abs(this._height) > 2) {
            ctx.beginPath();
            ctx.moveTo(this._width, 0);
            ctx.lineTo(-this._height, 0)
            ctx.stroke();
        }
        else {
            ctx.beginPath();
            ctx.moveTo(this._width, 0);
            ctx.lineTo(this._width, 0)
            ctx.stroke();
        }


        // if (Math.abs(this._height) > 2) {
        //     ctx.beginPath();
        //     ctx.moveTo(this._width, 0);
        //     ctx.lineTo(-this._height, 0)
        //     ctx.stroke();
        // }
        ctx.restore();
    }

    //style 2 top or bottom
    render2(ctx, coords) {
        ctx.beginPath();
        ctx.moveTo(this._x, this._y);
        ctx.lineTo(this._x, this._y + 100)
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(40, 0)
        ctx.stroke();

        //negative on -height for outside bars.
        ctx.fillStyle = 'rgba(14, 28, 20, 0.8)'
        ctx.fillRect(this._x, this._y, this._width, this._height);
        ctx.strokeStyle = 'rgba(14, 28, 20, 0.8)';
        ctx.lineWidth = 0.1;
        if (this._height > 2) {
            ctx.beginPath();
            ctx.rect(this._x, this._y, this._width, this._height);
            ctx.stroke();
        }
    }
}

export default class Visualizer {
    constructor() {
        this._visualizer = document.querySelector('.visualizer');
        this._canvas = this._visualizer.querySelector('.analyserRenderer');
        this._canvas.width = window.innerWidth;
        this._canvas.height = window.innerHeight;

        this._ctx = this._canvas.getContext('2d');

        this._coordinates = { x: this._canvas.width / 2, y: this._canvas.height / 2 };
        this._magnitude = 200;

        this._audio = this._createAudio();
        this._audioCtx = new AudioContext();
        this._analyser = this._audioCtx.createAnalyser();
        this._analyser.connect(this._audioCtx.destination);
        this._source = this._audioCtx.createMediaElementSource(this._audio);
        this._source.connect(this._analyser);

        this._currentIdx = 0;
        this._audioSrcs = [
            './songs/track (0).mp3',
            './songs/track (1).mp3',
            './songs/track (2).mp3',
            './songs/track (3).mp3',
            './songs/track (4).mp3',
            './songs/track (5).mp3',
            './songs/track (6).mp3',
            './songs/track (7).mp3',
            './songs/track (8).mp3',
            './songs/track (9).mp3'];
        shuffleArray(this._audioSrcs);
        this._setMediaSource(this._audioSrcs[0]);

        this._bars = Array(100).fill().map(() => new Bar());
        this._fbcArray = [];

        this._audioMeta = { artist: undefined, album: undefined, title: undefined }

        this._setupEvents();
        this._animate = this._animate.bind(this);
        this._animate();
    }

    _setupEvents() {
        window.addEventListener('keypress', e => {
            switch (e.keyCode) {
                case 32: this.togglePlay(); break;
                case 48: this.playNext(); break;
                case 57: this.playPrevious(); break;
                case 45: this.volumeDown(); break;
                case 61: this.volumeUp(); break;
                default: this.togglePlay(); break;
            }
        });
        window.addEventListener('beforeunload', () => this._audioCtx.close());
        this._audio.addEventListener('ended', () => {
            this.playNext();
        });
        this._audio.addEventListener('loadedmetadata', e => {
            console.log(e.target.src)
            new jsmediatags.Reader(e.target.src)
                .setTagsToRead(["title", "artist", "album"])
                .read({
                    onSuccess: tag => {
                        this._audioMeta.artist = tag.tags.artist || 'Unknown artist';
                        this._audioMeta.album = tag.tags.album || 'Unknown album';
                        this._audioMeta.title = tag.tags.title || this._audio.src.split(/\/|\\/).pop().split('.')[0] || 'Unknown title';
                    },
                    onError: err => {
                        this._audioMeta.artist = 'Unknown artist';
                        this._audioMeta.album = 'Unknown album';
                        this._audioMeta.title = this._audio.src.split(/\/|\\/).pop().split('.')[0] || 'Unknown title';
                    }
                });
        });

        window.addEventListener('resize', () => {
            this._canvas.width = window.innerWidth;
            this._canvas.height = window.innerHeight;
            this._coordinates = { x: this._canvas.width / 2, y: this._canvas.height / 2 };
        });
    }

    _createAudio() {
        let audio = new Audio();
        //audio.controls = true;
        audio.autoplay = false;
        audio.volume = 0.1;

        this._visualizer.querySelector('.audioBox').append(audio);
        return audio;
    }

    _setMediaSource(src) {
        this._audio.src = src;
    }

    togglePlay() {
        if (this._audio.paused) {
            this.playAudio();
        }
        else {
            this.pauseAudio();
        }
    }

    playAudio() {
        this._audio.play();
        this._audioCtx.resume();
    }

    pauseAudio() {
        this._audio.pause();
        this._audioCtx.suspend();
    }

    volumeUp() {
        if (this._audio.muted) {
            this.unmute();
        }
        if (this._audio.volume < 0.9) {
            this._audio.volume += 0.1;
        }
    }

    volumeDown() {
        if (this._audio.volume > 0.1) {
            this._audio.volume -= 0.1;
        }
        else {
            this.mute();
        }

    }

    setVolume(vol) {
        this._audio.volume = vol;
    }

    mute() {
        this._audio.muted = true;
    }

    unmute() {
        this._audio.muted = false;
    }

    reload() {
        this.pauseAudio();
        this._audio.load();
        this.playAudio();
    }

    addTrack(src) {
        this._audioSrcs.push(src);
    }

    addTracks(srcArray) {
        if (Array.isArray(srcArray)) {
            for (let src of srcArray) {
                this._audioSrcs.push(src);
            }
        }
    }

    playNext() {
        this._currentIdx++;
        if (this._currentIdx >= this._audioSrcs.length) {
            this._currentIdx = 0;
        }
        this._setMediaSource(this._audioSrcs[this._currentIdx]);
        this.reload();
    }

    playPrevious() {
        this._currentIdx--;
        if (this._currentIdx < 0) {
            this._currentIdx = this._audioSrcs.length - 1;
        }
        this._setMediaSource(this._audioSrcs[this._currentIdx]);
        this.reload();
    }

    removeTrack(idx) {
        this._audioSrcs = this._audioSrcs.filter((_, i) => i !== idx);
    }

    shuffle() {
        this._audioSrcs = shuffleArray(this._audioSrcs);
    }

    _renderText(ctx, x, y, txt, font, color, baseline) {
        ctx.font = font || '15px monospace';
        ctx.textBaseline = baseline || 'middle';
        ctx.textAlign = 'center';
        ctx.fillText(txt, x, y);
    }

    _render(ctx) {
        ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);

        ctx.fillStyle = '#00ccff';
        ctx.globalAlpha = 0.4;

        for (let i = 0; i < this._bars.length; i++) {
            const barX = this._coordinates.x + Math.cos(Math.PI * 2 / this._bars.length * i) * this._magnitude;
            const barY = this._coordinates.y + Math.sin(Math.PI * 2 / this._bars.length * i) * this._magnitude;
            const barWidth = 10;
            const barHeight = -(this._fbcArray[i] / 2);

            const bar = this._bars[i];
            bar._x = barX;
            bar._y = barY;
            bar._width = barWidth;
            bar._height = barHeight;
            bar.render(ctx, this._coordinates);
        }
        ctx.globalAlpha = 1;
        this._renderText(ctx, this._coordinates.x, this._coordinates.y - this._magnitude * 0.25, this._audioMeta.artist, '17px monospace');
        this._renderText(ctx, this._coordinates.x, this._coordinates.y, this._audioMeta.title, '45px monospace');
        this._renderText(ctx, this._coordinates.x, this._coordinates.y + this._magnitude * 0.3, this._audioMeta.album, '30px monospace');
    }

    _update() {
        this._fbcArray = new Uint8Array(this._analyser.frequencyBinCount);
        this._analyser.getByteFrequencyData(this._fbcArray);
    }

    _animate() {
        requestAnimationFrame(this._animate);
        this._update();
        this._render(this._ctx);
    }
}