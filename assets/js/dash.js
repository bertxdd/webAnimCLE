(function () {
  var BASE_SPECIES = 87, ZONES = 14, YEARS = [2021, 2022, 2023, 2024, 2025, 2026];
  var DEFAULT_LOGS = [
    { id: 'LOG-101', date: '2026-11-12', site: 'Cebu Strait', type: 'Plastic removal', tons: 2.1, species: 1, crew: 'Mactan Channel Crew', author: 'Field Team', notes: 'Mangrove-edge sweep completed.' },
    { id: 'LOG-102', date: '2026-11-10', site: 'Manila Bay', type: 'Plastic removal', tons: 4.8, species: 0, crew: 'Baywatch North', author: 'Field Team', notes: 'Breakwater debris collection.' },
    { id: 'LOG-103', date: '2026-11-08', site: 'Verde Island Passage', type: 'Reef restoration', tons: 0.6, species: 2, crew: 'Batangas Reef Divers', author: 'Field Team', notes: 'Coral nursery maintenance and cleanup.' },
    { id: 'LOG-104', date: '2026-11-05', site: 'Puerto Princesa', type: 'Wildlife rescue', tons: 0.4, species: 3, crew: 'Honda Bay Responders', author: 'Field Team', notes: 'Assisted turtles near nesting cove.' }
  ];
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  function load(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function getLogs() { var v = load('aquasave_logs', null); if (!v) { localStorage.setItem('aquasave_logs', JSON.stringify(DEFAULT_LOGS)); return DEFAULT_LOGS.slice(); } return v; }
  function setLogs(l) { localStorage.setItem('aquasave_logs', JSON.stringify(l)); }
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches, ready = false, shown = { t: 0, s: 0, z: 0 };

  var prof = load('aquasave_profile', {}), name = (prof.name || '').trim();
  $('userAvatar').textContent = name ? name.charAt(0).toUpperCase() : '?';
  $('userNameNav').textContent = name || 'Responder';
  if (name) $('welcomeHeading').textContent = 'Good morning, ' + name.split(' ')[0] + '!';

  $('logSite').innerHTML = PH_SITES.map(function (s) { return '<option>' + s.n + '</option>'; }).join('');

  function count(el, from, to, dec, suf) {
    var o = { v: from };
    gsap.to(o, { v: to, duration: reduce ? 0 : 1.6, ease: 'power2.out', onUpdate: function () { el.innerHTML = o.v.toLocaleString(undefined, { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suf; } });
  }
  function render() {
    var logs = getLogs(), extra = {}, xs = 0;
    logs.forEach(function (l) { extra[l.site] = (extra[l.site] || 0) + (+l.tons || 0); xs += +l.species || 0; });
    var rows = PH_SITES.map(function (s) { return { n: s.n, g: s.g, st: s.st, v: s.t[5] + (extra[s.n] || 0) }; }).sort(function (a, b) { return b.v - a.v; });
    var total = rows.reduce(function (n, r) { return n + r.v; }, 0), sp = BASE_SPECIES + xs;
    if (ready) {
      count($('kTons'), shown.t, total, 1, '<small> t</small>'); count($('kSp'), shown.s, sp, 0, ''); count($('kZones'), shown.z, ZONES, 0, '');
      shown = { t: total, s: sp, z: ZONES };
    }
    var max = rows[0].v;
    $('siteBars').innerHTML = rows.map(function (r) {
      return '<div><div class="brow-top"><span>' + esc(r.n) + ' <small style="color:var(--mist);font-weight:600">(' + esc(r.g) + ')</small></span><small>' + r.v.toFixed(1) + ' t</small></div><div class="btrack"><div class="bfill' + (r.st !== 'Active' ? ' ember' : '') + '" data-w="' + Math.round(r.v / max * 100) + '"></div></div></div>';
    }).join('');
    // bars grow in from the left, matching the line chart's reveal
    var fills = document.querySelectorAll('#siteBars .bfill');
    if (ready) gsap.fromTo(fills, { scaleX: 0 }, { scaleX: function (i, el) { return el.dataset.w / 100; }, duration: reduce ? 0 : 1.2, stagger: reduce ? 0 : 0.07, ease: 'power3.out' });
    var yrs = YEARS.map(function (y, i) { var t = PH_SITES.reduce(function (n, s) { return n + s.t[i]; }, 0); return [y, i === 5 ? t + logs.reduce(function (n, l) { return n + (+l.tons || 0); }, 0) : t]; });
    yrs.forEach(function (d) { d[1] = Math.round(d[1] * 10) / 10; });
    window.AQUA_YEARS = yrs;
    if (window.AquaChart) AquaChart.set(yrs);
    $('logsBody').innerHTML = logs.map(function (l) {
      return '<tr><td><strong>' + esc(l.id) + '</strong></td><td>' + esc(l.date) + '</td><td>' + esc(l.site) + '</td><td>' + esc(l.type) + '</td><td><strong>' + (+l.tons).toFixed(1) + ' t</strong></td><td>' + (parseInt(l.species, 10) || 0) + '</td><td>' + esc(l.crew) + ' <small style="color:var(--mist)">(' + esc(l.author || '') + ')</small></td><td>' + esc(l.notes) + '</td><td><button type="button" class="tbtn" data-del="' + esc(l.id) + '">Delete</button></td></tr>';
    }).join('') || '<tr><td colspan="9" style="color:var(--mist)">No logs yet.</td></tr>';
  }
  $('logsBody').addEventListener('click', function (e) {
    var b = e.target.closest('[data-del]'); if (!b) return;
    setLogs(getLogs().filter(function (l) { return l.id !== b.dataset.del; })); render();
  });
  $('clearLogs').addEventListener('click', function () { if (confirm('Clear all field logs?')) { setLogs([]); render(); } });

  var modal = $('modal');
  function open() { modal.classList.add('open'); $('logTons').focus(); }
  function close() { modal.classList.remove('open'); }
  ['openLog', 'addLog2'].forEach(function (id) { $(id).addEventListener('click', open); });
  $('closeLog').addEventListener('click', close);
  modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  $('logForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var entry = { id: 'LOG-' + Date.now().toString().slice(-6), date: new Date().toISOString().slice(0, 10), site: $('logSite').value, type: $('logType').value,
      tons: parseFloat($('logTons').value) || 0, species: parseInt($('logSpecies').value, 10) || 0, crew: $('logCrew').value.trim() || 'Coastal Volunteers', author: name || 'Responder', notes: $('logNotes').value.trim() };
    var l = getLogs(); l.unshift(entry); setLogs(l); close(); $('logForm').reset(); render();
    var li = document.createElement('li');
    li.innerHTML = '<span class="dotl"></span><div><strong>' + esc(entry.site) + '</strong><br><span style="color:var(--mist)">Crew logged ' + entry.tons.toFixed(1) + ' t of plastic</span></div><small>just now</small>';
    var feed = document.querySelector('[data-feed]'); if (feed) feed.prepend(li);
  });

  render();
  // wait for the skeleton state (ph-map.js clears it after 800 ms), then play the intro
  setTimeout(function () {
    ready = true; render();
    document.getElementById('dash').classList.remove('is-loading');
  }, 700);
})();
