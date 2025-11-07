/* ========= STARFIELD CANVAS =========
   - Muchísimas estrellas con parallax y brillo (twinkle)
   - Meteoros diagonales desde bordes aleatorios
   - Cobertura total arriba/abajo, muy fluido
*/
(function () {
    const canvas = document.getElementById('space');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const DPR = Math.max(1, Math.min(window.devicePixelRatio || 1, 2)); // nitidez
    let W, H;

    function resize() {
        W = canvas.clientWidth = window.innerWidth;
        H = canvas.clientHeight = window.innerHeight;
        canvas.width = Math.floor(W * DPR);
        canvas.height = Math.floor(H * DPR);
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    // Parámetros ajustables
    const LAYERS = [
        { count: 120, speed: 0.05, size: [0.5, 1.2], twinkle: 0.6 },
        { count: 220, speed: 0.12, size: [0.7, 1.6], twinkle: 0.8 },
        { count: 320, speed: 0.25, size: [0.9, 2.0], twinkle: 1.0 }
    ];
    const SHOOTING_RATE = 0.012; // probabilidad por frame de crear un meteorito (~1.2%)
    const SHOOTING_SPEED = [6, 10]; // px/frame
    const SHOOTING_LEN = [120, 220]; // largo de la estela

    // Estrellas estáticas (parallax + twinkle)
    const stars = [];
    function rand(a, b) { return a + Math.random() * (b - a); }

    LAYERS.forEach((layer, idx) => {
        for (let i = 0; i < layer.count; i++) {
            stars.push({
                x: Math.random() * W,
                y: Math.random() * H,
                r: rand(layer.size[0], layer.size[1]),
                spd: layer.speed,
                t: Math.random() * Math.PI * 2,
                tw: layer.twinkle,
                layer: idx
            });
        }
    });

    // Meteoritos
    const shoots = [];
    function spawnShoot() {
        // Elige un borde al azar (top, right, bottom, left) y un ángulo hacia dentro
        const edge = Math.floor(Math.random() * 4);
        let x, y, ang;
        switch (edge) {
            case 0: // top
                x = Math.random() * W; y = -20; ang = rand(Math.PI * 0.65, Math.PI * 1.35); break;
            case 1: // right
                x = W + 20; y = Math.random() * H; ang = rand(Math.PI * 1.1, Math.PI * 1.6); break;
            case 2: // bottom
                x = Math.random() * W; y = H + 20; ang = rand(-Math.PI * 0.35, Math.PI * 0.35); break;
            default: // left
                x = -20; y = Math.random() * H; ang = rand(-Math.PI * 0.1, Math.PI * 0.4); break;
        }
        shoots.push({
            x, y,
            vx: Math.cos(ang) * rand(SHOOTING_SPEED[0], SHOOTING_SPEED[1]),
            vy: Math.sin(ang) * rand(SHOOTING_SPEED[0], SHOOTING_SPEED[1]),
            life: rand(0.6, 1.2), // segundos “visibles”
            age: 0,
            len: rand(SHOOTING_LEN[0], SHOOTING_LEN[1]),
            alpha: 1
        });
    }

    let last = performance.now();
    function tick(now) {
        const dt = Math.min(50, now - last) / 16.666; // frames ~60fps
        last = now;

        ctx.clearRect(0, 0, W, H);

        // Fondo suave (sutil degradado radial)
        const grad = ctx.createRadialGradient(W * 0.5, H * 0.4, 0, W * 0.5, H * 0.4, Math.max(W, H));
        grad.addColorStop(0, 'rgba(10,10,20,0.6)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        // Dibujar estrellas
        ctx.save();
        stars.forEach(s => {
            s.x -= s.spd * dt;           // parallax horizontal
            if (s.x < -2) s.x = W + 2;   // reaparece a la derecha

            // Twinkle (parpadeo)
            s.t += 0.02 * s.tw * dt;
            const a = 0.6 + 0.4 * Math.sin(s.t);

            ctx.globalAlpha = a;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
        });
        ctx.restore();

        // Crear meteoritos
        if (Math.random() < SHOOTING_RATE) spawnShoot();

        // Dibujar meteoritos
        for (let i = shoots.length - 1; i >= 0; i--) {
            const sh = shoots[i];
            sh.age += dt / 60; // ~segundos
            sh.x += sh.vx * dt;
            sh.y += sh.vy * dt;

            // desvanecer
            sh.alpha = Math.max(0, 1 - sh.age / sh.life);

            ctx.save();
            ctx.globalAlpha = sh.alpha;
            const ang = Math.atan2(sh.vy, sh.vx);
            const tx = sh.x - Math.cos(ang) * sh.len;
            const ty = sh.y - Math.sin(ang) * sh.len;

            // estela
            const grd = ctx.createLinearGradient(sh.x, sh.y, tx, ty);
            grd.addColorStop(0, '#ffffff');
            grd.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.strokeStyle = grd;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(sh.x, sh.y);
            ctx.lineTo(tx, ty);
            ctx.stroke();

            // cabeza
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(sh.x, sh.y, 2.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // fuera de pantalla o agotado
            if (sh.alpha <= 0 || sh.x < -200 || sh.x > W + 200 || sh.y < -200 || sh.y > H + 200) {
                shoots.splice(i, 1);
            }
        }

        requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
})();

/* ========= UX botones ========= */
document.getElementById("btn-like")?.addEventListener("click", (() => {
    let contador = 0;
    return function () {
        contador++;
        const label = document.getElementById("contador");
        if (label) label.textContent = "❤️ " + contador;
    };
})());
document.getElementById("btn-descargar-cv")?.addEventListener("click", () => alert("¡Gracias por descargar mi CV!"));
document.querySelector("h1")?.addEventListener("click", () => alert("Gracias por visitar mi portafolio"));
$(function () {
    $(window).on("scroll", function () {
        if ($(this).scrollTop() > 300) $("#btn-volver-arriba").fadeIn(); else $("#btn-volver-arriba").fadeOut();
    });
    $("#btn-volver-arriba").on("click", function () {
        $("html, body").animate({ scrollTop: 0 }, 800);
        return false;
    });
});