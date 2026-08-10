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

const checkout = document.querySelector("[data-checkout]");

if (checkout) {
  const totals = [...checkout.querySelectorAll("[data-plan-total]")];
  const selectedName = checkout.querySelector("[data-plan-name]");
  const selectedDescription = checkout.querySelector("[data-plan-description]");
  const receiptInput = checkout.querySelector("[data-receipt-input]");
  const receiptName = checkout.querySelector("[data-receipt-name]");
  const paymentForm = checkout.querySelector("[data-payment-form]");
  const paymentStatus = checkout.querySelector("[data-payment-status]");
  const passwordInput = checkout.querySelector("[data-password-input]");
  const confirmPasswordInput = paymentForm.elements.confirm_password;
  const passwordToggle = checkout.querySelector("[data-password-toggle]");

  const renderPlan = (planKey) => {
    savePlan(planKey);
    const plan = PURCHASE_PLANS[planKey];
    totals.forEach((total) => { total.textContent = formatPrice(plan.price); });
    selectedName.textContent = plan.name;
    selectedDescription.textContent = plan.shortName;
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set("plan", planKey);
    window.history.replaceState({}, "", nextUrl);
  };

  renderPlan(selectedPlanKey);

  passwordToggle.addEventListener("click", () => {
    const showing = passwordInput.type === "text";
    passwordInput.type = showing ? "password" : "text";
    passwordToggle.setAttribute("aria-pressed", String(!showing));
    passwordToggle.setAttribute("aria-label", showing ? "Show password" : "Hide password");
  });

  const validatePasswords = () => {
    confirmPasswordInput.setCustomValidity(passwordInput.value === confirmPasswordInput.value ? "" : "Passwords do not match.");
  };

  passwordInput.addEventListener("input", validatePasswords);
  confirmPasswordInput.addEventListener("input", validatePasswords);

  receiptInput.addEventListener("change", () => {
    receiptName.textContent = receiptInput.files[0]?.name || "PNG or JPG up to 10MB";
  });

  checkout.querySelectorAll("[data-copy-value]").forEach((button) => {
    button.addEventListener("click", async () => {
      const label = button.querySelector("[data-copy-label]");
      try {
        await navigator.clipboard.writeText(button.dataset.copyValue);
        label.textContent = "Copied";
        window.setTimeout(() => { label.textContent = "Copy"; }, 1400);
      } catch {
        label.textContent = "Copy manually";
      }
    });
  });

  paymentForm.addEventListener("submit", (event) => {
    event.preventDefault();
    validatePasswords();
    if (!paymentForm.reportValidity()) return;
    paymentStatus.hidden = false;
    paymentStatus.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
}
