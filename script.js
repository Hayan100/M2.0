const carousel = document.querySelector("[data-carousel]");

const accountLink = document.querySelector("[data-account-link]");

if (accountLink) {
  const accountOrigin = "https://mdcatemy.com";
  const accountLabel = accountLink.querySelector("[data-account-label]");
  const loginIcon = accountLink.querySelector('[data-account-icon="login"]');
  const dashboardIcon = accountLink.querySelector('[data-account-icon="dashboard"]');

  fetch(`${accountOrigin}/api/v1/users/me`, { credentials: "include" })
    .then((response) => response.ok ? response.json() : null)
    .then((account) => {
      if (account?.status !== "success") return;
      accountLink.href = `${accountOrigin}/dashboard`;
      accountLabel.textContent = "Dashboard";
      loginIcon.hidden = true;
      dashboardIcon.hidden = false;
    })
    .catch(() => {});
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
