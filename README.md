# SeaGuard Ops

Frontend-only operations analytics platform (SaaS-style) for coastal cleanup crews, local governments and partner businesses in the Philippines. Built for the ITL303 Endterm CLE, aligned with SDG 14 (Life Below Water). All figures are sample data.

## Pages
- `index.html`: animated landing page, counters, Philippine site map, marine life cards with video modal.
- `register.html`: validated form, animated checkmarks, password strength meter, pledge modal.
- `login.html`: login with an animated shield emblem.
- `dashboard.html`: skeleton loading, animated counters, interactive canvas chart, site map (2021 to 2026), live activity feed.
- Every page ends with the animated sea footer.

## Performance
Off-screen animations are paused (`assets/js/perf.js`), the hero canvas stops when scrolled away, canvas resolution is capped at 2x, and the dashboard chart only redraws while something is moving.

## Technology
HTML5, CSS3 (keyframes, 2D/3D transforms), vanilla JavaScript, inline SVG, and HTML Canvas. No build step. Open `index.html` to run.