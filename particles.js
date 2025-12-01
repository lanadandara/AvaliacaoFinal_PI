const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particlesArray = [];
let mouse = {
    x: null,
    y: null,
    radius: 150
};

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

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.baseX = x;
        this.baseY = y;
        this.density = (Math.random() * 30) + 5;
        this.size = Math.random() * 2 + 0.5;
        this.opacity = 0;
        this.targetOpacity = 0;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        // Direção preferencial única para cada partícula - evita padrões circulares
        this.preferredAngle = Math.random() * Math.PI * 2;
        this.chaosLevel = Math.random() * 0.5 + 0.5; // 0.5 a 1.0
        this.timeOffset = Math.random() * 1000;
    }

    draw() {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }

    update() {
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        let forceDirectionX = dx / distance;
        let forceDirectionY = dy / distance;
        let maxDistance = mouse.radius;
        let force = (maxDistance - distance) / maxDistance;
        let directionX = forceDirectionX * force * this.density;
        let directionY = forceDirectionY * force * this.density;

        if (distance < mouse.radius) {
            this.targetOpacity = Math.min(1, force * 2);

            // Em vez de usar o ângulo radial, mistura direções para quebrar o círculo
            let radialAngle = Math.atan2(dy, dx);

            // Usa o ângulo preferencial da partícula + noise temporal
            let time = Date.now() * 0.001 + this.timeOffset;
            let noiseAngle1 = Math.sin(time * 0.7 + this.baseX * 0.02) * Math.PI;
            let noiseAngle2 = Math.cos(time * 0.5 + this.baseY * 0.02) * Math.PI;

            // Mistura: pouco radial, muito caótico
            let finalAngle = (radialAngle * 0.2) +
                           (this.preferredAngle * 0.4) +
                           (noiseAngle1 * 0.3) +
                           (noiseAngle2 * 0.3);

            // Adiciona variação aleatória muito forte
            finalAngle += (Math.random() - 0.5) * Math.PI * 1.2 * this.chaosLevel;

            // Força de dispersão variável e intensa
            let dispersionForce = force * this.density * (2 + Math.random() * 2) * this.chaosLevel;

            // Aplica a força na direção final (não-radial)
            this.x += Math.cos(finalAngle) * dispersionForce;
            this.y += Math.sin(finalAngle) * dispersionForce;

            // Múltiplas ondas de turbulência em diferentes escalas
            let turbulence1 = Math.sin(time * 1.3 + distance * 0.15) * 3 * this.chaosLevel;
            let turbulence2 = Math.cos(time * 0.8 + distance * 0.08) * 2 * this.chaosLevel;

            this.x += turbulence1 + (Math.random() - 0.5) * 4;
            this.y += turbulence2 + (Math.random() - 0.5) * 4;

            // Vórtice que empurra partículas em espiral, não em círculo
            let vortexAngle = finalAngle + Math.PI / 2;
            let vortexStrength = Math.sin(time * 2 + distance * 0.2) * force * 3;
            this.x += Math.cos(vortexAngle) * vortexStrength;
            this.y += Math.sin(vortexAngle) * vortexStrength;
        } else {
            this.targetOpacity = 0;
            if (this.x !== this.baseX) {
                let dx = this.x - this.baseX;
                this.x -= dx / 10;
            }
            if (this.y !== this.baseY) {
                let dy = this.y - this.baseY;
                this.y -= dy / 10;
            }
        }

        // Suavização da opacidade
        this.opacity += (this.targetOpacity - this.opacity) * 0.1;

        // Movimento sutil contínuo
        this.x += this.speedX * 0.5;
        this.y += this.speedY * 0.5;

        // Manter partículas dentro dos limites
        if (this.x < 0 || this.x > canvas.width) {
            this.speedX *= -1;
        }
        if (this.y < 0 || this.y > canvas.height) {
            this.speedY *= -1;
        }

        this.draw();
    }
}

function init() {
    particlesArray = [];
    let numberOfParticles = (canvas.height * canvas.width) / 8000;

    for (let i = 0; i < numberOfParticles; i++) {
        let x = Math.random() * canvas.width;
        let y = Math.random() * canvas.height;
        particlesArray.push(new Particle(x, y));
    }
}

function connect() {
    for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
            let dx = particlesArray[a].x - particlesArray[b].x;
            let dy = particlesArray[a].y - particlesArray[b].y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 100) {
                let opacity = (1 - distance / 100) *
                            Math.min(particlesArray[a].opacity, particlesArray[b].opacity) * 0.3;
                ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                ctx.stroke();
            }
        }
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
    }

    connect();
    requestAnimationFrame(animate);
}

init();
animate();
