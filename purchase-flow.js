const PURCHASE_PLANS = Object.freeze({
  "quiz-builder": {
    name: "Quiz Builder",
    shortName: "Quiz Builder access",
    price: 2500,
  },
  "rapid-revision": {
    name: "Science Subjects Rapid Revision Session",
    shortName: "Rapid Revision Session",
    price: 3500,
  },
  "all-in-one": {
    name: "All-in-One Revision Package",
    shortName: "Quiz Builder + Rapid Revision Session",
    price: 4000,
  },
});

const PLAN_STORAGE_KEY = "mdcatemy-selected-plan";
const formatPrice = (amount) => `PKR ${amount.toLocaleString("en-PK")}`;
const getPlanKey = () => {
  const requested = new URLSearchParams(window.location.search).get("plan");
  if (PURCHASE_PLANS[requested]) return requested;
  const saved = sessionStorage.getItem(PLAN_STORAGE_KEY);
  return PURCHASE_PLANS[saved] ? saved : "all-in-one";
};

let selectedPlanKey = getPlanKey();

const savePlan = (planKey) => {
  if (!PURCHASE_PLANS[planKey]) return;
  selectedPlanKey = planKey;
  sessionStorage.setItem(PLAN_STORAGE_KEY, planKey);
};

const checkoutUrl = () => `checkout.html?plan=${encodeURIComponent(selectedPlanKey)}`;

const authDialog = document.querySelector("[data-auth-dialog]");

if (authDialog) {
  const panels = [...authDialog.querySelectorAll("[data-auth-panel]")];
  const closeButton = authDialog.querySelector("[data-close-auth]");
  const loginForm = authDialog.querySelector("[data-login-form]");
  const signupForm = authDialog.querySelector("[data-signup-form]");
  let opener;

  const showPanel = (panelName) => {
    panels.forEach((panel) => { panel.hidden = panel.dataset.authPanel !== panelName; });
    authDialog.scrollTo(0, 0);
    const firstField = authDialog.querySelector(`[data-auth-panel="${panelName}"] input`);
    window.setTimeout(() => firstField?.focus(), 0);
  };

  const openAuth = (trigger, planKey) => {
    opener = trigger;
    savePlan(planKey);
    showPanel("login");
    authDialog.showModal();
    document.body.classList.add("modal-open");
  };

  document.querySelectorAll("[data-purchase-plan]").forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      openAuth(trigger, trigger.dataset.purchasePlan);
    });
  });

  authDialog.querySelector("[data-show-signup]").addEventListener("click", () => showPanel("signup"));
  authDialog.querySelector("[data-show-login]").addEventListener("click", () => showPanel("login"));
  closeButton.addEventListener("click", () => authDialog.close());
  authDialog.addEventListener("click", (event) => {
    if (event.target === authDialog) authDialog.close();
  });
  authDialog.addEventListener("close", () => {
    document.body.classList.remove("modal-open");
    opener?.focus();
  });

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (loginForm.reportValidity()) window.location.href = checkoutUrl();
  });

  const password = signupForm.elements.password;
  const confirmPassword = signupForm.elements.confirm_password;
  const validatePasswords = () => {
    confirmPassword.setCustomValidity(password.value === confirmPassword.value ? "" : "Passwords do not match.");
  };

  password.addEventListener("input", validatePasswords);
  confirmPassword.addEventListener("input", validatePasswords);
  signupForm.addEventListener("submit", (event) => {
    event.preventDefault();
    validatePasswords();
    if (signupForm.reportValidity()) window.location.href = checkoutUrl();
  });
}

const checkout = document.querySelector("[data-checkout]");

if (checkout) {
  const planInputs = [...checkout.querySelectorAll("[data-checkout-plan]")];
  const total = checkout.querySelector("[data-plan-total]");
  const selectedName = checkout.querySelector("[data-plan-name]");
  const selectedDescription = checkout.querySelector("[data-plan-description]");
  const receiptInput = checkout.querySelector("[data-receipt-input]");
  const receiptName = checkout.querySelector("[data-receipt-name]");
  const paymentForm = checkout.querySelector("[data-payment-form]");
  const paymentStatus = checkout.querySelector("[data-payment-status]");

  const renderPlan = (planKey) => {
    savePlan(planKey);
    const plan = PURCHASE_PLANS[planKey];
    planInputs.forEach((input) => {
      const selected = input.value === planKey;
      input.checked = selected;
      input.closest(".checkout-plan-card").classList.toggle("is-selected", selected);
    });
    total.textContent = formatPrice(plan.price);
    selectedName.textContent = plan.name;
    selectedDescription.textContent = plan.shortName;
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set("plan", planKey);
    window.history.replaceState({}, "", nextUrl);
  };

  planInputs.forEach((input) => input.addEventListener("change", () => renderPlan(input.value)));
  renderPlan(selectedPlanKey);

  receiptInput.addEventListener("change", () => {
    receiptName.textContent = receiptInput.files[0]?.name || "PNG or JPG up to 10MB";
  });

  checkout.querySelectorAll("[data-copy-value]").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(button.dataset.copyValue);
        const original = button.textContent;
        button.textContent = "Copied";
        window.setTimeout(() => { button.textContent = original; }, 1400);
      } catch {
        button.textContent = "Select and copy the number above";
      }
    });
  });

  paymentForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!paymentForm.reportValidity()) return;
    paymentStatus.hidden = false;
    paymentStatus.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
}
