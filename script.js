const carousel = document.querySelector("[data-carousel]");

const registration = document.querySelector("[data-registration]");
const registrationPlans = Object.freeze({
  "quiz-builder": { name: "Quiz Builder", price: 2500 },
  "rapid-revision": { name: "Science Subjects Rapid Revision Session", price: 3500 },
  "all-in-one": { name: "All-in-One Revision Package", price: 4000 },
});
const formatRegistrationPrice = (price) => `Rs ${price.toLocaleString("en-PK")}/-`;
let setRegistrationAccount = () => {};

if (registration) {
  const form = registration.querySelector("[data-registration-form]");
  const planName = registration.querySelector("[data-registration-plan-name]");
  const totals = registration.querySelectorAll("[data-registration-total], [data-registration-copy-total], [data-registration-payment-note-total]");
  const accountChoice = registration.querySelector("[data-registration-account-choice]");
  const accountOptions = registration.querySelector("[data-registration-account-options]");
  const newAccountFields = registration.querySelector("[data-registration-new-account-fields]");
  const emailInput = form.elements.email;
  const emailField = emailInput.closest("label");
  const passwordInput = form.elements.password;
  const emailNote = registration.querySelector("[data-registration-email-note]");
  const receiptInput = registration.querySelector("[data-registration-receipt]");
  const receiptName = registration.querySelector("[data-registration-receipt-name]");
  const receiptPreview = registration.querySelector("[data-registration-receipt-preview]");
  const bank = registration.querySelector("[data-registration-bank]");
  let accountEmail = "";
  let receiptPreviewUrl = "";
  const selectMenus = [...registration.querySelectorAll("[data-registration-select]")];

  const selectOption = (menu, option) => {
    const input = menu.querySelector("[data-registration-select-input]");
    menu.querySelector("[data-registration-select-label]").textContent = option.textContent;
    input.value = option.dataset.value;
    menu.open = false;
    delete menu.dataset.invalid;
    input.dispatchEvent(new Event("change"));
  };

  selectMenus.forEach((menu) => {
    menu.addEventListener("toggle", () => {
      if (menu.open) selectMenus.forEach((otherMenu) => { if (otherMenu !== menu) otherMenu.open = false; });
    });
    menu.addEventListener("click", (event) => {
      const option = event.target.closest("[data-registration-select-option]");
      if (option) selectOption(menu, option);
    });
  });

  const checkEmailConflict = () => {
    const knownEmails = [accountEmail, "hayan@mdcatemy.com"].filter(Boolean).map((email) => email.toLowerCase());
    const conflict = accountChoice.value === "fresh" && knownEmails.includes(emailInput.value.trim().toLowerCase());
    emailNote.hidden = !conflict;
    emailField.classList.toggle("has-error", conflict);
    emailInput.setCustomValidity(conflict ? "An account with this email address already exists." : "");
  };

  const updateAccountFields = () => {
    const isFreshAccount = accountChoice.value === "fresh";
    newAccountFields.hidden = !isFreshAccount;
    emailInput.required = isFreshAccount;
    passwordInput.required = isFreshAccount;
    if (!isFreshAccount) emailInput.value = "";
    passwordInput.value = "";
    checkEmailConflict();
  };

  updateAccountFields();

  const renderPlan = (key) => {
    const plan = registrationPlans[key];
    if (!plan) return;
    registration.dataset.selectedPlan = key;
    planName.textContent = plan.name;
    totals.forEach((total) => { total.textContent = formatRegistrationPrice(plan.price); });
  };

  setRegistrationAccount = (account) => {
    accountEmail = account?.email || "";
    if (!accountEmail) return;
    accountOptions.replaceChildren();
    [["existing", accountEmail], ["fresh", "Create a fresh account"]].forEach(([value, label]) => {
      const option = document.createElement("button");
      option.type = "button";
      option.dataset.registrationSelectOption = "";
      option.dataset.value = value;
      option.textContent = label;
      accountOptions.append(option);
    });
    updateAccountFields();
  };

  accountChoice.addEventListener("change", updateAccountFields);
  emailInput.addEventListener("input", checkEmailConflict);
  receiptInput.addEventListener("change", () => {
    const receipt = receiptInput.files[0];
    receiptName.textContent = receipt?.name || "PNG or JPG up to 10MB";
    if (receiptPreviewUrl) URL.revokeObjectURL(receiptPreviewUrl);
    if (!receipt) {
      receiptPreviewUrl = "";
      receiptPreview.hidden = true;
      receiptPreview.removeAttribute("src");
      return;
    }
    receiptPreviewUrl = URL.createObjectURL(receipt);
    receiptPreview.src = receiptPreviewUrl;
    receiptPreview.hidden = false;
  });
  registration.querySelectorAll("[data-copy-text]").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard?.writeText(button.dataset.copyText);
        button.title = "Copied";
        window.setTimeout(() => { button.title = button.getAttribute("aria-label"); }, 1400);
      } catch {}
    });
  });

  document.querySelectorAll("[data-register-plan]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      renderPlan(button.dataset.registerPlan);
      registration.hidden = false;
      bank.open = false;
      document.querySelectorAll("[data-register-plan]").forEach((item) => {
        item.setAttribute("aria-expanded", String(item === button));
      });
      window.requestAnimationFrame(() => registration.scrollIntoView({ behavior: "smooth", block: "start" }));
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const missingMenu = selectMenus.find((menu) => menu.hasAttribute("data-registration-required") && !menu.querySelector("[data-registration-select-input]").value);
    if (missingMenu) {
      missingMenu.dataset.invalid = "";
      missingMenu.querySelector("summary").focus();
      return;
    }
    if (!form.reportValidity()) return;
  });
}

const accountLink = document.querySelector("[data-account-link]");
const accountMenu = document.querySelector("[data-user-menu]");

if (accountLink) {
  const accountOrigin = "https://mdcatemy.com";
  const accountName = accountMenu?.querySelector("[data-account-name]");
  const dashboardLink = accountMenu?.querySelector("[data-dashboard-link]");
  const logoutButton = accountMenu?.querySelector("[data-logout-button]");
  let demoAccount = null;

  try {
    demoAccount = JSON.parse(sessionStorage.getItem("mdcatemy-demo-account"));
  } catch {}

  const showAccount = (accountDetails) => {
    const displayName = accountDetails.name
      || accountDetails.full_name
      || accountDetails.fullName
      || accountDetails.username
      || accountDetails.email?.split("@")[0]
      || "Student";

    accountLink.hidden = true;
    if (accountMenu) accountMenu.hidden = false;
    if (accountName) accountName.textContent = displayName;
    if (dashboardLink) dashboardLink.href = `${accountOrigin}/dashboard`;
    setRegistrationAccount(accountDetails);
  };

  if (demoAccount?.email === "hayan@mdcatemy.com") {
    showAccount(demoAccount);
  } else {
    fetch(`${accountOrigin}/api/v1/users/me`, { credentials: "include" })
      .then((response) => response.ok ? response.json() : null)
      .then((account) => {
        if (account?.status !== "success") return;
        showAccount(account.data?.user || account.data || account);
      })
      .catch(() => {});
  }

  logoutButton?.addEventListener("click", async () => {
    logoutButton.disabled = true;
    sessionStorage.removeItem("mdcatemy-demo-account");
    if (!demoAccount) {
      try {
        await fetch(`${accountOrigin}/api/v1/users/logout`, { method: "POST", credentials: "include" });
      } catch {
        // The session is owned by the main app; still return the student to the login page.
      }
    }
    window.location.assign("login.html");
  });
}

if (carousel) {
  const slides = [...carousel.querySelectorAll(".platform-slide")];
  const dots = [...carousel.querySelectorAll(".carousel-dot")];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let active = 0;
  let timer;
  let transitioning = false;

  const show = (index) => {
    const next = (index + slides.length) % slides.length;
    if (next === active || transitioning) return;

    const previous = active;
    transitioning = true;
    slides[next].classList.add("is-entering");
    dots.forEach((dot, dotIndex) => {
      const selected = dotIndex === next;
      dot.classList.toggle("is-active", selected);
      dot.setAttribute("aria-pressed", selected);
    });

    window.setTimeout(() => {
      slides[previous].classList.remove("is-active");
      slides[next].classList.add("is-active");
      slides[next].classList.remove("is-entering");
      active = next;
      transitioning = false;
    }, reducedMotion ? 0 : 800);
  };

  const stop = () => window.clearInterval(timer);
  const start = () => {
    stop();
    if (!reducedMotion) timer = window.setInterval(() => show(active + 1), 8000);
  };

  dots.forEach((dot, index) => dot.addEventListener("click", () => {
    show(index);
    start();
  }));

  carousel.addEventListener("mouseenter", stop);
  carousel.addEventListener("mouseleave", start);
  carousel.addEventListener("focusin", stop);
  carousel.addEventListener("focusout", start);
  Promise.all(slides.map((slide) => slide.decode ? slide.decode().catch(() => {}) : Promise.resolve())).then(start);
}

const collapseCopy = (copy) => {
  if (!copy) return;
  copy.classList.remove("is-expanded");
  const button = copy.querySelector(".read-more");
  button.setAttribute("aria-expanded", "false");
  button.textContent = "Read more";
};

document.querySelectorAll("[data-collapsible]").forEach((copy) => {
  const button = copy.querySelector(".read-more");
  button.addEventListener("click", () => {
    const expanded = copy.classList.toggle("is-expanded");
    button.setAttribute("aria-expanded", expanded);
    button.textContent = expanded ? "Read less" : "Read more";
  });
});

const testimonials = document.querySelector("[data-testimonials]");

if (testimonials) {
  const slides = [...testimonials.querySelectorAll(".testimonial-slide")];
  const dots = [...testimonials.querySelectorAll(".testimonial-dots button")];
  const count = testimonials.querySelector(".testimonial-count");
  let active = 0;

  const show = (index) => {
    slides.forEach((slide) => collapseCopy(slide.querySelector("[data-collapsible]")));
    active = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      const selected = slideIndex === active;
      slide.classList.toggle("is-active", selected);
      slide.setAttribute("aria-hidden", !selected);
    });
    dots.forEach((dot, dotIndex) => {
      const selected = dotIndex === active;
      dot.classList.toggle("is-active", selected);
      dot.setAttribute("aria-pressed", selected);
    });
    count.textContent = `${active + 1} / ${slides.length}`;
  };

  testimonials.querySelector(".testimonial-prev").addEventListener("click", () => show(active - 1));
  testimonials.querySelector(".testimonial-next").addEventListener("click", () => show(active + 1));
  dots.forEach((dot, index) => dot.addEventListener("click", () => show(index)));
  testimonials.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") show(active - 1);
    if (event.key === "ArrowRight") show(active + 1);
  });
}

const syllabusDialog = document.querySelector("[data-syllabus-dialog]");

if (syllabusDialog) {
  const image = syllabusDialog.querySelector("[data-syllabus-image]");
  const canvas = syllabusDialog.querySelector("[data-syllabus-canvas]");
  const label = syllabusDialog.querySelector("[data-zoom-label]");
  const closeButton = syllabusDialog.querySelector("[data-close-syllabus]");
  let zoom = 100;
  let closeTimer;
  let previousFocus;

  const setZoom = (next) => {
    zoom = Math.min(200, Math.max(50, next));
    const availableWidth = window.innerWidth - 32;
    const availableHeight = window.innerHeight - 32;
    const fittedWidth = Math.min(availableWidth, availableHeight * (1080 / 1350));
    image.style.width = `${fittedWidth * (zoom / 100)}px`;
    label.value = `${zoom}%`;
    label.textContent = `${zoom}%`;
  };

  const closeSyllabus = () => {
    if (syllabusDialog.hidden || syllabusDialog.classList.contains("is-closing")) return;
    syllabusDialog.classList.add("is-closing");
    syllabusDialog.classList.remove("is-open");
    closeTimer = window.setTimeout(() => {
      syllabusDialog.classList.remove("is-closing");
      syllabusDialog.hidden = true;
      document.body.classList.remove("modal-open");
      previousFocus?.focus();
    }, 200);
  };

  const openSyllabus = (event) => {
    window.clearTimeout(closeTimer);
    syllabusDialog.classList.remove("is-closing");
    previousFocus = event.currentTarget;
    setZoom(100);
    syllabusDialog.hidden = false;
    document.body.classList.add("modal-open");
    canvas.scrollTo(0, 0);
    window.requestAnimationFrame(() => {
      syllabusDialog.classList.add("is-open");
      closeButton.focus();
    });
  };

  document.querySelectorAll("[data-open-syllabus]").forEach((trigger) => {
    trigger.addEventListener("click", openSyllabus);
  });

  syllabusDialog.querySelector("[data-zoom-out]").addEventListener("click", () => setZoom(zoom - 25));
  syllabusDialog.querySelector("[data-zoom-in]").addEventListener("click", () => setZoom(zoom + 25));
  closeButton.addEventListener("click", closeSyllabus);
  canvas.addEventListener("click", (event) => {
    if (event.target === canvas) closeSyllabus();
  });
  window.addEventListener("resize", () => {
    if (!syllabusDialog.hidden) setZoom(zoom);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !syllabusDialog.hidden) closeSyllabus();
  });
}

const featureDialog = document.querySelector("[data-feature-dialog]");

if (featureDialog) {
  const panels = [...featureDialog.querySelectorAll("[data-feature-panel]")];
  const closeButton = featureDialog.querySelector("[data-close-feature]");
  let opener;
  let closeTimer;

  const closeFeature = () => {
    if (!featureDialog.open) return;
    featureDialog.classList.remove("is-open");
    closeTimer = window.setTimeout(() => featureDialog.close(), 180);
  };

  document.querySelectorAll("[data-open-feature]").forEach((button) => {
    button.addEventListener("click", () => {
      window.clearTimeout(closeTimer);
      opener = button;
      const panel = panels.find((item) => item.dataset.featurePanel === button.dataset.openFeature);
      panels.forEach((item) => { item.hidden = item !== panel; });
      featureDialog.setAttribute("aria-labelledby", panel.querySelector("h2").id);
      featureDialog.showModal();
      featureDialog.scrollTo(0, 0);
      document.body.classList.add("modal-open");
      window.requestAnimationFrame(() => {
        featureDialog.classList.add("is-open");
        closeButton.focus();
      });
    });
  });

  closeButton.addEventListener("click", closeFeature);
  featureDialog.addEventListener("click", (event) => {
    if (event.target === featureDialog) closeFeature();
  });
  featureDialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeFeature();
  });
  featureDialog.addEventListener("close", () => {
    document.body.classList.remove("modal-open");
    panels.forEach((panel) => { panel.hidden = true; });
    opener?.focus();
  });
}
