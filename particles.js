const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let mouse = {
    x: null,
    y: null,
    radius: 150
};

let nodes = [];
let time = 0;

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

class Node {
    constructor(x, y, id) {
        this.baseX = x;
        this.baseY = y;
        this.x = x;
        this.y = y;
        this.id = id;

        // Visual properties
        this.size = Math.random() * 2 + 1;
        this.baseSize = this.size;
        this.opacity = 0;
        this.targetOpacity = Math.random() * 0.3 + 0.1;

        // Movement properties
        this.vx = 0;
        this.vy = 0;
        this.damping = 0.85;
        this.spring = 0.03;

        // Noise offset for organic movement
        this.noiseOffsetX = Math.random() * 1000;
        this.noiseOffsetY = Math.random() * 1000;
        this.noiseSpeed = Math.random() * 0.0005 + 0.0002;

        // Lifecycle
        this.life = Math.random();
        this.lifeSpeed = Math.random() * 0.01 + 0.005;

        // Mouse interaction
        this.distanceFromMouse = Infinity;
    }

    update() {
        time += 0.001;

        // Organic noise-based movement when no mouse
        let noiseX = (Math.sin(this.noiseOffsetX + time * 1000 * this.noiseSpeed) * 0.5 + 0.5) * 30 - 15;
        let noiseY = (Math.cos(this.noiseOffsetY + time * 1000 * this.noiseSpeed) * 0.5 + 0.5) * 30 - 15;

        // Calculate distance from mouse
        if (mouse.x !== null && mouse.y !== null) {
            let dx = mouse.x - this.baseX;
            let dy = mouse.y - this.baseY;
            this.distanceFromMouse = Math.sqrt(dx * dx + dy * dy);

            if (this.distanceFromMouse < mouse.radius) {
                // Strong repulsion/attraction based on distance
                let force = (1 - this.distanceFromMouse / mouse.radius) * 2;
                let angle = Math.atan2(dy, dx);

                // Create fluid wave effect
                let waveEffect = Math.sin(this.distanceFromMouse * 0.05 - time * 5) * force;

                // Push away from mouse with wave motion
                this.vx -= Math.cos(angle) * force * 3 + waveEffect * Math.cos(angle);
                this.vy -= Math.sin(angle) * force * 3 + waveEffect * Math.sin(angle);

                // Increase opacity and size near mouse
                this.targetOpacity = Math.min(1, force * 0.8 + 0.2);
                this.size = this.baseSize * (1 + force * 2);
            } else {
                this.targetOpacity = Math.random() * 0.3 + 0.1;
                this.size = this.baseSize;
            }
        } else {
            this.targetOpacity = Math.random() * 0.3 + 0.1;
            this.size = this.baseSize;
            this.distanceFromMouse = Infinity;
        }

        // Apply spring force to return to base position
        let dx = this.baseX + noiseX - this.x;
        let dy = this.baseY + noiseY - this.y;

        this.vx += dx * this.spring;
        this.vy += dy * this.spring;

        // Apply velocity and damping
        this.vx *= this.damping;
        this.vy *= this.damping;

        this.x += this.vx;
        this.y += this.vy;

        // Update opacity smoothly
        this.opacity += (this.targetOpacity - this.opacity) * 0.1;

        // Lifecycle animation (subtle pulsing)
        this.life += this.lifeSpeed;
        if (this.life > Math.PI * 2) {
            this.life = 0;
        }
    }

    draw() {
        if (this.opacity > 0.01) {
            // Pulsing effect
            let pulse = Math.sin(this.life) * 0.2 + 0.8;
            let finalOpacity = this.opacity * pulse;
            let finalSize = this.size * pulse;

            // Draw pixelated dot
            ctx.fillStyle = `rgba(255, 255, 255, ${finalOpacity})`;
            ctx.fillRect(
                Math.floor(this.x - finalSize / 2),
                Math.floor(this.y - finalSize / 2),
                Math.ceil(finalSize),
                Math.ceil(finalSize)
            );

            // Add glow for nodes near mouse
            if (this.distanceFromMouse < mouse.radius * 0.6 && mouse.x !== null) {
                let glowSize = finalSize * 2;
                ctx.fillStyle = `rgba(255, 255, 255, ${finalOpacity * 0.2})`;
                ctx.fillRect(
                    Math.floor(this.x - glowSize / 2),
                    Math.floor(this.y - glowSize / 2),
                    Math.ceil(glowSize),
                    Math.ceil(glowSize)
                );
            }
        }
    }

    drawConnections(otherNodes) {
        // Only draw connections if node is visible enough
        if (this.opacity < 0.1) return;

        let maxDistance = 80;
        let connectionOpacity = this.opacity * 0.3;

        for (let other of otherNodes) {
            if (other.id <= this.id) continue; // Avoid duplicate connections
            if (other.opacity < 0.1) continue;

            let dx = other.x - this.x;
            let dy = other.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < maxDistance) {
                let opacity = (1 - distance / maxDistance) * connectionOpacity * other.opacity;

                // Draw pixelated line
                ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
                ctx.lineWidth = 1;

                ctx.beginPath();
                ctx.moveTo(Math.floor(this.x), Math.floor(this.y));
                ctx.lineTo(Math.floor(other.x), Math.floor(other.y));
                ctx.stroke();

                // Boost connection opacity near mouse
                if (mouse.x !== null) {
                    let midX = (this.x + other.x) / 2;
                    let midY = (this.y + other.y) / 2;
                    let distToMouse = Math.sqrt((mouse.x - midX) ** 2 + (mouse.y - midY) ** 2);

                    if (distToMouse < mouse.radius * 0.7) {
                        let boost = (1 - distToMouse / (mouse.radius * 0.7)) * 0.4;
                        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity + boost})`;
                        ctx.lineWidth = 2;

                        ctx.beginPath();
                        ctx.moveTo(Math.floor(this.x), Math.floor(this.y));
                        ctx.lineTo(Math.floor(other.x), Math.floor(other.y));
                        ctx.stroke();
                    }
                }
            }
        }
    }
}

function init() {
    nodes = [];

    // Create irregular grid of nodes
    let spacingX = 40;
    let spacingY = 40;
    let cols = Math.ceil(canvas.width / spacingX) + 2;
    let rows = Math.ceil(canvas.height / spacingY) + 2;

    let id = 0;
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            // Add randomness to grid positions for organic look
            let x = j * spacingX + (Math.random() - 0.5) * spacingX * 0.5 - spacingX;
            let y = i * spacingY + (Math.random() - 0.5) * spacingY * 0.5 - spacingY;

            // Skip some nodes randomly for dispersed effect
            if (Math.random() > 0.15) {
                nodes.push(new Node(x, y, id++));
            }
        }
    }
}

function animate() {
    // Fade effect instead of clear for trail
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update all nodes
    for (let node of nodes) {
        node.update();
    }

    // Draw connections first (behind nodes)
    for (let node of nodes) {
        node.drawConnections(nodes);
    }

    // Draw nodes on top
    for (let node of nodes) {
        node.draw();
    }

    // Add occasional pixel "dust" near mouse
    if (mouse.x !== null && Math.random() > 0.8) {
        for (let i = 0; i < 5; i++) {
            let angle = Math.random() * Math.PI * 2;
            let distance = Math.random() * mouse.radius * 0.8;
            let x = mouse.x + Math.cos(angle) * distance;
            let y = mouse.y + Math.sin(angle) * distance;
            let size = Math.random() * 2 + 1;

            ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.3})`;
            ctx.fillRect(Math.floor(x), Math.floor(y), size, size);
        }
    }

    requestAnimationFrame(animate);
}

init();
animate();
