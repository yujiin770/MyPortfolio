// --- DOM Element References ---
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const errorDisplay = document.querySelector('.error-display');
const errorText = document.querySelector('.error-display p');
const weatherDisplay = document.querySelector('.weather-display');
const cityNameEl = document.getElementById('city-name');
const localTimeDateEl = document.getElementById('local-time-date');
const weatherIconEl = document.getElementById('weather-icon');
const temperatureEl = document.getElementById('temperature');
const descriptionEl = document.getElementById('description');
const forecastContainer = document.getElementById('forecast-container');

// --- API Configuration ---
const apiKey = '78e59eb288e9a2b3b943f5ac4c12055f'; // Remember to paste your key

// --- NEW: Map and Marker Global Variables ---
let map = null;
let marker = null;

// --- Functions ---

// NEW: Initialize the map on page load
function initMap() {
    map = L.map('map').setView([20, 0], 2); // Default view (world map)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
}

// NEW: Update the map view and add a marker
function updateMap(coords) {
    if (marker) {
        marker.remove(); // Remove old marker if it exists
    }
    const lat = coords.lat;
    const lon = coords.lon;
    map.setView([lat, lon], 13); // Set view to city's coordinates with a zoom level of 13
    marker = L.marker([lat, lon]).addTo(map);
}

async function getWeatherForCity(city) {
    if (!city.trim()) {
        errorText.textContent = 'Please enter a city name.';
        errorDisplay.style.display = 'block';
        weatherDisplay.style.display = 'none';
        return;
    }

    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

    try {
        const [currentWeatherResponse, forecastResponse] = await Promise.all([
            fetch(currentWeatherUrl),
            fetch(forecastUrl)
        ]);

        if (!currentWeatherResponse.ok || !forecastResponse.ok) {
            throw new Error('City not found. Please try again.');
        }

        const currentWeatherData = await currentWeatherResponse.json();
        const forecastData = await forecastResponse.json();
        
        errorText.textContent = 'City not found. Please try again.';
        errorDisplay.style.display = 'none';
        weatherDisplay.style.display = 'block';

        displayCurrentWeather(currentWeatherData);
        displayForecast(forecastData);
        updateMap(currentWeatherData.coord); // NEW: Update the map with coordinates
    } catch (error) {
        console.error('Error fetching weather data:', error);
        errorDisplay.style.display = 'block';
        weatherDisplay.style.display = 'none';
    }
}

function displayCurrentWeather(data) {
    cityNameEl.textContent = data.name;
    temperatureEl.textContent = `${Math.round(data.main.temp)}°C`;
    descriptionEl.textContent = data.weather[0].description;
    weatherIconEl.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    localTimeDateEl.textContent = getFormattedLocalTime(data.dt, data.timezone);
}

function displayForecast(data) {
    forecastContainer.innerHTML = '';
    const dailyForecasts = data.list.filter(item => item.dt_txt.includes('12:00:00'));

    dailyForecasts.forEach(forecast => {
        const forecastCard = document.createElement('div');
        forecastCard.className = 'forecast-card';
        const day = new Date(forecast.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' });
        const icon = forecast.weather[0].icon;
        const temp = `${Math.round(forecast.main.temp)}°C`;
        forecastCard.innerHTML = `
            <p class="day">${day}</p>
            <img src="https://openweathermap.org/img/wn/${icon}.png" alt="Weather icon">
            <p>${temp}</p>
        `;
        forecastContainer.appendChild(forecastCard);
    });
}

function getFormattedLocalTime(utcTimestamp, timezoneOffset) {
    const date = new Date((utcTimestamp + timezoneOffset) * 1000);
    const options = {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', timeZone: 'UTC' 
    };
    return new Intl.DateTimeFormat('en-US', options).format(date);
}

// --- Event Listeners and Initial Call ---
searchBtn.addEventListener('click', () => getWeatherForCity(cityInput.value));
cityInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') getWeatherForCity(cityInput.value);
});

// Initialize the map as soon as the script loads
initMap();