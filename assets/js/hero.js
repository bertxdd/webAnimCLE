(function(){
const oceanCanvas = document.querySelector("#ocean-canvas");
if (oceanCanvas) {
  const ctx = oceanCanvas.getContext("2d");
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const LITE = document.documentElement.classList.contains("lite"),
    ROWS = LITE ? 14 : 30,
    mouse = { x: -999, y: -999, sx: -999, sy: -999 };
  let t = 0,
    w = 0,
    h = 0,
    bounds = oceanCanvas.getBoundingClientRect(),
    heroVisible = true,
    running = true;
  const resize = () => {
    const r = Math.min(window.devicePixelRatio || 1, LITE ? 1 : 1.5);
    bounds = oceanCanvas.getBoundingClientRect();
    w = oceanCanvas.clientWidth;
    h = oceanCanvas.clientHeight;
    oceanCanvas.width = w * r;
    oceanCanvas.height = h * r;
    ctx.setTransform(r, 0, 0, r, 0, 0);
  };
  document.getElementById("hero").addEventListener("pointermove", (e) => {
    bounds = oceanCanvas.getBoundingClientRect();
    mouse.x = e.clientX - bounds.left;
    mouse.y = e.clientY - bounds.top;
    if (mouse.sx < 0) {
      mouse.sx = mouse.x;
      mouse.sy = mouse.y;
    }
  });
  const draw = () => {
    if (!heroVisible) {
      running = false;
      return;
    }
    t += still ? 0 : 0.006;
    mouse.sx += (mouse.x - mouse.sx) * 0.12;
    mouse.sy += (mouse.y - mouse.sy) * 0.12;
    ctx.clearRect(0, 0, w, h);
    const ROWSN = ROWS,
      STEP = LITE ? 14 : 8;
    for (let i = 0; i < ROWSN; i++) {
      const k = i / (ROWSN - 1),
        base = h * (0.28 + k * 0.72),
        amp = 20 + k * 70;
      ctx.beginPath();
      for (let x = 0; x <= w + 8; x += STEP) {
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
          dy = base - mouse.sy;
        y -= 55 * Math.exp(-(dx * dx + dy * dy) / 26000);
        x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.strokeStyle =
        i === ROWSN - 1 ? "#00E5FF" : `rgba(240,249,255,${0.28 + k * 0.5})`;
      ctx.lineWidth = i === ROWSN - 1 ? 2 : 1.2;
      ctx.stroke();
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.fillStyle = `rgb(${14 - k * 8 | 0},${160 - k * 34 | 0},${190 - k * 36 | 0})`;
      ctx.fill();
      ctx.beginPath();
    }
    if (mouse.sx > 0) {
      const depth = Math.round(120 + (mouse.sy / h) * 3880);
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
      ctx.fillText(
        `${depth.toLocaleString()} m down`,
        mouse.sx + 22,
        mouse.sy + 4,
      );
    }
    requestAnimationFrame(draw);
  };
  addEventListener("resize", resize);
  new IntersectionObserver((es) => {
    heroVisible = es[0].isIntersecting;
    if (heroVisible && !running) {
      bounds = oceanCanvas.getBoundingClientRect();
      if (mouse.x >= 0) {
        mouse.sx = mouse.x;
        mouse.sy = mouse.y;
      }
      running = true;
      requestAnimationFrame(draw);
    }
  }).observe(oceanCanvas);
  resize();
  draw();
}


})();
