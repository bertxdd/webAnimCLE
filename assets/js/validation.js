const form = document.querySelector("[data-validated-form]");
if (form) {
  const password = form.querySelector("#password");
  const meter = form.querySelector(".password-meter span");
  const validate = (input) => {
    const message = input.closest(".form-group").querySelector(".form-error");
    const isValid = input.checkValidity();
    input.classList.toggle("valid", isValid);
    input.classList.toggle("invalid", !isValid && input.value.length > 0);
    message.textContent = isValid ? "Looks good" : input.validationMessage;
    message.style.color = isValid ? "#b6e36b" : "";
    message.classList.remove("ok");
    if (isValid) {
      void message.offsetWidth;
      message.classList.add("ok");
    }
    return isValid;
  };
  form
    .querySelectorAll("input")
    .forEach((input) => input.addEventListener("blur", () => validate(input)));
  password?.addEventListener("input", () => {
    const score = [
      password.value.length >= 8,
      /[A-Z]/.test(password.value),
      /[0-9]/.test(password.value),
      /[^A-Za-z0-9]/.test(password.value),
    ].filter(Boolean).length;
    meter.style.width = `${score * 25}%`;
    meter.style.background =
      score > 2 ? "#5eead4" : score > 1 ? "#facc15" : "#fb7185";
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const valid = [...form.querySelectorAll("input[required]")]
      .map(validate)
      .every(Boolean);
    if (valid)
      document.querySelector("#pledge-modal")?.classList.add("is-open");
  });
}
