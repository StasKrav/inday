// ============================================
// filters.js - ПРАВИЛЬНАЯ ЛОГИКА
// ============================================

// ============================================
// СОСТОЯНИЕ
// ============================================

const state = {
    // Выбранный тег (null = нет фильтра по тегу)
    selectedTag: null,
    
    // Режим "показать все" (true = показываем все события без ограничений по дате)
    showAll: false,
    
    // Поисковый запрос
    searchQuery: ''
};

// ============================================
// ГЛАВНАЯ ФУНКЦИЯ ФИЛЬТРАЦИИ
// ============================================

function getFilteredEvents() {
    let events = [...calendarEvents];
    
    // 1. Поиск (всегда первый)
    if (state.searchQuery.trim()) {
        const q = state.searchQuery.toLowerCase().trim();
        events = events.filter(e => 
            e.title.toLowerCase().includes(q) ||
            (e.description && e.description.toLowerCase().includes(q))
        );
    }
    
    // 2. Фильтр по тегу (если выбран)
    if (state.selectedTag) {
        events = events.filter(e => e.tags && e.tags.includes(state.selectedTag));
    }
    
    // 3. Фильтр по дате (только если НЕ включен режим "показать все")
    if (!state.showAll) {
        events = filterByDate(events);
    }
    
    return events;
}

// ============================================
// ФИЛЬТР ПО ДАТЕ
// ============================================

function filterByDate(events) {
    if (currentView === 'day') {
        const dateStr = formatDateKey(selectedDate);
        return events.filter(e => e.date === dateStr);
    }
    
    if (currentView === 'week') {
        const start = getWeekStart(selectedDate);
        const end = new Date(start);
        end.setDate(end.getDate() + 6);
        
        return events.filter(e => {
            const d = parseDateKey(e.date);
            return d >= start && d <= end;
        });
    }
    
    if (currentView === 'month') {
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();
        return events.filter(e => {
            const d = parseDateKey(e.date);
            return d.getMonth() === month && d.getFullYear() === year;
        });
    }
    
    return events;
}

// ============================================
// УПРАВЛЕНИЕ ФИЛЬТРАМИ
// ============================================

/**
 * Клик по кнопке "Все"
 * Переключает режим показа всех событий
 */
function toggleAllMode() {
    // Переключаем showAll
    state.showAll = !state.showAll;
    
    // Если включаем showAll - показываем подсказку
    if (state.showAll) {
        if (state.selectedTag) {
            const tagName = tags[state.selectedTag]?.name || '';

        } else {

        }
    } else {
        // Выключаем showAll - возвращаемся к периоду
        if (state.selectedTag) {
            const tagName = tags[state.selectedTag]?.name || '';
 
        } else {

        }
    }
    
    applyFilters();
}

/**
 * Клик по тегу
 * Выбирает/снимает тег для фильтрации
 */
function selectTag(tagId) {
    if (!tags[tagId]) return;
    
    // Если уже выбран этот тег - снимаем
    if (state.selectedTag === tagId) {
        state.selectedTag = null;
        
        // Показываем подсказку в зависимости от состояния showAll
        if (state.showAll) {
 
        } else {

        }
    } else {
        // Выбираем тег
        state.selectedTag = tagId;
        
        // Показываем подсказку в зависимости от состояния showAll
        if (state.showAll) {


        }
    }
    
    applyFilters();
}

/**
 * Сброс всех фильтров
 * Возвращает состояние по умолчанию
 */
function resetFilters() {
    state.selectedTag = null;
    state.showAll = false;
    state.searchQuery = '';
    
    // Очищаем поле поиска
    const searchInput = document.getElementById('globalSearch');
    if (searchInput) searchInput.value = '';
    
    applyFilters();

}

// ============================================
// ПРИМЕНЕНИЕ ФИЛЬТРОВ
// ============================================

function applyFilters() {
    if (typeof renderMiniCalendar === 'function') renderMiniCalendar();
    if (typeof renderTimeline === 'function') renderTimeline();
    if (typeof updateViewTitle === 'function') updateViewTitle();
    updateFilterUI();
}

// ============================================
// ОБНОВЛЕНИЕ UI
// ============================================

function updateFilterUI() {
    // 1. Кнопка "Все"
    const allChip = document.querySelector('.chip[data-filter="all"]');
    if (allChip) {
        // Активна ТОЛЬКО когда включен showAll
        allChip.classList.toggle('active', state.showAll);
        
        // Обновляем текст кнопки
        if (state.showAll) {
            if (state.selectedTag) {
                const tagName = tags[state.selectedTag]?.name || '';
                allChip.textContent = `Все (${tagName})`;
            } else {
                allChip.textContent = 'Все';
            }
        } else {
            allChip.textContent = 'Все';
        }
    }
    
    // 2. Теги
    document.querySelectorAll('.chip[data-filter]').forEach(el => {
        const filter = el.dataset.filter;
        if (filter === 'all') return;
        
        // Активен только когда выбран этот тег
        // НЕ зависит от состояния showAll!
        const isActive = state.selectedTag === filter;
        el.classList.toggle('active', isActive);
    });
}

// ============================================
// ВСПОМОГАТЕЛЬНЫЕ
// ============================================

function getViewName() {
    const names = { day: 'дне', week: 'неделе', month: 'месяце' };
    return names[currentView] || 'дне';
}

function getEmptyMessage() {
    if (state.searchQuery) {
        return `Ничего не найдено по запросу "${state.searchQuery}"`;
    }
    
    if (state.selectedTag) {
        const tagName = tags[state.selectedTag]?.name || '';
        if (state.showAll) {
            return `Нет событий с тегом "${tagName}"`;
        } else {
            return `Нет событий с тегом "${tagName}" в ${getViewName()}`;
        }
    }
    
    if (state.showAll) {
        return 'Нет событий';
    }
    
    return `Нет событий в ${getViewName()}`;
}

// ============================================
// ПОИСК
// ============================================

function initSearch() {
    const input = document.getElementById('globalSearch');
    if (!input) return;
    
    let timeout;
    input.addEventListener('input', function() {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            state.searchQuery = this.value;
            applyFilters();
        }, 300);
    });
}

// ============================================
// ЭКСПОРТ
// ============================================

window.state = state;
window.getFilteredEvents = getFilteredEvents;
window.toggleAllMode = toggleAllMode;
window.selectTag = selectTag;
window.resetFilters = resetFilters;
window.applyFilters = applyFilters;
window.updateFilterUI = updateFilterUI;
window.getEmptyMessage = getEmptyMessage;
window.initSearch = initSearch;

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    initSearch();
    resetFilters();
});
