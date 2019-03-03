const setAttributes = (elem, attrs) => {
    Object.assign(elem.style, attrs);
}

const createVisualizer = (width, height, queryElement) => {
    const visualizer = document.createElement('div');
    visualizer.className = 'visualizer';

    const audioBox = document.createElement('div');
    audioBox.className = 'audioBox';

    const analyzer = document.createElement('canvas')
    analyzer.className = 'analyzerRenderer';


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

    setAttributes(analyzer, {
        width: `${width}px`,
        height: `${height / 2}px`,
        background: '#002d3c',
        float: 'left'
    });

    queryElement.append(visualizer);
    visualizer.append(audioBox);
    visualizer.append(analyzer);

    return visualizer;
}

let visualizer = createVisualizer(500, 60, document.querySelector('body'));

let audio = new Audio();
audio.src = './track.m4a';
audio.controls = true;
audio.autoplay = true;
audio.loop = true;
audio.volume = 0.1;

let canvas, ctx, source, audioCtx, analyzer, fbcArray, bars, barX, barWidth, barHeight;
window.addEventListener('load', initMp3Player, false);

function initMp3Player() {
    visualizer.querySelector('.audioBox').append(audio);
    audioCtx = new AudioContext();
    analyzer = audioCtx.createAnalyser();

    canvas = visualizer.querySelector('.analyzerRenderer');
    ctx = canvas.getContext('2d');

    source = audioCtx.createMediaElementSource(audio);
    source.connect(analyzer);
    analyzer.connect(audioCtx.destination)
    animate();
}

function animate() {
    requestAnimationFrame(animate);
    fbcArray = new Uint8Array(analyzer.frequencyBinCount);
    analyzer.getByteFrequencyData(fbcArray);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#00ccff';
    bars = 100;

    for (let i = 0; i < bars; i++) {
        barX = i * 3;
        barWidth = 2;
        barHeight = -(fbcArray[i] / 2);
        ctx.fillRect(barX, canvas.height, barWidth, barHeight);
    }
}
