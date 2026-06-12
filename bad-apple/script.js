const video = document.createElement('video');
video.src = 'https://limewire.com/decrypt?sharingBucketId=245813da-b2e8-490c-8183-76c54f1e6dc0&contentItemId=08e7f4d2-24a4-4181-ae79-37140eb7afff&downloadUrl=https%3A%2F%2Fsp1.strg.com%2Flimewire%2Flmwrntwrk%2Fbuckets%2F245813da-b2e8-490c-8183-76c54f1e6dc0%2F08e7f4d2-24a4-4181-ae79-37140eb7afff%3FX-Amz-Algorithm%3DAWS4-HMAC-SHA256%26X-Amz-Date%3D20260612T021310Z%26X-Amz-SignedHeaders%3Dhost%26X-Amz-Credential%3D3HMkFzXmKJPnacuYeHAg%2F20260612%2Flmwrntwrk%2Fs3%2Faws4_request%26X-Amz-Expires%3D1800%26X-Amz-Signature%3Dd8b99e749560bb1ceb677ee94295301382031676bbc8d793f86ca93ce90c3f63%26x-lmwrntwrk-request-id%3D01KTWSNKJ8DGCSBA4SMGSW1JVX%26x-lmwrntwrk-signature%3DILTOiQjwqn1iwZ1VycUA28RsSTbdca6ie9f7uy0gM2GzOOZX7bWQZM2Y3J0KzoSPIglcn2atMCQFJHExuHwjTX4%25253D%26x-max-request-count%3D10000&mediaType=video%2Fmp4&decryptionKeys=eyJhZXNHY21Kd2siOnsiYWVzS2V5VHlwZSI6IlNZTU1FVFJJQ19BRVMtR0NNX0tFWSIsImp3ayI6eyJhbGciOiJBMjU2R0NNIiwiZXh0Ijp0cnVlLCJrIjoidnJQQnlteFNLTTdpUEk2Z19DenJuNllFNk1fWUFweHBKUFM2RWQ1SzN2MCIsImtleV9vcHMiOlsiZW5jcnlwdCIsImRlY3J5cHQiXSwia3R5Ijoib2N0In19LCJhZXNDdHJKd2siOnsiYWVzS2V5VHlwZSI6IlNZTU1FVFJJQ19BRVMtQ1RSX0tFWSIsImp3ayI6eyJhbGciOiJBMjU2Q1RSIiwiZXh0Ijp0cnVlLCJrIjoidnJQQnlteFNLTTdpUEk2Z19DenJuNllFNk1fWUFweHBKUFM2RWQ1SzN2MCIsImtleV9vcHMiOlsiZW5jcnlwdCIsImRlY3J5cHQiXSwia3R5Ijoib2N0In19fQ';
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
