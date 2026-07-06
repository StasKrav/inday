// ============================================
// timeline.js — ИСПРАВЛЕННАЯ ВЕРСИЯ
// ============================================

// ============================================
// РЕНДЕРИНГ СОБЫТИЙ
// ============================================

function renderDayEvents(events) {
    if (events.length === 0) {
        return `<div class="timeline-empty"><p>Нет событий на этот день</p></div>`;
    }

    events.sort((a, b) => (a.time || "00:00").localeCompare(b.time || "00:00"));

    return events.map(event => `
        <div class="timeline-event" id="event-${event.id}" 
             style="border-left-color: ${event.color}" 
             onclick="handleEventClick('${event.id}', this)">
            <div class="event-checkbox"></div>
            <div class="timeline-event-time">${event.time || "Весь день"}</div>
            <div class="timeline-event-content">
                <div class="timeline-event-title">${escapeHtml(event.title)}</div>
                ${event.description ? `<div class="timeline-event-desc">${escapeHtml(event.description)}</div>` : ""}
            </div>
        </div>
    `).join("");
}

function renderWeekEvents(events) {
    if (events.length === 0) {
        return `<div class="timeline-empty"><p>Нет событий на этой неделе</p></div>`;
    }

    const grouped = {};
    events.forEach(e => {
        if (!grouped[e.date]) grouped[e.date] = [];
        grouped[e.date].push(e);
    });

    const sortedDates = Object.keys(grouped).sort();

    return sortedDates.map(date => {
        const dateObj = parseDateKey(date);
        const dayLabel = dateObj.toLocaleDateString("ru-RU", {
            weekday: "short",
            day: "numeric"
        });
        
        const dayEvents = grouped[date].sort((a, b) => 
            (a.time || "00:00").localeCompare(b.time || "00:00")
        );

        return `
            <div style="margin-bottom: 12px;">
                <div style="font-size: 12px; font-weight: 600; color: var(--text-secondary); margin-bottom: 4px; padding-left: 4px;">
                    ${dayLabel}
                </div>
                ${dayEvents.map(event => `
                    <div class="timeline-event" id="event-${event.id}" 
                         style="border-left-color: ${event.color}" 
                         onclick="handleEventClick('${event.id}', this)">
                        <div class="event-checkbox"></div>
                        <div class="timeline-event-time">${event.time || "Весь день"}</div>
                        <div class="timeline-event-content">
                            <div class="timeline-event-title">${escapeHtml(event.title)}</div>
                            ${event.description ? `<div class="timeline-event-desc">${escapeHtml(event.description)}</div>` : ""}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }).join("");
}

function renderMonthEvents(events) {
    if (events.length === 0) {
        return `<div class="timeline-empty"><p>Нет событий в этом месяце</p></div>`;
    }

    const grouped = {};
    events.forEach(e => {
        if (!grouped[e.date]) grouped[e.date] = [];
        grouped[e.date].push(e);
    });

    const sortedDates = Object.keys(grouped).sort();

    return sortedDates.map(date => {
        const dateObj = parseDateKey(date);
        const dayLabel = dateObj.toLocaleDateString("ru-RU", {
            day: "numeric",
            month: "short"
        });
        
        const dayEvents = grouped[date].sort((a, b) => 
            (a.time || "00:00").localeCompare(b.time || "00:00")
        );

        return `
            <div style="margin-bottom: 8px;">
                <div style="font-size: 12px; font-weight: 600; color: var(--text-secondary); margin-bottom: 2px; padding-left: 4px;">
                    ${dayLabel}
                </div>
                ${dayEvents.map(event => `
                    <div class="timeline-event" id="event-${event.id}" 
                         style="border-left-color: ${event.color}" 
                         onclick="handleEventClick('${event.id}', this)">
                        <div class="event-checkbox"></div>
                        <div class="timeline-event-time">${event.time || "Весь день"}</div>
                        <div class="timeline-event-content">
                            <div class="timeline-event-title">${escapeHtml(event.title)}</div>
                            ${event.description ? `<div class="timeline-event-desc">${escapeHtml(event.description)}</div>` : ""}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }).join("");
}

function renderAllEvents(events) {
    if (events.length === 0) {
        return `<div class="timeline-empty"><p>Нет событий</p></div>`;
    }

    const grouped = {};
    events.forEach(e => {
        if (!grouped[e.date]) grouped[e.date] = [];
        grouped[e.date].push(e);
    });

    const sortedDates = Object.keys(grouped).sort();

    return sortedDates.map(date => {
        const dateObj = parseDateKey(date);
        const dateStr = dateObj.toLocaleDateString("ru-RU", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });

        const dayEvents = grouped[date].sort((a, b) => 
            (a.time || "00:00").localeCompare(b.time || "00:00")
        );

        return `
            <div style="margin-bottom: 16px;">
                <div style="font-size: 12px; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; padding-left: 4px;">
                    ${dateStr}
                </div>
                ${dayEvents.map(event => `
                    <div class="timeline-event" id="event-${event.id}" 
                         style="border-left-color: ${event.color}" 
                         onclick="handleEventClick('${event.id}', this)">
                        <div class="event-checkbox"></div>
                        <div class="timeline-event-time">${event.time || "Весь день"}</div>
                        <div class="timeline-event-content">
                            <div class="timeline-event-title">${escapeHtml(event.title)}</div>
                            ${event.description ? `<div class="timeline-event-desc">${escapeHtml(event.description)}</div>` : ""}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }).join("");
}

// ============================================
// ОБРАБОТЧИК КЛИКА ПО СОБЫТИЮ
// ============================================

function handleEventClick(eventId, element) {
    const id = typeof eventId === 'string' ? eventId : String(eventId);
    
    if (typeof isSelectMode === 'function' && isSelectMode()) {
        if (typeof selectEvent === 'function') {
            selectEvent(id, element);
        }
    } else {
        if (typeof showEventDetails === 'function') {
            showEventDetails(id);
        }
    }
}

// ============================================
// ПОИСК
// ============================================

function showSearchResults(results, term) {
    const container = document.getElementById("timeline");
    const title = document.getElementById("timelineTitle");
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
    container.innerHTML = renderAllEvents(results);
}

// ============================================
// ГЛАВНАЯ ФУНКЦИЯ РЕНДЕРИНГА
// ============================================

function renderTimeline() {
    const container = document.getElementById("timeline");
    if (!container) return;

    const events = typeof getFilteredEvents === 'function' ? getFilteredEvents() : calendarEvents;

    events.sort((a, b) => 
        a.date.localeCompare(b.date) || 
        (a.time || "00:00").localeCompare(b.time || "00:00")
    );

    if (typeof updateViewTitle === 'function') {
        updateViewTitle();
    }

    if (events.length === 0) {
        container.innerHTML = `
            <div class="timeline-empty">
                <p>${typeof getEmptyMessage === 'function' ? getEmptyMessage() : 'Нет событий'}</p>
            </div>
        `;
        return;
    }

    if (currentView === "day") {
        container.innerHTML = renderDayEvents(events);
    } else if (currentView === "week") {
        container.innerHTML = renderWeekEvents(events);
    } else {
        container.innerHTML = renderMonthEvents(events);
    }
    
    if (typeof restoreSelection === 'function') {
        restoreSelection();
    }
}

// ============================================
// ОБНОВЛЕНИЕ ЗАГОЛОВКА
// ============================================

function updateViewTitle() {
    const title = document.getElementById('timelineTitle');
    if (!title) return;
    
    if (state.searchQuery) {
        const count = getFilteredEvents().length;
        title.textContent = `🔍 Поиск: "${state.searchQuery}" (${count})`;
        return;
    }
    
    if (state.showAll) {
        const count = getFilteredEvents().length;
        title.textContent = `Все события (${count})`;
        return;
    }
    
    if (currentView === 'day') {
        title.textContent = formatDateDisplay(selectedDate);
    } else if (currentView === 'week') {
        const range = getWeekRange(selectedDate);
        title.textContent = `Неделя: ${range.display}`;
    } else {
        title.textContent = getMonthName(selectedDate.getMonth()) + ' ' + selectedDate.getFullYear();
    }
}

// ============================================
// ВОССТАНОВЛЕНИЕ ВЫБОРА
// ============================================

function restoreSelection() {
    if (typeof isSelectMode === 'function' && isSelectMode()) {
        const ids = typeof getSelectedIds === 'function' ? getSelectedIds() : [];
        ids.forEach(id => {
            const el = document.getElementById(`event-${id}`);
            if (el) {
                el.classList.add('selected');
            }
        });
        if (typeof updateSelectionUI === 'function') {
            updateSelectionUI();
        }
    }
}

// ============================================
// ЭКСПОРТ
// ============================================

window.renderTimeline = renderTimeline;
window.renderDayEvents = renderDayEvents;
window.renderWeekEvents = renderWeekEvents;
window.renderMonthEvents = renderMonthEvents;
window.renderAllEvents = renderAllEvents;
window.handleEventClick = handleEventClick;
window.updateViewTitle = updateViewTitle;
window.showSearchResults = showSearchResults;
window.restoreSelection = restoreSelection;

console.log('📅 Timeline module loaded');
