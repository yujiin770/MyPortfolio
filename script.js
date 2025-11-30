// =========================================================================
// --- FINAL SCRIPT (GitHub Button Visibility Corrected) ---
// =========================================================================

document.addEventListener('DOMContentLoaded', () => {

  // --- Global Element Selections ---
  const body = document.body;
  const splashScreen = document.getElementById('splash-screen');
  const mainNav = document.getElementById('main-nav');
  const backToTopBtn = document.getElementById('back-to-top-btn');
  let lastScrollY = window.scrollY;
  const navHeight = mainNav ? mainNav.offsetHeight : 70;

  // --- Splash Screen ---
  if (splashScreen) {
    body.classList.add('no-scroll');
    setTimeout(() => {
      splashScreen.classList.add('hidden');
      body.classList.remove('no-scroll');
    }, 2500);
  }

  // --- Theme Toggle Logic ---
  const themeToggle = document.getElementById('theme-toggle');
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
      navLinksContainer.classList.contains('is-open') ? closeNav() : openNav();
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

  // --- Typing Animation for Hero Section ---
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

  // --- Scroll-in Animations for Sections ---
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

  // --- Project Details Modal Logic ---
  const projectModal = document.getElementById('project-details-modal');
  if (projectModal) {
    const closeProjectModalBtn = document.getElementById('close-project-modal-btn');
    const projectsWrapper = document.querySelector('.projects-swiper');
    const modalImage = document.getElementById('modal-project-image');
    const modalTitle = document.getElementById('modal-project-title');
    const modalDescription = document.getElementById('modal-project-description');
    const modalTagsContainer = document.getElementById('modal-project-tags');
    const modalLinksContainer = document.getElementById('modal-project-links');

    const openProjectModal = (card) => {
        modalImage.src = card.dataset.modalImage;
        modalTitle.textContent = card.dataset.modalTitle;
        modalDescription.textContent = card.dataset.modalDescription;
        
        modalTagsContainer.innerHTML = '';
        modalLinksContainer.innerHTML = '';

        card.querySelectorAll('.tech-tag').forEach(tag => {
          modalTagsContainer.appendChild(tag.cloneNode(true));
        });

        const linkHref = card.dataset.modalLinkHref;
        const linkText = card.dataset.modalLinkText;
        if (linkHref && linkText && linkHref !== '#') {
          const link = document.createElement('a');
          link.href = linkHref;
          link.textContent = linkText;
          link.className = 'btn btn-primary';
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          modalLinksContainer.appendChild(link);
        }

        // *** THE FIX IS HERE ***
        // The check '&& githubHref !== "#"' has been removed.
        const githubHref = card.dataset.modalGithubHref;
        if (githubHref) { 
            const githubLink = document.createElement('a');
            githubLink.href = githubHref;
            githubLink.target = '_blank';
            githubLink.rel = 'noopener noreferrer';
            githubLink.className = 'btn btn-secondary';
            githubLink.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 0.5rem;">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                </svg>
                View on GitHub
            `;
            modalLinksContainer.appendChild(githubLink);
        }
        
        projectModal.classList.add('is-visible');
        body.style.overflow = 'hidden';
    };
    
    const closeProjectModal = () => {
        projectModal.classList.remove('is-visible');
        body.style.overflow = '';
    };

    projectsWrapper.addEventListener('click', (e) => {
      if (e.target.closest('a') || e.target.closest('button')) {
          if (!e.target.closest('.project-modal-trigger')) {
              return;
          }
      }
      const card = e.target.closest('.project-card');
      if (card) {
        openProjectModal(card);
      }
    });

    closeProjectModalBtn.addEventListener('click', closeProjectModal);
    projectModal.addEventListener('click', (e) => {
      if (e.target === projectModal) {
        closeProjectModal();
      }
    });
  }

  // --- Active Navigation Link on Scroll ---
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');
  function updateActiveNavLinkOnScroll() {
    let currentSectionId = '';
    const scrollY = window.scrollY;
    sections.forEach(section => {
      if (scrollY >= section.offsetTop - 150) {
        currentSectionId = section.id;
      }
    });
    if (window.innerHeight + scrollY >= document.body.offsetHeight - 5) {
       currentSectionId = sections[sections.length - 1].id;
    }
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + currentSectionId);
    });
  }
  
  // --- Swiper Initialization for Projects Carousel ---
  new Swiper('.projects-swiper', {
    loop: true,
    grabCursor: true,
    slidesPerView: 1,
    spaceBetween: 30,
    breakpoints: {
      768: { slidesPerView: 2 },
      1024: { slidesPerView: 3 }
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
  });

  // --- Infinite Scroller Logic for Tech Stack ---
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
  
     // --- 2. CHATBOT LOGIC (GEMINI API VERSION) ---
    // NOTE: This uses the secure serverless function method we discussed.
    const chatbotToggleBtn = document.getElementById('chatbot-toggle-btn');
    if (chatbotToggleBtn) {
        const chatbotWindow = document.getElementById('chatbot-window');
        const chatbotMessages = document.getElementById('chatbot-messages');
        const chatbotInput = document.getElementById('chatbot-input');
        const chatbotSendBtn = document.getElementById('chatbot-send-btn');
        const TYPING_DELAY = 800;

        const addUserMessage = (message) => {
            const el = document.createElement('div');
            el.classList.add('chat-message', 'user-message');
            el.innerHTML = `<p>${message}</p>`;
            chatbotMessages.appendChild(el);
            chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        };
        const addBotMessage = (message) => {
            const el = document.createElement('div');
            el.classList.add('chat-message', 'bot-message');
            el.innerHTML = `<p>${message}</p>`; // Use innerHTML to render Gemini's Markdown formatting if any
            chatbotMessages.appendChild(el);
            chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        };
        const showTypingIndicator = () => {
            const indicator = document.createElement('div');
            indicator.id = 'typing-indicator';
            indicator.classList.add('chat-message', 'bot-message', 'bot-typing-indicator');
            indicator.innerHTML = `<p><span></span><span></span><span></span></p>`;
            chatbotMessages.appendChild(indicator);
            chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        };
        const hideTypingIndicator = () => {
            const indicator = document.getElementById('typing-indicator');
            if (indicator) indicator.remove();
        };

        async function getGeminiResponse(userInput) {
            // This is the relative path to your Netlify function
            const functionUrl = '/api/get-gemini-response';
            try {
                const response = await fetch(functionUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt: userInput })
                });
                if (!response.ok) return "I'm sorry, I'm having trouble connecting to my brain right now.";
                const data = await response.json();
                return data.reply;
            } catch (error) {
                console.error("Error fetching Gemini response:", error);
                return "There was an error reaching my servers. Let's try that again.";
            }
        }

        const handleSendMessage = async () => {
            const userInput = chatbotInput.value.trim();
            if (!userInput) return;
            addUserMessage(userInput);
            chatbotInput.value = '';
            showTypingIndicator();
            setTimeout(async () => {
                const botResponse = await getGeminiResponse(`You are a helpful assistant for Eugene Almira's portfolio. Be friendly and concise. User asks: "${userInput}"`);
                hideTypingIndicator();
                addBotMessage(botResponse);
            }, TYPING_DELAY);
        };

        chatbotToggleBtn.addEventListener('click', () => {
            chatbotWindow.classList.toggle('is-open');
            chatbotToggleBtn.classList.toggle('is-open');
        });
        chatbotSendBtn.addEventListener('click', handleSendMessage);
        chatbotInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleSendMessage(); });
        
        setTimeout(() => { addBotMessage("Hi! I'm Eugene's AI assistant. Ask me anything about his portfolio."); }, 1500);
    }

  // --- Initial & Event-Driven Calls ---
  window.addEventListener('scroll', handleScroll);
  handleScroll();
});