document.addEventListener('DOMContentLoaded', () => {
  const io = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle('is-offscreen', !e.isIntersecting)));
  ['.sea-footer', '.animal-grid', '.ph-map'].forEach((s) => document.querySelectorAll(s).forEach((el) => io.observe(el)));
});