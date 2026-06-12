const video = document.createElement('video');
video.src = 'https://ia601807.us.archive.org/26/items/bad-apple-pv_202307/%E3%80%90%E6%9D%B1%E6%96%B9%E3%80%91Bad%20Apple%21%21%20%EF%BC%B0%EF%BC%B6%E3%80%90%E5%BD%B1%E7%B5%B5%E3%80%91.mp4';
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
