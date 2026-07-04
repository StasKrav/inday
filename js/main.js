// ============================================
// TOAST
// ============================================
let toastTimeout;

function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) {
        // Создаём toast, если его нет
        const newToast = document.createElement('div');
        newToast.className = 'toast';
        newToast.id = 'toast';
        document.body.appendChild(newToast);
        return showToast(message);
    }
    toast.textContent = message;
    toast.style.display = 'flex';
    toast.classList.add('visible');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.classList.remove('visible');
        toast.style.display = 'none';
    }, 2500);
}

// ============================================
// THEME
// ============================================
function toggleTheme() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('keeprus_calendar_theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const icon = document.getElementById('themeIcon');
    if (!icon) return;
    if (theme === 'dark') {
        icon.innerHTML = `
            <circle cx="12" cy="12" r="5"/>
            <path d="M12 1v2"/>
            <path d="M12 21v2"/>
            <path d="M4.22 4.22l1.42 1.42"/>
            <path d="M18.36 18.36l1.42 1.42"/>
            <path d="M1 12h2"/>
            <path d="M21 12h2"/>
            <path d="M4.22 19.78l1.42-1.42"/>
            <path d="M18.36 5.64l1.42-1.42"/>
        `;
    } else {
        icon.innerHTML = `
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        `;
    }
}

function loadTheme() {
    const saved = localStorage.getItem('keeprus_calendar_theme');
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = saved || (prefersDark ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", theme);
    updateThemeIcon(theme);
}

// ============================================
// CONFIRM DIALOG
// ============================================
let confirmCallback = null;

function showConfirmDialog(title, message, okText, callback) {
    const dialog = document.getElementById('genericConfirmDialog');
    if (!dialog) return;
    document.getElementById('genericConfirmTitle').textContent = title || 'Подтверждение';
    document.getElementById('genericConfirmMessage').textContent = message || '';
    document.getElementById('genericConfirmOkBtn').textContent = okText || 'Подтвердить';
    confirmCallback = callback;
    dialog.classList.add('visible');
}

function closeConfirmDialog() {
    const dialog = document.getElementById('genericConfirmDialog');
    if (dialog) dialog.classList.remove('visible');
    confirmCallback = null;
}

document.addEventListener('DOMContentLoaded', function() {
    const okBtn = document.getElementById('genericConfirmOkBtn');
    const cancelBtn = document.getElementById('genericConfirmCancelBtn');
    const dialog = document.getElementById('genericConfirmDialog');
    
    if (okBtn) {
        okBtn.addEventListener('click', function() {
            if (confirmCallback) confirmCallback();
            closeConfirmDialog();
        });
    }
    if (cancelBtn) cancelBtn.addEventListener('click', closeConfirmDialog);
    if (dialog) {
        dialog.addEventListener('click', function(e) {
            if (e.target === e.currentTarget) closeConfirmDialog();
        });
    }
});

// ============================================
// UTILITY
// ============================================
function formatDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
}

function parseDateKey(dateStr) {
    if (!dateStr) return new Date();
    const parts = dateStr.split('-');
    return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
}

function getMonthName(month) {
    const names = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
                   'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    return names[month];
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}


let calendarEvents = [];
let currentDate = new Date();
let selectedDate = new Date();
let selectedEventColor = '#1a73e8';
let editingEventId = null;
let viewingEventId = null;
let currentDetailEventId = null;
let currentView = 'day'; // 'day', 'week', 'month'

function loadCalendarEvents() {
    const saved = localStorage.getItem('keeprus_calendar_events');
    if (saved) {
        try {
            calendarEvents = JSON.parse(saved);
            calendarEvents.forEach(event => {
                if (!event.id) event.id = Date.now() + Math.random();
            });
            return;
        } catch (e) {
            console.error('Ошибка загрузки событий:', e);
        }
    }
    calendarEvents = getDefaultEvents();
    saveCalendarEvents();
}

function getDefaultEvents() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(today);
    dayAfter.setDate(dayAfter.getDate() + 2);
    
    return [
        {
            id: Date.now(),
            title: 'Встреча с командой',
            date: formatDateKey(today),
            time: '14:00',
            color: '#6366f1',
            description: 'Обсуждение нового проекта'
        },
        {
            id: Date.now() + 1,
            title: 'Завершить проект',
            date: formatDateKey(tomorrow),
            time: '18:00',
            color: '#ef4444',
            description: 'Дедлайн по проекту'
        },
        {
            id: Date.now() + 2,
            title: 'Планёрка',
            date: formatDateKey(dayAfter),
            time: '10:00',
            color: '#22c55e',
            description: 'Еженедельная планерка'
        }
    ];
}

function saveCalendarEvents() {
    localStorage.setItem('keeprus_calendar_events', JSON.stringify(calendarEvents));
}


function renderMiniCalendar() {
    const grid = document.getElementById('miniGrid');
    const monthYear = document.getElementById('miniMonthYear');
    const count = document.getElementById('miniEventsCount');
    
    if (!grid || !monthYear || !count) return;
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    monthYear.textContent = getMonthName(month) + ' ' + year;
    
    const monthEvents = calendarEvents.filter(e => {
        const d = parseDateKey(e.date);
        return d.getMonth() === month && d.getFullYear() === year;
    });
    count.textContent = monthEvents.length + ' событий';
    
    const firstDay = new Date(year, month, 1);
    let firstDayOfWeek = firstDay.getDay();
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDayOfWeek);
    
    const today = new Date();
    const todayStr = formatDateKey(today);
    const selectedStr = formatDateKey(selectedDate);
    
    grid.innerHTML = '';
    
    for (let i = 0; i < 42; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        
        const dateStr = formatDateKey(date);
        const isCurrentMonth = date.getMonth() === month;
        const isToday = dateStr === todayStr;
        const isSelected = dateStr === selectedStr;
        const hasEvents = calendarEvents.some(e => e.date === dateStr);
        
        const dayBtn = document.createElement('button');
        dayBtn.className = 'day';
        if (!isCurrentMonth) dayBtn.classList.add('other-month');
        if (isToday) dayBtn.classList.add('today');
        if (isSelected) dayBtn.classList.add('selected');
        if (hasEvents) dayBtn.classList.add('has-event');
        
        dayBtn.textContent = date.getDate();
        dayBtn.title = date.toLocaleDateString('ru-RU', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        });
        
        dayBtn.addEventListener('click', () => {
            selectedDate = date;
            renderMiniCalendar();
            renderTimeline();
            updateViewTitle();
            // Очищаем поиск при смене дня
            const searchInput = document.getElementById('globalSearch');
            if (searchInput) searchInput.value = '';
        });
        
        grid.appendChild(dayBtn);
    }
}

function changeMonth(delta) {
    currentDate.setMonth(currentDate.getMonth() + delta);
    renderMiniCalendar();
}

function goToToday() {
    currentDate = new Date();
    selectedDate = new Date();
    renderMiniCalendar();
    renderTimeline();
    updateViewTitle();
    updateWidgets(selectedDate);  // ← ОБНОВЛЯЕМ ВИДЖЕТЫ
    
    // Очищаем поиск
    const searchInput = document.getElementById('globalSearch');
    if (searchInput) searchInput.value = '';
}


function renderTimeline() {
    const container = document.getElementById('timeline');
    if (!container) return;
    
    if (currentView === 'day') {
        renderDayView(container);
    } else if (currentView === 'week') {
        renderWeekView(container);
    } else {
        renderMonthView(container);
    }
}

function updateViewTitle() {
    const title = document.getElementById('timelineTitle');
    if (!title) return;
    
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    if (currentView === 'day') {
        title.textContent = selectedDate.toLocaleDateString('ru-RU', options);
    } else if (currentView === 'week') {
        const weekStart = getWeekStart(selectedDate);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        const startStr = weekStart.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
        const endStr = weekEnd.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
        title.textContent = `Неделя: ${startStr} — ${endStr}`;
    } else {
        title.textContent = getMonthName(selectedDate.getMonth()) + ' ' + selectedDate.getFullYear();
    }
}

function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    return d;
}

function renderDayView(container) {
    const dateStr = formatDateKey(selectedDate);
    const events = calendarEvents.filter(e => e.date === dateStr);
    
    updateViewTitle();
    
    if (events.length === 0) {
        container.innerHTML = `
            <div class="timeline-empty">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p>Нет событий на этот день</p>
            </div>
        `;
        return;
    }
    
    events.sort((a, b) => (a.time || '00:00').localeCompare(b.time || '00:00'));
    
    container.innerHTML = events.map(event => `
        <div class="timeline-event" style="border-left-color: ${event.color}" onclick="showEventDetails('${event.id}')">
            <div class="timeline-event-time">${event.time || 'Весь день'}</div>
            <div class="timeline-event-content">
                <div class="timeline-event-title">${escapeHtml(event.title)}</div>
                ${event.description ? `<div class="timeline-event-desc">${escapeHtml(event.description)}</div>` : ''}
            </div>
        </div>
    `).join('');
}

function renderWeekView(container) {
    const weekStart = getWeekStart(selectedDate);
    const events = [];
    
    for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + i);
        const dateStr = formatDateKey(date);
        const dayEvents = calendarEvents.filter(e => e.date === dateStr);
        dayEvents.forEach(e => {
            events.push({
                ...e,
                _dayLabel: date.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric' })
            });
        });
    }
    
    updateViewTitle();
    
    if (events.length === 0) {
        container.innerHTML = `
            <div class="timeline-empty">
                <p>Нет событий на этой неделе</p>
            </div>
        `;
        return;
    }
    
    events.sort((a, b) => a.date.localeCompare(b.date) || (a.time || '00:00').localeCompare(b.time || '00:00'));
    
    container.innerHTML = events.map(event => `
        <div class="timeline-event" style="border-left-color: ${event.color}" onclick="showEventDetails('${event.id}')">
            <div class="timeline-event-time">${event._dayLabel} ${event.time || ''}</div>
            <div class="timeline-event-content">
                <div class="timeline-event-title">${escapeHtml(event.title)}</div>
                ${event.description ? `<div class="timeline-event-desc">${escapeHtml(event.description)}</div>` : ''}
            </div>
        </div>
    `).join('');
}

function renderMonthView(container) {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const events = calendarEvents.filter(e => {
        const d = parseDateKey(e.date);
        return d.getMonth() === month && d.getFullYear() === year;
    });
    
    updateViewTitle();
    
    if (events.length === 0) {
        container.innerHTML = `
            <div class="timeline-empty">
                <p>Нет событий в этом месяце</p>
            </div>
        `;
        return;
    }
    
    events.sort((a, b) => a.date.localeCompare(b.date));
    
    container.innerHTML = events.map(event => {
        const dateObj = parseDateKey(event.date);
        const dateStr = dateObj.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
        return `
            <div class="timeline-event" style="border-left-color: ${event.color}" onclick="showEventDetails('${event.id}')">
                <div class="timeline-event-time">${dateStr} ${event.time || ''}</div>
                <div class="timeline-event-content">
                    <div class="timeline-event-title">${escapeHtml(event.title)}</div>
                    ${event.description ? `<div class="timeline-event-desc">${escapeHtml(event.description)}</div>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

function changeDay(delta) {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + delta);
    selectedDate = newDate;
    renderMiniCalendar();
    renderTimeline();
}

function toggleView() {
    const views = ['day', 'week', 'month'];
    const currentIndex = views.indexOf(currentView);
    currentView = views[(currentIndex + 1) % views.length];
    renderTimeline();
    updateViewIcon();
}

function updateViewIcon() {
    const icon = document.getElementById('viewIcon');
    if (!icon) return;
    
    if (currentView === 'day') {
        icon.innerHTML = `
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/>
        `;
    } else if (currentView === 'week') {
        icon.innerHTML = `
            <rect x="3" y="3" width="18" height="4" rx="1"/>
            <rect x="3" y="10" width="18" height="4" rx="1"/>
            <rect x="3" y="17" width="18" height="4" rx="1"/>
        `;
    } else {
        icon.innerHTML = `
            <rect x="3" y="3" width="18" height="18" rx="1"/>
            <path d="M3 9h18"/>
            <path d="M3 15h18"/>
        `;
    }
}


function showEventDetails(eventId) {
    const id = typeof eventId === 'string' ? parseFloat(eventId) : eventId;
    const event = calendarEvents.find(e => e.id === id);
    if (!event) {
        showToast('Событие не найдено');
        return;
    }
    
    currentDetailEventId = event.id;
    
    const emptyState = document.querySelector('.empty-state');
    const details = document.getElementById('eventDetails');
    
    if (emptyState) emptyState.style.display = 'none';
    if (details) details.style.display = 'flex';
    
    // Скрываем FAB, показываем кнопку в хедере
    const fab = document.querySelector('.fab');
    const headerBtn = document.getElementById('headerAddBtn');
    if (fab) fab.style.display = 'none';
    if (headerBtn) headerBtn.style.display = 'flex';
    
    const colorEl = document.getElementById('detailColor');
    const titleEl = document.getElementById('detailTitle');
    const dateTimeEl = document.getElementById('detailDateTime');
    const descEl = document.getElementById('detailDescription');
    
    if (colorEl) colorEl.style.background = event.color;
    if (titleEl) titleEl.textContent = event.title || 'Без названия';
    
    let dateTime = '—';
    if (event.date && event.time) {
        const dateObj = parseDateKey(event.date);
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        dateTime = dateObj.toLocaleDateString('ru-RU', options) + ' в ' + event.time;
    } else if (event.date) {
        const dateObj = parseDateKey(event.date);
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        dateTime = dateObj.toLocaleDateString('ru-RU', options);
    }
    if (dateTimeEl) dateTimeEl.textContent = dateTime;
    if (descEl) descEl.textContent = event.description || 'Нет описания';
}

function closeDetails() {
    const emptyState = document.querySelector('.empty-state');
    const details = document.getElementById('eventDetails');
    
    if (emptyState) emptyState.style.display = 'flex';
    if (details) details.style.display = 'none';
    currentDetailEventId = null;
    
    // Показываем FAB, скрываем кнопку в хедере
    const fab = document.querySelector('.fab');
    const headerBtn = document.getElementById('headerAddBtn');
    if (fab) fab.style.display = 'flex';
    if (headerBtn) headerBtn.style.display = 'none';
}

function deleteEventFromDetail() {
    if (currentDetailEventId) {
        const event = calendarEvents.find(e => e.id === currentDetailEventId);
        if (event) {
            showConfirmDialog(
                'Удалить событие?',
                `Удалить "${event.title}"?`,
                'Удалить',
                () => {
                    calendarEvents = calendarEvents.filter(e => e.id !== currentDetailEventId);
                    saveCalendarEvents();
                    closeDetails();
                    renderMiniCalendar();
                    renderTimeline();
                    showToast('Событие удалено');
                }
            );
        }
    }
}

function editEventFromDetail() {
    if (currentDetailEventId) {
        const eventId = currentDetailEventId;
        closeDetails();
        setTimeout(() => editEvent(eventId), 200);
    }
}


function showAddEventModal() {
    editingEventId = null;
    document.getElementById('eventTitle').value = '';
    const dateStr = formatDateKey(selectedDate);
    document.getElementById('eventDate').value = dateStr;
    document.getElementById('eventTime').value = '';
    document.getElementById('eventDescription').value = '';
    selectedEventColor = '#6366f1';
    document.querySelectorAll('.event-color-option').forEach(el => {
        el.classList.toggle('active', el.dataset.color === '#6366f1');
    });
    document.getElementById('addEventModal').classList.add('visible');
    setTimeout(() => document.getElementById('eventTitle').focus(), 100);
}

function closeAddEventModal() {
    document.getElementById('addEventModal').classList.remove('visible');
    
    // Восстанавливаем кнопки в зависимости от состояния
    const details = document.getElementById('eventDetails');
    const isDetailsOpen = details && details.style.display !== 'none';
    const fab = document.querySelector('.fab');
    const headerBtn = document.getElementById('headerAddBtn');
    
    if (isDetailsOpen) {
        // Если детали открыты — FAB скрыт, кнопка в хедере видна
        if (fab) fab.style.display = 'none';
        if (headerBtn) headerBtn.style.display = 'flex';
    } else {
        // Если детали закрыты — FAB виден, кнопка в хедере скрыта
        if (fab) fab.style.display = 'flex';
        if (headerBtn) headerBtn.style.display = 'none';
    }
}

function selectEventColor(color, element) {
    selectedEventColor = color;
    document.querySelectorAll('.color-option').forEach(el => {  // ← ПРАВИЛЬНО!
        el.classList.remove('active');
    });
    element.classList.add('active');
}

function editEvent(eventId) {
    const id = typeof eventId === 'string' ? parseFloat(eventId) : eventId;
    const event = calendarEvents.find(e => e.id === id);
    if (!event) return;
    
    editingEventId = event.id;
    document.getElementById('eventTitle').value = event.title;
    document.getElementById('eventDate').value = event.date;
    document.getElementById('eventTime').value = event.time || '';
    document.getElementById('eventDescription').value = event.description || '';
    selectedEventColor = event.color;
    
    document.querySelectorAll('.event-color-option').forEach(el => {
        el.classList.toggle('active', el.dataset.color === event.color);
    });
    
    document.getElementById('addEventModal').classList.add('visible');
    setTimeout(() => document.getElementById('eventTitle').focus(), 100);
}

function saveEvent() {
    const title = document.getElementById('eventTitle').value.trim();
    const date = document.getElementById('eventDate').value;
    const time = document.getElementById('eventTime').value;
    const description = document.getElementById('eventDescription').value.trim();
    
    if (!title) {
        showToast('Введите название события');
        return;
    }
    
    if (!date) {
        showToast('Выберите дату');
        return;
    }
    
    if (editingEventId) {
        const index = calendarEvents.findIndex(e => e.id === editingEventId);
        if (index !== -1) {
            calendarEvents[index] = {
                ...calendarEvents[index],
                title,
                date,
                time,
                color: selectedEventColor,
                description
            };
        }
    } else {
        calendarEvents.push({
            id: Date.now() + Math.random(),
            title,
            date,
            time,
            color: selectedEventColor,
            description
        });
    }
    
    saveCalendarEvents();
    closeAddEventModal();
    renderMiniCalendar();
    renderTimeline();
    showToast(editingEventId ? 'Событие обновлено' : 'Событие добавлено');
}

function deleteEvent(eventId) {
    const id = typeof eventId === 'string' ? parseFloat(eventId) : eventId;
    const event = calendarEvents.find(e => e.id === id);
    if (!event) return;
    
    showConfirmDialog(
        'Удалить событие?',
        `Удалить "${event.title}"?`,
        'Удалить',
        () => {
            calendarEvents = calendarEvents.filter(e => e.id !== id);
            saveCalendarEvents();
            renderMiniCalendar();
            renderTimeline();
            if (currentDetailEventId === id) closeDetails();
            showToast('Событие удалено');
        }
    );
}


function viewEvent(eventId) {
    const id = typeof eventId === 'string' ? parseFloat(eventId) : eventId;
    const event = calendarEvents.find(e => e.id === id);
    if (!event) {
        showToast('Событие не найдено');
        return;
    }
    
    viewingEventId = event.id;
    
    const colorEl = document.getElementById('viewEventColor');
    const titleEl = document.getElementById('viewEventTitle');
    const dateTimeEl = document.getElementById('viewEventDateTime');
    const descEl = document.getElementById('viewEventDescription');
    
    if (colorEl) colorEl.style.background = event.color;
    if (titleEl) titleEl.textContent = event.title || 'Без названия';
    
    let dateTime = '—';
    if (event.date && event.time) {
        const dateObj = parseDateKey(event.date);
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        dateTime = dateObj.toLocaleDateString('ru-RU', options) + ' в ' + event.time;
    } else if (event.date) {
        const dateObj = parseDateKey(event.date);
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        dateTime = dateObj.toLocaleDateString('ru-RU', options);
    }
    if (dateTimeEl) dateTimeEl.textContent = dateTime;
    if (descEl) descEl.textContent = event.description || 'Нет описания';
    
    const modal = document.getElementById('viewEventModal');
    if (modal) {
        modal.classList.add('visible');
        document.body.style.overflow = 'hidden';
    }
}

function closeViewEventModal() {
    const modal = document.getElementById('viewEventModal');
    if (modal) modal.classList.remove('visible');
    document.body.style.overflow = '';
    viewingEventId = null;
}

function editEventFromView() {
    if (viewingEventId) {
        const eventId = viewingEventId;
        closeViewEventModal();
        setTimeout(() => editEvent(eventId), 200);
    }
}

function deleteEventFromView() {
    if (viewingEventId) {
        const eventId = viewingEventId;
        const event = calendarEvents.find(e => e.id === eventId);
        if (event) {
            closeViewEventModal();
            setTimeout(() => deleteEvent(eventId), 200);
        }
    }
}


document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('globalSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const term = e.target.value.trim();
            if (term.length > 0) {
                const results = calendarEvents.filter(e => 
                    e.title.toLowerCase().includes(term.toLowerCase()) ||
                    (e.description && e.description.toLowerCase().includes(term.toLowerCase()))
                );
                showSearchResults(results, term);
            } else {
                renderTimeline();
                updateViewTitle();
            }
        });
        
        // ⌘K / Ctrl+K
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                searchInput.value = '';
                searchInput.blur();
                renderTimeline();
                updateViewTitle();
            }
        });
    }
});

function showSearchResults(results, term) {
    const container = document.getElementById('timeline');
    const title = document.getElementById('timelineTitle');
    if (!container || !title) return;
    
    title.textContent = `🔍 Результаты поиска (${results.length})`;
    
    if (results.length === 0) {
        container.innerHTML = `
            <div class="timeline-empty">
                <p>Ничего не найдено по запросу "${term}"</p>
            </div>
        `;
        return;
    }
    
    results.sort((a, b) => a.date.localeCompare(b.date));
    
    container.innerHTML = results.map(event => {
        const dateObj = parseDateKey(event.date);
        const dateStr = dateObj.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
        return `
            <div class="timeline-event" style="border-left-color: ${event.color}" onclick="showEventDetails('${event.id}')">
                <div class="timeline-event-time">${dateStr} ${event.time || ''}</div>
                <div class="timeline-event-content">
                    <div class="timeline-event-title">${escapeHtml(event.title)}</div>
                    ${event.description ? `<div class="timeline-event-desc">${escapeHtml(event.description)}</div>` : ''}
                </div>
            </div>
        `;
    }).join('');
}


document.addEventListener('keydown', function(e) {
    // ⌘K / Ctrl+K — фокус на поиск
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('globalSearch');
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
    }
    
    // Escape — закрыть модалки
    if (e.key === 'Escape') {
        closeAddEventModal();
        closeViewEventModal();
        closeConfirmDialog();
        closeDetails();
    }
});


document.addEventListener('DOMContentLoaded', function() {
    const chips = document.querySelectorAll('.chip');
    chips.forEach(chip => {
        chip.addEventListener('click', function() {
            chips.forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.dataset.filter;
            if (filter === 'all') {
                renderTimeline();
                return;
            }
            
            // Простая фильтрация по цвету/категории
            const colorMap = {
                'work': '#6366f1',
                'personal': '#22c55e',
                'important': '#ef4444'
            };
            
            const color = colorMap[filter];
            if (color) {
                const container = document.getElementById('timeline');
                const events = calendarEvents.filter(e => e.color === color);
                if (events.length === 0) {
                    container.innerHTML = `
                        <div class="timeline-empty">
                            <p>Нет событий в этой категории</p>
                        </div>
                    `;
                    return;
                }
                container.innerHTML = events.map(event => `
                    <div class="timeline-event" style="border-left-color: ${event.color}" onclick="showEventDetails('${event.id}')">
                        <div class="timeline-event-time">${event.date} ${event.time || ''}</div>
                        <div class="timeline-event-content">
                            <div class="timeline-event-title">${escapeHtml(event.title)}</div>
                            ${event.description ? `<div class="timeline-event-desc">${escapeHtml(event.description)}</div>` : ''}
                        </div>
                    </div>
                `).join('');
            }
        });
    });
});


function exportCalendar() {
    if (calendarEvents.length === 0) {
        showToast('Нет событий для экспорта');
        return;
    }
    
    const json = JSON.stringify(calendarEvents, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calendar_events_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Календарь экспортирован');
}

function importCalendar() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const data = JSON.parse(event.target.result);
                if (!Array.isArray(data)) {
                    showToast('❌ Неверный формат файла');
                    return;
                }
                calendarEvents = data;
                calendarEvents.forEach(event => {
                    if (!event.id) event.id = Date.now() + Math.random();
                });
                saveCalendarEvents();
                renderMiniCalendar();
                renderTimeline();
                showToast(`Импортировано ${calendarEvents.length} событий`);
            } catch (err) {
                showToast('❌ Ошибка импорта');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

function clearAllEvents() {
    if (calendarEvents.length === 0) {
        showToast('Календарь уже пуст');
        return;
    }
    
    showConfirmDialog(
        'Очистить календарь?',
        `Будет удалено ${calendarEvents.length} событий без возможности восстановления`,
        'Очистить',
        () => {
            calendarEvents = [];
            saveCalendarEvents();
            renderMiniCalendar();
            renderTimeline();
            closeDetails();
            showToast('Календарь очищен');
        }
    );
}


function toggleHamburgerMenu() {
    // Можно добавить мобильное меню при необходимости
    showToast('Меню в разработке');
}


document.addEventListener('DOMContentLoaded', function() {
    loadTheme();
    loadCalendarEvents();
    renderMiniCalendar();
    renderTimeline();
    updateViewTitle();
    updateViewIcon();
    
});
