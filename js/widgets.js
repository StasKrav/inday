// ============================================
// ПОГОДА - ПОЛНОСТЬЮ РАБОЧИЙ КОД
// ============================================

let weatherCity = 'Perm';
let weatherEnabled = true;
let weatherInterval = null;

function loadWeatherState() {
    const savedCity = localStorage.getItem('weather_city');
    if (savedCity) weatherCity = savedCity;
    
    const savedEnabled = localStorage.getItem('weather_enabled');
    if (savedEnabled !== null) {
        weatherEnabled = savedEnabled === 'true';
    } else {
        weatherEnabled = true;
        localStorage.setItem('weather_enabled', 'true');
    }
}

function saveWeatherState() {
    localStorage.setItem('weather_enabled', weatherEnabled);
    localStorage.setItem('weather_city', weatherCity);
}

// ============================================
// ОСНОВНАЯ ФУНКЦИЯ ВКЛ/ВЫКЛ
// ============================================
function toggleWeather() {
    weatherEnabled = !weatherEnabled;
    
    const module = document.getElementById('weatherModule');
    const btn = document.getElementById('weatherToggleBtn');
    const content = document.getElementById('weatherContent');
    const settings = document.getElementById('weatherSettings');
    
    console.log('🌤 toggleWeather(), теперь включена?', weatherEnabled);
    
    if (weatherEnabled) {
        // ВКЛЮЧАЕМ
        module.classList.remove('disabled');
        module.style.opacity = '1';
        content.style.display = 'block';
        if (btn) btn.classList.add('active');
        if (settings) settings.style.display = 'none';
        fetchWeather();
        startWeatherInterval();
    } else {
        // ВЫКЛЮЧАЕМ
        module.classList.add('disabled');
        module.style.opacity = '0.3';
        content.style.display = 'none';
        if (btn) btn.classList.remove('active');
        if (settings) settings.style.display = 'none';
        stopWeatherInterval();
    }
    
    saveWeatherState();
}

// ============================================
// ЗАПРОС ПОГОДЫ
// ============================================
async function fetchWeather() {
    console.log('🌤 fetchWeather(), enabled:', weatherEnabled);
    
    if (!weatherEnabled) {
        console.log('⏸️ Пропускаем запрос');
        return;
    }
    
    const content = document.getElementById('weatherContent');
    if (!content) return;
    
    content.style.display = 'block';
    content.innerHTML = '<div class="weather-loading">⏳ Загрузка...</div>';
    
    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(weatherCity)}&units=metric&lang=ru&appid=bd5e378503939ddaee76f12ad7a97608`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Ошибка ${response.status}`);
        }
        
        const data = await response.json();
        
        const icon = getWeatherIcon(data.weather[0].icon);
        const temp = Math.round(data.main.temp);
        const feelsLike = Math.round(data.main.feels_like);
        const desc = data.weather[0].description;
        const humidity = data.main.humidity;
        const wind = Math.round(data.wind.speed * 3.6);
        const cityName = data.name;
        
        content.innerHTML = `
            <div class="weather-info">
                <div class="weather-icon">${icon}</div>
                <div>
                    <div class="weather-temp">${temp}°C</div>
                    <div class="weather-desc">
                        ${capitalize(desc)}
                        <span class="weather-city">${cityName}</span>
                    </div>
                    <div class="weather-details">
                        <span>💧 ${humidity}%</span>
                        <span>💨 ${wind} км/ч</span>
                        <span>🌡️ ${feelsLike}°</span>
                    </div>
                </div>
            </div>
        `;
        
    } catch (error) {
        content.innerHTML = `
            <div class="weather-error">
                ⚠️ ${error.message || 'Не удалось загрузить погоду'}
            </div>
        `;
        console.error('Weather error:', error);
    }
}

// ============================================
// ИНТЕРВАЛ
// ============================================
function startWeatherInterval() {
    if (weatherInterval) clearInterval(weatherInterval);
    weatherInterval = setInterval(fetchWeather, 600000);
}

function stopWeatherInterval() {
    if (weatherInterval) {
        clearInterval(weatherInterval);
        weatherInterval = null;
    }
}

// ============================================
// НАСТРОЙКИ
// ============================================
function toggleWeatherSettings() {
    if (!weatherEnabled) {
        alert('Сначала включите погоду!');
        return;
    }
    const settings = document.getElementById('weatherSettings');
    settings.style.display = settings.style.display === 'none' ? 'block' : 'none';
    if (settings.style.display === 'block') {
        document.getElementById('cityInput').focus();
    }
}

function saveCity() {
    const city = document.getElementById('cityInput').value.trim();
    if (!city) return;
    weatherCity = city;
    localStorage.setItem('weather_city', city);
    document.getElementById('weatherSettings').style.display = 'none';
    fetchWeather();
    showToast(`🌤 ${city}`);
}

// ============================================
// ВСПОМОГАТЕЛЬНЫЕ
// ============================================
function getWeatherIcon(code) {
    const map = {
        '01d': '☀️', '01n': '🌙',
        '02d': '⛅', '02n': '☁️',
        '03d': '☁️', '03n': '☁️',
        '04d': '☁️', '04n': '☁️',
        '09d': '🌧️', '09n': '🌧️',
        '10d': '🌦️', '10n': '🌧️',
        '11d': '⛈️', '11n': '⛈️',
        '13d': '❄️', '13n': '❄️',
        '50d': '🌫️', '50n': '🌫️'
    };
    return map[code] || '🌤️';
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================
function initWeather() {
    console.log('🌤 Инициализация погоды...');
    
    loadWeatherState();
    
    console.log('🌤 weatherEnabled:', weatherEnabled);
    console.log('🌤 weatherCity:', weatherCity);
    
    const module = document.getElementById('weatherModule');
    const btn = document.getElementById('weatherToggleBtn');
    const settingsBtn = document.getElementById('weatherSettingsBtn');
    const saveBtn = document.getElementById('citySaveBtn');
    const content = document.getElementById('weatherContent');
    const input = document.getElementById('cityInput');
    
    // ВЕШАЕМ ОБРАБОТЧИКИ
    if (btn) {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🔘 Клик по кнопке погоды!');
            toggleWeather();
        });
        console.log('✅ Обработчик на toggle повешен');
    }
    
    if (settingsBtn) {
        settingsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🔘 Клик по настройкам');
            toggleWeatherSettings();
        });
    }
    
    if (saveBtn) {
        saveBtn.addEventListener('click', function(e) {
            e.preventDefault();
            saveCity();
        });
    }
    
    if (input) {
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') saveCity();
        });
    }
    
    // Применяем состояние
    if (weatherEnabled) {
        module.classList.remove('disabled');
        module.style.opacity = '1';
        content.style.display = 'block';
        if (btn) btn.classList.add('active');
        fetchWeather();
        startWeatherInterval();
    } else {
        module.classList.add('disabled');
        module.style.opacity = '0.3';
        content.style.display = 'none';
        if (btn) btn.classList.remove('active');
        stopWeatherInterval();
    }
}

// ============================================
// ЗАПУСК
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    initWeather();
});

