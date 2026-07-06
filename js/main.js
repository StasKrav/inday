
// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================

document.addEventListener("DOMContentLoaded", function () {
    // 1. Тема
    loadTheme();

    // 2. Данные
    loadCalendarEvents();
    loadTags();

    // 3. Рендеринг
    renderMiniCalendar();
    renderTimeline();
    renderTags();
    updateViewTitle();
    updateViewIcon();
    initTagColorPicker();

    // 4. Поиск
    const searchInput = document.getElementById("globalSearch");
    if (searchInput) {
        searchInput.addEventListener("input", function (e) {
            const term = e.target.value.trim();
            if (term.length > 0) {
                const results = calendarEvents.filter(
                    (e) =>
                        e.title.toLowerCase().includes(term.toLowerCase()) ||
                        (e.description &&
                            e.description.toLowerCase().includes(term.toLowerCase()))
                );
                // ✅ Используем функцию из timeline.js
                if (typeof window.showSearchResults === 'function') {
                    window.showSearchResults(results, term);
                }
            } else {
                renderTimeline();
                updateViewTitle();
            }
        });

        searchInput.addEventListener("keydown", function (e) {
            if (e.key === "Escape") {
                searchInput.value = "";
                searchInput.blur();
                renderTimeline();
                updateViewTitle();
            }
        });
    }
});

// ============================================
// ГОРЯЧИЕ КЛАВИШИ
// ============================================

document.addEventListener("keydown", function (e) {
    // ⌘K / Ctrl+K — фокус на поиск
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        const searchInput = document.getElementById("globalSearch");
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
    }

    // Escape — закрыть модалки
    if (e.key === "Escape") {
        closeAddEventModal();
        closeViewEventModal();
        closeConfirmDialog();
        closeDetails();
    }
});

// ============================================
// ИНИЦИАЛИЗАЦИЯ ЦВЕТОВ (для тегов)
// ============================================

function initTagColorPicker() {
    const container = document.getElementById("editTagColors");
    if (!container) return;

    const colors = [
        "#6366f1", "#8b5cf6", "#ec4899", "#ef4444", "#f59e0b",
        "#22c55e", "#06b6d4", "#14b8a6", "#f472b6"
    ];

    container.innerHTML = colors
        .map(
            (color) => `
                <div class="color-option" data-color="${color}" 
                     style="background:${color};" 
                     onclick="selectEditTagColor('${color}', this)">
                </div>
            `
        )
        .join("");
}

// ============================================
// ЭКСПОРТ
// ============================================

window.getWeekStart = getWeekStart;
window.initTagColorPicker = initTagColorPicker;
