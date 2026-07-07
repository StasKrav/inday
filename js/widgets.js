// ============================================
// ПОГОДА - ЯНДЕКС (30 запросов/сутки)
// ============================================

let weatherCity = "Perm";
let weatherEnabled = true;
let weatherInterval = null;
let weatherInitDone = false;
let lastWeatherUpdate = null;
let weatherData = null;

// Координаты городов (можно добавить свои)
const CITY_COORDS = {
    'moscow': { lat: 55.7558, lon: 37.6173 },
    'perm': { lat: 58.0104, lon: 56.2294 },
    'spb': { lat: 59.9343, lon: 30.3351 },
    'ekb': { lat: 56.8389, lon: 60.6057 },
    'novosibirsk': { lat: 55.0084, lon: 82.9357 },
    'kazan': { lat: 55.7887, lon: 49.1221 },
    'nnovgorod': { lat: 56.3287, lon: 44.0020 },
    'chelyabinsk': { lat: 55.1644, lon: 61.4368 },
    'omsk': { lat: 54.9885, lon: 73.3242 },
    'samara': { lat: 53.1959, lon: 50.1002 },
    'rostov': { lat: 47.2357, lon: 39.7015 },
    'ufa': { lat: 54.7355, lon: 55.9919 },
    'krasnoyarsk': { lat: 56.0106, lon: 92.8526 },
    'voronezh': { lat: 51.6608, lon: 39.2003 },
    'perm': { lat: 58.0104, lon: 56.2294 }
};

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
    
    // Загружаем кэш
    const cached = localStorage.getItem("weather_cache");
    if (cached) {
        try {
            const parsed = JSON.parse(cached);
            if (parsed.data && parsed.timestamp) {
                const age = Date.now() - parsed.timestamp;
                if (age < 3600000) { // час
                    weatherData = parsed.data;
                    lastWeatherUpdate = parsed.timestamp;
                    console.log('🌤 Загружены кэшированные данные погоды');
                }
            }
        } catch (e) {}
    }
}

function saveWeatherState() {
    localStorage.setItem("weather_enabled", String(weatherEnabled));
    localStorage.setItem("weather_city", weatherCity);
}

function saveWeatherCache(data) {
    const cache = {
        data: data,
        timestamp: Date.now()
    };
    localStorage.setItem("weather_cache", JSON.stringify(cache));
    weatherData = data;
    lastWeatherUpdate = Date.now();
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
// ПОЛУЧЕНИЕ КООРДИНАТ ПО НАЗВАНИЮ ГОРОДА
// ============================================
function getCoords(city) {
    const key = city.toLowerCase().trim();
    // Если есть точное совпадение
    if (CITY_COORDS[key]) {
        return CITY_COORDS[key];
    }
    
    // Поиск по вхождению
    for (const [name, coords] of Object.entries(CITY_COORDS)) {
        if (name.includes(key) || key.includes(name)) {
            return coords;
        }
    }
    
    // По умолчанию Москва
    console.warn(`⚠️ Город "${city}" не найден, используем Москву`);
    return CITY_COORDS['moscow'];
}

// ============================================
// ЗАПРОС ПОГОДЫ (Яндекс)
// ============================================
async function fetchWeather() {
    if (!weatherEnabled) {
        console.log('🌤 Погода отключена');
        return;
    }
    
    // Проверяем кэш - если обновлялись меньше часа назад, используем кэш
    if (weatherData && lastWeatherUpdate) {
        const age = Date.now() - lastWeatherUpdate;
        if (age < 3600000) { // меньше часа
            console.log(`🌤 Используем кэш (${Math.round(age/60000)} мин назад)`);
            renderWeather(weatherData);
            return;
        }
    }
    
    const coords = getCoords(weatherCity);
    // ВАЖНО: замените на ваш реальный ключ от Яндекса
    const apiKey = '95f105f1-349c-4a4c-ab0e-60d285e7fd45';
    const url = `https://api.weather.yandex.ru/v2/forecast?lat=${coords.lat}&lon=${coords.lon}`;
    
    console.log(`🌤 Запрос погоды для: ${weatherCity} (${coords.lat}, ${coords.lon})`);
    
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
        const response = await fetch(url, {
            headers: {
                'X-Yandex-Weather-Key': apiKey
            }
        });
        
        if (!response.ok) {
            if (response.status === 429) {
                console.warn('⚠️ Лимит запросов Яндекс Погоды превышен');
                if (weatherData) {
                    renderWeather(weatherData);
                    content.innerHTML += `
                        <div style="text-align:center;padding:4px;font-size:11px;opacity:0.4;">
                            ⚠️ Данные от ${new Date(lastWeatherUpdate).toLocaleTimeString()}
                        </div>
                    `;
                } else {
                    if (content) {
                        content.innerHTML = `
                            <div style="text-align:center;padding:20px;opacity:0.5;">
                                ⚠️ Лимит запросов<br>
                                <small style="font-size:11px;">Попробуйте через час</small>
                            </div>
                        `;
                    }
                }
                return;
            }
            throw new Error(`Ошибка ${response.status}`);
        }
        
        const data = await response.json();
        saveWeatherCache(data);
        renderWeather(data);
        
    } catch (error) {
        console.error('❌ Weather error:', error);
        if (weatherData) {
            renderWeather(weatherData);
            if (content) {
                content.innerHTML += `
                    <div style="text-align:center;padding:4px;font-size:11px;color:#ef4444;opacity:0.6;">
                        ⚠️ Ошибка обновления, показаны кэшированные данные
                    </div>
                `;
            }
        } else {
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
}

// ============================================
// ОТРИСОВКА ПОГОДЫ (Яндекс) - С SVG ИКОНКАМИ
// ============================================
function renderWeather(data) {
    const content = document.getElementById("weatherContent");
    if (!content) return;
    
    const fact = data.fact;
    const city = data.geo_object?.locality?.name || weatherCity;
    
    // Получаем SVG иконку по состоянию погоды
    const weatherIcon = getWeatherSVG(fact.condition);
    
    content.innerHTML = `
        <div style="display:flex;align-items:center;gap:12px;padding:4px 0;">
            <div style="flex-shrink:0;width:48px;height:48px;display:flex;align-items:center;justify-content:center;">
                ${weatherIcon}
            </div>
            <div style="flex:1;min-width:0;">
                <div style="font-size:22px;font-weight:600;line-height:1.2;">
                    ${Math.round(fact.temp)}°
                    <span style="font-size:14px;font-weight:400;opacity:0.6;margin-left:4px;">C</span>
                </div>
                <div style="font-size:13px;opacity:0.7;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                    ${getWeatherDescription(fact.condition)}
                </div>
                <div style="font-size:11px;opacity:0.5;margin-top:2px;">
                    ${city} • ощущается ${Math.round(fact.feels_like)}°
                </div>
            </div>
            <div style="text-align:right;font-size:12px;opacity:0.5;line-height:1.8;flex-shrink:0;">
                <div>${fact.humidity}%</div>
                <div>${Math.round(fact.wind_speed)} м/с</div>
                <div>${fact.pressure_mm} мм</div>
            </div>
        </div>
        <div style="font-size:10px;opacity:0.3;text-align:right;margin-top:2px;">
            обновлено ${new Date().toLocaleTimeString()}
        </div>
    `;
}

// ============================================
// ПОЛУЧЕНИЕ SVG ИКОНКИ ПО СОСТОЯНИЮ ПОГОДЫ
// ============================================
function getWeatherSVG(condition) {
    const color = '#f59e0b'; // Основной цвет
    
    const icons = {
        'clear': `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"/>
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>`,
        
        'partly-cloudy': `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2a9 9 0 0 1 9 9"/>
            <path d="M8 17a5 5 0 0 1 0-10 5 5 0 0 1 9.9-1.1"/>
            <path d="M17 8a4 4 0 0 1 0 8h-9a4 4 0 0 1 0-8"/>
        </svg>`,
        
        'cloudy': `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z"/>
        </svg>`,
        
        'overcast': `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z"/>
            <path d="M3 12h18" stroke-opacity="0.5"/>
        </svg>`,
        
        'light-rain': `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z"/>
            <path d="M10 19v2M14 19v2M18 19v2" stroke="#60a5fa"/>
        </svg>`,
        
        'rain': `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z"/>
            <path d="M9 19v2M13 19v2M17 19v2" stroke="#60a5fa"/>
        </svg>`,
        
        'heavy-rain': `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z"/>
            <path d="M8 19v2M12 19v2M16 19v2M20 19v2" stroke="#60a5fa"/>
        </svg>`,
        
        'snow': `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#e2e8f0" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z"/>
            <path d="M10 16l2-2M14 16l-2-2M12 12v4" stroke="#e2e8f0"/>
        </svg>`,
        
        'light-snow': `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#e2e8f0" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z"/>
            <path d="M12 14l-1 2M16 14l1 2" stroke="#e2e8f0"/>
        </svg>`,
        
        'heavy-snow': `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#e2e8f0" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z"/>
            <path d="M10 16l2-2M14 16l-2-2M12 14l-1 2M16 14l1 2" stroke="#e2e8f0"/>
        </svg>`,
        
        'thunderstorm': `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z"/>
            <path d="M12 14l-2 4h4l-2 4" stroke="#f59e0b"/>
        </svg>`,
        
        'fog': `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z"/>
            <path d="M5 16h14M6 19h12" stroke="#94a3b8" stroke-opacity="0.5"/>
        </svg>`
    };
    
    return icons[condition] || icons['clear'];
}

// ============================================
// ПОЛУЧЕНИЕ ОПИСАНИЯ ПО СОСТОЯНИЮ
// ============================================
function getWeatherDescription(condition) {
    const descriptions = {
        'clear': 'Ясно',
        'partly-cloudy': 'Малооблачно',
        'cloudy': 'Облачно',
        'overcast': 'Пасмурно',
        'light-rain': 'Небольшой дождь',
        'rain': 'Дождь',
        'heavy-rain': 'Сильный дождь',
        'snow': 'Снег',
        'light-snow': 'Небольшой снег',
        'heavy-snow': 'Сильный снег',
        'thunderstorm': 'Гроза',
        'fog': 'Туман'
    };
    return descriptions[condition] || condition || 'Неизвестно';
}

// ============================================
// ИНТЕРВАЛ ОБНОВЛЕНИЯ (РАЗ В ЧАС)
// ============================================
function startWeatherInterval() {
    stopWeatherInterval();
    // Обновляем раз в час (3600000 мс)
    weatherInterval = setInterval(() => {
        console.log('🔄 Обновление погоды по таймеру (раз в час)');
        fetchWeather();
    }, 3600000);
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
        
        // Если есть кэш - показываем сразу, потом обновляем
        if (weatherData) {
            renderWeather(weatherData);
        }
        
        // Загружаем актуальную погоду с задержкой
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
