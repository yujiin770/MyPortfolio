const TMDB_API_KEY = 'a7335062c481384f8c699d8b6f38dce7'; // Your API key
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

let currentView = 'home';
let lastScrollTop = 0;
let intersectionObserver; 

let currentPage = 1;
let totalPages = 1;
let currentSearchType = null;
let currentSearchValue = null;
let isLoadingMore = false;

let heroCarouselInterval;
let currentHeroSlide = 0;
let heroSlides = [];

// Global list of genres for reuse
const genres = [
    { id: 28, name: 'Action' }, { id: 12, name: 'Adventure' }, { id: 16, name: 'Animation' }, 
    { id: 35, name: 'Comedy' }, { id: 80, name: 'Crime' }, { id: 99, name: 'Documentary' },
    { id: 18, name: 'Drama' }, { id: 10751, name: 'Family' }, { id: 14, name: 'Fantasy' }, 
    { id: 36, name: 'History' }, { id: 27, 'name': 'Horror' }, { id: 10402, name: 'Music' },
    { id: 9648, name: 'Mystery' }, { id: 10749, name: 'Romance' }, { id: 878, name: 'Sci-Fi' }, 
    { id: 53, name: 'Thriller' }, { id: 10752, name: 'War' }, { id: 37, name: 'Western' }
];

// DOM Element references 
const trailerModal = document.getElementById('trailerModal');
const trailerPlayer = document.getElementById('trailerPlayer');
const trailerCloseBtn = document.getElementById('trailerCloseBtn');
const splashScreen = document.getElementById('splashScreen');
const appContainer = document.getElementById('app');
const heroSection = document.getElementById('heroSection');
const homeContent = document.getElementById('homeContent');
const searchResultsSection = document.getElementById('searchResults');
const resultsGrid = document.getElementById('resultsGrid');
const resultView = document.getElementById('resultView');
const movieTitleInput = document.getElementById('movieTitle');
const searchQueryText = document.getElementById('searchQueryText');
const appHeader = document.getElementById('appHeader');
const loadingIndicator = document.getElementById('loadingIndicator');
const sidebarMenu = document.getElementById('sidebarMenu');
const sidebarOverlay = document.getElementById('sidebarOverlay');

//  Initial Setup 
document.addEventListener('DOMContentLoaded', async () => {
    setupEventListeners();
    setupImageObserver();
    setupGenreDropdown(); 
    setupSidebar();
    
    const minSplashTime = new Promise(resolve => setTimeout(resolve, 2000));
    await Promise.all([ fetchHomeContent(), setupHeroCarousel(), minSplashTime ]);

    splashScreen.classList.add('splash-hidden');
    appContainer.classList.remove('app-hidden');
    appContainer.classList.add('app-visible');
    
    setTimeout(() => { splashScreen.style.display = 'none'; }, 500);
});

function openSidebar() {
    sidebarMenu.classList.add('sidebar-open');
    sidebarOverlay.classList.add('active');
}

function closeSidebar() {
    sidebarMenu.classList.remove('sidebar-open');
    sidebarOverlay.classList.remove('active');
}

function setupSidebar() {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');

    hamburgerBtn.addEventListener('click', openSidebar);
    sidebarCloseBtn.addEventListener('click', closeSidebar);
    sidebarOverlay.addEventListener('click', closeSidebar);

    const collapsibleToggles = document.querySelectorAll('.sidebar-section-toggle');
    collapsibleToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const content = toggle.nextElementSibling;
            toggle.classList.toggle('active');
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });
}

function setupEventListeners() {
    movieTitleInput.addEventListener('keypress', handleSearchInput); 
    trailerCloseBtn.addEventListener('click', closeTrailer);
    trailerModal.addEventListener('click', (event) => {
        if (event.target === trailerModal) closeTrailer();
    });

    window.addEventListener('scroll', () => {
        handleHeaderScroll();
        handleInfiniteScroll();
    });

    document.getElementById('heroPrevBtn').addEventListener('click', () => {
        showHeroSlide(currentHeroSlide - 1);
        resetCarouselInterval();
    });
    document.getElementById('heroNextBtn').addEventListener('click', () => {
        showHeroSlide(currentHeroSlide + 1);
        resetCarouselInterval();
    });

    document.getElementById('navShows').addEventListener('click', (e) => {
        e.preventDefault();
        searchByQuery("popular tv shows"); 
    });
    document.getElementById('navMovies').addEventListener('click', (e) => {
        e.preventDefault();
        searchByQuery("popular movies");
    });
}

async function setupHeroCarousel() {
    const data = await fetchFromTMDB('/movie/now_playing?region=US');
    if (data && data.results) {
        heroSlides = data.results.filter(m => m.backdrop_path).slice(0, 7);
        const carouselContainer = document.getElementById('heroCarousel');
        carouselContainer.innerHTML = heroSlides.map((movie, index) => `
            <div class="hero-slide ${index === 0 ? 'active' : ''}" style="background-image: url('https://image.tmdb.org/t/p/w1280${movie.backdrop_path}')"></div>
        `).join('');
        showHeroSlide(0);
        resetCarouselInterval();
    }
}

function showHeroSlide(index) {
    if (!heroSlides.length) return;

    const slides = document.querySelectorAll('.hero-slide');
    currentHeroSlide = (index + heroSlides.length) % heroSlides.length;

    slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === currentHeroSlide);
    });

    const movie = heroSlides[currentHeroSlide];
    const trailerPromise = fetchFromTMDB(`/movie/${movie.id}/videos`);
    const heroContentContainer = document.getElementById('heroContent');
    
    let title = movie.title;
    if (title.includes(':')) {
        title = title.replace(':', ':<br>');
    } else if (title.length > 20) {
        const breakPoint = title.lastIndexOf(' ', Math.floor(title.length / 1.5));
        if (breakPoint > 0) {
            title = title.substring(0, breakPoint) + '<br>' + title.substring(breakPoint + 1);
        }
    }

    heroContentContainer.innerHTML = `
        <div class="max-w-md text-shadow">
            <h1 class="hero-title-main mb-4">${title}</h1>
            <p class="hero-description text-gray-200 mb-8">${movie.overview.substring(0, 150)}...</p>
            <div class="flex flex-col sm:flex-row gap-4">
                <button id="heroPlayBtn" class="btn-hero-play"><i class="fas fa-play"></i> Play</button>
                <button onclick="selectMovie(${movie.id}, 'movie')" class="btn-hero-secondary">
                    <i class="fas fa-info-circle"></i> More Info
                </button>
            </div>
        </div>
    `;

    trailerPromise.then(videoData => {
        const trailer = videoData.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
        const playBtn = document.getElementById('heroPlayBtn');
        if(playBtn && trailer) {
            playBtn.onclick = () => playTrailer(trailer.key);
        } else if (playBtn) {
            playBtn.disabled = true;
            playBtn.style.opacity = '0.5';
        }
    });
}

function resetCarouselInterval() {
    clearInterval(heroCarouselInterval);
    heroCarouselInterval = setInterval(() => {
        showHeroSlide(currentHeroSlide + 1);
    }, 7000);
}

function setupGenreDropdown() {
    const desktopMenu = document.getElementById('genreDropdownMenu');
    const mobileContainer = document.getElementById('mobileGenreContainer');
    const toggle = document.getElementById('genreDropdownToggle');

    const desktopHTML = genres.map(genre => 
        `<a href="#" class="genre-dropdown-link" onclick="event.preventDefault(); searchByGenre(${genre.id}, '${genre.name}');">${genre.name}</a>`
    ).join('');
    
    const mobileHTML = `<div class="mobile-genre-grid">${genres.map(genre => 
        `<a href="#" class="mobile-genre-link" onclick="event.preventDefault(); searchByGenre(${genre.id}, '${genre.name}'); closeSidebar();">${genre.name}</a>`
    ).join('')}</div>`;

    desktopMenu.innerHTML = desktopHTML;
    mobileContainer.innerHTML = mobileHTML;

    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        toggle.classList.toggle('active');
        desktopMenu.classList.toggle('hidden');
    });

    window.addEventListener('click', () => {
        if (!desktopMenu.classList.contains('hidden')) {
            desktopMenu.classList.add('hidden');
            toggle.classList.remove('active');
        }
    });
}

function setupImageObserver() {
    intersectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const src = img.getAttribute('data-src');
                if (src) {
                    img.src = src;
                    img.setAttribute('data-loaded', 'true');
                }
                observer.unobserve(img);
            }
        });
    }, { rootMargin: '0px 0px 200px 0px' });
}

function observeImages() {
    const images = document.querySelectorAll('.poster-img');
    images.forEach(img => intersectionObserver.observe(img));
}

function handleHeaderScroll() {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (appHeader) {
        if (scrollTop > lastScrollTop && scrollTop > 50) {
            appHeader.classList.add('header-hidden');
        } else {
            appHeader.classList.remove('header-hidden');
        }
    }
    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
}

function playTrailer(youtubeKey) {
    trailerPlayer.innerHTML = `
        <iframe src="https://www.youtube.com/embed/${youtubeKey}?autoplay=1&rel=0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    trailerModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    setTimeout(() => trailerModal.classList.add('visible'), 10);
}

function closeTrailer() {
    trailerModal.classList.remove('visible');
    document.body.style.overflow = '';
    setTimeout(() => {
        trailerModal.classList.add('hidden');
        trailerPlayer.innerHTML = '';
    }, 300);
}

function clearResult() {
    resultView.innerHTML = '';
    resultView.classList.add('hidden');
    resultsGrid.innerHTML = '';
    searchResultsSection.classList.add('hidden');
    
    heroSection.classList.remove('hidden');
    homeContent.classList.remove('hidden');
    movieTitleInput.value = '';
    
    document.title = 'CineFlix - Discover Your Next Favorite Movie';
    currentView = 'home';
    resetSearchState();
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetSearchState() {
    currentPage = 1;
    totalPages = 1;
    currentSearchType = null;
    currentSearchValue = null;
    isLoadingMore = false;
}

async function fetchFromTMDB(endpoint) {
    const url = `${TMDB_BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${TMDB_API_KEY}&language=en-US`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`TMDB API error: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error(`Error fetching from TMDB: ${url}`, error);
        return null;
    }
}

async function fetchHomeContent() {
    const sections = [
        { id: 'trendingSection', endpoint: '/trending/all/week', title: '🔥 Trending This Week' },
        { id: 'nowPlayingSection', endpoint: '/movie/now_playing?region=US', title: '🎬 Now Playing' },
        { id: 'topRatedSection', endpoint: '/movie/top_rated?region=US', title: '⭐ Top Rated Movies' },
        { id: 'popularTVSection', endpoint: '/tv/popular?region=US', title: '📺 Popular TV Shows' },
    ];
    await Promise.all(sections.map(async (section) => {
        const data = await fetchFromTMDB(section.endpoint);
        if (data && data.results) renderMovieRow(section.id, section.title, data.results);
    }));
    observeImages();
}

// --- FIX: SCROLLROW FUNCTION RESTORED ---
function scrollRow(rowId, direction) {
    const row = document.getElementById(rowId);
    if (row) {
        const scrollAmount = row.clientWidth * 0.8; 
        const scrollValue = direction === 'left' ? -scrollAmount : scrollAmount;
        row.scrollBy({ left: scrollValue, behavior: 'smooth' });
    }
}

// --- FIX: ARROW BUTTONS RESTORED TO THIS FUNCTION ---
function renderMovieRow(containerId, title, movies) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const validMovies = movies.filter(Boolean);
    const moviesHTML = validMovies.slice(0, 10).map(movie => `<div class="movie-card-wrapper">${createMovieCard(movie)}</div>`).join('');
    
    const rowId = `${containerId}-scroll`;

    container.innerHTML = `
        <h2 class="text-2xl font-bold text-foreground mb-4">${title}</h2>
        <div class="movie-row-wrapper">
            <div id="${rowId}" class="movie-row">${moviesHTML}</div>
            <button class="scroll-btn scroll-left" onclick="scrollRow('${rowId}', 'left')" aria-label="Scroll left">
                <i class="fas fa-chevron-left"></i>
            </button>
            <button class="scroll-btn scroll-right" onclick="scrollRow('${rowId}', 'right')" aria-label="Scroll right">
                <i class="fas fa-chevron-right"></i>
            </button>
        </div>
    `;
}

function createMovieCard(movie) {
    if (!movie) return '';
    const mediaType = movie.media_type || (movie.title ? 'movie' : 'tv');
    const posterPath = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://placehold.co/500x750/151A2A/4DD8B5?text=CineFlix';
    const title = movie.title || movie.name;
    const releaseDate = movie.release_date || movie.first_air_date;
    const year = releaseDate ? new Date(releaseDate).getFullYear() : 'N/A';
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : null;

    return `
        <div class="movie-card" onclick="selectMovie(${movie.id}, '${mediaType}')">
            <img data-src="${posterPath}" alt="${title}" class="poster-img" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7">
            <div class="p-3">
                <h3 class="font-semibold text-white text-sm truncate">${title}</h3>
                <div class="flex items-center justify-between text-xs text-muted-foreground mt-1">
                    <span>${year}</span>
                    ${rating ? `<div class="flex items-center gap-1"><i class="fas fa-star text-yellow-400"></i><span>${rating}</span></div>` : ''}
                </div>
            </div>
        </div>`;
}

function createThumbnailCard(movie) {
    if (!movie) return '';
    const mediaType = movie.media_type || (movie.title ? 'movie' : 'tv');
    const imagePath = movie.backdrop_path ? `https://image.tmdb.org/t/p/w500${movie.backdrop_path}` : (movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://placehold.co/500x281/151A2A/4DD8B5?text=CineFlix');
    const title = movie.title || movie.name;
    const releaseDate = movie.release_date || movie.first_air_date;
    const year = releaseDate ? new Date(releaseDate).getFullYear() : 'N/A';

    return `
        <div class="thumbnail-card" onclick="selectMovie(${movie.id}, '${mediaType}')">
            <img data-src="${imagePath}" alt="${title}" class="thumbnail-poster poster-img" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7">
            <div class="thumbnail-info">
                <h3 class="font-semibold text-white text-sm truncate">${title}</h3>
                <div class="flex items-center justify-between text-xs text-muted-foreground mt-1">
                    <span>${year}</span>
                    <i class="fas fa-star text-yellow-400"></i>
                </div>
            </div>
        </div>`;
}

function renderSearchSkeleton() {
    const skeletonCard = `<div class="movie-card"><div class="skeleton skeleton-poster"></div><div class="p-3"><div class="skeleton skeleton-text"></div><div class="skeleton skeleton-text skeleton-text-short"></div></div></div>`;
    resultsGrid.innerHTML = Array(12).fill(skeletonCard).join('');
}

function renderDetailsSkeleton() {
    resultView.innerHTML = `<div class="relative"><div class="absolute top-4 left-4 z-30 bg-black/50 h-10 w-10 rounded-full skeleton"></div><div class="details-backdrop skeleton"></div><div class="relative z-10 container mx-auto px-4 pt-[30vh] pb-16"><div class="flex flex-col md:flex-row gap-8"><div class="flex-shrink-0 w-full max-w-xs mx-auto -mt-24 md:-mt-32"><div class="skeleton skeleton-poster"></div></div><div class="flex-1 pt-4"><div class="skeleton skeleton-title"></div><div class="skeleton skeleton-text w-1/2 mb-6"></div><div class="skeleton skeleton-text w-1/3 mb-6"></div><div class="skeleton skeleton-text mb-2 w-1/4"></div><div class="skeleton skeleton-text"></div><div class="skeleton skeleton-text"></div><div class="skeleton skeleton-text w-3/4"></div></div></div></div></div>`;
}

function handleSearchInput(e) { if (e.key === 'Enter') triggerSearch(e.target); }
function triggerSearch(inputElement) { const query = inputElement.value.trim(); if (query) searchByQuery(query); else clearResult(); }

async function searchByQuery(query) {
    resetSearchState();
    currentSearchType = 'query';
    currentSearchValue = query;
    heroSection.classList.add('hidden');
    homeContent.classList.add('hidden');
    searchResultsSection.classList.remove('hidden');
    currentView = 'search';
    document.title = `Search: ${query} - CineFlix`;
    searchQueryText.textContent = `Results for "${query}"`;
    renderSearchSkeleton();
    window.scrollTo(0, 0);
    setTimeout(async () => {
        const data = await fetchFromTMDB(`/search/multi?query=${encodeURIComponent(query)}&include_adult=false&page=1`);
        if (data && data.results) {
            totalPages = data.total_pages;
            const filteredResults = data.results.filter(item => item.media_type !== 'person' && item.poster_path);
            resultsGrid.innerHTML = filteredResults.length > 0 ? filteredResults.map(createMovieCard).join('') : `<p class="text-muted-foreground col-span-full text-center">No results found for "${query}".</p>`;
        } else {
            resultsGrid.innerHTML = `<p class="text-muted-foreground col-span-full text-center">Could not fetch results. Please try again.</p>`;
        }
        observeImages();
    }, 50);
}

async function searchByGenre(genreId, genreName) {
    resetSearchState();
    currentSearchType = 'genre';
    currentSearchValue = genreId;
    heroSection.classList.add('hidden');
    homeContent.classList.add('hidden');
    searchResultsSection.classList.remove('hidden');
    currentView = 'search';
    document.title = `${genreName} Movies - CineFlix`;
    searchQueryText.textContent = `Results for "${genreName}"`;
    renderSearchSkeleton();
    window.scrollTo(0, 0);
    setTimeout(async () => {
        const data = await fetchFromTMDB(`/discover/movie?with_genres=${genreId}&sort_by=popularity.desc&page=1`);
        if (data && data.results) {
            totalPages = data.total_pages;
            resultsGrid.innerHTML = data.results.length > 0 ? data.results.map(createMovieCard).join('') : `<p class="text-muted-foreground col-span-full text-center">No results found for ${genreName}.</p>`;
        } else {
            resultsGrid.innerHTML = `<p class="text-muted-foreground col-span-full text-center">Could not fetch results. Please try again.</p>`;
        }
        observeImages();
    }, 50);
}

function handleInfiniteScroll() {
    const isAtBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 500;
    if (isAtBottom && currentView === 'search' && !isLoadingMore && currentPage < totalPages) {
        loadMoreResults();
    }
}

async function loadMoreResults() {
    isLoadingMore = true;
    loadingIndicator.classList.remove('hidden');
    currentPage++;
    let endpoint = '';
    if (currentSearchType === 'genre') {
        endpoint = `/discover/movie?with_genres=${currentSearchValue}&sort_by=popularity.desc&page=${currentPage}`;
    } else if (currentSearchType === 'query') {
        endpoint = `/search/multi?query=${encodeURIComponent(currentSearchValue)}&include_adult=false&page=${currentPage}`;
    }
    const data = await fetchFromTMDB(endpoint);
    if (data && data.results) {
        const filteredResults = (currentSearchType === 'query') ? data.results.filter(item => item.media_type !== 'person' && item.poster_path) : data.results;
        resultsGrid.innerHTML += filteredResults.map(createMovieCard).join('');
        observeImages();
    }
    loadingIndicator.classList.add('hidden');
    isLoadingMore = false;
}

async function selectMovie(id, mediaType) {
    if (mediaType === 'person') return;
    currentView = 'details';
    searchResultsSection.classList.add('hidden');
    heroSection.classList.add('hidden');
    homeContent.classList.add('hidden');
    resultView.classList.remove('hidden');
    renderDetailsSkeleton();
    window.scrollTo(0, 0);
    setTimeout(async () => {
        const details = await fetchFromTMDB(`/${mediaType}/${id}?append_to_response=videos,credits,recommendations`);
        if (details) {
            document.title = `${details.title || details.name} - CineFlix`;
            renderMovieDetails(details, mediaType, details.recommendations?.results);
            observeImages();
        } else {
            resultView.innerHTML = `<p class="text-muted-foreground text-center py-20">Could not load details. Please go back and try again.</p>`;
        }
    }, 50);
}

// --- FIX: ARROW BUTTONS RESTORED TO THIS FUNCTION ---
function renderMovieDetails(details, mediaType, similarMovies) {
    const title = details.title || details.name;
    const overview = details.overview || 'No overview available.';
    const year = new Date(details.release_date || details.first_air_date).getFullYear() || 'N/A';
    const rating = details.vote_average ? details.vote_average.toFixed(1) : 'N/A';
    const genresHTML = details.genres.map(g => `<a href="#" class="btn-genre" onclick="event.preventDefault(); searchByGenre(${g.id}, '${g.name}')">${g.name}</a>`).join('');
    const runtime = details.runtime || (details.episode_run_time ? details.episode_run_time[0] : null);
    const runtimeText = runtime ? `${runtime} min` : '';
    const backdropPath = details.backdrop_path ? `https://image.tmdb.org/t/p/w1280${details.backdrop_path}` : '';
    const posterPath = details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : 'https://placehold.co/500x750/151A2A/4DD8B5?text=CineFlix';
    const trailer = details.videos?.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
    const cast = details.credits?.cast.slice(0, 10).map(c => `<div class="text-center flex-shrink-0 w-28 cursor-pointer movie-card-wrapper" onclick="selectPerson(${c.id}, '${c.name}')"><img data-src="${c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : 'https://placehold.co/185x278/151A2A/a0a0a0?text=No+Img'}" class="w-24 h-24 rounded-full object-cover mx-auto mb-2 border-2 border-border poster-img" alt="${c.name}"><p class="font-semibold text-sm truncate">${c.name}</p><p class="text-xs text-muted-foreground truncate">${c.character}</p></div>`).join('');
    
    const similarRowId = 'similarMoviesRow';
    const similarMoviesHTML = similarMovies && similarMovies.length > 0
        ? `<div class="mt-16"><h2 class="text-2xl font-bold mb-4">You Might Also Like</h2><div class="movie-row-wrapper">
            <div id="${similarRowId}" class="movie-row">${similarMovies.map(movie => `<div class="thumbnail-card-wrapper">${createThumbnailCard(movie)}</div>`).join('')}</div>
            <button class="scroll-btn scroll-left" onclick="scrollRow('${similarRowId}', 'left')" aria-label="Scroll left"><i class="fas fa-chevron-left"></i></button>
            <button class="scroll-btn scroll-right" onclick="scrollRow('${similarRowId}', 'right')" aria-label="Scroll right"><i class="fas fa-chevron-right"></i></button>
           </div></div>`
        : '';
    
    const castRowId = 'castRow';
    const castHTML = cast 
        ? `<div class="mt-16"><h2 class="text-2xl font-bold mb-4">Top Cast</h2><div class="movie-row-wrapper">
            <div id="${castRowId}" class="movie-row">${cast}</div>
            <button class="scroll-btn scroll-left" onclick="scrollRow('${castRowId}', 'left')" aria-label="Scroll left"><i class="fas fa-chevron-left"></i></button>
            <button class="scroll-btn scroll-right" onclick="scrollRow('${castRowId}', 'right')" aria-label="Scroll right"><i class="fas fa-chevron-right"></i></button>
           </div></div>` 
        : '';

    resultView.innerHTML = `<div class="relative"><button onclick="clearResult()" class="absolute top-4 left-4 z-30 bg-black/50 hover:bg-black/70 text-white rounded-full h-10 w-10 flex items-center justify-center transition-colors"><i class="fas fa-arrow-left text-md"></i></button><div class="details-backdrop" style="background-image: url('${backdropPath}')"></div><div class="relative z-10 container mx-auto px-4 pt-[30vh] pb-16"><div class="flex flex-col md:flex-row gap-8 lg:gap-12"><div class="flex-shrink-0 w-full max-w-[250px] sm:max-w-xs mx-auto -mt-24 md:-mt-32"><img src="${posterPath}" alt="${title}" class="rounded-lg shadow-2xl w-full"></div><div class="flex-1 pt-4 text-center md:text-left"><h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">${title}</h1><div class="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2 text-muted-foreground mb-4"><span>${year}</span>${runtimeText ? `<span>•</span><span>${runtimeText}</span>` : ''}</div><div class="flex items-center justify-center md:justify-start gap-2 mb-6"><i class="fas fa-star text-yellow-400 text-2xl"></i><span class="text-2xl font-bold">${rating}</span><span class="text-muted-foreground">/ 10</span></div><div class="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-6">${genresHTML}</div><h2 class="text-2xl font-bold mb-2">Overview</h2><p class="mb-8 max-w-3xl mx-auto md:mx-0">${overview}</p><div class="flex items-center justify-center md:justify-start flex-wrap gap-4">${trailer ? `<button onclick="playTrailer('${trailer.key}')" class="btn-hero-play"><i class="fas fa-play"></i> Watch Trailer</button>` : ''}</div></div></div>${castHTML}${similarMoviesHTML}</div></div>`;
}

async function selectPerson(id, name) {
    currentView = 'personDetails';
    searchResultsSection.classList.add('hidden');
    heroSection.classList.add('hidden');
    homeContent.classList.add('hidden');
    resultView.classList.remove('hidden');
    document.title = `${name} - CineFlix`;
    resultView.innerHTML = `<div class="flex justify-center mt-20"><div class="spinner"></div></div>`;
    window.scrollTo(0, 0);
    const personDetails = await fetchFromTMDB(`/person/${id}?append_to_response=movie_credits`);
    if (personDetails) {
        renderPersonDetails(personDetails);
        observeImages();
    } else {
        resultView.innerHTML = `<p class="text-muted-foreground text-center py-20">Could not load details for ${name}.</p>`;
    }
}

function renderPersonDetails(details) {
    const knownFor = details.movie_credits?.cast.sort((a, b) => (b.popularity || 0) - (a.popularity || 0)).filter(m => m.poster_path);
    const biography = details.biography ? details.biography.split('\n\n').map(p => `<p>${p}</p>`).join('') : 'No biography available.';
    resultView.innerHTML = `<div class="relative"><button onclick="clearResult()" class="absolute top-4 left-4 z-30 bg-black/50 hover:bg-black/70 text-white rounded-full h-10 w-10 flex items-center justify-center transition-colors"><i class="fas fa-arrow-left text-md"></i></button><div class="container mx-auto px-4 sm:px-6 lg:px-8 py-16"><div class="flex flex-col md:flex-row gap-8 lg:gap-12 items-start"><div class="flex-shrink-0 w-full max-w-[250px] sm:max-w-xs mx-auto"><img src="${details.profile_path ? `https://image.tmdb.org/t/p/w500${details.profile_path}` : 'https://placehold.co/500x750/151A2A/4DD8B5?text=No+Image'}" alt="${details.name}" class="rounded-lg shadow-2xl w-full"></div><div class="flex-1 pt-4 text-center md:text-left"><h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">${details.name}</h1><p class="text-muted-foreground mb-4">Known for: ${details.known_for_department}</p><h2 class="text-2xl font-bold mb-2 mt-8">Biography</h2><div class="mb-8 max-w-3xl mx-auto md:mx-0 text-muted-foreground actor-bio">${biography}</div></div></div>${knownFor && knownFor.length > 0 ? `<div class="mt-16"><h2 class="text-2xl font-bold mb-4">Known For</h2><div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">${knownFor.map(createMovieCard).join('')}</div></div>` : ''}</div></div>`;
}

function createFloatingIcons() {}