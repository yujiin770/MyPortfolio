const TMDB_API_KEY = 'a7335062c481384f8c699d8b6f38dce7'; // IMPORTANT: Replace with your actual TMDB API key
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

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
const searchBtn = document.getElementById('searchBtn');
const appHeader = document.getElementById('appHeader');
let lastScrollTop = 0;

let currentView = 'home';

document.addEventListener('DOMContentLoaded', async () => {
    const minSplashTime = new Promise(resolve => setTimeout(resolve, 3000));
    await Promise.all([ fetchHomeContent(), minSplashTime ]);
    
    setupEventListeners();

    splashScreen.classList.add('splash-hidden');
    appContainer.classList.remove('app-hidden');
    appContainer.classList.add('app-visible');

    setTimeout(() => {
        splashScreen.remove();
    }, 500);
});

function setupEventListeners() {
    movieTitleInput.addEventListener('keypress', handleSearchInput);
    searchBtn.addEventListener('click', () => triggerSearch(movieTitleInput));
    
    trailerCloseBtn.addEventListener('click', closeTrailer);
    trailerModal.addEventListener('click', (event) => {
        if (event.target === trailerModal) {
            closeTrailer();
        }
    });

    window.addEventListener('scroll', handleScroll);
}

function handleScroll() {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (appHeader) {
        if (scrollTop > lastScrollTop && scrollTop > appHeader.offsetHeight) {
            appHeader.classList.add('header-hidden');
        } else {
            appHeader.classList.remove('header-hidden');
        }
    }
    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
}

function playTrailer(youtubeKey) {
    trailerPlayer.innerHTML = `
        <iframe 
            src="https://www.youtube.com/embed/${youtubeKey}?autoplay=1&rel=0&showinfo=0" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen>
        </iframe>`;
    trailerModal.classList.remove('hidden');
    setTimeout(() => {
        trailerModal.classList.add('visible');
    }, 10);
}

function closeTrailer() {
    trailerModal.classList.remove('visible');
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
   
    window.scrollTo({ top: 0, behavior: 'smooth' });

    currentView = 'home';
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
        { id: 'trendingSection', endpoint: '/trending/movie/week', title: '🔥 Trending This Week' },
        { id: 'nowPlayingSection', endpoint: '/movie/now_playing?region=US', title: '🎬 Now Playing' },
        { id: 'topRatedSection', endpoint: '/movie/top_rated?region=US', title: '⭐ Top Rated Movies' },
        { id: 'popularTVSection', endpoint: '/tv/popular?region=US', title: '📺 Popular TV Shows' },
    ];
    await Promise.all(sections.map(async (section) => {
        const data = await fetchFromTMDB(section.endpoint);
        if (data && data.results) renderMovieRow(section.id, section.title, data.results);
    }));
}

function renderMovieRow(containerId, title, movies) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const moviesHTML = movies.slice(0, 10).map(movie => `<div class="movie-card-wrapper">${createMovieCard(movie)}</div>`).join('');
    container.innerHTML = `<h2 class="text-2xl font-bold text-foreground mb-4">${title}</h2><div class="movie-row">${moviesHTML}</div>`;
}

function createMovieCard(movie) {
    const mediaType = movie.media_type || (movie.title ? 'movie' : 'tv');
    const posterPath = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://placehold.co/500x750/151A2A/4DD8B5?text=CineFlix';
    const title = movie.title || movie.name;
    const releaseDate = movie.release_date || movie.first_air_date;
    const year = releaseDate ? new Date(releaseDate).getFullYear() : 'N/A';
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : null;
    const tmdbUrl = `https://www.themoviedb.org/${mediaType}/${movie.id}`;

    return `
        <div class="movie-card" onclick="selectMovie(${movie.id}, '${mediaType}')">
            <img src="${posterPath}" alt="${title}" class="poster-img">
            <div class="p-3">
                <h3 class="font-semibold text-white text-sm truncate">${title}</h3>
                <div class="flex items-center justify-between text-xs text-muted-foreground mt-1">
                    <span>${year}</span>
                    <div class="flex items-center gap-3">
                        ${rating ? `<div class="flex items-center gap-1"><i class="fas fa-star text-yellow-400"></i><span>${rating}</span></div>` : ''}
                        <a href="${tmdbUrl}" target="_blank" rel="noopener noreferrer" class="tmdb-link-icon" title="View on TMDB" onclick="event.stopPropagation()"><i class="fas fa-external-link-alt"></i></a>
                    </div>
                </div>
            </div>
        </div>`;
}

function handleSearchInput(e) {
    if (e.key === 'Enter') triggerSearch(e.target);
}

function triggerSearch(inputElement) {
    const query = inputElement.value.trim();
    if (query) {
        searchMovies(query);
        inputElement.blur();
    }
}

async function searchMovies(query) {
    heroSection.classList.add('hidden');
    homeContent.classList.add('hidden');
    searchResultsSection.classList.remove('hidden');
    currentView = 'search';
    searchQueryText.textContent = `Results for "${query}"`;
    resultsGrid.innerHTML = `<div class="col-span-full flex justify-center mt-8"><div class="spinner"></div></div>`;
    const data = await fetchFromTMDB(`/search/multi?query=${encodeURIComponent(query)}&include_adult=false`);
    if (data && data.results) {
        const filteredResults = data.results.filter(item => item.media_type !== 'person' && item.poster_path);
        resultsGrid.innerHTML = filteredResults.length > 0 ? filteredResults.map(createMovieCard).join('') : `<p class="text-muted-foreground col-span-full text-center">No results found for "${query}".</p>`;
    } else {
        resultsGrid.innerHTML = `<p class="text-muted-foreground col-span-full text-center">Could not fetch results. Please try again.</p>`;
    }
    window.scrollTo(0, 0);
}

async function selectMovie(id, mediaType) {
    searchResultsSection.classList.add('hidden');
    heroSection.classList.add('hidden');
    homeContent.classList.add('hidden');
    resultView.classList.remove('hidden');
    currentView = 'details';
    resultView.innerHTML = `<div class="flex justify-center mt-20"><div class="spinner"></div></div>`;
    const endpoint = `/${mediaType}/${id}?append_to_response=videos,credits`;
    const details = await fetchFromTMDB(endpoint);
    if (details) {
        renderMovieDetails(details, mediaType);
    } else {
        resultView.innerHTML = `<p class="text-muted-foreground text-center py-20">Could not load details. Please go back and try again.</p>`;
    }
    window.scrollTo(0, 0);
}

function renderMovieDetails(details, mediaType) {
    const title = details.title || details.name;
    const overview = details.overview || 'No overview available.';
    const year = new Date(details.release_date || details.first_air_date).getFullYear() || 'N/A';
    const rating = details.vote_average ? details.vote_average.toFixed(1) : 'N/A';
    const genres = details.genres.map(g => g.name).join(', ');
    const runtime = details.runtime || (details.episode_run_time ? details.episode_run_time[0] : null);
    const runtimeText = runtime ? `${runtime} min` : '';
    const backdropPath = details.backdrop_path ? `https://image.tmdb.org/t/p/w1280${details.backdrop_path}` : '';
    const posterPath = details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : 'https://placehold.co/500x750/151A2A/4DD8B5?text=CineFlix';
    const trailer = details.videos?.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
    const tmdbUrl = `https://www.themoviedb.org/${mediaType}/${details.id}`;
    const cast = details.credits?.cast.slice(0, 10).map(c => `
        <div class="text-center flex-shrink-0 w-28">
            <img src="${c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : 'https://placehold.co/185x278/151A2A/a0a0a0?text=No+Img'}" class="w-24 h-24 rounded-full object-cover mx-auto mb-2 border-2 border-border">
            <p class="font-semibold text-sm truncate">${c.name}</p>
            <p class="text-xs text-muted-foreground truncate">${c.character}</p>
        </div>
    `).join('');

    resultView.innerHTML = `
        <div class="relative">
            <button onclick="clearResult()" class="absolute top-4 left-4 z-30 bg-black/50 hover:bg-black/70 text-white rounded-full h-10 w-10 flex items-center justify-center transition-colors">
                <i class="fas fa-arrow-left text-md"></i>
            </button>
            <div class="details-backdrop" style="background-image: url('${backdropPath}')"></div>
            <div class="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-[30vh] pb-16">
                <div class="flex flex-col md:flex-row gap-8 lg:gap-12">
                    <div class="flex-shrink-0 w-full max-w-[250px] sm:max-w-xs mx-auto -mt-24 md:-mt-32">
                        <img src="${posterPath}" alt="${title}" class="rounded-lg shadow-2xl w-full">
                    </div>
                    <div class="flex-1 pt-4 text-center md:text-left">
                        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">${title}</h1>
                        <div class="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1 text-muted-foreground mb-4">
                            <span>${year}</span><span>•</span><span>${genres}</span>${runtimeText ? `<span>•</span><span>${runtimeText}</span>` : ''}
                        </div>
                        <div class="flex items-center justify-center md:justify-start gap-2 mb-6">
                            <i class="fas fa-star text-yellow-400 text-2xl"></i>
                            <span class="text-2xl font-bold">${rating}</span><span class="text-muted-foreground">/ 10</span>
                        </div>
                        <h2 class="text-2xl font-bold mb-2">Overview</h2>
                        <p class="mb-8 max-w-3xl mx-auto md:mx-0">${overview}</p>
                        <div class="flex items-center justify-center md:justify-start flex-wrap gap-4">
                            ${trailer ? `<button onclick="playTrailer('${trailer.key}')" class="btn-primary-action"><i class="fas fa-play"></i> Watch Trailer</button>` : ''}
                            <a href="${tmdbUrl}" target="_blank" rel="noopener noreferrer" class="btn-tmdb">View on TMDB</a>
                        </div>
                    </div>
                </div>
                ${cast ? `<div class="mt-16"><h2 class="text-2xl font-bold mb-4">Top Cast</h2><div class="flex gap-6 overflow-x-auto pb-4">${cast}</div></div>` : ''}
            </div>
        </div>
    `;
}