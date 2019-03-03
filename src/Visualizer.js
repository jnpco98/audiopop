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

        this._animate = this._animate.bind(this);
        this._animate();
    }

    _createAudio() {
        let audio = new Audio();
        audio.src = './track.m4a';
        audio.controls = true;
        audio.autoplay = true;
        audio.loop = true;
        audio.volume = 0.1;

        return audio;
    }

    _setMediaSource(src) {
        this._audio.src = src;
    }

    playAudio() {
        this._audio.play();
    }

    pauseAudio() {
        this._audio.pause();
    }

    reload() {
        this._audio.reload();
    }

    render() {

    }

    update() {

    }

    _animate() {
        requestAnimationFrame(this._animate);
        const fbcArray = new Uint8Array(this._analyser.frequencyBinCount);

        this._analyser.getByteFrequencyData(fbcArray);
        this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
        this._ctx.fillStyle = '#00ccff';

        const bars = 100;

        for (let i = 0; i < bars; i++) {
            const barX = i * 3;
            const barWidth = 2;
            const barHeight = -(fbcArray[i] / 2);
            this._ctx.fillRect(barX, this._canvas.height, barWidth, barHeight);
        }
    }
}