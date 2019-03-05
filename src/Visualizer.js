import { shuffleArray } from './Utility';

class Bar {
    constructor(x, y, width, height) {
        this._x = x;
        this._y = y;
        this._width = width;
        this._height = height;
    }

    render(ctx) {
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
        this._audioSrcs = ['./track2.webm', './track.m4a'];
        this._setMediaSource(this._audioSrcs[0]);

        this._bars = Array(100).fill().map(() => new Bar());
        this._fbcArray = [];

        this._setupEvents();
        this._animate = this._animate.bind(this);
        this._animate();
    }

    _setupEvents() {
        window.addEventListener('keypress', e => {
            console.log(e.keyCode)
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
        // ctx.beginPath();
        // ctx.lineWidth = 3;
        // ctx.arc(this._coordinates.x, this._coordinates.y, this._magnitude, 0, Math.PI * 2);
        // ctx.stroke();
        ctx.fillStyle = '#00ccff';
        ctx.globalAlpha = 0.4;

        for (let i = 0; i < this._bars.length; i++) {
            const barX = this._coordinates.x + Math.cos(Math.PI * 2 / this._bars.length * i) * this._magnitude - 5;
            const barY = this._coordinates.y + Math.sin(Math.PI * 2 / this._bars.length * i) * this._magnitude;
            const barWidth = 10;
            const barHeight = -(this._fbcArray[i] / 2);

            const bar = this._bars[i];
            bar._x = barX;
            bar._y = barY;
            bar._width = barWidth;
            bar._height = barHeight;
            bar.render(ctx);
        }
        ctx.globalAlpha = 1;
        this._renderText(ctx, this._coordinates.x, this._coordinates.y - this._magnitude * 0.25, 'Artist', '17px monospace');
        this._renderText(ctx, this._coordinates.x, this._coordinates.y, 'A very long test Song title', '45px monospace');
        this._renderText(ctx, this._coordinates.x, this._coordinates.y + this._magnitude * 0.3, 'Album', '30px monospace');
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