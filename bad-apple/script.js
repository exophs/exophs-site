const video = document.createElement('video');
video.src = 'https://cdn.glitch.global/58cc88e6-fae4-4d3a-9fee-87a8518eb0a0/bad-apple.mp4?v=1729383680202';
video.crossOrigin = 'anonymous';
video.loop = true;
video.muted = false;

const canvas = document.getElementById('videoCanvas');
const ctx = canvas.getContext('2d');
const asciiElement = document.getElementById('ascii-art');

video.addEventListener('canplaythrough', () => {
    console.log('Video loaded and can play through!');
    canvas.width = 500;
    canvas.height = 500 * (video.videoHeight / video.videoWidth);
    video.play();
    convertToAscii();
});

video.addEventListener('error', (e) => {
    console.error('Error loading video:', e);
});

function convertToAscii() {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const frameData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const asciiArt = createAsciiArt(frameData, canvas.width);
    asciiElement.textContent = asciiArt;

    requestAnimationFrame(convertToAscii);
}

function createAsciiArt(frameData, fixedWidth) {
    const { data, height } = frameData;
    let ascii = '';
    const characters = '@#S%?*+;:,. ';

    for (let y = 0; y < height; y += 10) {
        for (let x = 0; x < fixedWidth; x += 5) {
            const index = (y * fixedWidth + x) * 4;
            const r = data[index];
            const g = data[index + 1];
            const b = data[index + 2];
            const avg = Math.floor((r + g + b) / 3);
            const charIndex = Math.floor((avg / 255) * (characters.length - 1));
            ascii += characters[charIndex];
        }
        ascii += '\n';
    }
    return ascii;
}

video.load();
