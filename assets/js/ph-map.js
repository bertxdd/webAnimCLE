/* Sample data. Replace with real figures when you have them. */
const PH_SITES = [
  { n: 'Manila Bay', r: 'Metro Manila', g: 'Luzon', f: 'Plastic removal', la: 14.55, lo: 120.95, t: 612, c: 18, s: 9, st: 'Active' },
  { n: 'Verde Island Passage', r: 'Batangas', g: 'Luzon', f: 'Reef restoration', la: 13.7, lo: 121.0, t: 248, c: 6, s: 14, st: 'Active' },
  { n: 'Albay Gulf', r: 'Bicol', g: 'Luzon', f: 'Wildlife rescue', la: 13.1, lo: 123.7, t: 121, c: 4, s: 10, st: 'Monitoring' },
  { n: 'Puerto Princesa', r: 'Palawan', g: 'Palawan', f: 'Wildlife rescue', la: 9.75, lo: 118.75, t: 164, c: 5, s: 12, st: 'Active' },
  { n: 'Iloilo Strait', r: 'Panay', g: 'Visayas', f: 'Plastic removal', la: 10.7, lo: 122.55, t: 143, c: 5, s: 8, st: 'Active' },
  { n: 'Mactan Channel', r: 'Cebu', g: 'Visayas', f: 'Plastic removal', la: 10.3, lo: 123.95, t: 231, c: 9, s: 11, st: 'Active' },
  { n: 'Leyte Gulf', r: 'Eastern Visayas', g: 'Visayas', f: 'Reef restoration', la: 11.25, lo: 125.0, t: 118, c: 4, s: 7, st: 'Monitoring' },
  { n: 'Davao Gulf', r: 'Davao Region', g: 'Mindanao', f: 'Plastic removal', la: 7.0, lo: 125.65, t: 196, c: 7, s: 10, st: 'Active' },
  { n: 'Zamboanga Coast', r: 'Zamboanga Peninsula', g: 'Mindanao', f: 'Wildlife rescue', la: 6.9, lo: 122.05, t: 109, c: 4, s: 6, st: 'Monitoring' }
];
const PH_CITIES = [['Baguio', 16.4, 120.6], ['Laoag', 18.2, 120.6], ['Tuguegarao', 17.6, 121.7], ['Naga', 13.62, 123.18], ['Kalibo', 11.7, 122.37], ['Dumaguete', 9.31, 123.3], ['Cagayan de Oro', 8.48, 124.65], ['Butuan', 8.95, 125.54], ['Cotabato', 7.2, 124.25], ['General Santos', 6.11, 125.17]];

document.querySelectorAll('[data-ph-map]').forEach((box) => {
  const panel = box.parentElement.querySelector('[data-ph-panel]');
  const st = { year: '2026', focus: 'All', status: 'All', mode: 'sites' };
  const FACTOR = { 2024: .64, 2025: .82, 2026: 1 };
  const X = (lo) => (lo - 116.5) * Math.cos(12.5 * Math.PI / 180) * 40, Y = (la) => (21.5 - la) * 40;
  const T = (s) => Math.round(s.t * FACTOR[st.year]);
  const sum = (a, k) => a.reduce((n, s) => n + (k === 't' ? T(s) : s[k]), 0);
  const vis = () => PH_SITES.filter((s) => (st.focus === 'All' || s.f === st.focus) && (st.status === 'All' || s.st === st.status));
  const H = (w) => w * 680 / 410;
  const vb = { x: 0, y: 0, w: 410 }, tg = { x: 0, y: 0, w: 410 };
  let raf;

  const cities = PH_CITIES.map(([n, la, lo]) => `<g class="ph-city" data-p="${X(lo).toFixed(1)},${Y(la).toFixed(1)}"><circle r="2"/><text x="6" y="3">${n}</text></g>`).join('');
  box.innerHTML = `<svg viewBox="0 0 410 680" role="img" aria-label="Map of the Philippines with cleanup sites"><path class="ph-land" d="${PH_PATH}"/>${cities}<g class="ph-marks"></g></svg>
    <div class="ph-ctrl"><button data-z="in" aria-label="Zoom in">+</button><button data-z="out" aria-label="Zoom out">−</button><button data-z="reset" aria-label="Reset view">⟲</button><button data-m="clusters" aria-label="Group sites into clusters">Clusters</button><button data-m="sites" aria-label="Show individual sites">Sites</button></div><div class="ph-tip" role="status"></div>`;
  const svg = box.querySelector('svg'), marks = box.querySelector('.ph-marks'), tip = box.querySelector('.ph-tip');

  const apply = () => {
    svg.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.w} ${H(vb.w)}`);
    const k = vb.w / 410;
    box.querySelectorAll('[data-p]').forEach((g) => g.setAttribute('transform', `translate(${g.dataset.p}) scale(${k})`));
  };
  const tick = () => {
    for (const a of ['x', 'y', 'w']) vb[a] += (tg[a] - vb[a]) * .2;
    apply();
    if (Math.abs(tg.w - vb.w) + Math.abs(tg.x - vb.x) + Math.abs(tg.y - vb.y) > .3) raf = requestAnimationFrame(tick);
  };
  const go = (cx, cy, w) => {
    w = Math.max(100, Math.min(410, w)); tg.w = w;
    tg.x = Math.max(0, Math.min(410 - w, cx - w / 2)); tg.y = Math.max(0, Math.min(680 - H(w), cy - H(w) / 2));
    cancelAnimationFrame(raf); raf = requestAnimationFrame(tick);
  };
  const centre = () => [tg.x + tg.w / 2, tg.y + H(tg.w) / 2];

  const tipAt = (g, html) => {
    tip.innerHTML = html;
    const b = box.getBoundingClientRect(), d = g.getBoundingClientRect();
    const x = d.left - b.left + d.width / 2, y = d.top - b.top + d.height / 2;
    tip.style.left = Math.max(0, Math.min(x > b.width * .5 ? x - 246 : x + d.width / 2 + 12, b.width - 230)) + 'px';
    tip.style.top = Math.max(0, Math.min(y - 60, b.height - 200)) + 'px';
    tip.classList.add('show');
    marks.querySelectorAll('.ph-dot').forEach((o) => o.classList.toggle('is-on', o === g));
  };
  const hide = () => { tip.classList.remove('show'); marks.querySelectorAll('.is-on').forEach((o) => o.classList.remove('is-on')); };
  const showSite = (g) => {
    const s = PH_SITES[g.dataset.i], max = Math.max(...PH_SITES.map(T));
    tipAt(g, `<h4>${s.n}</h4><small>${s.r}, ${s.g}</small><dl><dt>Focus</dt><dd>${s.f}</dd><dt>Plastic removed</dt><dd>${T(s)} t</dd><dt>Active crews</dt><dd>${s.c}</dd><dt>Species rescued</dt><dd>${s.s}</dd><dt>Status</dt><dd>${s.st}</dd></dl><div class="ph-bar"><i style="width:${T(s) / max * 100}%"></i></div>`);
  };
  const showCluster = (g) => {
    const a = vis().filter((s) => s.g === g.dataset.g);
    tipAt(g, `<h4>${g.dataset.g}</h4><small>Click to zoom in</small><dl><dt>Sites</dt><dd>${a.length}</dd><dt>Plastic removed</dt><dd>${sum(a, 't')} t</dd><dt>Active crews</dt><dd>${sum(a, 'c')}</dd><dt>Species rescued</dt><dd>${sum(a, 's')}</dd></dl>`);
  };

  const draw = () => {
    const v = vis(); let h = '';
    if (st.mode === 'clusters') {
      const gr = {}; v.forEach((s) => (gr[s.g] = gr[s.g] || []).push(s));
      Object.entries(gr).forEach(([g, a], i) => {
        const x = a.reduce((n, s) => n + X(s.lo), 0) / a.length, y = a.reduce((n, s) => n + Y(s.la), 0) / a.length, r = 12 + a.length * 3;
        h += `<g class="ph-dot ph-cl" tabindex="0" role="button" aria-label="${g}, ${a.length} sites" data-g="${g}" data-p="${x.toFixed(1)},${y.toFixed(1)}"><circle class="ph-pulse" r="${r}" style="animation-delay:${i * .3}s"/><circle class="ph-core ${a.length > 2 ? 'big' : ''}" r="${r}"/><text class="ph-n" text-anchor="middle" dy=".35em">${a.length}</text></g>`;
      });
    } else {
      v.forEach((s, i) => {
        const r = 4 + Math.sqrt(T(s)) / 5;
        h += `<g class="ph-dot" tabindex="0" role="button" aria-label="${s.n}, ${T(s)} tons removed" data-i="${PH_SITES.indexOf(s)}" data-p="${X(s.lo).toFixed(1)},${Y(s.la).toFixed(1)}"><circle class="ph-pulse" r="${r}" style="animation-delay:${i * .3}s"/><circle class="ph-core" r="${r}" style="animation-delay:${.3 + i * .1}s"/></g>`;
      });
    }
    marks.innerHTML = h; hide(); apply();
    box.querySelectorAll('[data-m]').forEach((b) => b.classList.toggle('on', b.dataset.m === st.mode));
    marks.querySelectorAll('.ph-dot').forEach((g) => {
      const show = () => (g.dataset.g ? showCluster(g) : showSite(g));
      g.addEventListener('pointerenter', show); g.addEventListener('pointerleave', hide);
      g.addEventListener('focus', show); g.addEventListener('blur', hide);
      g.addEventListener('click', () => {
        if (!g.dataset.g) return show();
        const [cx, cy] = g.dataset.p.split(',').map(Number);
        st.mode = 'sites'; draw(); go(cx, cy, 150);
      });
    });
    if (panel) {
      panel.querySelector('.ph-sum').textContent = `${v.length} of ${PH_SITES.length} sites, ${sum(v, 't').toLocaleString()} t removed in ${st.year}, ${sum(v, 'c')} crews`;
      panel.querySelector('tbody').innerHTML = v.map((s) => `<tr><td>${s.n}</td><td>${s.g}</td><td>${s.f}</td><td>${T(s)} t</td><td><span class="tag">${s.st}</span></td></tr>`).join('') || '<tr><td colspan="5">No sites match these filters. Reset one filter to see sites again.</td></tr>';
    }
  };

  box.querySelector('.ph-ctrl').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    const [cx, cy] = centre();
    if (b.dataset.z === 'in') go(cx, cy, tg.w * .6);
    if (b.dataset.z === 'out') go(cx, cy, tg.w / .6);
    if (b.dataset.z === 'reset') go(205, 340, 410);
    if (b.dataset.m) { st.mode = b.dataset.m; draw(); }
  });
  if (panel) {
    panel.innerHTML = `<div class="ph-filters"><label>Year<select data-f="year"><option>2026</option><option>2025</option><option>2024</option></select></label><label>Focus area<select data-f="focus"><option>All</option><option>Plastic removal</option><option>Reef restoration</option><option>Wildlife rescue</option></select></label><label>Status<select data-f="status"><option>All</option><option>Active</option><option>Monitoring</option></select></label></div><p class="ph-sum" aria-live="polite"></p><button class="btn btn-ghost btn-small ph-toggle" aria-expanded="false">Show location details</button><div class="table-wrap ph-table" hidden><table><thead><tr><th>Site</th><th>Island group</th><th>Focus</th><th>Removed</th><th>Status</th></tr></thead><tbody></tbody></table></div>`;
    panel.querySelectorAll('select').forEach((s) => s.addEventListener('change', () => { st[s.dataset.f] = s.value; draw(); }));
    const tb = panel.querySelector('.ph-toggle'), tbl = panel.querySelector('.ph-table');
    tb.addEventListener('click', () => { tbl.hidden = !tbl.hidden; tb.textContent = tbl.hidden ? 'Show location details' : 'Hide location details'; tb.setAttribute('aria-expanded', String(!tbl.hidden)); });
  }
  draw();
});

const feed = document.querySelector('[data-feed]');
if (feed) {
  const acts = () => [`Crew logged ${2 + Math.floor(Math.random() * 7)} t of plastic`, 'Reef survey completed', 'Net removed from reef edge', `${1 + Math.floor(Math.random() * 3)} volunteers checked in`];
  const add = () => {
    const s = PH_SITES[Math.floor(Math.random() * PH_SITES.length)], a = acts();
    const li = document.createElement('li');
    li.innerHTML = `<span class="status"></span><div><strong>${s.n}</strong><br><span class="muted">${a[Math.floor(Math.random() * a.length)]}</span></div><small class="muted">just now</small>`;
    feed.prepend(li); while (feed.children.length > 5) feed.lastChild.remove();
  };
  for (let i = 0; i < 4; i++) add();
  setInterval(add, 3200);
}
const loading = document.querySelector('.is-loading');
if (loading) setTimeout(() => loading.classList.remove('is-loading'), 800);
