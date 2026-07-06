// ============================================
// ПОГОДА - ЧИСТАЯ ВЕРСИЯ
// ============================================

let weatherCity = "Perm";
let weatherEnabled = true;
let weatherInterval = null;
let weatherInitDone = false;

// ============================================
// ЗАГРУЗКА СОСТОЯНИЯ
// ============================================
function loadWeatherState() {
    const savedCity = localStorage.getItem("weather_city");
    if (savedCity) weatherCity = savedCity;

    const savedEnabled = localStorage.getItem("weather_enabled");
    if (savedEnabled !== null) {
        weatherEnabled = savedEnabled === "true";
    } else {
        weatherEnabled = true;
        localStorage.setItem("weather_enabled", "true");
    }
}

function saveWeatherState() {
    localStorage.setItem("weather_enabled", String(weatherEnabled));
    localStorage.setItem("weather_city", weatherCity);
}

// ============================================
// ВКЛ/ВЫКЛ ПОГОДЫ
// ============================================
function toggleWeather() {
    weatherEnabled = !weatherEnabled;
    
    const module = document.getElementById("weatherModule");
    const btn = document.getElementById("weatherToggleBtn");
    const content = document.getElementById("weatherContent");
    const settings = document.getElementById("weatherSettings");
    
    console.log(`🌤 toggleWeather(), теперь: ${weatherEnabled ? 'ВКЛ' : 'ВЫКЛ'}`);
    
    if (weatherEnabled) {
        module?.classList.remove("disabled");
        module.style.opacity = "1";
        content.style.display = "block";
        btn?.classList.add("active");
        if (settings) settings.style.display = "none";
        fetchWeather();
        startWeatherInterval();
    } else {
        module?.classList.add("disabled");
        module.style.opacity = "0.3";
        content.style.display = "none";
        btn?.classList.remove("active");
        if (settings) settings.style.display = "none";
        stopWeatherInterval();
    }
    
    saveWeatherState();
}

// ============================================
// ЗАПРОС ПОГОДЫ
// ============================================
async function fetchWeather() {
    if (!weatherEnabled) {
        console.log('🌤 Погода отключена');
        return;
    }
    
    const city = weatherCity || 'Perm';
    const apiKey = 'bd5e378503939ddaee76f12ad7a97608';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&lang=ru&appid=${apiKey}`;
    
    console.log(`🌤 Запрос погоды для: ${city}`);
    
    const content = document.getElementById("weatherContent");
    if (content) {
        content.innerHTML = `
            <div style="text-align:center;padding:15px;opacity:0.6;">
                <div style="display:inline-block;width:20px;height:20px;border:2px solid var(--border);border-top:2px solid var(--primary);border-radius:50%;animation:spin 0.8s linear infinite;"></div>
                <br><small style="margin-top:8px;display:block;">Загрузка...</small>
            </div>
        `;
    }
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            if (response.status === 429) {
                console.warn('⚠️ Лимит запросов к API погоды превышен');
                if (content) {
                    content.innerHTML = `
                        <div style="text-align:center;padding:20px;opacity:0.5;">
                            ⚠️ Лимит запросов<br>
                            <small style="font-size:11px;">Попробуйте через 5-10 минут</small>
                        </div>
                    `;
                }
                return;
            }
            throw new Error(`Ошибка ${response.status}`);
        }
        
        const data = await response.json();
        renderWeather(data);
        
    } catch (error) {
        console.error('❌ Weather error:', error);
        if (content) {
            content.innerHTML = `
                <div style="text-align:center;padding:20px;opacity:0.5;">
                    ❌ Ошибка загрузки<br>
                    <small style="font-size:11px;">${error.message}</small>
                </div>
            `;
        }
    }
}

// ============================================
// ОТРИСОВКА ПОГОДЫ
// ============================================
function renderWeather(data) {
    const content = document.getElementById("weatherContent");
    if (!content) return;
    
    const temp = Math.round(data.main.temp);
    const feelsLike = Math.round(data.main.feels_like);
    const description = data.weather[0].description;
    const icon = data.weather[0].icon;
    const city = data.name;
    const humidity = data.main.humidity;
    const wind = Math.round(data.wind.speed);
    const pressure = data.main.pressure;
    
    // Используем картинку с OpenWeather
    const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;
    
    content.innerHTML = `
        <div style="display:flex;align-items:center;gap:12px;padding:4px 0;">
            <div style="flex-shrink:0;">
                <img src="${iconUrl}" alt="${description}" style="width:48px;height:48px;display:block;">
            </div>
            <div style="flex:1;min-width:0;">
                <div style="font-size:22px;font-weight:600;line-height:1.2;">
                    ${temp}°
                    <span style="font-size:14px;font-weight:400;opacity:0.6;margin-left:4px;">C</span>
                </div>
                <div style="font-size:13px;opacity:0.7;text-transform:capitalize;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                    ${description}
                </div>
                <div style="font-size:11px;opacity:0.5;margin-top:2px;">
                    ${city} • ощущается ${feelsLike}°
                </div>
            </div>
            <div style="text-align:right;font-size:12px;opacity:0.5;line-height:1.6;flex-shrink:0;">
                <div>💧 ${humidity}%</div>
                <div>🌬 ${wind} м/с</div>
                <div>📊 ${pressure} гПа</div>
            </div>
        </div>
    `;
}

// ============================================
// ИНТЕРВАЛ ОБНОВЛЕНИЯ (10 минут)
// ============================================
function startWeatherInterval() {
    stopWeatherInterval();
    weatherInterval = setInterval(() => {
        console.log('🔄 Обновление погоды по таймеру');
        fetchWeather();
    }, 600000); // 10 минут
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
        showToast('❌ Сначала включите погоду', true);
        return;
    }
    const settings = document.getElementById("weatherSettings");
    if (!settings) return;
    
    const isVisible = settings.style.display === "block";
    settings.style.display = isVisible ? "none" : "block";
    
    if (!isVisible) {
        const input = document.getElementById("cityInput");
        if (input) {
            input.value = weatherCity;
            setTimeout(() => input.focus(), 100);
        }
    }
}

function saveCity() {
    const input = document.getElementById("cityInput");
    if (!input) return;
    
    const city = input.value.trim();
    if (!city) {
        showToast('❌ Введите название города', true);
        return;
    }
    
    weatherCity = city;
    saveWeatherState();
    
    const settings = document.getElementById("weatherSettings");
    if (settings) settings.style.display = "none";
    
    showToast(`✅ Город сохранен: ${city}`);
    fetchWeather();
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ (ОДИН РАЗ)
// ============================================
function initWeather() {
    // Защита от повторной инициализации
    if (weatherInitDone) {
        console.log('🌤 Погода уже инициализирована');
        return;
    }
    weatherInitDone = true;
    
    console.log('🌤 Инициализация погоды...');
    
    loadWeatherState();
    console.log(`🌤 weatherEnabled: ${weatherEnabled}, weatherCity: ${weatherCity}`);
    
    const module = document.getElementById("weatherModule");
    const btn = document.getElementById("weatherToggleBtn");
    const settingsBtn = document.getElementById("weatherSettingsBtn");
    const saveBtn = document.getElementById("citySaveBtn");
    const content = document.getElementById("weatherContent");
    const input = document.getElementById("cityInput");
    
    // Устанавливаем город в input
    if (input) input.value = weatherCity;
    
    // Вешаем обработчики (только один раз!)
    if (btn && !btn._listenerAdded) {
        btn._listenerAdded = true;
        btn.addEventListener("click", function(e) {
            e.preventDefault();
            console.log("🔘 Клик по кнопке погоды!");
            toggleWeather();
        });
        console.log("✅ Обработчик на toggle повешен");
    }
    
    if (settingsBtn && !settingsBtn._listenerAdded) {
        settingsBtn._listenerAdded = true;
        settingsBtn.addEventListener("click", function(e) {
            e.preventDefault();
            console.log("🔘 Клик по настройкам");
            toggleWeatherSettings();
        });
    }
    
    if (saveBtn && !saveBtn._listenerAdded) {
        saveBtn._listenerAdded = true;
        saveBtn.addEventListener("click", function(e) {
            e.preventDefault();
            saveCity();
        });
    }
    
    if (input && !input._listenerAdded) {
        input._listenerAdded = true;
        input.addEventListener("keydown", function(e) {
            if (e.key === "Enter") saveCity();
        });
    }
    
    // Применяем состояние
    if (weatherEnabled) {
        module?.classList.remove("disabled");
        module.style.opacity = "1";
        content.style.display = "block";
        btn?.classList.add("active");
        
        // Загружаем погоду с задержкой
        setTimeout(() => {
            fetchWeather();
        }, 500);
        startWeatherInterval();
    } else {
        module?.classList.add("disabled");
        module.style.opacity = "0.3";
        content.style.display = "none";
        btn?.classList.remove("active");
        stopWeatherInterval();
    }
}

// ============================================
// ЗАПУСК ПРИ ЗАГРУЗКЕ
// ============================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWeather);
} else {
    initWeather();
}

// ============================================
// ЭКСПОРТ ДЛЯ ГЛОБАЛЬНОГО ДОСТУПА
// ============================================
window.toggleWeather = toggleWeather;
window.fetchWeather = fetchWeather;
window.saveCity = saveCity;
window.toggleWeatherSettings = toggleWeatherSettings;
window.weatherEnabled = weatherEnabled;
window.weatherCity = weatherCity;
