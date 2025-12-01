const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let mouse = {
    x: null,
    y: null,
    radius: 150
};

let glitchPoints = [];

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

class GlitchPoint {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.baseX = x;
        this.baseY = y;
        this.size = Math.random() * 2 + 1; // Small points: 1-3px
        this.opacity = 0;
        this.targetOpacity = 0;
        this.offsetX = 0;
        this.offsetY = 0;
        this.targetOffsetX = 0;
        this.targetOffsetY = 0;
        this.color = this.getRandomColor();
        this.glitchIntensity = Math.random();
        this.flickerSpeed = Math.random() * 0.1 + 0.05;
    }

    getRandomColor() {
        const colors = [
            [255, 255, 255], // white
            [255, 0, 0],     // red
            [0, 255, 0],     // green
            [0, 0, 255],     // blue
            [255, 255, 255], // more white for balance
            [255, 255, 255]
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        // Check if mouse is near this point
        if (mouse.x !== null && mouse.y !== null) {
            let dx = mouse.x - this.baseX;
            let dy = mouse.y - this.baseY;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < mouse.radius) {
                let force = 1 - (distance / mouse.radius);

                // Appear when mouse is near
                this.targetOpacity = Math.min(0.8, force * this.glitchIntensity);

                // Small random offset for glitchy feel
                this.targetOffsetX = (Math.random() - 0.5) * force * 20;
                this.targetOffsetY = (Math.random() - 0.5) * force * 20;

                // Occasionally change color for glitch effect
                if (Math.random() > 0.97) {
                    this.color = this.getRandomColor();
                }
            } else {
                this.targetOpacity = 0;
                this.targetOffsetX = 0;
                this.targetOffsetY = 0;
            }
        } else {
            this.targetOpacity = 0;
            this.targetOffsetX = 0;
            this.targetOffsetY = 0;
        }

        // Smooth interpolation
        this.opacity += (this.targetOpacity - this.opacity) * this.flickerSpeed;
        this.offsetX += (this.targetOffsetX - this.offsetX) * 0.1;
        this.offsetY += (this.targetOffsetY - this.offsetY) * 0.1;

        // Update position
        this.x = this.baseX + this.offsetX;
        this.y = this.baseY + this.offsetY;
    }

    draw() {
        if (this.opacity > 0.01) {
            ctx.fillStyle = `rgba(${this.color[0]}, ${this.color[1]}, ${this.color[2]}, ${this.opacity})`;
            ctx.fillRect(this.x, this.y, this.size, this.size);

            // Occasionally add a subtle glow
            if (this.opacity > 0.5 && Math.random() > 0.9) {
                ctx.fillStyle = `rgba(${this.color[0]}, ${this.color[1]}, ${this.color[2]}, ${this.opacity * 0.3})`;
                ctx.fillRect(this.x - 1, this.y - 1, this.size + 2, this.size + 2);
            }
        }
    }
}

function init() {
    glitchPoints = [];

    // Create a grid of potential glitch points
    const spacing = 30; // Distance between points
    const randomOffset = 15; // Random variation in position

    for (let x = 0; x < canvas.width; x += spacing) {
        for (let y = 0; y < canvas.height; y += spacing) {
            // Add random offset so they're not in a perfect grid
            let px = x + (Math.random() - 0.5) * randomOffset;
            let py = y + (Math.random() - 0.5) * randomOffset;

            // Only add some points (not all) for more scattered effect
            if (Math.random() > 0.3) {
                glitchPoints.push(new GlitchPoint(px, py));
            }
        }
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < glitchPoints.length; i++) {
        glitchPoints[i].update();
        glitchPoints[i].draw();
    }

    requestAnimationFrame(animate);
}

init();
animate();
