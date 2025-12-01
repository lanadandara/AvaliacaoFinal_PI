const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let mouse = {
    x: null,
    y: null,
    radius: 200
};

let glitchSlices = [];
let pixelSize = 4;

window.addEventListener('mousemove', function(event) {
    mouse.x = event.x;
    mouse.y = event.y;
});

window.addEventListener('resize', function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    init();
});

window.addEventListener('mouseout', function() {
    mouse.x = null;
    mouse.y = null;
});

class GlitchSlice {
    constructor(y) {
        this.y = y;
        this.baseY = y;
        this.height = Math.random() * 15 + 5;
        this.offsetX = 0;
        this.targetOffsetX = 0;
        this.opacity = 0;
        this.targetOpacity = 0;
        this.rgbShift = 0;
        this.targetRgbShift = 0;
        this.pixelation = 0;
        this.targetPixelation = 0;
        this.glitchIntensity = Math.random();
        this.updateTimer = 0;
        this.staticNoise = Math.random();
    }

    update() {
        // Check if mouse is near this slice
        if (mouse.x !== null && mouse.y !== null) {
            let dy = Math.abs(mouse.y - this.y);
            let dx = Math.abs(mouse.x - canvas.width / 2);

            if (dy < mouse.radius) {
                let distance = dy;
                let force = 1 - (distance / mouse.radius);

                // Set target values based on mouse proximity
                this.targetOpacity = force * 0.8;
                this.targetOffsetX = (Math.random() - 0.5) * force * 150 * this.glitchIntensity;
                this.targetRgbShift = force * 8 * this.glitchIntensity;
                this.targetPixelation = force * 12;

                // Random repositioning for glitchy effect
                this.updateTimer++;
                if (this.updateTimer > 5 && Math.random() > 0.7) {
                    this.targetOffsetX = (Math.random() - 0.5) * force * 200;
                    this.updateTimer = 0;
                }
            } else {
                this.targetOpacity = 0;
                this.targetOffsetX = 0;
                this.targetRgbShift = 0;
                this.targetPixelation = 0;
            }
        } else {
            this.targetOpacity = 0;
            this.targetOffsetX = 0;
            this.targetRgbShift = 0;
            this.targetPixelation = 0;
        }

        // Smooth interpolation
        this.opacity += (this.targetOpacity - this.opacity) * 0.15;
        this.offsetX += (this.targetOffsetX - this.offsetX) * 0.1;
        this.rgbShift += (this.targetRgbShift - this.rgbShift) * 0.15;
        this.pixelation += (this.targetPixelation - this.pixelation) * 0.1;
    }

    draw() {
        if (this.opacity > 0.01) {
            let currentY = this.y;
            let currentHeight = this.height;

            // Draw pixelated effect
            if (this.pixelation > 0.5) {
                let pixSize = Math.max(2, Math.floor(this.pixelation));
                ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity * 0.3})`;

                for (let x = 0; x < canvas.width; x += pixSize) {
                    if (Math.random() > 0.5) {
                        let randomOffset = (Math.random() - 0.5) * this.pixelation * 2;
                        ctx.fillRect(
                            x + this.offsetX + randomOffset,
                            currentY,
                            pixSize,
                            currentHeight
                        );
                    }
                }
            }

            // RGB split effect for glitch
            if (this.rgbShift > 0.5) {
                // Red channel
                ctx.fillStyle = `rgba(255, 0, 0, ${this.opacity * 0.4})`;
                ctx.fillRect(
                    this.offsetX - this.rgbShift,
                    currentY,
                    canvas.width,
                    currentHeight
                );

                // Green channel
                ctx.fillStyle = `rgba(0, 255, 0, ${this.opacity * 0.3})`;
                ctx.fillRect(
                    this.offsetX,
                    currentY,
                    canvas.width,
                    currentHeight
                );

                // Blue channel
                ctx.fillStyle = `rgba(0, 0, 255, ${this.opacity * 0.4})`;
                ctx.fillRect(
                    this.offsetX + this.rgbShift,
                    currentY,
                    canvas.width,
                    currentHeight
                );
            }

            // Main white glitch bars
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
            ctx.fillRect(
                this.offsetX,
                currentY,
                canvas.width,
                currentHeight
            );

            // Add some horizontal line segments for more glitch effect
            if (this.opacity > 0.3 && Math.random() > 0.6) {
                ctx.fillStyle = `rgba(${Math.random() * 100 + 155}, ${Math.random() * 100 + 155}, ${Math.random() * 100 + 155}, ${this.opacity * 0.8})`;
                let segmentWidth = Math.random() * 200 + 50;
                let segmentX = Math.random() * canvas.width;
                ctx.fillRect(
                    segmentX + this.offsetX,
                    currentY,
                    segmentWidth,
                    currentHeight * 0.5
                );
            }

            // Pixelated noise overlay
            if (this.pixelation > 2) {
                for (let i = 0; i < 10; i++) {
                    if (Math.random() > 0.7) {
                        let noiseSize = Math.floor(this.pixelation / 2) + 2;
                        ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, ${this.opacity * 0.5})`;
                        ctx.fillRect(
                            Math.random() * canvas.width + this.offsetX,
                            currentY + Math.random() * currentHeight,
                            noiseSize,
                            noiseSize
                        );
                    }
                }
            }
        }
    }
}

function init() {
    glitchSlices = [];
    let sliceCount = Math.floor(canvas.height / 15);

    for (let i = 0; i < sliceCount; i++) {
        let y = (canvas.height / sliceCount) * i;
        glitchSlices.push(new GlitchSlice(y));
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Optional: add subtle background static when mouse is present
    if (mouse.x !== null && mouse.y !== null && Math.random() > 0.95) {
        for (let i = 0; i < 50; i++) {
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.1})`;
            ctx.fillRect(
                Math.random() * canvas.width,
                Math.random() * canvas.height,
                Math.random() * 3 + 1,
                Math.random() * 3 + 1
            );
        }
    }

    for (let i = 0; i < glitchSlices.length; i++) {
        glitchSlices[i].update();
        glitchSlices[i].draw();
    }

    requestAnimationFrame(animate);
}

init();
animate();
