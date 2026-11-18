(function () {
  const cv = document.querySelector("#ocean-canvas");
  if (!cv) return;
  const ctx = cv.getContext("2d", { desynchronized: true });
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const LITE = document.documentElement.classList.contains("lite");
  // Quality levels. The loop measures its own cost and steps down when a device (e.g. a laptop on battery saver) can't keep up.
  const LEVELS = [
    { rows: 30, step: 8, scale: 1, skip: 1 },
    { rows: 22, step: 11, scale: 0.85, skip: 1 },
    { rows: 16, step: 14, scale: 0.7, skip: 1 },
    { rows: 12, step: 18, scale: 0.6, skip: 2 },
  ];
  const mouse = { x: -999, y: -999, sx: -999, sy: -999 };
  let lvl = LITE ? 2 : 0,
    w = 0,
    h = 0,
    t = 0,
    vis = true,
    run = false,
    last = 0,
    slow = 0,
    frame = 0,
    rt = 0,
    label = "",
    labelKey = -1;

  const resize = () => {
    const r = Math.min(window.devicePixelRatio || 1, 1.25) * LEVELS[lvl].scale;
    w = cv.clientWidth;
    h = cv.clientHeight;
    cv.width = Math.round(w * r);
    cv.height = Math.round(h * r);
    ctx.setTransform(r, 0, 0, r, 0, 0);
  };

  document.getElementById("hero").addEventListener(
    "pointermove",
    (e) => {
      const b = cv.getBoundingClientRect();
      mouse.x = e.clientX - b.left;
      mouse.y = e.clientY - b.top;
      if (mouse.sx < 0) {
        mouse.sx = mouse.x;
        mouse.sy = mouse.y;
      }
    },
    { passive: true },
  );

  const draw = (now) => {
    if (!vis) {
      run = false;
      return;
    }
    requestAnimationFrame(draw);
    const dt = last ? Math.min(now - last, 100) : 16.7,
      k = dt / 16.67;
    last = now;
    // time-based motion: the cursor follow and the waves keep the same speed even when frames are slow
    t += still ? 0 : 0.006 * k;
    const f = 1 - Math.pow(0.88, k);
    mouse.sx += (mouse.x - mouse.sx) * f;
    mouse.sy += (mouse.y - mouse.sy) * f;
    const q = LEVELS[lvl];
    if (++frame % q.skip) return;

    const c0 = performance.now(),
      R = q.rows,
      S = q.step;
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < R; i++) {
      const kk = i / (R - 1),
        base = h * (0.28 + kk * 0.72),
        amp = 20 + kk * 70,
        // each fill only needs to reach the next row's baseline, because the next row paints over the rest (about 2x overdraw instead of about 15x)
        bottom = i < R - 1 ? h * (0.28 + ((i + 1) / (R - 1)) * 0.72) : h;
      ctx.beginPath();
      for (let x = 0; x <= w + S; x += S) {
        let y =
          base -
          amp *
            Math.max(
              0,
              Math.sin(x * 0.004 + i * 0.21 + t) * 0.6 +
                Math.sin(x * 0.011 - t * 1.3 + i * 0.4) * 0.4 +
                Math.sin(x * 0.0017 + t * 0.5) * 0.5,
            );
        const dx = x - mouse.sx,
          dy = base - mouse.sy,
          d2 = dx * dx + dy * dy;
        if (d2 < 200000) y -= 55 * Math.exp(-d2 / 26000);
        x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.strokeStyle =
        i === R - 1 ? "#00E5FF" : `rgba(240,249,255,${0.28 + kk * 0.5})`;
      ctx.lineWidth = i === R - 1 ? 2 : 1.2;
      ctx.stroke();
      ctx.lineTo(w, bottom);
      ctx.lineTo(0, bottom);
      ctx.fillStyle = `rgb(${(14 - kk * 8) | 0},${(160 - kk * 34) | 0},${(190 - kk * 36) | 0})`;
      ctx.fill();
    }
    if (mouse.sx > 0) {
      const depth = Math.round((120 + (mouse.sy / h) * 3880) / 10) * 10;
      if (depth !== labelKey) {
        labelKey = depth;
        label = `${depth.toLocaleString()} m down`;
      }
      ctx.strokeStyle = "#021019";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(mouse.sx, mouse.sy, 14, 0, 7);
      ctx.stroke();
      ctx.fillStyle = "#021019";
      ctx.beginPath();
      ctx.arc(mouse.sx, mouse.sy, 3, 0, 7);
      ctx.fill();
      ctx.font = "600 13px system-ui";
      ctx.fillStyle = "#F0F9FF";
      ctx.fillText(label, mouse.sx + 22, mouse.sy + 4);
    }
    // adaptive quality: step down after a sustained run of slow frames (never back up, so it can't flicker)
    const cost = performance.now() - c0;
    slow = cost > 8 || dt > 45 ? slow + 1 : Math.max(0, slow - 1);
    if (slow > 24 && lvl < LEVELS.length - 1) {
      lvl++;
      slow = 0;
      resize();
    }
  };

  addEventListener("resize", () => {
    clearTimeout(rt);
    rt = setTimeout(resize, 120);
  });
  new IntersectionObserver((es) => {
    vis = es[0].isIntersecting;
    if (vis && !run) {
      last = 0;
      run = true;
      requestAnimationFrame(draw);
    }
  }).observe(cv);
  // on battery: start one level lighter
  if (navigator.getBattery)
    navigator
      .getBattery()
      .then((b) => {
        const check = () => {
          if (!b.charging && lvl < 1) {
            lvl = 1;
            resize();
          }
        };
        check();
        b.addEventListener("chargingchange", check);
      })
      .catch(() => {});
  resize();
  run = true;
  requestAnimationFrame(draw);
})();
