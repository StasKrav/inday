
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

        // ⌘Alt+B / Ctrl+Alt+B — открыть редактор блоков
        if ((e.metaKey || e.ctrlKey) && e.altKey && e.key === "b") {
            e.preventDefault();
            console.log('⌘Alt+B нажат!');
            if (typeof openBlockEditor === 'function') {
                openBlockEditor();
            } else {
                showToast('❌ Редактор блоков не найден', true);
            }
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
    const modal = document.getElementById('adminLoginModal');
    if (!modal) {
        // Если модалки нет — создаём её скрыто
        createAdminLoginModal();
        return;
    }
    modal.classList.add('visible');
    setTimeout(() => {
        const input = document.getElementById('adminPasswordInput');
        if (input) {
            input.value = '';
            input.focus();
        }
    }, 100);
}

function createAdminLoginModal() {
    // Минималистичная модалка без намёков на админку
    const modal = document.createElement('div');
    modal.id = 'adminLoginModal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 360px;">
            <div class="modal-header">
                <h3 style="font-size:16px;">🔐 Доступ</h3>
                <button class="modal-close" onclick="closeAdminLoginModal()">✕</button>
            </div>
            <div class="modal-body">
                <div class="field">
                    <label>Код доступа</label>
                    <input type="password" class="field-input" id="adminPasswordInput" 
                           placeholder="Введите код..." 
                           onkeydown="if(event.key==='Enter') tryAdminLogin()">
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-cancel" onclick="closeAdminLoginModal()">Отмена</button>
                <button class="btn-save" onclick="tryAdminLogin()">Войти</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function closeAdminLoginModal() {
    document.getElementById('adminLoginModal').classList.remove('visible');
}

// ============================================
// ВХОД В АДМИН-РЕЖИМ (БЕЗ ПОДСКАЗОК)
// ============================================

function tryAdminLogin() {
    const password = document.getElementById('adminPasswordInput')?.value || '';
    
    // ПРОВЕРКА БЕЗ ПОДСКАЗОК
    if (password === 'Inday2024@Secure!') {  // ← СВОЙ ПАРОЛЬ
        localStorage.setItem('calendar_admin_mode', 'true');
        closeAdminLoginModal();
        
        // Открываем редактор без лишних сообщений
        setTimeout(() => {
            if (typeof openPublicEventEditor === 'function') {
                openPublicEventEditor();
            }
        }, 300);
    } else {
        // ❌ НЕВЕРНЫЙ ПАРОЛЬ — просто очищаем поле без подсказок
        const input = document.getElementById('adminPasswordInput');
        if (input) {
            input.value = '';
            input.focus();
            input.style.borderColor = '#ef4444';
            setTimeout(() => {
                input.style.borderColor = '';
            }, 500);
        }
    }
}
