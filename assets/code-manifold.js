(async function codeManifold() {
    const canvas = document.getElementById("code-manifold");
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const prefersReducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    const script = document.currentScript;
    const fallbackSource = `${codeManifold}`;
    const source = await fetchSource(script, fallbackSource);
    const glyphs = source.replace(/\s+/g, " ").trim();

    const rows = 27;
    const cols = 58;
    const points = makeSurface(rows, cols, glyphs);
    const pointer = { x: 0, y: 0 };
    let time = 0;
    let lastFrame = performance.now();
    let raf = 0;

    canvas.addEventListener("pointermove", (event) => {
        const box = canvas.getBoundingClientRect();
        pointer.x = ((event.clientX - box.left) / box.width - 0.5) * 2;
        pointer.y = ((event.clientY - box.top) / box.height - 0.5) * 2;
    });

    canvas.addEventListener("pointerleave", () => {
        pointer.x = 0;
        pointer.y = 0;
    });

    addEventListener("resize", resize, { passive: true });
    if (prefersReducedMotion.addEventListener) {
        prefersReducedMotion.addEventListener("change", schedule);
    } else {
        prefersReducedMotion.addListener(schedule);
    }
    resize();
    schedule();

    function schedule() {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(draw);
    }

    function resize() {
        const width = canvas.clientWidth || canvas.width;
        const height = width * 0.4375;
        const scale = Math.min(devicePixelRatio || 1, 2);
        canvas.width = Math.round(width * scale);
        canvas.height = Math.round(height * scale);
        ctx.setTransform(scale, 0, 0, scale, 0, 0);
    }

    function draw(now) {
        const dt = Math.min(48, now - lastFrame);
        lastFrame = now;
        time += prefersReducedMotion.matches ? 0 : dt * 0.001;

        const width = canvas.width / Math.min(devicePixelRatio || 1, 2);
        const height = canvas.height / Math.min(devicePixelRatio || 1, 2);
        const tilt = 0.84 + pointer.y * 0.18;
        const spin = time * 0.32 + pointer.x * 0.34;
        const light = normalize([0.25, -0.55, 1]);

        ctx.fillStyle = "#08090c";
        ctx.fillRect(0, 0, width, height);
        ctx.font = "11px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const projected = points.map((point) => project(point, spin, tilt, time, light));
        projected.sort((a, b) => a.depth - b.depth);

        for (const point of projected) {
            const alpha = clamp(0.16 + point.brightness * 0.82, 0.12, 0.95);
            ctx.fillStyle = `rgba(${point.red}, ${point.green}, ${point.blue}, ${alpha})`;
            ctx.fillText(point.char, width * 0.5 + point.x, height * 0.53 + point.y);
        }

        if (!prefersReducedMotion.matches) raf = requestAnimationFrame(draw);
    }

    function project(point, spin, tilt, waveTime, light) {
        const wave = Math.sin(point.u * 3.5 + waveTime * 1.8) * 0.065;
        const saddle = (point.u * point.u - point.v * point.v) * 0.62 + wave;
        const [x0, z0] = rotate2(point.u, saddle, spin);
        const [y1, z1] = rotate2(point.v, z0, tilt);
        const depth = z1 + 3.3;
        const scale = 148 / depth;
        const normal = normalize([-1.24 * point.u, 1.24 * point.v, 1]);
        const brightness = Math.max(0, dot(normal, light));
        const ink = 135 + Math.round(brightness * 95);

        return {
            char: point.char,
            x: x0 * scale * 2.1,
            y: y1 * scale * 1.45,
            depth,
            brightness,
            red: ink - 62,
            green: ink + 9,
            blue: ink + 26,
        };
    }

    function makeSurface(rowCount, colCount, text) {
        const points = [];
        let k = 0;

        for (let row = 0; row < rowCount; row += 1) {
            const v = row / (rowCount - 1) * 2 - 1;
            for (let col = 0; col < colCount; col += 1) {
                const u = col / (colCount - 1) * 2 - 1;
                const rim = Math.hypot(u, v);
                if (rim > 1.33) continue;

                points.push({
                    u,
                    v,
                    char: text[k++ % text.length],
                });
            }
        }

        return points;
    }

    async function fetchSource(tag, fallback) {
        try {
            const response = await fetch(tag.src, { cache: "force-cache" });
            if (response.ok) return response.text();
        } catch (_) {
            return fallback;
        }
        return fallback;
    }

    function rotate2(a, b, angle) {
        const s = Math.sin(angle);
        const c = Math.cos(angle);
        return [a * c - b * s, a * s + b * c];
    }

    function normalize(vector) {
        const length = Math.hypot(...vector) || 1;
        return vector.map((value) => value / length);
    }

    function dot(a, b) {
        return a.reduce((sum, value, i) => sum + value * b[i], 0);
    }

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }
})();
