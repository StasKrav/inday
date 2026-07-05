// ============================================
// НОВОСТИ
// ============================================

const NEWS_STATE = {
  enabled: false,
  category: "technology", // 'technology', 'business', 'science', 'health', 'sports', 'entertainment'
  country: "us",
  pageSize: 8,
};

// Загрузка состояния новостей
function loadNewsState() {
  const saved = localStorage.getItem("news_state");
  if (saved) {
    try {
      Object.assign(NEWS_STATE, JSON.parse(saved));
    } catch (e) {}
  }
}

function saveNewsState() {
  localStorage.setItem("news_state", JSON.stringify(NEWS_STATE));
}

// ============================================
// ВКЛЮЧИТЬ/ВЫКЛЮЧИТЬ НОВОСТИ
// ============================================
function toggleNews() {
  NEWS_STATE.enabled = !NEWS_STATE.enabled;
  const module = document.getElementById("newsModule");
  const btn = document.getElementById("newsToggleBtn");

  if (module) {
    module.style.display = NEWS_STATE.enabled ? "block" : "none";
  }
  if (btn) {
    btn.classList.toggle("active", NEWS_STATE.enabled);
  }

  saveNewsState();

  if (NEWS_STATE.enabled) {
    fetchNews();
  }
}

// ============================================
// ЗАПРОС НОВОСТЕЙ (бесплатный API)
// ============================================
async function fetchNews() {
  const content = document.getElementById("newsContent");
  if (!content) return;

  // Показываем загрузку
  content.innerHTML = '<div class="news-loading">📡 Загрузка новостей...</div>';

  // Анимация обновления
  const refreshBtn = document.querySelector(".news-refresh");
  if (refreshBtn) refreshBtn.classList.add("spinning");

  try {
    // Используем бесплатный NewsAPI (ограничение 100 запросов/день)
    const url = `https://newsapi.org/v2/top-headlines?country=${NEWS_STATE.country}&category=${NEWS_STATE.category}&pageSize=${NEWS_STATE.pageSize}&apiKey=78d5b7cd35d942c6b5a5e123c64cd5bd`;

    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 426) {
        throw new Error("Требуется обновление API ключа");
      }
      if (response.status === 429) {
        throw new Error("Превышен лимит запросов. Попробуйте позже.");
      }
      throw new Error(`Ошибка ${response.status}`);
    }

    const data = await response.json();

    if (data.status === "error") {
      throw new Error(data.message || "Ошибка загрузки новостей");
    }

    if (!data.articles || data.articles.length === 0) {
      content.innerHTML = `
                <div class="news-empty">
                    📭 Нет новостей в категории "${NEWS_STATE.category}"
                </div>
            `;
      return;
    }

    // Фильтруем статьи без заголовка
    const articles = data.articles.filter(
      (a) => a.title && a.title !== "[Removed]",
    );

    if (articles.length === 0) {
      content.innerHTML = `
                <div class="news-empty">📭 Новости не найдены</div>
            `;
      return;
    }

    // Рендерим новости
    content.innerHTML = articles
      .map(
        (article) => `
            <a href="${article.url}" target="_blank" class="news-item" title="${article.title}">
                ${
                  article.urlToImage
                    ? `
                    <img src="${article.urlToImage}" alt="" class="news-item-image" loading="lazy" onerror="this.style.display='none'">
                `
                    : ""
                }
                <div class="news-item-body">
                    <div class="news-item-title">${escapeHtml(article.title)}</div>
                    <div class="news-item-source">
                        ${article.source.name || "Неизвестный источник"}
                        ${
                          article.publishedAt
                            ? `
                            <span class="time">${formatNewsTime(article.publishedAt)}</span>
                        `
                            : ""
                        }
                    </div>
                </div>
            </a>
        `,
      )
      .join("");
  } catch (error) {
    console.error("News error:", error);
    content.innerHTML = `
            <div class="news-error">
                ⚠️ ${error.message || "Не удалось загрузить новости"}
                <br>
                <span style="font-size:11px;opacity:0.4;">Попробуйте обновить позже</span>
            </div>
        `;
  } finally {
    // Убираем анимацию
    const refreshBtn = document.querySelector(".news-refresh");
    if (refreshBtn) refreshBtn.classList.remove("spinning");
  }
}

// ============================================
// ФОРМАТИРОВАНИЕ ВРЕМЕНИ НОВОСТИ
// ============================================
function formatNewsTime(dateStr) {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000 / 60); // минуты

    if (diff < 1) return "только что";
    if (diff < 60) return `${diff} мин назад`;
    if (diff < 1440) return `${Math.floor(diff / 60)} ч назад`;
    return date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
  } catch (e) {
    return "";
  }
}

// ============================================
// ВЫБОР КАТЕГОРИИ (опционально)
// ============================================
function setNewsCategory(category) {
  NEWS_STATE.category = category;
  saveNewsState();
  if (NEWS_STATE.enabled) {
    fetchNews();
    showToast(`Категория: ${category}`);
  }
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================
function initNews() {
  loadNewsState();

  // Применяем состояние
  const module = document.getElementById("newsModule");
  const btn = document.getElementById("newsToggleBtn");

  if (module && NEWS_STATE.enabled) {
    module.style.display = "block";
    if (btn) btn.classList.add("active");
    fetchNews();
  }
}

// ============================================
// КАТЕГОРИИ (можно добавить в интерфейс)
// ============================================
const newsCategories = {
  technology: "💻 Технологии",
  business: "📈 Бизнес",
  science: "🔬 Наука",
  health: "🏥 Здоровье",
  sports: "⚽ Спорт",
  entertainment: "🎬 Развлечения",
  general: "📰 Главное",
};
