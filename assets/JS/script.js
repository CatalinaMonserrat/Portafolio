console.log('JS CARGADO:', new Date().toISOString());
document.getElementById('space') && console.log('CANVAS OK');

/* ========= STARFIELD CANVAS ========= */
(function () {
    const canvas = document.getElementById('space');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W, H;

    function resize() {
        const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
        const w = window.innerWidth;
        const h = window.innerHeight;

        // tamaño CSS
        canvas.style.width = w + "px";
        canvas.style.height = h + "px";
        // backing store
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        // dibujar en "px CSS"
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        W = w;
        H = h;
    }

    // Asegura tamaño al cargar (2 pasadas) y al redimensionar
    window.addEventListener('load', () => { resize(); setTimeout(resize, 50); });
    window.addEventListener('resize', resize);

    // Inicializa ANTES de crear las estrellas
    resize();

    // Parámetros
    const LAYERS = [
        { count: 120, speed: 0.05, size: [0.5, 1.2], twinkle: 0.6 },
        { count: 220, speed: 0.12, size: [0.7, 1.6], twinkle: 0.8 },
        { count: 320, speed: 0.25, size: [0.9, 2.0], twinkle: 1.0 }
    ];
    const SHOOTING_RATE = 0.012; // prob/ frame
    const SHOOTING_SPEED = [6, 10];
    const SHOOTING_LEN = [120, 220];

    // Estrellas
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
        const edge = Math.floor(Math.random() * 4);
        let x, y, ang;
        switch (edge) {
            case 0: x = Math.random() * W; y = -20; ang = rand(Math.PI * 0.65, Math.PI * 1.35); break; // top
            case 1: x = W + 20; y = Math.random() * H; ang = rand(Math.PI * 1.1, Math.PI * 1.6); break; // right
            case 2: x = Math.random() * W; y = H + 20; ang = rand(-Math.PI * 0.35, Math.PI * 0.35); break; // bottom
            default: x = -20; y = Math.random() * H; ang = rand(-Math.PI * 0.1, Math.PI * 0.4); break; // left
        }
        shoots.push({
            x, y,
            vx: Math.cos(ang) * rand(SHOOTING_SPEED[0], SHOOTING_SPEED[1]),
            vy: Math.sin(ang) * rand(SHOOTING_SPEED[0], SHOOTING_SPEED[1]),
            life: rand(0.6, 1.2),
            age: 0,
            len: rand(SHOOTING_LEN[0], SHOOTING_LEN[1]),
            alpha: 1
        });
    }

    let last = performance.now();
    function tick(now) {
        const dt = Math.min(50, now - last) / 16.666; // ~60fps
        last = now;

        ctx.clearRect(0, 0, W, H);

        // Fondo suave
        const grad = ctx.createRadialGradient(W * 0.5, H * 0.4, 0, W * 0.5, H * 0.4, Math.max(W, H));
        grad.addColorStop(0, 'rgba(10,10,20,0.6)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        // Estrellas
        ctx.save();
        stars.forEach(s => {
            s.x -= s.spd * dt;        // parallax
            if (s.x < -2) s.x = W + 2;

            s.t += 0.02 * s.tw * dt;  // twinkle
            const a = 0.6 + 0.4 * Math.sin(s.t);

            ctx.globalAlpha = a;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
        });
        ctx.restore();

        // Meteoritos
        if (Math.random() < SHOOTING_RATE) spawnShoot();

        for (let i = shoots.length - 1; i >= 0; i--) {
            const sh = shoots[i];
            sh.age += dt / 60;
            sh.x += sh.vx * dt;
            sh.y += sh.vy * dt;
            sh.alpha = Math.max(0, 1 - sh.age / sh.life);

            ctx.save();
            ctx.globalAlpha = sh.alpha;
            const ang = Math.atan2(sh.vy, sh.vx);
            const tx = sh.x - Math.cos(ang) * sh.len;
            const ty = sh.y - Math.sin(ang) * sh.len;

            const grd = ctx.createLinearGradient(sh.x, sh.y, tx, ty);
            grd.addColorStop(0, '#ffffff');
            grd.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.strokeStyle = grd;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(sh.x, sh.y);
            ctx.lineTo(tx, ty);
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(sh.x, sh.y, 2.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

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