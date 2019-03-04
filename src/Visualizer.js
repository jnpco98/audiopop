import { shuffleArray } from './Utility';

const setAttributes = (elem, attrs) => {
    Object.assign(elem.style, attrs);
}

const createVisualizer = (width, height, queryElement) => {
    const visualizer = document.createElement('div');
    visualizer.className = 'visualizer';

    const audioBox = document.createElement('div');
    audioBox.className = 'audioBox';

    const analyser = document.createElement('canvas')
    analyser.className = 'analyserRenderer';


    setAttributes(visualizer, {
        width: `${width}px`,
        height: `${height}px`,
        background: `#000`,
        padding: '5px',
        margin: '50px auto'
    });

    setAttributes(audioBox, {
        width: '500px',
        background: '#000',
        float: 'left'
    });

    setAttributes(analyser, {
        width: `${width}px`,
        height: `${height / 2}px`,
        background: '#002d3c',
        float: 'left'
    });

    queryElement.append(visualizer);
    visualizer.append(audioBox);
    visualizer.append(analyser);

    return visualizer;
}

export default class Visualizer {
    constructor() {
        this._visualizer = createVisualizer(500, 60, document.querySelector('body'));
        this._canvas = this._visualizer.querySelector('.analyserRenderer');
        this._ctx = this._canvas.getContext('2d');

        this._audio = this._createAudio();
        this._visualizer.querySelector('.audioBox').append(this._audio);

        this._audioCtx = new AudioContext();

        this._analyser = this._audioCtx.createAnalyser();
        this._analyser.connect(this._audioCtx.destination);

        this._source = this._audioCtx.createMediaElementSource(this._audio);
        this._source.connect(this._analyser);

        this._audioSrcs = ['./track2.webm', './track.m4a'];
        this._currentIdx = 0;
        this._setMediaSource(this._audioSrcs[0]);

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
                default: this.togglePlay(); break;
            }
        });
        this._audio.addEventListener('ended', () => {
            this.playNext();
        });
    }

    _createAudio() {
        let audio = new Audio();
        audio.controls = true;
        audio.autoplay = true;
        audio.volume = 0.1;

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
    }

    pauseAudio() {
        this._audio.pause();
    }

    setVolume(vol) {
        this._audio.volume = vol / 100;
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

    _render() {
        this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
        this._ctx.fillStyle = '#00ccff';

        const bars = 100;

        for (let i = 0; i < bars; i++) {
            const barX = i * 3;
            const barWidth = 2;
            const barHeight = -(this._fbcArray[i] / 2);
            this._ctx.fillRect(barX, this._canvas.height, barWidth, barHeight);
        }
    }

    _update() {
        this._fbcArray = new Uint8Array(this._analyser.frequencyBinCount);
        this._analyser.getByteFrequencyData(this._fbcArray);
    }

    _animate() {
        requestAnimationFrame(this._animate);
        this._render();
        this._update();
    }
}