const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let mouse = {
    x: null,
    y: null,
    radius: 200,
    velocity: 0
};

let lastMouseX = null;
let lastMouseY = null;
let glitchIntensity = 0;
let targetGlitchIntensity = 0;

window.addEventListener('mousemove', function(event) {
    if (lastMouseX !== null && lastMouseY !== null) {
        let dx = event.x - lastMouseX;
        let dy = event.y - lastMouseY;
        mouse.velocity = Math.sqrt(dx * dx + dy * dy);
    }

    lastMouseX = event.x;
    lastMouseY = event.y;
    mouse.x = event.x;
    mouse.y = event.y;
});

window.addEventListener('resize', function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

window.addEventListener('mouseout', function() {
    mouse.x = null;
    mouse.y = null;
    mouse.velocity = 0;
});

// Glitch line class for horizontal displacement
class GlitchLine {
    constructor() {
        this.reset();
    }

    reset() {
        this.y = Math.random() * canvas.height;
        this.height = Math.random() * 20 + 2;
        this.offsetX = 0;
        this.targetOffsetX = 0;
        this.life = 0;
        this.maxLife = Math.random() * 30 + 10;
        this.rgbSplit = Math.random() * 15 + 5;
        this.active = false;
    }

    update(intensity) {
        // Randomly activate glitch lines
        if (!this.active && Math.random() < 0.02 * intensity) {
            this.active = true;
            this.y = Math.random() * canvas.height;
            this.height = Math.random() * 30 + 5;
            this.targetOffsetX = (Math.random() - 0.5) * 100 * intensity;
            this.rgbSplit = Math.random() * 20 * intensity;
            this.life = 0;
            this.maxLife = Math.random() * 20 + 5;
        }

        if (this.active) {
            this.life++;

            // Smooth offset transition
            this.offsetX += (this.targetOffsetX - this.offsetX) * 0.3;

            // Random offset changes for jittery effect
            if (Math.random() < 0.3) {
                this.targetOffsetX = (Math.random() - 0.5) * 80 * intensity;
            }

            // Deactivate after life expires
            if (this.life > this.maxLife) {
                this.active = false;
                this.targetOffsetX = 0;
            }
        } else {
            // Return to normal position
            this.offsetX += (0 - this.offsetX) * 0.2;
        }
    }

    draw(imageData) {
        if (this.active && Math.abs(this.offsetX) > 0.5) {
            let startY = Math.floor(Math.max(0, this.y));
            let endY = Math.floor(Math.min(canvas.height, this.y + this.height));

            // RGB channel shift
            this.drawRGBShift(imageData, startY, endY);
        }
    }

    drawRGBShift(imageData, startY, endY) {
        let offset = Math.floor(this.offsetX);
        let rgbOffset = Math.floor(this.rgbSplit);

        // Create temporary line buffer
        for (let y = startY; y < endY; y++) {
            let rowStart = y * canvas.width * 4;
            let tempRow = new Uint8ClampedArray(canvas.width * 4);

            // Copy original row
            for (let i = 0; i < canvas.width * 4; i++) {
                tempRow[i] = imageData.data[rowStart + i];
            }

            // Apply displacement with RGB split
            for (let x = 0; x < canvas.width; x++) {
                let sourceX = x - offset;

                if (sourceX >= 0 && sourceX < canvas.width) {
                    let targetIdx = rowStart + x * 4;
                    let sourceIdx = rowStart + sourceX * 4;

                    // Red channel shifted
                    let redX = Math.max(0, Math.min(canvas.width - 1, sourceX - rgbOffset));
                    imageData.data[targetIdx] = tempRow[rowStart + redX * 4];

                    // Green channel
                    imageData.data[targetIdx + 1] = tempRow[sourceIdx + 1];

                    // Blue channel shifted opposite direction
                    let blueX = Math.max(0, Math.min(canvas.width - 1, sourceX + rgbOffset));
                    imageData.data[targetIdx + 2] = tempRow[rowStart + blueX * 4 + 2];

                    // Alpha
                    imageData.data[targetIdx + 3] = tempRow[sourceIdx + 3];
                }
            }
        }
    }
}

// Corruption block class
class CorruptionBlock {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.width = Math.random() * 150 + 50;
        this.height = Math.random() * 100 + 30;
        this.life = 0;
        this.maxLife = Math.random() * 15 + 5;
        this.active = false;
        this.type = Math.floor(Math.random() * 3); // Different corruption types
    }

    update(intensity) {
        if (!this.active && Math.random() < 0.01 * intensity) {
            this.active = true;
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.width = Math.random() * 200 + 100;
            this.height = Math.random() * 150 + 50;
            this.life = 0;
            this.maxLife = Math.random() * 10 + 3;
            this.type = Math.floor(Math.random() * 3);
        }

        if (this.active) {
            this.life++;
            if (this.life > this.maxLife) {
                this.active = false;
            }
        }
    }

    draw(imageData) {
        if (!this.active) return;

        let startX = Math.floor(Math.max(0, this.x));
        let endX = Math.floor(Math.min(canvas.width, this.x + this.width));
        let startY = Math.floor(Math.max(0, this.y));
        let endY = Math.floor(Math.min(canvas.height, this.y + this.height));

        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                let idx = (y * canvas.width + x) * 4;

                if (this.type === 0) {
                    // Invert colors
                    imageData.data[idx] = 255 - imageData.data[idx];
                    imageData.data[idx + 1] = 255 - imageData.data[idx + 1];
                    imageData.data[idx + 2] = 255 - imageData.data[idx + 2];
                } else if (this.type === 1) {
                    // Bit crush
                    let levels = 4;
                    imageData.data[idx] = Math.floor(imageData.data[idx] / levels) * levels;
                    imageData.data[idx + 1] = Math.floor(imageData.data[idx + 1] / levels) * levels;
                    imageData.data[idx + 2] = Math.floor(imageData.data[idx + 2] / levels) * levels;
                } else {
                    // Pixelate
                    let pixelSize = 8;
                    let px = Math.floor(x / pixelSize) * pixelSize;
                    let py = Math.floor(y / pixelSize) * pixelSize;
                    let sampIdx = (py * canvas.width + px) * 4;

                    if (sampIdx >= 0 && sampIdx < imageData.data.length - 3) {
                        imageData.data[idx] = imageData.data[sampIdx];
                        imageData.data[idx + 1] = imageData.data[sampIdx + 1];
                        imageData.data[idx + 2] = imageData.data[sampIdx + 2];
                    }
                }
            }
        }
    }
}

// Initialize glitch elements
let glitchLines = [];
let corruptionBlocks = [];

for (let i = 0; i < 15; i++) {
    glitchLines.push(new GlitchLine());
}

for (let i = 0; i < 8; i++) {
    corruptionBlocks.push(new CorruptionBlock());
}

// Render base content to glitch
function renderBaseContent() {
    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw some subtle grid or pattern to glitch
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;

    let gridSize = 50;
    for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    // Add some random dots for texture
    if (mouse.x !== null) {
        for (let i = 0; i < 100; i++) {
            let x = Math.random() * canvas.width;
            let y = Math.random() * canvas.height;
            let dx = x - mouse.x;
            let dy = y - mouse.y;
            let dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < mouse.radius) {
                let opacity = (1 - dist / mouse.radius) * 0.2;
                ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
                ctx.fillRect(x, y, 2, 2);
            }
        }
    }
}

function animate() {
    // Calculate glitch intensity based on mouse presence and velocity
    if (mouse.x !== null) {
        let velocityFactor = Math.min(mouse.velocity / 20, 1);
        targetGlitchIntensity = 0.3 + velocityFactor * 0.7;
    } else {
        targetGlitchIntensity = 0.05; // Minimal ambient glitching
    }

    // Smooth intensity transition
    glitchIntensity += (targetGlitchIntensity - glitchIntensity) * 0.1;

    // Decay mouse velocity
    mouse.velocity *= 0.9;

    // Render base content
    renderBaseContent();

    // Get image data for manipulation
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Update and apply glitch lines
    for (let line of glitchLines) {
        line.update(glitchIntensity);
        line.draw(imageData);
    }

    // Update and apply corruption blocks
    for (let block of corruptionBlocks) {
        block.update(glitchIntensity);
        block.draw(imageData);
    }

    // Random RGB channel shift on entire canvas
    if (glitchIntensity > 0.3 && Math.random() < 0.05) {
        applyGlobalRGBShift(imageData, Math.floor(glitchIntensity * 10));
    }

    // Apply scanline effect
    applyScanlines(imageData, glitchIntensity);

    // Put modified image data back
    ctx.putImageData(imageData, 0, 0);

    // Add some overlay glitch bars
    if (Math.random() < glitchIntensity * 0.1) {
        let barY = Math.random() * canvas.height;
        let barHeight = Math.random() * 5 + 1;
        ctx.fillStyle = `rgba(${Math.random() * 100 + 155}, ${Math.random() * 100 + 155}, ${Math.random() * 100 + 155}, ${glitchIntensity * 0.8})`;
        ctx.fillRect(0, barY, canvas.width, barHeight);
    }

    requestAnimationFrame(animate);
}

function applyGlobalRGBShift(imageData, amount) {
    let tempData = new Uint8ClampedArray(imageData.data);

    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            let idx = (y * canvas.width + x) * 4;

            // Shift red channel
            let redX = Math.max(0, Math.min(canvas.width - 1, x - amount));
            let redIdx = (y * canvas.width + redX) * 4;
            imageData.data[idx] = tempData[redIdx];

            // Shift blue channel
            let blueX = Math.max(0, Math.min(canvas.width - 1, x + amount));
            let blueIdx = (y * canvas.width + blueX) * 4;
            imageData.data[idx + 2] = tempData[blueIdx + 2];
        }
    }
}

function applyScanlines(imageData, intensity) {
    let scanlineSpacing = 4;
    let scanlineOpacity = intensity * 0.15;

    for (let y = 0; y < canvas.height; y += scanlineSpacing) {
        for (let x = 0; x < canvas.width; x++) {
            let idx = (y * canvas.width + x) * 4;
            imageData.data[idx] *= (1 - scanlineOpacity);
            imageData.data[idx + 1] *= (1 - scanlineOpacity);
            imageData.data[idx + 2] *= (1 - scanlineOpacity);
        }
    }
}

animate();
