/**
 * ================================================================
 * NOVA LANDING PAGE — script.js
 * Vanilla ES6+ | No external libraries
 * ================================================================
 *
 * Sections:
 *  1.  DOM Element References
 *  2.  Sticky Header (scroll shadow)
 *  3.  Hamburger / Mobile Menu Toggle
 *  4.  Close Mobile Menu on Outside Click / Escape Key
 *  5.  Active Nav Link on Scroll (Intersection Observer)
 *  6.  Smooth Scroll for all anchor links (fallback for older browsers)
 *  7.  Contact Form Validation & Submission
 *  8.  Scroll-to-Top Button
 *  9.  Footer — Dynamic Year
 *  10. Hero Bar Chart Animation (Intersection Observer)
 *  11. Reveal-on-Scroll Animations (Intersection Observer)
 *  12. Init
 * ================================================================
 */

'use strict';

/* ----------------------------------------------------------------
   1. DOM ELEMENT REFERENCES
   ---------------------------------------------------------------- */
const header         = document.getElementById('header');
const hamburger      = document.getElementById('hamburger');
const mobileMenu     = document.getElementById('mobile-menu');
const mobileLinks    = document.querySelectorAll('.mobile-menu__link, .mobile-menu__cta');
const navLinks       = document.querySelectorAll('.nav__link');
const sections       = document.querySelectorAll('section[id]');
const contactForm    = document.getElementById('contact-form');
const formSuccess    = document.getElementById('form-success');
const submitBtn      = document.getElementById('submit-btn');
const btnText        = document.getElementById('btn-text');
const currentYearEl  = document.getElementById('current-year');
const heroBars       = document.querySelectorAll('.hero__bar');

/* ----------------------------------------------------------------
   2. STICKY HEADER — adds .scrolled class on scroll
   ---------------------------------------------------------------- */
/**
 * Observes the body scroll position and toggles the 'scrolled'
 * class on the header to trigger shadow / background changes.
 */
function initStickyHeader() {
  const THRESHOLD = 20; // px before adding class

  const handleScroll = () => {
    const isScrolled = window.scrollY > THRESHOLD;
    header.classList.toggle('scrolled', isScrolled);
  };

  // Passive listener for performance
  window.addEventListener('scroll', handleScroll, { passive: true });

  // Run once on load in case user reloads mid-page
  handleScroll();
}

/* ----------------------------------------------------------------
   3. HAMBURGER / MOBILE MENU TOGGLE
   ---------------------------------------------------------------- */
/**
 * Toggles the mobile menu open/closed and updates
 * aria-expanded on the hamburger button.
 */
function initMobileMenu() {
  hamburger.addEventListener('click', toggleMobileMenu);

  // Close menu when any mobile nav link is clicked
  mobileLinks.forEach((link) => {
    link.addEventListener('click', closeMobileMenu);
  });
}

function toggleMobileMenu() {
  const isOpen = mobileMenu.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', String(isOpen));
  hamburger.setAttribute('aria-label', isOpen ? 'მენიუს დახურვა' : 'მენიუს გახსნა');

  // Prevent body scroll when menu is open
  document.body.style.overflow = isOpen ? 'hidden' : '';
}

function closeMobileMenu() {
  mobileMenu.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.setAttribute('aria-label', 'მენიუს გახსნა');
  document.body.style.overflow = '';
}

/* ----------------------------------------------------------------
   4. CLOSE MOBILE MENU — outside click & Escape key
   ---------------------------------------------------------------- */
function initMenuCloseHandlers() {
  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
      closeMobileMenu();
      hamburger.focus(); // return focus to trigger element
    }
  });

  // Close when clicking outside the menu and hamburger
  document.addEventListener('click', (e) => {
    const isMenuOpen    = mobileMenu.classList.contains('open');
    const clickedInMenu = mobileMenu.contains(e.target);
    const clickedHamburger = hamburger.contains(e.target);

    if (isMenuOpen && !clickedInMenu && !clickedHamburger) {
      closeMobileMenu();
    }
  });
}

/* ----------------------------------------------------------------
   5. ACTIVE NAV LINK — Intersection Observer
   ---------------------------------------------------------------- */
/**
 * Highlights the corresponding desktop nav link when its
 * section enters the viewport.
 */
function initActiveNavLink() {
  const observerOptions = {
    root: null,
    rootMargin: '-50% 0px -50% 0px', // trigger at section midpoint
    threshold: 0,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Remove active from all links
        navLinks.forEach((link) => link.classList.remove('active'));

        // Find and mark the matching link active
        const activeLink = document.querySelector(
          `.nav__link[href="#${entry.target.id}"]`
        );
        if (activeLink) {
          activeLink.classList.add('active');
        }
      }
    });
  }, observerOptions);

  sections.forEach((section) => observer.observe(section));
}

/* ----------------------------------------------------------------
   6. SMOOTH SCROLL — fallback polyfill
   ---------------------------------------------------------------- */
/**
 * For browsers that don't support CSS scroll-behavior: smooth,
 * this provides a JavaScript-based smooth scroll on anchor clicks.
 */
function initSmoothScroll() {
  // Only polyfill if CSS scroll-behavior isn't supported
  if ('scrollBehavior' in document.documentElement.style) return;

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);

      if (target) {
        e.preventDefault();
        const headerHeight = header.offsetHeight;
        const targetTop = target.getBoundingClientRect().top + window.scrollY - headerHeight;

        window.scrollTo({ top: targetTop, behavior: 'smooth' });
      }
    });
  });
}

/* ----------------------------------------------------------------
   7. CONTACT FORM — Validation & Submission
   ---------------------------------------------------------------- */

/**
 * Validates a single field and displays or clears its error message.
 * Returns true if valid, false if invalid.
 *
 * @param {HTMLInputElement|HTMLTextAreaElement} field  - The input element
 * @param {HTMLElement}                          errorEl - The error span
 * @param {string}                               type    - 'text' | 'email' | 'textarea'
 * @returns {boolean}
 */
function validateField(field, errorEl, type) {
  const value = field.value.trim();

  // --- Empty check ---
  if (!value) {
    showFieldError(field, errorEl, 'ეს ველი სავალდებულოა.');
    return false;
  }

  // --- Email format check ---
  if (type === 'email') {
    // RFC 5322-like regex
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(value)) {
      showFieldError(field, errorEl, 'გთხოვთ, შეიყვანოთ სწორი ელ. ფოსტა.');
      return false;
    }
  }

  // --- Minimum length for message ---
  if (type === 'textarea' && value.length < 10) {
    showFieldError(field, errorEl, 'შეტყობინება მინიმუმ 10 სიმბოლო უნდა იყოს.');
    return false;
  }

  // Field is valid — clear error
  clearFieldError(field, errorEl);
  return true;
}

/**
 * Sets the error state on a field.
 * @param {HTMLElement} field
 * @param {HTMLElement} errorEl
 * @param {string}      message
 */
function showFieldError(field, errorEl, message) {
  field.classList.add('error');
  field.setAttribute('aria-invalid', 'true');
  errorEl.textContent = message;
}

/**
 * Clears the error state on a field.
 * @param {HTMLElement} field
 * @param {HTMLElement} errorEl
 */
function clearFieldError(field, errorEl) {
  field.classList.remove('error');
  field.removeAttribute('aria-invalid');
  errorEl.textContent = '';
}

/**
 * Sets the submit button to a loading state and back.
 * @param {boolean} isLoading
 */
function setSubmitLoading(isLoading) {
  submitBtn.disabled = isLoading;
  if (isLoading) {
    btnText.textContent = 'იგზავნება...';
    submitBtn.style.opacity = '0.75';
    submitBtn.style.cursor = 'not-allowed';
  } else {
    btnText.textContent = 'შეტყობინების გაგზავნა';
    submitBtn.style.opacity = '';
    submitBtn.style.cursor = '';
  }
}

/**
 * Initializes the contact form with real-time validation
 * and async-simulated submission.
 */
function initContactForm() {
  if (!contactForm) return;

  const nameField    = contactForm.querySelector('#name');
  const emailField   = contactForm.querySelector('#email');
  const messageField = contactForm.querySelector('#message');
  const nameError    = document.getElementById('name-error');
  const emailError   = document.getElementById('email-error');
  const messageError = document.getElementById('message-error');

  // --- Real-time validation on blur ---
  nameField.addEventListener('blur', () =>
    validateField(nameField, nameError, 'text')
  );
  emailField.addEventListener('blur', () =>
    validateField(emailField, emailError, 'email')
  );
  messageField.addEventListener('blur', () =>
    validateField(messageField, messageError, 'textarea')
  );

  // Clear error on input (UX: don't scold while typing)
  [nameField, emailField, messageField].forEach((field) => {
    field.addEventListener('input', () => {
      if (field.classList.contains('error')) {
        const errorEl = document.getElementById(`${field.id}-error`);
        clearFieldError(field, errorEl);
      }
    });
  });

  // --- Form submit handler ---
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validate all fields
    const isNameValid    = validateField(nameField, nameError, 'text');
    const isEmailValid   = validateField(emailField, emailError, 'email');
    const isMessageValid = validateField(messageField, messageError, 'textarea');

    // Bail out if any field is invalid
    if (!isNameValid || !isEmailValid || !isMessageValid) {
      // Focus first invalid field
      if (!isNameValid) nameField.focus();
      else if (!isEmailValid) emailField.focus();
      else messageField.focus();
      return;
    }

    // Simulate async form submission (replace with real fetch in production)
    setSubmitLoading(true);

    try {
      await simulateSubmission();

      // --- SUCCESS ---
      contactForm.reset();
      formSuccess.hidden = false;
      formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      // Auto-hide success after 6 seconds
      setTimeout(() => {
        formSuccess.hidden = true;
      }, 6000);

    } catch (error) {
      // Handle submission error (in production, show a server error message)
      console.error('Submission failed:', error);
      alert('შეცდომა მოხდა. გთხოვთ, სცადოთ მოგვიანებით.');
    } finally {
      setSubmitLoading(false);
    }
  });
}

/**
 * Simulates an async network request (replace with actual fetch).
 * @returns {Promise<void>}
 */
function simulateSubmission() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate 95% success rate (5% error for demo purposes)
      Math.random() < 0.95 ? resolve() : reject(new Error('Server error'));
    }, 1200);
  });
}

/* ----------------------------------------------------------------
   8. SCROLL-TO-TOP BUTTON
   ---------------------------------------------------------------- */
/**
 * Creates and injects a scroll-to-top button, shows it after
 * scrolling 400px down the page.
 */
function initScrollTopButton() {
  // Create the button
  const scrollTopBtn = document.createElement('button');
  scrollTopBtn.className = 'scroll-top';
  scrollTopBtn.setAttribute('aria-label', 'გვერდის თავში გადასვლა');
  scrollTopBtn.innerHTML = '↑';
  document.body.appendChild(scrollTopBtn);

  // Show/hide based on scroll position
  window.addEventListener('scroll', () => {
    const isVisible = window.scrollY > 400;
    scrollTopBtn.classList.toggle('visible', isVisible);
  }, { passive: true });

  // Scroll to top on click
  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ----------------------------------------------------------------
   9. FOOTER — DYNAMIC YEAR
   ---------------------------------------------------------------- */
/**
 * Injects the current year into the footer copyright.
 */
function initDynamicYear() {
  if (currentYearEl) {
    currentYearEl.textContent = new Date().getFullYear();
  }
}

/* ----------------------------------------------------------------
   10. HERO BAR CHART ANIMATION
   ---------------------------------------------------------------- */
/**
 * Animates hero chart bars from height 0 when they
 * enter the viewport, creating a draw-up effect.
 */
function initHeroBarAnimation() {
  if (!heroBars.length) return;

  // Store original heights, set to 0 initially
  heroBars.forEach((bar) => {
    bar.dataset.targetHeight = bar.style.getPropertyValue('--h') || '50%';
    bar.style.setProperty('--h', '0%');
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Animate bars with staggered delays
          heroBars.forEach((bar, index) => {
            setTimeout(() => {
              bar.style.setProperty('--h', bar.dataset.targetHeight);
            }, index * 100);
          });
          observer.disconnect(); // Animate only once
        }
      });
    },
    { threshold: 0.3 }
  );

  // Observe the chart container
  const chart = document.querySelector('.hero__chart');
  if (chart) observer.observe(chart);
}

/* ----------------------------------------------------------------
   11. REVEAL-ON-SCROLL ANIMATIONS (Intersection Observer)
   ---------------------------------------------------------------- */
/**
 * Adds fade-in / slide-up CSS animations to elements
 * as they scroll into view.
 *
 * Elements to animate are given the data-reveal attribute in CSS
 * via a dynamic style injection (keeps HTML clean).
 */
function initRevealAnimations() {
  // Inject the animation CSS
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    /* Initial state — hidden and shifted down */
    .reveal {
      opacity: 0;
      transform: translateY(24px);
      transition:
        opacity 0.55s ease,
        transform 0.55s ease;
    }

    /* Visible state — fully shown */
    .reveal.is-visible {
      opacity: 1;
      transform: translateY(0);
    }
  `;
  document.head.appendChild(styleEl);

  // Selectors to animate
  const revealSelectors = [
    '.hero__content',
    '.hero__visual',
    '.about__content',
    '.about__media',
    '.feature-card',
    '.contact__info',
    '.contact__form-wrapper',
    '.section__header',
  ];

  // Add reveal class to matching elements
  revealSelectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((el) => {
      el.classList.add('reveal');
    });
  });

  // Observe each reveal element
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target); // Only reveal once
        }
      });
    },
    {
      threshold: 0.1,       // Trigger when 10% visible
      rootMargin: '0px 0px -60px 0px', // slightly before reaching viewport edge
    }
  );

  document.querySelectorAll('.reveal').forEach((el) => {
    revealObserver.observe(el);
  });
}

/* ----------------------------------------------------------------
   12. INIT — Run everything on DOMContentLoaded
   ---------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  initStickyHeader();
  initMobileMenu();
  initMenuCloseHandlers();
  initActiveNavLink();
  initSmoothScroll();
  initContactForm();
  initScrollTopButton();
  initDynamicYear();
  initHeroBarAnimation();
  initRevealAnimations();

  console.log('%c✅ ნოვა — Landing Page Loaded', 'color: #6c63ff; font-weight: bold; font-size: 14px;');
});
