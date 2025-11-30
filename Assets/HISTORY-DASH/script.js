document.addEventListener('DOMContentLoaded', () => {

    // =====================================================================
    // ===== COMPLETE AUDIO MANAGEMENT SYSTEM (Play, Mute, and Save) =====
    // =====================================================================
    const audioElement = document.getElementById('background-music');
    const muteButton = document.getElementById('mute-btn');

    if (audioElement && muteButton) {
        
        const toggleMute = () => {
            const isNowMuted = !audioElement.muted;
            audioElement.muted = isNowMuted;
            muteButton.classList.toggle('muted', isNowMuted);
            localStorage.setItem('musicMuted', isNowMuted);
        };

        const startMusic = () => {
            if (audioElement.paused) {
                audioElement.play().catch(error => {
                    console.error("Audio playback was prevented by the browser:", error);
                });
            }
        };

        const savedMutePreference = localStorage.getItem('musicMuted') === 'true';
        audioElement.muted = savedMutePreference;
        muteButton.classList.toggle('muted', savedMutePreference);

        muteButton.addEventListener('click', toggleMute);
        document.addEventListener('click', startMusic, { once: true });
        document.addEventListener('touchstart', startMusic, { once: true });
        document.addEventListener('keydown', startMusic, { once: true });
    }

    // =================================================================
    // ===== BUTTON HOVER SOUND EFFECTS =====
    // =================================================================
    const hoverSound = document.getElementById('hover-sound');
    const interactiveElements = document.querySelectorAll(
        'button, a.play-now-button, a.hero-scroll-down-button, a.hero-play-button-mobile, a.spotlight-cta-button, .nav-item, .gallery-item, .social-icons a, .store-button, .footer-links a, .modal-close, .modal-close-btn'
    );

    if (hoverSound && interactiveElements.length > 0) {
        hoverSound.volume = 0.4;
        const playHoverSound = () => {
            hoverSound.currentTime = 0;
            hoverSound.play().catch(e => {});
        };
        interactiveElements.forEach(element => {
            element.addEventListener('mouseenter', playHoverSound);
        });
    }

    // =================================================================
    // ===== ANIMATE SECTIONS ON SCROLL (Intersection Observer) =====
    // =================================================================
    const animatedSections = document.querySelectorAll('.animated-section');
    if (animatedSections.length > 0) {
        const observerCallback = (entries, observer) => {
            entries.forEach(entry => {
                entry.target.classList.toggle('is-visible', entry.isIntersecting);
            });
        };
        const observerOptions = { root: null, rootMargin: '0px', threshold: 0.1 };
        const observer = new IntersectionObserver(observerCallback, observerOptions);
        animatedSections.forEach(section => { observer.observe(section); });
    }
    
    // =================================================================
    // ===== HEADER & NAVIGATION LOGIC (FINAL FIX) =====
    // =================================================================
    const header = document.querySelector('.main-header');
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.main-nav a.nav-item');
    const headerHeight = header ? header.offsetHeight : 0;
    let lastScrollTop = 0;

    const activateNavOnScroll = () => {
        const scrollY = window.pageYOffset;
        let activeSectionId = null;

        // Find the currently active section
        for (const section of sections) {
            const sectionTop = section.offsetTop - headerHeight - 100; // Increased buffer
            if (scrollY >= sectionTop) {
                activeSectionId = section.getAttribute('id');
            }
        }
        
        // Update nav links based on the active section
        navLinks.forEach(link => {
            const linkHref = link.getAttribute('href');
            // Strict rule: If we are near the very top, ONLY "Home" is active.
            if (scrollY < 200) {
                link.classList.toggle('active', linkHref === '#');
            } else {
                // Otherwise, activate the link that matches the current section ID
                link.classList.toggle('active', linkHref === '#' + activeSectionId);
            }
        });
    };

    const handleScroll = () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (header) {
            header.classList.toggle('header-scrolled', scrollTop > 50);
            header.classList.toggle('header-hidden', scrollTop > lastScrollTop && scrollTop > headerHeight);
        }
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
        activateNavOnScroll();
        
        const heroScrollButton = document.querySelector('.hero-scroll-down-button');
        if (heroScrollButton) {
            heroScrollButton.classList.toggle('hidden', scrollTop > 50);
        }
    };
    
    // Smooth scrolling logic for all anchor links
    document.querySelectorAll('.main-nav a, .spotlight-cta-button, .hero-scroll-down-button').forEach(link => {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            
            if (href.startsWith('#')) {
                e.preventDefault(); // Prevent default jump behavior
                
                // If the link is just "#", scroll to the top of the page.
                if (href === '#') {
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                } 
                // For all other links like "#gallery", scroll to that specific section.
                else {
                    const targetElement = document.querySelector(href);
                    if (targetElement) {
                        const topPos = targetElement.offsetTop - headerHeight;
                        window.scrollTo({
                            top: topPos,
                            behavior: 'smooth'
                        });
                    }
                }
            }
        });
    });

    // Run the scroll functions once on page load to set the initial state
    window.addEventListener('scroll', handleScroll);
    activateNavOnScroll();


    // =================================================================
    // ===== BURGER MENU FUNCTIONALITY =====
    // =================================================================
    const burger = document.querySelector('.burger-menu');
    const nav = document.querySelector('.main-nav');
    if (burger && nav) {
        const toggleNav = () => {
            burger.classList.toggle('open');
            nav.classList.toggle('open');
        };
        burger.addEventListener('click', toggleNav);
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (nav.classList.contains('open')) toggleNav();
            });
        });
    }

    // =================================================================
    // ===== CUSTOM GALLERY MODAL LOGIC =====
    // =================================================================
    const galleryItems = document.querySelectorAll('.gallery-item');
    const galleryModal = document.getElementById('gallery-modal');
    if (galleryModal && galleryItems.length > 0) {
        const modalImage = document.getElementById('modal-image');
        const modalTitle = document.getElementById('modal-title');
        const modalDescription = document.getElementById('modal-description');
        const closeModalBtn = galleryModal.querySelector('.modal-close-btn');
        const modalOverlay = galleryModal.querySelector('.modal-overlay');
        const openModal = (item) => {
            modalImage.src = item.dataset.modalImg;
            modalTitle.textContent = item.dataset.modalTitle;
            modalDescription.textContent = item.dataset.modalDescription;
            galleryModal.classList.add('active');
        };
        const closeModal = () => galleryModal.classList.remove('active');
        galleryItems.forEach(item => item.addEventListener('click', () => openModal(item)));
        closeModalBtn.addEventListener('click', closeModal);
        modalOverlay.addEventListener('click', closeModal);
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && galleryModal.classList.contains('active')) closeModal();
        });
    }

    // =================================================================
    // ===== GAMEPLAY VIDEO PLAYER LOGIC =====
    // =================================================================
    const videoWrapper = document.getElementById('video-wrapper');
    const gameplayVideo = document.getElementById('gameplay-video');
    const videoModal = document.getElementById('video-modal');
    if (videoWrapper && gameplayVideo && videoModal) {
        const modalContent = videoModal.querySelector('.video-modal-content');
        const closeModalBtn = videoModal.querySelector('.video-modal-close');
        const openModal = () => {
            modalContent.appendChild(gameplayVideo);
            gameplayVideo.style.display = 'block';
            videoModal.classList.add('active');
            gameplayVideo.play();
        };
        const closeModal = () => {
            gameplayVideo.pause();
            videoModal.classList.remove('active');
            videoWrapper.appendChild(gameplayVideo);
        };
        videoWrapper.addEventListener('click', openModal);
        closeModalBtn.addEventListener('click', closeModal);
        videoModal.addEventListener('click', (e) => {
            if (e.target === videoModal) closeModal();
        });
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && videoModal.classList.contains('active')) closeModal();
        });
    }

    // =================================================================
    // ===== INFINITE SCROLLER LOGIC =====
    // =================================================================
    const scroller = document.querySelector('.scroller');
    if (scroller) {
        const scrollerInner = scroller.querySelector('.scroller-inner');
        const scrollerContent = Array.from(scrollerInner.children);
        scrollerContent.forEach(item => {
            const duplicatedItem = item.cloneNode(true);
            scrollerInner.appendChild(duplicatedItem);
        });
    }

    // =================================================================
    // ===== TYPEWRITER EFFECT FOR STORY SECTION =====
    // =================================================================
    const storySection = document.getElementById('story');
    if (storySection) {
        const text1 = "In History Dash, a curious high school student stumbles upon a mysterious device during a museum field trip a time-traveling artifact that links to important moments in history. Suddenly transported across time, the student learns that pieces of history have been scattered and distorted.";
        const text2 = "To return to the present, the student must collect key artifacts, avoid the forces that want to erase the truth, and answer critical trivia that unlock portals to the next era. But a dark force the embodiment of ignorance and misinformation is always chasing. Will this student be fast and smart enough to restore history before it’s too late?";
        const p1 = document.getElementById('story-paragraph-1');
        const p2 = document.getElementById('story-paragraph-2');
        if (p1 && p2) {
            const typeWriter = (element, text, speed) => {
                let i = 0;
                element.innerHTML = '<span class="typing-cursor"></span>';
                const cursor = element.querySelector('.typing-cursor');
                function type() {
                    if (i < text.length) {
                        cursor.insertAdjacentText('beforebegin', text.charAt(i++));
                        setTimeout(type, speed);
                    } else {
                        cursor.remove();
                    }
                }
                type();
            };
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        typeWriter(p1, text1, 20);
                        setTimeout(() => typeWriter(p2, text2, 20), text1.length * 20 + 500);
                        observer.unobserve(storySection);
                    }
                });
            }, { threshold: 0.4 });
            observer.observe(storySection);
        }
    }

    // =================================================================
    // ===== PROTAGONIST IMAGE AUTO-SWITCHER (Switches char1/char2) =====
    // =================================================================
    const protagonistImages = document.querySelectorAll('.protagonist-image');
    if (protagonistImages.length > 1) {
        let currentProtagonistIndex = 0;
        setInterval(() => {
            protagonistImages[currentProtagonistIndex].classList.remove('active');
            currentProtagonistIndex = (currentProtagonistIndex + 1) % protagonistImages.length;
            protagonistImages[currentProtagonistIndex].classList.add('active');
        }, 4000); // Switch every 4 seconds
    }
});


// =================================================================
// ===== FUNCTIONS TO RUN AFTER PAGE VISUALS ARE FULLY LOADED =====
// =================================================================
window.addEventListener('load', () => {

    // --- Home Section Entrance Animation ---
    function animateHeroSection() {
        const title = document.querySelector('.hero-title');
        const navItems = document.querySelectorAll('.main-nav .nav-item');
        if (title) setTimeout(() => title.classList.add('is-visible'), 600);
        navItems.forEach((item, index) => {
            setTimeout(() => { item.classList.add('is-visible'); }, 1200 + (index * 150));
        });
    }

    // --- SPLASH SCREEN HIDING/SHATTER LOGIC ---
    const splashScreen = document.getElementById('splash-screen');
    if (splashScreen) {
        const shatterOverlay = document.getElementById('shatter-overlay');
        for (let i = 0; i < 20; i++) {
            const pane = document.createElement('div');
            pane.classList.add('shatter-pane');
            shatterOverlay.appendChild(pane);
        }
        setTimeout(() => {
            splashScreen.classList.add('shattering');
            setTimeout(animateHeroSection, 400);
            setTimeout(() => splashScreen.classList.add('hidden'), 1200);
        }, 3500); 
    } else {
        animateHeroSection();
    }

    // --- FLOATING ICONS LOGIC ---
    const iconsContainer = document.getElementById('floating-icons-container');
    if (iconsContainer) {
        const coinSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12,2C17.52,2 22,6.48 22,12C22,17.52 17.52,22 12,22C6.48,22 2,17.52 2,12C2,6.48 6.48,2 12,2M12,4C7.58,4 4,7.58 4,12C4,16.42 7.58,20 12,20C16.42,20 20,16.42 20,12C20,7.58 16.42,4 12,4M12,6.09L13.71,9.54L17.5,10.09L14.75,12.77L15.42,16.54L12,14.7L8.58,16.54L9.25,12.77L6.5,10.09L10.29,9.54L12,6.09Z" /></svg>`;
        for (let i = 0; i < 20; i++) {
            const icon = document.createElement('div');
            icon.classList.add('floating-icon');
            icon.innerHTML = coinSVG;
            const size = Math.random() * 80 + 20;
            const left = Math.random() * 100;
            const animDuration = Math.random() * 15 + 10;
            const animDelay = Math.random() * 10;
            icon.style.setProperty('--size', `${size}px`);
            icon.style.left = `${left}%`;
            icon.style.animationDuration = `${animDuration}s`;
            icon.style.animationDelay = `${animDelay}s`;
            iconsContainer.appendChild(icon);
        }
    }

    // --- BACK TO TOP BUTTON LOGIC ---
    const backToTopButton = document.getElementById('back-to-top-btn');
    if (backToTopButton) {
        window.addEventListener('scroll', () => {
            backToTopButton.classList.toggle('visible', window.scrollY > 300);
        });
        backToTopButton.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});