// Final projects.js (with Theme Toggle Logic)

document.addEventListener('DOMContentLoaded', () => {

    // --- NEW: THEME TOGGLE LOGIC (CONSOLIDATED HERE) ---
    const body = document.body;
    const themeToggle = document.getElementById('theme-toggle');

    const applyTheme = () => {
        if (localStorage.getItem('theme') === 'light') {
            body.classList.add('light-mode');
        } else {
            body.classList.remove('light-mode');
        }
    };

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            body.classList.toggle('light-mode');
            localStorage.setItem('theme', body.classList.contains('light-mode') ? 'light' : 'dark');
        });
    }
    // Apply theme on initial load
    applyTheme();


    // --- ALL OTHER PROJECT LOGIC REMAINS THE SAME ---
    const projectsData = [
        {
            image: 'Assets/MoviePic.jpg',
            title: 'CineFlix Platform',
            tags: ['HTML', 'Tailwind', 'JS'],
            description: "CineFlix is a modern, responsive web application for discovering movies and TV shows. I focused on creating a clean, immersive user experience using HTML, Tailwind CSS, and JavaScript. The site includes dynamic sections like trending titles, search functionality, and a stylish splash screen."
        },
        {
            image: 'Assets/poster.png',
            title: '2D Horror Game',
            tags: ['VB.NET', 'Database'],
            description: "Developed a 2D Horror game using VB.NET, featuring interactive gameplay and persistent data storage with a local database using XAMPP. The project was a deep dive into object-oriented programming, game loops, and event handling."
        },
        {
            image: 'Assets/Sales-and-inventory.jpg',
            title: 'Sales & Inventory',
            tags: ['VB.NET', 'SQL', 'QR Code'],
            description: "A desktop app that makes sales and stock management easier. It has a secure login system where each user gets a unique QR code for quick sign-in. The app lets you add, edit, delete, and view products, create barcodes, and view a dashboard with important stock information."
        },
        {
            image: 'Assets/Police-Case.jpg',
            title: 'Police Record System',
            tags: ['VB.NET', 'SQL Server'],
            description: "A solo thesis project for software engineering, this desktop application improves how police stations manage records. Built with VB.NET and a SQL Server database, it replaces manual logbooks with a secure digital system featuring role-based access, evidence handling, and a statistics dashboard."
        },
        {
            image: 'Assets/WebsiteImage.png',
            title: 'Game Landing Page',
            tags: ['HTML', 'CSS', 'Responsive'],
            description: "Designed and developed a fully responsive landing page for a fictional video game. This project showcases modern front-end techniques using pure HTML and CSS, ensuring a seamless and visually engaging experience across all devices."
        },
        {
            image: 'Assets/Car-Rental.jpg',
            title: 'Automotive Rental',
            tags: ['VB.NET', 'System Design'],
            description: "As the Frontend Developer and a Quality Assurance tester for this group thesis, I designed the user interface and ensured the system worked smoothly. The application, built with VB.NET, includes features for managing vehicles, customers, bookings, and invoices, using QR codes to speed up check-ins."
        },
        {
            image: 'Assets/pageant-tabulation.jpg',
            title: 'Pageant Tabulation',
            tags: ['Web Dev', 'LAN Based'],
            description: "A flexible, Web LAN-based tabulation system developed for a live school event. As the Frontend Developer, I created a responsive and intuitive interface that allowed judges to input scores quickly and accurately, ensuring instant and error-free results."
        },
        {
            image: 'Assets/Sis-Project.jpg',
            title: 'Student Info System',
            tags: ['VB.NET', 'SQL'],
            description: "A comprehensive desktop application designed to manage student records securely. It features a login module, full CRUD (Create, Read, Update, Delete) operations, and automatic QR code generation for quick identification, replacing manual record-keeping with an efficient digital solution."
        },
        {
            image: 'Assets/TouristSpotWebsite/Assets/SnakeIslandElNido.jpg',
            title: 'Palawan Travel Site',
            tags: ['JavaScript', 'Leaflet.js', 'EmailJS'],
            description: "A responsive and immersive website for discovering and booking tours in Palawan. The project showcases stunning destinations through video backgrounds, an interactive map using Leaflet.js, and a booking form connected to EmailJS, allowing inquiries to be sent directly to my Gmail."
        }
    ];

    const carouselContainer = document.getElementById('carousel');
    const listViewContainer = document.getElementById('list-view');
    const toggleBtn = document.getElementById('toggle-view-btn');
    const carouselView = document.getElementById('carousel-view');
    const animationContainer = document.getElementById('animation-container');
    let activeProjectIndex = null;

    const createTagHtml = (tag) => `<span class="tech-tag">${tag}</span>`;

    const populateViews = () => {
        if (!carouselContainer || !listViewContainer) return;
        let carouselHtml = '';
        let listHtml = '';

        projectsData.forEach((project, index) => {
            const tagsHtml = project.tags.map(createTagHtml).join('');
            carouselHtml += `
                <div class="item" style="--offset: ${index + 1};" data-index="${index}">
                    <img src="${project.image}" alt="${project.title}">
                    <div class="item-content">
                        <h3>${project.title}</h3>
                        <div class="tech-tags">${tagsHtml}</div>
                    </div>
                </div>`;
            listHtml += `
                <div class="list-view-card glass-card hover-lift" data-index="${index}">
                    <div class="project-image-wrapper">
                        <img src="${project.image}" alt="${project.title}" class="project-image"/>
                    </div>
                    <div class="p-6">
                        <h3 class="text-xl font-bold mb-3">${project.title}</h3>
                        <div class="tech-tags">${tagsHtml}</div>
                    </div>
                </div>`;
        });
        carouselContainer.innerHTML = carouselHtml;
        listViewContainer.innerHTML = listHtml;
    };

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const isCarouselVisible = !carouselView.classList.contains('hidden');
            const btnSpan = toggleBtn.querySelector('span');
            const btnSvg = toggleBtn.querySelector('svg');
            carouselView.classList.toggle('hidden');
            listViewContainer.classList.toggle('hidden');
            if (isCarouselVisible) {
                btnSpan.textContent = 'Carousel Mode';
                btnSvg.innerHTML = `<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line>`;
            } else {
                btnSpan.textContent = 'List Mode';
                btnSvg.innerHTML = `<line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line>`;
            }
        });
    }

    const modal = document.getElementById('project-details-modal');
    const modalContent = modal.querySelector('.project-modal-content');
    const modalImage = document.getElementById('modal-project-image');
    const modalTitle = document.getElementById('modal-project-title');
    const modalTags = document.getElementById('modal-project-tags');
    const modalDescription = document.getElementById('modal-project-description');
    const closeModalBtn = document.getElementById('close-project-modal-btn');
    
    const openModal = (project, startElement) => {
        activeProjectIndex = projectsData.indexOf(project);
        const startRect = startElement.getBoundingClientRect();
        
        modalImage.src = project.image;
        modalTitle.textContent = project.title;
        modalDescription.textContent = project.description;
        modalTags.innerHTML = project.tags.map(createTagHtml).join('');

        const clone = startElement.cloneNode(true);
        clone.classList.add('animation-clone');
        animationContainer.appendChild(clone);
        
        clone.style.position = 'fixed';
        clone.style.top = `${startRect.top}px`;
        clone.style.left = `${startRect.left}px`;
        clone.style.width = `${startRect.width}px`;
        clone.style.height = `${startRect.height}px`;

        startElement.style.opacity = '0';
        
        modal.classList.add('is-visible', 'no-content');
        const endRect = modalContent.getBoundingClientRect();
        
        requestAnimationFrame(() => {
            clone.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            clone.style.top = `${endRect.top}px`;
            clone.style.left = `${endRect.left}px`;
            clone.style.width = `${endRect.width}px`;
            clone.style.height = `${endRect.height}px`;
            clone.classList.add('expanded');
        });

        clone.addEventListener('transitionend', () => {
            modal.classList.remove('no-content');
            animationContainer.innerHTML = '';
            document.body.style.overflow = 'hidden';
        }, { once: true });
    };

    const closeModal = () => {
        if (activeProjectIndex === null) return;
        
        const isCarouselVisible = !carouselView.classList.contains('hidden');
        const view = isCarouselVisible ? carouselView : listViewContainer;
        const endElement = view.querySelector(`[data-index="${activeProjectIndex}"]`);
        
        if (!endElement) {
            modal.classList.remove('is-visible');
            return;
        }

        const endRect = endElement.getBoundingClientRect();
        const startRect = modalContent.getBoundingClientRect();

        const clone = modalContent.cloneNode(true);
        clone.classList.add('animation-clone', 'expanded');
        animationContainer.appendChild(clone);

        clone.style.position = 'fixed';
        clone.style.top = `${startRect.top}px`;
        clone.style.left = `${startRect.left}px`;
        clone.style.width = `${startRect.width}px`;
        clone.style.height = `${startRect.height}px`;

        modal.classList.add('no-content');

        requestAnimationFrame(() => {
            clone.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            clone.style.top = `${endRect.top}px`;
            clone.style.left = `${endRect.left}px`;
            clone.style.width = `${endRect.width}px`;
            clone.style.height = `${endRect.height}px`;
            clone.classList.remove('expanded');
            clone.style.opacity = '0';
        });

        clone.addEventListener('transitionend', () => {
            modal.classList.remove('is-visible');
            endElement.style.opacity = '1';
            animationContainer.innerHTML = '';
            document.body.style.overflow = '';
            activeProjectIndex = null;
        }, { once: true });
    };

    const handleProjectClick = (e) => {
        const target = e.target.closest('.item, .list-view-card');
        if (target) {
            const projectIndex = target.dataset.index;
            if (projectIndex !== null) {
                openModal(projectsData[projectIndex], target);
            }
        }
    };

    carouselView.addEventListener('click', handleProjectClick);
    listViewContainer.addEventListener('click', handleProjectClick);
    closeModalBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    populateViews();
});