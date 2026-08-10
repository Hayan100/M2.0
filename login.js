const loginForm = document.querySelector("[data-login-form]");

if (loginForm) {
  const password = loginForm.elements.password;
  const passwordToggle = loginForm.querySelector("[data-password-toggle]");
  const submit = loginForm.querySelector("[data-login-submit]");
  const status = loginForm.querySelector("[data-login-status]");
  const apiBase = "https://api.mdcatemy.com/api/v1";

  passwordToggle.addEventListener("click", () => {
    const showing = password.type === "text";
    password.type = showing ? "password" : "text";
    passwordToggle.setAttribute("aria-pressed", String(!showing));
    passwordToggle.setAttribute("aria-label", showing ? "Show password" : "Hide password");
  });

  const showStatus = (message) => {
    status.textContent = message;
    status.hidden = false;
  };

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!loginForm.reportValidity()) return;

    submit.disabled = true;
    showStatus("Signing you in to your camp…");

    try {
      const response = await fetch(`${apiBase}/users/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginForm.elements.email.value, password: password.value }),
      });
      const login = await response.json();
      if (login.status !== "success") throw new Error(login.message || "Unable to sign in. Please try again.");

      const accountResponse = await fetch(`${apiBase}/users/me`, { credentials: "include" });
      const account = await accountResponse.json();
      const user = account.data;
      const destination = user?.role === "ADMIN"
        ? "/admin"
        : user?.payment_status !== "VERIFIED" && user?.upgrade_status !== "VERIFIED"
          ? "/payment-status"
          : "/dashboard";
      window.location.assign(`https://www.mdcatemy.com${destination}`);
    } catch (error) {
      showStatus(error.message || "We could not sign you in right now. Please try again.");
      submit.disabled = false;
    }
  });
}
