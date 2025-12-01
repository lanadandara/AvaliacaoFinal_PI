const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let mouse = {
    x: null,
    y: null,
    radius: 180
};

let glitchFragments = [];

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

class GlitchFragment {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.baseX = x;
        this.baseY = y;
        this.width = Math.random() * 80 + 20;
        this.height = Math.random() * 15 + 3;
        this.offsetX = 0;
        this.offsetY = 0;
        this.targetOffsetX = 0;
        this.targetOffsetY = 0;
        this.opacity = 0;
        this.targetOpacity = 0;
        this.rgbShift = 0;
        this.targetRgbShift = 0;
        this.rotation = (Math.random() - 0.5) * 0.3;
        this.pixelSize = Math.floor(Math.random() * 4) + 2;
        this.glitchIntensity = Math.random();
        this.updateTimer = 0;
        this.color = Math.random() > 0.7 ? {
            r: Math.random() * 255,
            g: Math.random() * 255,
            b: Math.random() * 255
        } : { r: 255, g: 255, b: 255 };
    }

    update() {
        if (mouse.x !== null && mouse.y !== null) {
            let dx = mouse.x - this.baseX;
            let dy = mouse.y - this.baseY;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < mouse.radius) {
                let force = 1 - (distance / mouse.radius);

                // Set target values based on mouse proximity
                this.targetOpacity = force * (0.6 + Math.random() * 0.3);

                // Scattered displacement
                let angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * Math.PI * 0.5;
                let pushDistance = force * (50 + Math.random() * 80) * this.glitchIntensity;

                this.targetOffsetX = Math.cos(angle) * pushDistance + (Math.random() - 0.5) * 30;
                this.targetOffsetY = Math.sin(angle) * pushDistance + (Math.random() - 0.5) * 30;

                this.targetRgbShift = force * (4 + Math.random() * 8);

                // Random repositioning for glitchy effect
                this.updateTimer++;
                if (this.updateTimer > 8 && Math.random() > 0.8) {
                    this.targetOffsetX = (Math.random() - 0.5) * force * 120;
                    this.targetOffsetY = (Math.random() - 0.5) * force * 80;
                    this.updateTimer = 0;
                }
            } else {
                this.targetOpacity = 0;
                this.targetOffsetX = 0;
                this.targetOffsetY = 0;
                this.targetRgbShift = 0;
            }
        } else {
            this.targetOpacity = 0;
            this.targetOffsetX = 0;
            this.targetOffsetY = 0;
            this.targetRgbShift = 0;
        }

        // Smooth interpolation
        this.opacity += (this.targetOpacity - this.opacity) * 0.12;
        this.offsetX += (this.targetOffsetX - this.offsetX) * 0.08;
        this.offsetY += (this.targetOffsetY - this.offsetY) * 0.08;
        this.rgbShift += (this.targetRgbShift - this.rgbShift) * 0.15;

        this.x = this.baseX + this.offsetX;
        this.y = this.baseY + this.offsetY;
    }

    draw() {
        if (this.opacity > 0.01) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);

            // RGB split effect for glitch
            if (this.rgbShift > 0.5) {
                // Red channel
                ctx.fillStyle = `rgba(255, 0, 0, ${this.opacity * 0.4})`;
                ctx.fillRect(-this.rgbShift, 0, this.width, this.height);

                // Blue channel
                ctx.fillStyle = `rgba(0, 0, 255, ${this.opacity * 0.4})`;
                ctx.fillRect(this.rgbShift, 0, this.width, this.height);
            }

            // Draw pixelated fragments
            if (Math.random() > 0.5) {
                for (let px = 0; px < this.width; px += this.pixelSize) {
                    for (let py = 0; py < this.height; py += this.pixelSize) {
                        if (Math.random() > 0.4) {
                            ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity})`;
                            ctx.fillRect(px, py, this.pixelSize, this.pixelSize);
                        }
                    }
                }
            } else {
                // Solid fragment
                ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity})`;
                ctx.fillRect(0, 0, this.width, this.height);
            }

            // Add some random pixels for extra glitch
            if (this.opacity > 0.3 && Math.random() > 0.7) {
                for (let i = 0; i < 5; i++) {
                    ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, ${this.opacity * 0.6})`;
                    ctx.fillRect(
                        Math.random() * this.width,
                        Math.random() * this.height,
                        this.pixelSize,
                        this.pixelSize
                    );
                }
            }

            ctx.restore();
        }
    }
}

function init() {
    glitchFragments = [];
    let fragmentCount = Math.floor((canvas.height * canvas.width) / 12000);

    for (let i = 0; i < fragmentCount; i++) {
        let x = Math.random() * canvas.width;
        let y = Math.random() * canvas.height;
        glitchFragments.push(new GlitchFragment(x, y));
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Add scattered static noise when mouse is present
    if (mouse.x !== null && mouse.y !== null && Math.random() > 0.92) {
        for (let i = 0; i < 30; i++) {
            let dx = (Math.random() - 0.5) * mouse.radius * 2;
            let dy = (Math.random() - 0.5) * mouse.radius * 2;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < mouse.radius) {
                ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.3})`;
                let size = Math.floor(Math.random() * 4) + 2;
                ctx.fillRect(
                    mouse.x + dx,
                    mouse.y + dy,
                    size,
                    size
                );
            }
        }
    }

    for (let i = 0; i < glitchFragments.length; i++) {
        glitchFragments[i].update();
        glitchFragments[i].draw();
    }

    requestAnimationFrame(animate);
}

init();
animate();
