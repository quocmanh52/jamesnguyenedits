/**
 * ============================================================================
 * MAJID EDITS - JAVASCRIPT CONTROLLER (script.js)
 * Features:
 *  1. Marquee Animation Controls (Pause/Resume buttons & prefers-reduced-motion)
 *  2. Lightbox Modal Dialog for Review Screenshots (Zoom in, Pause Marquee, Close X)
 *  3. Scroll Reveal Animations (IntersectionObserver)
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // --------------------------------------------------------------------------
  // 1. SYSTEM REDUCED MOTION DETECTION
  // --------------------------------------------------------------------------
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  // --------------------------------------------------------------------------
  // 2. MARQUEE PAUSE / RESUME MOTION TOGGLE
  // --------------------------------------------------------------------------
  /**
   * Binds a marquee container to its corresponding toggle button.
   * @param {string} containerSelector - CSS selector for the marquee wrapper.
   * @param {string} buttonId - ID of the button controlling the marquee.
   */
  function bindMotion(containerSelector, buttonId) {
    const container = document.querySelector(containerSelector);
    const button = document.getElementById(buttonId);
    if (!container || !button) return;

    let isPaused = reducedMotionQuery.matches;

    function syncState() {
      container.classList.toggle('paused', isPaused);
      button.setAttribute('aria-pressed', String(isPaused));
      button.textContent = isPaused ? 'Resume motion' : 'Pause motion';
      button.hidden = reducedMotionQuery.matches;
    }

    // Initialize state
    syncState();

    // Toggle button click listener
    button.addEventListener('click', () => {
      isPaused = !isPaused;
      syncState();
    });

    // Listen to OS-level accessibility changes
    reducedMotionQuery.addEventListener('change', () => {
      isPaused = reducedMotionQuery.matches;
      syncState();
    });
  }

  // Bind both client logos ticker and feedback review screenshots ticker
  bindMotion('.marquee', 'motion-toggle');
  bindMotion('.feedback-marquee', 'feedback-toggle');

  // --------------------------------------------------------------------------
  // 3. LIGHTBOX MODAL DIALOG FOR FEEDBACK SCREENSHOTS
  // --------------------------------------------------------------------------
  const modal = document.getElementById('screenshot-modal');
  const modalImg = document.getElementById('enlarged-screenshot');
  const modalTitle = document.getElementById('screenshot-title');
  const closeBtn = document.getElementById('close-screenshot');
  const feedbackMarquee = document.querySelector('.feedback-marquee');
  const feedbackToggle = document.getElementById('feedback-toggle');

  let activeOpenerButton = null;

  if (modal && modalImg && closeBtn) {
    // Attach click handlers to all review cards
    const feedbackCards = document.querySelectorAll('[data-screenshot]');

    feedbackCards.forEach((card) => {
      card.addEventListener('click', () => {
        activeOpenerButton = card;
        const screenshotSrc = card.dataset.screenshot;
        const clientName = card.dataset.client || 'Client';

        // Set enlarged modal content
        modalImg.src = screenshotSrc;
        modalImg.alt = `Original feedback screenshot from ${clientName}`;
        if (modalTitle) {
          modalTitle.textContent = `${clientName} / Feedback`;
        }

        // Open native modal dialog
        modal.showModal();

        // Lock background scroll
        document.body.classList.add('modal-open');

        // Automatically pause feedback ticker while inspecting
        if (feedbackMarquee) {
          feedbackMarquee.classList.add('paused');
        }

        // Set focus to the close button for keyboard accessibility
        closeBtn.focus();
      });
    });

    // Close button click handler
    closeBtn.addEventListener('click', () => {
      modal.close();
    });

    // Modal close event cleanup
    modal.addEventListener('close', () => {
      modalImg.removeAttribute('src');
      document.body.classList.remove('modal-open');

      // Resume ticker ONLY if the user had not manually paused it beforehand
      const isManuallyPaused = feedbackToggle && feedbackToggle.getAttribute('aria-pressed') === 'true';
      if (feedbackMarquee && !isManuallyPaused && !reducedMotionQuery.matches) {
        feedbackMarquee.classList.remove('paused');
      }

      // Return focus to the trigger button that opened the modal
      if (activeOpenerButton) {
        activeOpenerButton.focus();
      }
    });

    // Click outside modal content (on the blurred backdrop) to close
    modal.addEventListener('click', (event) => {
      const rect = modal.getBoundingClientRect();
      const isClickedOutside =
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom;

      if (isClickedOutside) {
        modal.close();
      }
    });
  }

  // --------------------------------------------------------------------------
  // 4. SCROLL REVEAL ANIMATIONS (INTERSECTION OBSERVER)
  // --------------------------------------------------------------------------
  if (!reducedMotionQuery.matches && 'IntersectionObserver' in window) {
    document.body.classList.add('motion-ready');

    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.07,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    // Register elements to animate on scroll
    const animatableElements = document.querySelectorAll(
      '.section-heading, .category-heading, .embedded-card, .services article, .steps article, .about, .contact'
    );

    animatableElements.forEach((el) => {
      el.classList.add('reveal');
      revealObserver.observe(el);
    });
  }
});
