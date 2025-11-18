// =========================================================================
// --- FULLY CORRECTED SCRIPT.JS (with Click-Outside-to-Close) ---
// =========================================================================

document.addEventListener('DOMContentLoaded', () => {

  // --- Theme Toggle & Body ---
  const themeToggle = document.getElementById('theme-toggle');
  const body = document.body;
  const backToTopBtn = document.getElementById('back-to-top-btn');
  const mainNav = document.getElementById('main-nav');
  let lastScrollY = window.scrollY;
  const navHeight = mainNav ? mainNav.offsetHeight : 70;

  // --- Splash Screen ---
  const splashScreen = document.getElementById('splash-screen');
  if (splashScreen) {
    body.classList.add('no-scroll');
    setTimeout(() => {
      splashScreen.classList.add('hidden');
      body.classList.remove('no-scroll');
    }, 2500);
  }

  // --- Theme Toggle Logic ---
  if (localStorage.getItem('theme') === 'light') {
    body.classList.add('light-mode');
  }
  themeToggle.addEventListener('click', () => {
    body.classList.toggle('light-mode');
    localStorage.setItem('theme', body.classList.contains('light-mode') ? 'light' : '');
  });

  // --- Mobile Navigation Sidebar Logic ---
  const burgerBtn = document.getElementById('burger-btn');
  const navLinksContainer = document.getElementById('nav-links');
  const navBackdrop = document.getElementById('mobile-nav-backdrop');

  const openNav = () => {
    navLinksContainer.classList.add('is-open');
    navBackdrop.classList.add('is-visible');
    body.style.overflow = 'hidden';
  };

  const closeNav = () => {
    navLinksContainer.classList.remove('is-open');
    navBackdrop.classList.remove('is-visible');
    body.style.overflow = '';
  };

  if (burgerBtn) {
    burgerBtn.addEventListener('click', () => {
      if (navLinksContainer.classList.contains('is-open')) {
        closeNav();
      } else {
        openNav();
      }
    });
  }
  
  if (navLinksContainer) {
    navLinksContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('nav-link')) {
        closeNav();
      }
    });
  }

  if (navBackdrop) {
    navBackdrop.addEventListener('click', closeNav);
  }

  // === START: NEW CODE BLOCK TO ADD ===
  // Close nav when clicking on the main content area (outside the sidebar)
  document.addEventListener('click', (e) => {
    if (
      navLinksContainer.classList.contains('is-open') && // 1. Is the menu open?
      !e.target.closest('#nav-links') &&                 // 2. Did we click OUTSIDE the nav links?
      !e.target.closest('#burger-btn')                    // 3. And we didn't click the burger button?
    ) {
      closeNav(); // If all are true, close it.
    }
  });
  // === END: NEW CODE BLOCK ===


  // --- Typing Animation ---
  const typingText = document.getElementById('typing-text');
  if (typingText) {
    const roles = ['3rd Year Student', 'BSIT Freelancer', 'I want to be', 'Software Developer and UI/UX Designer'];
    let roleIndex = 0, charIndex = 0, isDeleting = false;
    function type() {
      const currentRole = roles[roleIndex];
      let displayText = isDeleting ? currentRole.substring(0, charIndex - 1) : currentRole.substring(0, charIndex + 1);
      typingText.textContent = displayText;
      charIndex = isDeleting ? charIndex - 1 : charIndex + 1;
      let typeSpeed = isDeleting ? 75 : 150;
      if (!isDeleting && displayText === currentRole) {
        typeSpeed = 2000;
        isDeleting = true;
      } else if (isDeleting && displayText === '') {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        typeSpeed = 500;
      }
      setTimeout(type, typeSpeed);
    }
    type();
  }

  // --- Scroll-Based Functions Handler ---
  const handleScroll = () => {
    if (backToTopBtn) {
      backToTopBtn.classList.toggle('is-visible', window.scrollY > 400);
    }
    if (mainNav) {
      const currentScrollY = window.scrollY;
      mainNav.classList.toggle('nav-hidden', currentScrollY > lastScrollY && currentScrollY > navHeight);
      lastScrollY = currentScrollY;
    }
    handleScrollAnimation();
    updateActiveNavLinkOnScroll();
  };

  // --- Scroll Animations ---
  const scrollElements = document.querySelectorAll('.scroll-animation');
  const elementInView = (el, dividend = 1) => el.getBoundingClientRect().top <= (window.innerHeight || document.documentElement.clientHeight) / dividend;
  const displayScrollElement = (element) => {
    element.classList.add('is-visible');
    if (element.classList.contains('skill-card')) {
      const percentageSpan = element.querySelector('.skill-header span');
      const progressBar = element.querySelector('.skill-progress');
      if (percentageSpan && progressBar) {
        progressBar.style.width = percentageSpan.textContent;
      }
    }
  };
  const handleScrollAnimation = () => scrollElements.forEach(el => {
    if (elementInView(el, 1.25)) displayScrollElement(el);
  });

  // --- Contact & Confirmation Modals with EmailJS ---
  (function() { emailjs.init({ publicKey: "KQWXoMlra2-zswXGQ" }); })();
  const contactModalTrigger = document.getElementById('contact-modal-trigger');
  const contactModal = document.getElementById('contact-modal');
  const closeContactModalBtn = document.getElementById('close-contact-modal-btn');
  const contactForm = document.getElementById('contact-form');
  const confirmationModal = document.getElementById('confirmation-modal');
  const closeConfirmationModalBtn = document.getElementById('close-confirmation-modal-btn');
  const confirmOkBtn = document.getElementById('confirm-ok-btn');
  const openContactModal = () => { if (contactModal) { contactModal.classList.add('is-visible'); body.style.overflow = 'hidden'; } };
  const closeContactModal = () => { if (contactModal) { contactModal.classList.remove('is-visible'); body.style.overflow = ''; if(contactForm) contactForm.reset(); } };
  const openConfirmationModal = () => { if (confirmationModal) { confirmationModal.classList.add('is-visible'); body.style.overflow = 'hidden'; } };
  const closeConfirmationModal = () => { if (confirmationModal) { confirmationModal.classList.remove('is-visible'); body.style.overflow = ''; } };
  if (contactModalTrigger) contactModalTrigger.addEventListener('click', (e) => { e.preventDefault(); openContactModal(); });
  if (contactModal) {
      closeContactModalBtn.addEventListener('click', closeContactModal);
      contactModal.addEventListener('click', (e) => { if (e.target === contactModal) closeContactModal(); });
      contactForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const submitBtn = contactForm.querySelector('input[type="submit"]');
          submitBtn.value = "Sending...";
          emailjs.sendForm('service_bxhw5kg', 'template_g7c534v', contactForm).then(() => {
              submitBtn.value = "Send Message"; 
              closeContactModal(); openConfirmationModal();
          }, (err) => {
              submitBtn.value = "Send Message"; 
              alert('Failed to send message. Please try again.\n' + JSON.stringify(err));
          });
      });
  }
  if (confirmationModal) {
      closeConfirmationModalBtn.addEventListener('click', closeConfirmationModal);
      confirmOkBtn.addEventListener('click', closeConfirmationModal);
      confirmationModal.addEventListener('click', (e) => { if(e.target === confirmationModal) closeConfirmationModal(); });
  }

  // --- Active Navigation Link on Scroll ---
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');
  function updateActiveNavLinkOnScroll() {
    let currentSectionId = '';
    const scrollY = window.scrollY;
    sections.forEach(section => {
      if (scrollY >= section.offsetTop - 150) currentSectionId = section.id;
    });
    if (window.innerHeight + scrollY >= document.body.offsetHeight - 5) {
       currentSectionId = sections[sections.length - 1].id;
    }
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + currentSectionId);
    });
  }
  
  // --- Swiper Initialization ---
  new Swiper('.projects-swiper', {
    loop: true, grabCursor: true, slidesPerView: 1, spaceBetween: 30,
    breakpoints: { 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } },
    navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
    pagination: { el: '.swiper-pagination', clickable: true },
  });

  // --- Infinite Scroller Logic (CONSOLIDATED) ---
  const scrollers = document.querySelectorAll(".scroller");
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    scrollers.forEach((scroller) => {
      scroller.setAttribute("data-animated", true);
      const scrollerInner = scroller.querySelector(".scroller__inner");
      Array.from(scrollerInner.children).forEach(item => {
        const duplicatedItem = item.cloneNode(true);
        duplicatedItem.setAttribute("aria-hidden", true); 
        scrollerInner.appendChild(duplicatedItem);
      });
    });
  }
  
  // --- Initial & Event-Driven Calls ---
  window.addEventListener('scroll', handleScroll);
  handleScroll();
});