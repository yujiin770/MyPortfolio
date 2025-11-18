document.addEventListener("DOMContentLoaded", () => {
    const select = (selector) => document.querySelector(selector);
    const selectAll = (selector) => document.querySelectorAll(selector);

    // --- Splash Screen ---
    const splashScreen = select('#splash-screen');
    if (splashScreen) {
        setTimeout(() => {
            splashScreen.classList.add('hidden');
            document.body.classList.remove('no-scroll');
        }, 2800);
    }

    // --- Hide/Show Header on Scroll ---
    const header = select("header");
    let lastScrollTop = 0;
    window.addEventListener("scroll", () => {
        let currentScroll = window.scrollY || document.documentElement.scrollTop;
        header.classList.toggle("sticky", currentScroll > 10);
        if (currentScroll > lastScrollTop && currentScroll > 100) {
            header.classList.add("hide-nav");
        } else {
            header.classList.remove("hide-nav");
        }
        lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
    });

    // --- Mobile Menu Toggle & Navigation Smooth Scroll ---
    const menuBtn = select(".menu-btn");
    const navigation = select(".navigation");
    const navLinks = selectAll(".navigation-items a");

    menuBtn.addEventListener("click", () => {
        menuBtn.classList.toggle("active");
        navigation.classList.toggle("active");
    });

    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            const href = link.getAttribute('href');
            if (href.startsWith('#')) {
                event.preventDefault();
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
            if (navigation.classList.contains('active')) {
                menuBtn.classList.remove("active");
                navigation.classList.remove("active");
            }
        });
    });

    // --- Home Section Video Slider ---
    const sliderBtns = selectAll(".nav-btn");
    const videoSlides = selectAll(".video-slide");
    const contentSlides = selectAll(".home .content");

    const activateSlide = (slideIndex) => {
        sliderBtns.forEach(btn => btn.classList.remove("active"));
        videoSlides.forEach(slide => slide.classList.remove("active"));
        contentSlides.forEach(content => content.classList.remove("active"));
        sliderBtns[slideIndex].classList.add("active");
        videoSlides[slideIndex].classList.add("active");
        contentSlides[slideIndex].classList.add("active");
    };

    sliderBtns.forEach((btn, i) => {
        btn.addEventListener("click", () => activateSlide(i));
    });

    // --- Scroll Animation (Intersection Observer) ---
    const animatedElements = selectAll('.animate-on-scroll');
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, { threshold: 0.1 });
    animatedElements.forEach(el => scrollObserver.observe(el));

    // --- Active Navigation Link Highlighting on Scroll ---
    const sections = selectAll('section[id]');
    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href').substring(1) === entry.target.id);
                });
            }
        });
    }, { rootMargin: '-50% 0px -50% 0px' });
    sections.forEach(section => navObserver.observe(section));



    // === INTERACTIVE MAP (LEAFLET.JS) WITH OFFLINE HANDLING ===

    const mapContainer = select('#map');
    let mapInitialized = false;

    function initializeMap() {
        if (mapInitialized || !mapContainer) return;
        mapContainer.innerHTML = "";
        
        const map = L.map('map').setView([10.0, 118.7395], 9);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        const destinations = [
             {
                lat: 11.2023, lng: 119.3954, name: 'El Nido Lagoons', id: 'card-el-nido-lagoons',
                description: 'Kayak through majestic limestone cliffs.', category: 'Kayaking & Scenery',
                image: '../Assets/El Nido Lagoon.jpg', youtubeId: 'en4muSsoS7s',
                price: 1200, priceNote: "/ person"
            },
            {
                lat: 11.1722, lng: 119.4128, name: 'Snake Island', id: 'card-snake-island',
                description: 'Walk the iconic S-shaped sandbar.', category: 'Landmark & Beach',
                image: '../Assets/SnakeIslandElNido.jpg', youtubeId: 'LG-qH2s0gXw',
                price: 1200, priceNote: "/ person"
            },
            {
                lat: 10.4939, lng: 119.4087, name: 'Port Barton', id: 'card-port-barton',
                description: 'Relax on untouched, tranquil beaches.', category: 'Relaxation',
                image: '../Assets/PortBartonElNido.png', youtubeId: 'Gk1y9q9p_lY',
                price: 1400, priceNote: "/ person"
            },
            {
                lat: 10.1977, lng: 118.9230, name: 'Underground River', id: 'card-underground-river',
                description: 'A UNESCO World Heritage Site.', category: 'Natural Wonder',
                image: '../Assets/UndergroundRiverElnido.jpg', youtubeId: '8Drf2_2jYp4',
                price: 2200, priceNote: "/ person"
            },
            {
                lat: 11.2957, lng: 119.4182, name: 'Nacpan Beach', id: 'card-nacpan-beach',
                description: '4km of pristine, powdery white sand.', category: 'Beach',
                image: '../Assets/nacpanbeachElNido.jpeg', youtubeId: 'AdJY3hrg_oE',
                price: 1400, priceNote: "/ person"
            },
            {
                lat: 11.1819, lng: 119.3931, name: 'Shimizu Island', id: 'card-shimizu-island',
                description: 'A premier spot for snorkeling.', category: 'Snorkeling Spot',
                image: '../Assets/shimizuElnido.jpg', youtubeId: 'F5o92Gun7hI',
                price: 1200, priceNote: "/ person"
            }
        ];

        const tourIcon = L.icon({
            iconUrl: '../Assets/placeholder.png',
            iconSize: [40, 40], iconAnchor: [20, 40], popupAnchor: [0, -42]
        });

        destinations.forEach(dest => {
            const marker = L.marker([dest.lat, dest.lng], { icon: tourIcon }).addTo(map);
            const formattedPrice = `₱${dest.price.toLocaleString()}`;
            const cardPriceEl = document.querySelector(`#${dest.id} .card-price`);
            if (cardPriceEl) {
                cardPriceEl.innerHTML = `${formattedPrice} <span>${dest.priceNote}</span>`;
            }
            const popupContent = `
                <img src="${dest.image}" alt="${dest.name}" class="popup-image">
                <div class="popup-text-content">
                    <h4>${dest.name}</h4>
                    <p>${dest.description}</p>
                    <span class="popup-category">${dest.category}</span>
                    <div class="popup-price">${formattedPrice}</div>
                    <button class="popup-button" data-youtubeid="${dest.youtubeId}">View Place</button>
                </div>`;
            marker.bindPopup(popupContent);
        });
        mapInitialized = true;
        // Video Modal Logic
        const modalOverlay = select('#video-modal');
        const videoContainer = select('#video-container');
        const closeModalBtn = select('.close-modal');
        const openModal = (youtubeId) => {
            videoContainer.innerHTML = `<iframe src="https://www.youtube.com/embed/${youtubeId}?autoplay=1" title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
            modalOverlay.classList.add('active');
        };
        const closeModal = () => {
            modalOverlay.classList.remove('active');
            videoContainer.innerHTML = '';
        };
        document.addEventListener('click', (e) => {
            if (e.target && e.target.classList.contains('popup-button')) {
                openModal(e.target.getAttribute('data-youtubeid'));
            }
        });
        closeModalBtn.addEventListener('click', closeModal);
        modalOverlay.addEventListener('click', (e) => (e.target === modalOverlay) && closeModal());
    }

    function displayOfflineMessageForMap() {
        if (mapContainer) {
            mapContainer.innerHTML = `
                <div class="offline-map-placeholder">
                    <h3><i class='bx bx-wifi-off'></i></h3>
                    <h4>Map Unavailable Offline</h4>
                    <p>Please connect to the internet to explore our destinations.</p>
                </div>`;
            mapInitialized = false;
        }
    }

    function handleConnectionChange() {
        if (navigator.onLine) {
            initializeMap();
        } else {
            displayOfflineMessageForMap();
        }
    }

    // Initial check on page load
    if (mapContainer) {
        handleConnectionChange();
    }

    // Listen for network status changes
    window.addEventListener('offline', displayOfflineMessageForMap);
    window.addEventListener('online', initializeMap);


    // --- BOOKING FORM LOGIC ---
    const bookingForm = select('#booking-form');
    if (bookingForm) {
        const destinationSelect = select('#destination');
        const priceDisplayContainer = select('#tour-price-display');
        const priceBreakdownDiv = select('#price-breakdown');
        const customQuoteMessageDiv = select('#custom-quote-message');
        const priceValueSpan = select('#price-value');
        const tourPackages = {
            "El Nido Tour A": { price: 1200 },
            "El Nido Tour C": { price: 1400 },
            "Underground River Tour": { price: 2200 },
            "Custom Package": { price: 0 }
        };

        const animateValue = (element, start, end, duration) => {
            let startTimestamp = null;
            const step = (timestamp) => {
                if (!startTimestamp) startTimestamp = timestamp;
                const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                const currentValue = Math.floor(progress * (end - start) + start);
                element.innerHTML = `₱${currentValue.toLocaleString()}`;
                if (progress < 1) window.requestAnimationFrame(step);
            };
            window.requestAnimationFrame(step);
        };

        destinationSelect.addEventListener('change', function() {
            const selectedValue = this.value;
            const packageInfo = tourPackages[selectedValue];
            priceBreakdownDiv.style.display = 'none';
            customQuoteMessageDiv.style.display = 'none';

            if (packageInfo && packageInfo.price > 0) {
                priceBreakdownDiv.style.display = 'flex';
                animateValue(priceValueSpan, 0, packageInfo.price, 500);
                priceDisplayContainer.classList.add('visible');
            } else if (selectedValue === "Custom Package") {
                customQuoteMessageDiv.style.display = 'block';
                priceDisplayContainer.classList.add('visible');
            } else {
                priceDisplayContainer.classList.remove('visible');
            }
        });

        (function() {
            emailjs.init({ publicKey: "84HZLi8lG5zQeU63v" });
        })();

        bookingForm.addEventListener('submit', function(event) {
            event.preventDefault();
            if (!navigator.onLine) {
                 Swal.fire({
                    title: 'No Internet Connection',
                    text: "We can't send your inquiry right now. Please check your connection and try again.",
                    icon: 'warning',
                    confirmButtonText: 'Close'
                });
                return;
            }
            const submitBtn = this.querySelector('.btn-submit');
            submitBtn.innerHTML = "Sending...";
            submitBtn.disabled = true;
            emailjs.sendForm('service_z0kty2h', 'template_ne7cx9r', this)
                .then(() => {
                    Swal.fire({
                        icon: 'success',
                        title: 'Inquiry Sent!',
                        text: 'Thank you! We will contact you shortly to finalize your booking.',
                        confirmButtonText: 'Close'
                    });
                    this.reset();
                    priceDisplayContainer.classList.remove('visible');
                }, (error) => {
                    console.error('EmailJS Error:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops... Something Went Wrong',
                        text: 'Please try again later or contact us directly.'
                    });
                })
                .finally(() => {
                    submitBtn.innerHTML = "Submit Booking Inquiry";
                    submitBtn.disabled = false;
                });
        });
    }
});