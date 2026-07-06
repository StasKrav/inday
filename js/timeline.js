// timeline.js - С ПОИСКОМ

// ============================================
// РЕНДЕРИНГ СОБЫТИЙ
// ============================================

function renderDayEvents(events) {
    if (events.length === 0) {
        return `<div class="timeline-empty"><p>Нет событий на этот день</p></div>`;
    }

    events.sort((a, b) => (a.time || "00:00").localeCompare(b.time || "00:00"));

    return events.map(event => `
        <div class="timeline-event" style="border-left-color: ${event.color}" onclick="showEventDetails('${event.id}')">
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
                    <div class="timeline-event" style="border-left-color: ${event.color}" onclick="showEventDetails('${event.id}')">
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
                    <div class="timeline-event" style="border-left-color: ${event.color}" onclick="showEventDetails('${event.id}')">
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
                    <div class="timeline-event" style="border-left-color: ${event.color}" onclick="showEventDetails('${event.id}')">
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

    updateViewTitle();

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
}

// ============================================
// ОБНОВЛЕНИЕ ЗАГОЛОВКА
// ============================================

function updateViewTitle() {
    const title = document.getElementById('timelineTitle');
    if (!title) return;
    
    // Поиск
    if (state.searchQuery) {
        const count = getFilteredEvents().length;
        title.textContent = `🔍 Поиск: "${state.searchQuery}" (${count})`;
        return;
    }
    
    // Режим "показать все"
    if (state.showAll) {
        const count = getFilteredEvents().length;
        title.textContent = `Все события (${count})`;
        return;
    }
    
    // Стандартный режим
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    if (currentView === 'day') {
        title.textContent = selectedDate.toLocaleDateString('ru-RU', options);
    } else if (currentView === 'week') {
        const start = getWeekStart(selectedDate);
        const end = new Date(start);
        end.setDate(end.getDate() + 6);
        title.textContent = `Неделя: ${start.toLocaleDateString('ru-RU', {day: 'numeric', month: 'short'})} — ${end.toLocaleDateString('ru-RU', {day: 'numeric', month: 'short', year: 'numeric'})}`;
    } else {
        title.textContent = getMonthName(selectedDate.getMonth()) + ' ' + selectedDate.getFullYear();
    }
}

// ============================================
// ЭКСПОРТ
// ============================================

window.renderTimeline = renderTimeline;
window.updateViewTitle = updateViewTitle;
window.showSearchResults = showSearchResults;
window.renderDayEvents = renderDayEvents;
window.renderWeekEvents = renderWeekEvents;
window.renderMonthEvents = renderMonthEvents;
window.renderAllEvents = renderAllEvents;
