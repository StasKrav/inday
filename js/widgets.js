// ============================================
// ПОГОДА - ПОЛНОСТЬЮ РАБОЧИЙ КОД
// ============================================

let weatherCity = "Perm";
let weatherEnabled = true;
let weatherInterval = null;

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
  localStorage.setItem("weather_enabled", weatherEnabled);
  localStorage.setItem("weather_city", weatherCity);
}

// ============================================
// ОСНОВНАЯ ФУНКЦИЯ ВКЛ/ВЫКЛ
// ============================================
function toggleWeather() {
  weatherEnabled = !weatherEnabled;

  const module = document.getElementById("weatherModule");
  const btn = document.getElementById("weatherToggleBtn");
  const content = document.getElementById("weatherContent");
  const settings = document.getElementById("weatherSettings");

  console.log("🌤 toggleWeather(), теперь включена?", weatherEnabled);

  if (weatherEnabled) {
    // ВКЛЮЧАЕМ
    module.classList.remove("disabled");
    module.style.opacity = "1";
    content.style.display = "block";
    if (btn) btn.classList.add("active");
    if (settings) settings.style.display = "none";
    fetchWeather();
    startWeatherInterval();
  } else {
    // ВЫКЛЮЧАЕМ
    module.classList.add("disabled");
    module.style.opacity = "0.3";
    content.style.display = "none";
    if (btn) btn.classList.remove("active");
    if (settings) settings.style.display = "none";
    stopWeatherInterval();
  }

  saveWeatherState();
}

// ============================================
// ЗАПРОС ПОГОДЫ
// ============================================
async function fetchWeather() {
  console.log("🌤 fetchWeather(), enabled:", weatherEnabled);

  if (!weatherEnabled) {
    console.log("⏸️ Пропускаем запрос");
    return;
  }

  const content = document.getElementById("weatherContent");
  if (!content) return;

  content.style.display = "block";
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

    const pressureHpa = data.main.pressure;
    const pressureMm = Math.round(pressureHpa * 0.750064);

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
                        <span>${pressureMm} мм</span>
                        <span>${humidity}%</span>
                        <span>${wind} км/ч</span>
                    </div>
                </div>
            </div>
        `;
  } catch (error) {
    content.innerHTML = `
            <div class="weather-error">
                ⚠️ ${error.message || "Не удалось загрузить погоду"}
            </div>
        `;
    console.error("Weather error:", error);
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
    alert("Сначала включите погоду!");
    return;
  }
  const settings = document.getElementById("weatherSettings");
  settings.style.display = settings.style.display === "none" ? "block" : "none";
  if (settings.style.display === "block") {
    document.getElementById("cityInput").focus();
  }
}

function saveCity() {
  const city = document.getElementById("cityInput").value.trim();
  if (!city) return;
  weatherCity = city;
  localStorage.setItem("weather_city", city);
  document.getElementById("weatherSettings").style.display = "none";
  fetchWeather();
  showToast(`🌤 ${city}`);
}

// ============================================
// ВСПОМОГАТЕЛЬНЫЕ
// ============================================
function getWeatherIcon(code) {
  const svg = (path, color = "#f59e0b", viewBox = "0 0 24 24") =>
    `<svg viewBox="${viewBox}" width="32" height="32" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;

  const icons = {
    "01d": svg(
      '<circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>',
      "#f59e0b",
    ),
    "01n": svg(
      '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
      "#94a3b8",
    ),
    "02d": svg(
      '<path d="M4 11.5A4.5 4.5 0 0 1 8.5 7h1.5A4.5 4.5 0 0 1 14.5 11.5"/><path d="M17 8a4 4 0 0 1 0 8h-9a4 4 0 0 1 0-8"/>',
      "#94a3b8",
    ),
    "02n": svg(
      '<path d="M12 2a9 9 0 1 0 9 9"/><path d="M17 8a4 4 0 0 1 0 8h-9a4 4 0 0 1 0-8"/>',
      "#94a3b8",
    ),
    "03d": svg('<path d="M17 8a4 4 0 0 1 0 8h-9a4 4 0 0 1 0-8"/>', "#94a3b8"),
    "03n": svg(
      '<path d="M12 2a9 9 0 1 0 9 9"/><path d="M17 8a4 4 0 0 1 0 8h-9a4 4 0 0 1 0-8"/>',
      "#94a3b8",
    ),
    "04d": svg('<path d="M3 12h18M5 8h14M7 4h10"/>', "#94a3b8"),
    "04n": svg(
      '<path d="M12 2a9 9 0 1 0 9 9"/><path d="M3 12h18M5 8h14M7 4h10"/>',
      "#94a3b8",
    ),
    "09d": svg(
      '<path d="M17 8a4 4 0 0 1 0 8h-9a4 4 0 0 1 0-8"/><path d="M8 12v4M12 11v5M16 12v4"/>',
      "#60a5fa",
    ),
    "09n": svg(
      '<path d="M12 2a9 9 0 1 0 9 9"/><path d="M17 8a4 4 0 0 1 0 8h-9a4 4 0 0 1 0-8"/><path d="M8 12v4M12 11v5M16 12v4"/>',
      "#60a5fa",
    ),
    "10d": svg(
      '<path d="M17 8a4 4 0 0 1 0 8h-9a4 4 0 0 1 0-8"/><path d="M12 16v4"/>',
      "#60a5fa",
    ),
    "10n": svg(
      '<path d="M12 2a9 9 0 1 0 9 9"/><path d="M17 8a4 4 0 0 1 0 8h-9a4 4 0 0 1 0-8"/><path d="M12 16v4"/>',
      "#60a5fa",
    ),
    "11d": svg(
      '<path d="M17 8a4 4 0 0 1 0 8h-9a4 4 0 0 1 0-8"/><path d="M12 6v3"/><path d="M9 10l4-2"/>',
      "#f59e0b",
    ),
    "11n": svg(
      '<path d="M12 2a9 9 0 1 0 9 9"/><path d="M17 8a4 4 0 0 1 0 8h-9a4 4 0 0 1 0-8"/><path d="M12 6v3"/><path d="M9 10l4-2"/>',
      "#f59e0b",
    ),
    "13d": svg(
      '<path d="M17 8a4 4 0 0 1 0 8h-9a4 4 0 0 1 0-8"/><path d="M12 12l-2 4h4l-2 4"/>',
      "#e2e8f0",
    ),
    "13n": svg(
      '<path d="M12 2a9 9 0 1 0 9 9"/><path d="M17 8a4 4 0 0 1 0 8h-9a4 4 0 0 1 0-8"/><path d="M12 12l-2 4h4l-2 4"/>',
      "#e2e8f0",
    ),
    "50d": svg(
      '<path d="M5 12h14"/><path d="M3 8h18"/><path d="M7 16h10"/>',
      "#94a3b8",
    ),
    "50n": svg(
      '<path d="M12 2a9 9 0 1 0 9 9"/><path d="M5 12h14"/><path d="M3 8h18"/><path d="M7 16h10"/>',
      "#94a3b8",
    ),
  };
  return icons[code] || icons["01d"];
}
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================
function initWeather() {
  console.log("🌤 Инициализация погоды...");

  loadWeatherState();

  console.log("🌤 weatherEnabled:", weatherEnabled);
  console.log("🌤 weatherCity:", weatherCity);

  const module = document.getElementById("weatherModule");
  const btn = document.getElementById("weatherToggleBtn");
  const settingsBtn = document.getElementById("weatherSettingsBtn");
  const saveBtn = document.getElementById("citySaveBtn");
  const content = document.getElementById("weatherContent");
  const input = document.getElementById("cityInput");

  // ВЕШАЕМ ОБРАБОТЧИКИ
  if (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      console.log("🔘 Клик по кнопке погоды!");
      toggleWeather();
    });
    console.log("✅ Обработчик на toggle повешен");
  }

  if (settingsBtn) {
    settingsBtn.addEventListener("click", function (e) {
      e.preventDefault();
      console.log("🔘 Клик по настройкам");
      toggleWeatherSettings();
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener("click", function (e) {
      e.preventDefault();
      saveCity();
    });
  }

  if (input) {
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") saveCity();
    });
  }

  // Применяем состояние
  if (weatherEnabled) {
    module.classList.remove("disabled");
    module.style.opacity = "1";
    content.style.display = "block";
    if (btn) btn.classList.add("active");
    fetchWeather();
    startWeatherInterval();
  } else {
    module.classList.add("disabled");
    module.style.opacity = "0.3";
    content.style.display = "none";
    if (btn) btn.classList.remove("active");
    stopWeatherInterval();
  }
}

// ============================================
// ЗАПУСК
// ============================================
document.addEventListener("DOMContentLoaded", function () {
  initWeather();
});
