const oceanCanvas = document.querySelector("#ocean-canvas");
if (oceanCanvas) {
  const ctx = oceanCanvas.getContext("2d");
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ROWS = 30,
    mouse = { x: -999, y: -999, sx: -999, sy: -999 };
  let t = 0,
    w = 0,
    h = 0,
    heroVisible = true,
    running = true;
  const resize = () => {
    const r = Math.min(window.devicePixelRatio || 1, 2);
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
    if (!heroVisible) {
      running = false;
      return;
    }
    t += still ? 0 : 0.006;
    mouse.sx += (mouse.x - mouse.sx) * 0.12;
    mouse.sy += (mouse.y - mouse.sy) * 0.12;
    ctx.clearRect(0, 0, w, h);
    const ROWSN = ROWS,
      STEP = 8;
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
        i === ROWSN - 1 ? "#ff5436" : `rgba(241,234,216,${0.28 + k * 0.5})`;
      ctx.lineWidth = i === ROWSN - 1 ? 2 : 1.2;
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
  new IntersectionObserver((es) => {
    heroVisible = es[0].isIntersecting;
    if (heroVisible && !running) {
      running = true;
      requestAnimationFrame(draw);
    }
  }).observe(oceanCanvas);
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
          setTimeout(run, document.querySelector(".is-loading") ? 900 : 0);
          io.disconnect();
        }
      }),
    { threshold: 0.6 },
  ).observe(el);
});

const chartCanvas = document.querySelector("#metrics-chart");
if (chartCanvas) {
  const ctx = chartCanvas.getContext("2d");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  /* [year, tons removed]. Edit these numbers to change the chart. */
  const DATA = [
    [2021, 300],
    [2022, 600],
    [2023, 950],
    [2024, 1243],
    [2025, 1592],
    [2026, 1942],
  ];
  const GOAL = 2500,
    N = DATA.length,
    pad = { l: 62, r: 28, t: 34, b: 38 };
  let w = 0,
    h = 0,
    visible = false,
    t0 = null,
    hover = -1,
    pinned = -1,
    last = 0,
    ha = 0,
    hx = 0,
    shown = -2,
    dirty = true;
  const rad = DATA.map(() => 5);
  const X = (i) => pad.l + (i * (w - pad.l - pad.r)) / (N - 1);
  const Y = (v) => pad.t + (1 - v / GOAL) * (h - pad.t - pad.b);
  const ease = (x) => 1 - Math.pow(1 - x, 3);
  const back = (x) =>
    1 + 2.70158 * Math.pow(x - 1, 3) + 1.70158 * Math.pow(x - 1, 2);

  const readout = document.createElement("div");
  readout.setAttribute("aria-live", "polite");
  readout.style.cssText = "min-height:1.7em;margin:4px 0 0;font-weight:600";
  chartCanvas.before(readout);
  chartCanvas.tabIndex = 0;
  chartCanvas.style.cursor = "crosshair";
  chartCanvas.style.touchAction = "pan-y";
  const info = (i) => {
    const [y, t] = DATA[i];
    const d = i
      ? `${Math.round((t / DATA[i - 1][1] - 1) * 100)}% up from ${DATA[i - 1][0]}`
      : "the first year on record";
    return `${y}: ${t.toLocaleString()} t removed, ${Math.round((t / GOAL) * 100)}% of the goal, ${d}.`;
  };

  const resize = () => {
    const r = Math.min(window.devicePixelRatio || 1, 2);
    w = chartCanvas.clientWidth;
    h = chartCanvas.clientHeight;
    chartCanvas.width = w * r;
    chartCanvas.height = h * r;
    ctx.setTransform(r, 0, 0, r, 0, 0);
    dirty = true;
  };
  const trace = () => {
    const P = DATA.map((d, i) => [X(i), Y(d[1])]);
    ctx.moveTo(P[0][0], P[0][1]);
    for (let i = 0; i < N - 1; i++) {
      const a = P[Math.max(i - 1, 0)],
        b = P[i],
        c = P[i + 1],
        d = P[Math.min(i + 2, N - 1)];
      ctx.bezierCurveTo(
        b[0] + (c[0] - a[0]) / 6,
        b[1] + (c[1] - a[1]) / 6,
        c[0] - (d[0] - b[0]) / 6,
        c[1] - (d[1] - b[1]) / 6,
        c[0],
        c[1],
      );
    }
  };

  const frame = (now) => {
    requestAnimationFrame(frame);
    if (!visible || !w) return;
    if (t0 === null && !document.querySelector(".is-loading")) t0 = now;
    const p = reduce
      ? 1
      : t0 === null
        ? 0
        : ease(Math.min((now - t0) / 1900, 1));
    const k = reduce ? 1 : 0.18,
      active = hover >= 0 ? hover : pinned;
    /* Only redraw while something is moving. */
    const busy =
      dirty ||
      p < 1 ||
      active >= 0 ||
      ha > 0.003 ||
      rad.some((r, i) => Math.abs(r - (i === active ? 9 : 5)) > 0.02);
    if (!busy) return;
    dirty = false;
    if (active >= 0) {
      last = active;
      if (ha < 0.02) hx = X(active);
      hx += (X(active) - hx) * k;
    }
    ha += ((active >= 0 ? 1 : 0) - ha) * k;
    rad.forEach((r, i) => {
      rad[i] += ((i === active ? 9 : 5) - r) * k;
      if (Math.abs(rad[i] - (i === active ? 9 : 5)) < 0.02)
        rad[i] = i === active ? 9 : 5;
    });
    if (active < 0 && ha < 0.003) ha = 0;
    if (active !== shown) {
      shown = active;
      readout.textContent =
        active >= 0
          ? info(active)
          : "Hover, tap or use the arrow keys to read a year. Click to pin it.";
      readout.style.color = active >= 0 ? "#f1ead8" : "#9fb8b3";
    }

    ctx.clearRect(0, 0, w, h);
    ctx.font = "11px system-ui";
    ctx.textAlign = "right";
    ctx.lineWidth = 1;
    for (let v = 0; v <= GOAL; v += 500) {
      const y = Y(v);
      ctx.strokeStyle = "rgba(241,234,216,.14)";
      ctx.beginPath();
      ctx.moveTo(pad.l, y);
      ctx.lineTo(w - pad.r, y);
      ctx.stroke();
      ctx.fillStyle = "#9fb8b3";
      ctx.fillText(v.toLocaleString(), pad.l - 10, y + 4);
    }
    ctx.setLineDash([6, 5]);
    ctx.strokeStyle = "#b6e36b";
    ctx.beginPath();
    ctx.moveTo(pad.l, Y(GOAL));
    ctx.lineTo(w - pad.r, Y(GOAL));
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.textAlign = "left";
    ctx.fillStyle = "#b6e36b";
    ctx.fillText("2,500 t goal", pad.l, Y(GOAL) - 8);

    /* The reveal: everything below is clipped to a edge that sweeps from the left. */
    const cut = pad.l - 6 + p * (w - pad.l - pad.r + 12);
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, cut, h);
    ctx.clip();
    const g = ctx.createLinearGradient(0, pad.t, 0, h - pad.b);
    g.addColorStop(0, "rgba(255,84,54,.30)");
    g.addColorStop(1, "rgba(255,84,54,0)");
    ctx.beginPath();
    trace();
    ctx.lineTo(X(N - 1), Y(0));
    ctx.lineTo(X(0), Y(0));
    ctx.closePath();
    ctx.fillStyle = g;
    ctx.fill();
    ctx.lineWidth = 3.5;
    ctx.lineJoin = "round";
    ctx.beginPath();
    trace();
    ctx.strokeStyle = `rgba(255,84,54,${1 - 0.6 * ha})`;
    ctx.stroke();
    if (ha > 0.01) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, hx, h);
      ctx.clip();
      ctx.beginPath();
      trace();
      ctx.strokeStyle = "#ff5436";
      ctx.globalAlpha = ha;
      ctx.stroke();
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = ha * 0.5;
      ctx.setLineDash([4, 5]);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "#f1ead8";
      ctx.beginPath();
      ctx.moveTo(hx, pad.t);
      ctx.lineTo(hx, h - pad.b);
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();

    ctx.textAlign = "center";
    DATA.forEach((d, i) => {
      const x = X(i),
        y = Y(d[1]),
        pop = Math.min(1, Math.max(0, (cut - x) / 45));
      ctx.globalAlpha = Math.min(1, p * 2.5);
      ctx.font = i === active ? "700 13px system-ui" : "12px system-ui";
      ctx.fillStyle = i === active ? "#f1ead8" : "#9fb8b3";
      ctx.fillText(d[0], x, h - 12);
      ctx.globalAlpha = 1;
      if (pop <= 0) return;
      const r = Math.max(rad[i] * back(pop), 0);
      if (i === active) {
        const ring = (now / 900) % 1;
        ctx.strokeStyle = `rgba(182,227,107,${(1 - ring) * 0.6})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, r + 4 + ring * 14, 0, 7);
        ctx.stroke();
      }
      ctx.fillStyle = i === active ? "#f1ead8" : "#b6e36b";
      ctx.strokeStyle = "#08232a";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 7);
      ctx.fill();
      ctx.stroke();
    });

    if (ha > 0.02) {
      const [yr, t] = DATA[last],
        bw = 156,
        bh = 76,
        px = X(last),
        py = Y(t);
      let bx = px + 18;
      if (bx + bw > w - 4) bx = px - 18 - bw;
      let by = py - bh - 16;
      if (by < 4) by = py + 18;
      ctx.save();
      ctx.globalAlpha = ha;
      ctx.translate(0, (1 - ha) * 10);
      ctx.beginPath();
      ctx.roundRect(bx, by, bw, bh, 8);
      ctx.fillStyle = "#f1ead8";
      ctx.fill();
      ctx.textAlign = "left";
      ctx.fillStyle = "#47625f";
      ctx.font = "600 12px system-ui";
      ctx.fillText(yr, bx + 14, by + 22);
      ctx.fillStyle = "#08232a";
      ctx.font = "800 22px system-ui";
      ctx.fillText(t.toLocaleString() + " t", bx + 14, by + 47);
      ctx.fillStyle = "#47625f";
      ctx.font = "12px system-ui";
      ctx.fillText(
        Math.round((t / GOAL) * 100) +
          "% of goal" +
          (last
            ? ", +" + Math.round((t / DATA[last - 1][1] - 1) * 100) + "%"
            : ""),
        bx + 14,
        by + 66,
      );
      ctx.restore();
    }
  };

  const idxAt = (e) => {
    const x = e.clientX - chartCanvas.getBoundingClientRect().left;
    return Math.max(
      0,
      Math.min(
        N - 1,
        Math.round((x - pad.l) / ((w - pad.l - pad.r) / (N - 1))),
      ),
    );
  };
  chartCanvas.addEventListener("pointermove", (e) => {
    hover = idxAt(e);
  });
  chartCanvas.addEventListener("pointerdown", (e) => {
    hover = idxAt(e);
  });
  chartCanvas.addEventListener("pointerleave", () => {
    hover = -1;
  });
  chartCanvas.addEventListener("click", (e) => {
    const i = idxAt(e);
    pinned = pinned === i ? -1 : i;
  });
  chartCanvas.addEventListener("keydown", (e) => {
    const keys = {
      ArrowRight: () => Math.min(N - 1, pinned + 1),
      ArrowLeft: () => (pinned < 0 ? N - 1 : Math.max(0, pinned - 1)),
      Home: () => 0,
      End: () => N - 1,
      Escape: () => -1,
    };
    if (keys[e.key]) {
      e.preventDefault();
      pinned = keys[e.key]();
    }
  });
  new IntersectionObserver((es) => {
    visible = es[0].isIntersecting;
    if (visible) dirty = true;
  }).observe(chartCanvas);
  addEventListener("resize", resize);
  resize();
  requestAnimationFrame(frame);
}