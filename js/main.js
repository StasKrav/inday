
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

    // ============================================
    // ⌘E / Ctrl+E — открыть редактор публичных событий
    // ============================================
    if ((e.metaKey || e.ctrlKey) && e.key === "e") {
        e.preventDefault();
        
        // Проверяем, есть ли функция
        if (typeof openPublicEventEditor === 'function') {
            // Если админ-режим уже включён — открываем редактор
            // Если нет — показываем окно входа
            openPublicEventEditor();
        } else {
            console.warn('⚠️ openPublicEventEditor не найдена');
            showToast('❌ Редактор недоступен', true);
        }
    }

    // Escape — закрыть модалки
        if (e.key === "Escape") {
            // Закрываем модалки с проверкой на существование
            if (typeof closeAddEventModal === 'function') closeAddEventModal();
            if (typeof closeViewEventModal === 'function') closeViewEventModal();
            if (typeof closeConfirmDialog === 'function') closeConfirmDialog();
            if (typeof closeDetails === 'function') closeDetails(); // ✅ Теперь есть проверка
            if (typeof closeAdminLoginModal === 'function') closeAdminLoginModal();
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

// ============================================
// ПРОВЕРКА ПОДДЕРЖКИ API
// ============================================

function isFileSystemAccessSupported() {
    return 'showDirectoryPicker' in window && 'showOpenFilePicker' in window;
}

// Показываем уведомление при загрузке
document.addEventListener('DOMContentLoaded', function() {
    if (isFileSystemAccessSupported()) {
        console.log('✅ File System Access API поддерживается');
    } else {
        console.log('ℹ️ File System Access API не поддерживается, используется стандартное скачивание');
    }
});

function toggleAdminMode() {
    const isAdmin = localStorage.getItem('calendar_admin_mode') === 'true';
    if (isAdmin) {
        localStorage.removeItem('calendar_admin_mode');
        showToast('👋 Админ-режим выключен');
        location.reload(); // Перезагружаем для обновления UI
    } else {
        showAdminLoginModal();
    }
}

function showAdminLoginModal() {
    document.getElementById('adminLoginModal').classList.add('visible');
    setTimeout(() => {
        document.getElementById('adminPasswordInput').focus();
    }, 100);
}

function closeAdminLoginModal() {
    document.getElementById('adminLoginModal').classList.remove('visible');
}

function tryAdminLogin() {
    const password = document.getElementById('adminPasswordInput').value;
    // Замените 'your_secret_password' на свой пароль
    if (password === 'stas321') {
        localStorage.setItem('calendar_admin_mode', 'true');
        closeAdminLoginModal();
        showToast('✅ Админ-режим включен');
        location.reload();
    } else {
        showToast('❌ Неверный пароль', true);
        document.getElementById('adminPasswordInput').value = '';
        document.getElementById('adminPasswordInput').focus();
    }
}
