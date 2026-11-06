document.querySelectorAll('[data-modal-open]').forEach((button) => {
  button.addEventListener('click', () => document.querySelector(`#${button.dataset.modalOpen}`)?.classList.add('is-open'));
});
document.querySelectorAll('[data-modal-close]').forEach((button) => {
  button.addEventListener('click', () => {
    button.closest('.modal-backdrop')?.classList.remove('is-open');
    if (button.dataset.redirect) window.location.href = button.dataset.redirect;
  });
});
document.querySelectorAll('.modal-backdrop').forEach((modal) => {
  modal.addEventListener('click', (event) => {
    if (event.target === modal) modal.classList.remove('is-open');
  });
});
document.querySelectorAll('[data-demo-submit]').forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const button = form.querySelector('button[type="submit"]');
    button.textContent = 'Access granted ✓';
    button.classList.add('btn-ghost');
    setTimeout(() => { button.textContent = 'Continue to dashboard'; window.location.href = 'dashboard.html'; }, 700);
  });
});
