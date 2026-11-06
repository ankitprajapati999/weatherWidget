const searchInput = document.getElementById("search-bar");
const searchButton = document.getElementById("search-btn");
const cityTags = document.querySelectorAll(".city-tag");

const weatherContainer = document.getElementById("weather-data");
const placeholder = document.getElementById("placeholder");
const errorBanner = document.getElementById("error-message");
const errorText = document.getElementById("error-text");

// UI Elements
const cityName = document.getElementById("city-name");
const timeEl = document.getElementById("time");
const conditionBadge = document.getElementById("condition-badge");
const tempVal = document.getElementById("temp-val");
const feelsLikeVal = document.getElementById("feels-like-val");
const weatherIcon = document.getElementById("weather-icon");

const windVal = document.getElementById("wind-val");
const windDir = document.getElementById("wind-dir");
const humidityVal = document.getElementById("humidity-val");
const dewpointVal = document.getElementById("dewpoint-val");
const uvVal = document.getElementById("uv-val");
const uvStatus = document.getElementById("uv-status");
const pressureVal = document.getElementById("pressure-val");
const visVal = document.getElementById("vis-val");
const aqiVal = document.getElementById("aqi-val");
const aqiStatus = document.getElementById("aqi-status");

// Automatically get user's location on page load
window.addEventListener("DOMContentLoaded", () => {
    getUserLocation();
});

function getUserLocation() {
    if (!navigator.geolocation) {
        showError(true, "Geolocation is not supported by your browser. Please search manually.");
        return;
    }

    setLoadingState(true, "Locating...");

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            fetchWeatherData(`${lat},${lon}`);
        },
        (error) => {
            setLoadingState(false);
            if (error.code === error.PERMISSION_DENIED) {
                console.log("User denied location access. Falling back to manual search.");
            } else {
                showError(true, "Unable to retrieve your location. Try searching a city.");
            }
        },
        { timeout: 10000 }
    );
}

async function fetchWeatherData(query) {
    showError(false);
    setLoadingState(true, "Searching...");

    try {
        const response = await fetch(`/api/weather?city=${encodeURIComponent(query)}`);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error?.message || "Location not found. Try another.");
        }

        renderWeather(data);
    } catch (err) {
        showError(true, err.message);
    } finally {
        setLoadingState(false);
    }
}

function renderWeather(data) {
    placeholder.classList.add("hidden");
    weatherContainer.classList.remove("hidden");

    // Location & Main Temp
    cityName.innerText = `${data.location.name}, ${data.location.country}`;
    timeEl.innerText = data.location.localtime;
    conditionBadge.innerText = data.current.condition.text;
    tempVal.innerText = `${Math.round(data.current.temp_c)}°`;
    feelsLikeVal.innerText = `${data.current.feelslike_c}°C`;
    weatherIcon.src = `https:${data.current.condition.icon}`;

    // Grid Metrics
    windVal.innerText = `${data.current.wind_kph} kph`;
    windDir.innerText = `Direction: ${data.current.wind_dir}`;

    humidityVal.innerText = `${data.current.humidity}%`;
    dewpointVal.innerText = `Dew: ${data.current.dewpoint_c}°C`;

    uvVal.innerText = data.current.uv;
    uvStatus.innerText = getUVDescription(data.current.uv);

    pressureVal.innerText = `${data.current.pressure_mb} mb`;
    visVal.innerText = `Visibility: ${data.current.vis_km} km`;

    // AQI Safety Check
    if (data.current.air_quality && data.current.air_quality.pm2_5 !== undefined) {
        const pm25 = data.current.air_quality.pm2_5.toFixed(1);
        aqiVal.innerText = pm25;
        aqiStatus.innerText = getAQIDescription(pm25);
    } else {
        aqiVal.innerText = "N/A";
        aqiStatus.innerText = "Air Quality unavailable";
    }
}

// Helpers
function setLoadingState(isLoading, customText = "Search") {
    if (isLoading) {
        searchButton.innerText = customText;
        searchButton.disabled = true;
        searchButton.style.opacity = "0.7";
    } else {
        searchButton.innerText = "Search";
        searchButton.disabled = false;
        searchButton.style.opacity = "1";
    }
}

function showError(show, message = "") {
    if (show) {
        errorText.innerText = message;
        errorBanner.classList.remove("hidden");
    } else {
        errorBanner.classList.add("hidden");
    }
}

function getUVDescription(uv) {
    if (uv <= 2) return "Low Risk";
    if (uv <= 5) return "Moderate";
    if (uv <= 7) return "High Risk";
    return "Very High";
}

function getAQIDescription(pm25) {
    if (pm25 <= 12) return "Good Air Quality";
    if (pm25 <= 35) return "Moderate Air Quality";
    return "Unhealthy Air Quality";
}

// Event Listeners
searchButton.addEventListener("click", () => {
    const query = searchInput.value.trim();
    if (query) fetchWeatherData(query);
});

searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        const query = searchInput.value.trim();
        if (query) fetchWeatherData(query);
    }
});

// Quick tags click handlers
cityTags.forEach((tag) => {
    tag.addEventListener("click", () => {
        const city = tag.getAttribute("data-city");
        if (city) {
            searchInput.value = city;
            fetchWeatherData(city);
        }
    });
});