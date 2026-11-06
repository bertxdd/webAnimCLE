const oceanCanvas = document.querySelector("#ocean-canvas");
if (oceanCanvas) {
  const ctx = oceanCanvas.getContext("2d");
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ROWS = 30,
    mouse = { x: -999, y: -999, sx: -999, sy: -999 };
  let t = 0,
    w = 0,
    h = 0;
  const resize = () => {
    const r = window.devicePixelRatio || 1;
    w = oceanCanvas.clientWidth;
    h = oceanCanvas.clientHeight;
    oceanCanvas.width = w * r;
    oceanCanvas.height = h * r;
    ctx.setTransform(r, 0, 0, r, 0, 0);
  };
  oceanCanvas.parentElement.addEventListener("pointermove", (e) => {
    const b = oceanCanvas.getBoundingClientRect();
    mouse.x = e.clientX - b.left;
    mouse.y = e.clientY - b.top;
    if (mouse.sx < 0) {
      mouse.sx = mouse.x;
      mouse.sy = mouse.y;
    }
  });
  const draw = () => {
    t += still ? 0 : 0.006;
    mouse.sx += (mouse.x - mouse.sx) * 0.12;
    mouse.sy += (mouse.y - mouse.sy) * 0.12;
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < ROWS; i++) {
      const k = i / (ROWS - 1),
        base = h * (0.28 + k * 0.72),
        amp = 20 + k * 70;
      ctx.beginPath();
      for (let x = 0; x <= w + 8; x += 8) {
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
        i === ROWS - 1 ? "#ff5436" : `rgba(241,234,216,${0.28 + k * 0.5})`;
      ctx.lineWidth = i === ROWS - 1 ? 2 : 1.2;
      ctx.stroke();
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.fillStyle = "#0c3138";
      ctx.fill();
      ctx.beginPath();
    }
    if (mouse.sx > 0) {
      const depth = Math.round(120 + (mouse.sy / h) * 3880);
      ctx.strokeStyle = "#ff5436";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(mouse.sx, mouse.sy, 14, 0, 7);
      ctx.stroke();
      ctx.fillStyle = "#ff5436";
      ctx.beginPath();
      ctx.arc(mouse.sx, mouse.sy, 3, 0, 7);
      ctx.fill();
      ctx.font = "600 13px system-ui";
      ctx.fillStyle = "#f1ead8";
      ctx.fillText(
        `${depth.toLocaleString()} m down`,
        mouse.sx + 22,
        mouse.sy + 4,
      );
    }
    requestAnimationFrame(draw);
  };
  addEventListener("resize", resize);
  resize();
  draw();
}

document.querySelectorAll("[data-count]").forEach((el) => {
  const target = Number(el.dataset.count);
  const run = () => {
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / 1600, 1);
      el.firstChild.textContent = Math.round(
        target * (1 - Math.pow(1 - p, 4)),
      ).toLocaleString();
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  new IntersectionObserver(
    (entries, io) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          run();
          io.disconnect();
        }
      }),
    { threshold: 0.6 },
  ).observe(el);
});

const chartCanvas = document.querySelector("#metrics-chart");
if (chartCanvas) {
  const ctx = chartCanvas.getContext("2d");
  const values = [18, 30, 43, 58, 76, 91],
    labels = ["2021", "2022", "2023", "2024", "2025", "2026"];
  const drawChart = () => {
    const r = window.devicePixelRatio || 1,
      w = chartCanvas.clientWidth,
      h = chartCanvas.clientHeight;
    chartCanvas.width = w * r;
    chartCanvas.height = h * r;
    ctx.setTransform(r, 0, 0, r, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(241,234,216,.15)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const y = 28 + i * ((h - 65) / 4);
      ctx.beginPath();
      ctx.moveTo(42, y);
      ctx.lineTo(w - 10, y);
      ctx.stroke();
    }
    const pts = values.map((v, i) => ({
      x: 45 + i * ((w - 65) / 5),
      y: h - 38 - v * 2.15,
    }));
    ctx.beginPath();
    pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
    ctx.strokeStyle = "#ff5436";
    ctx.lineWidth = 3;
    ctx.stroke();
    pts.forEach((p, i) => {
      ctx.fillStyle = "#b6e36b";
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, 7);
      ctx.fill();
      ctx.fillStyle = "#9fb8b3";
      ctx.font = "12px system-ui";
      ctx.fillText(labels[i], p.x - 15, h - 10);
    });
  };
  addEventListener("resize", drawChart);
  drawChart();
}
