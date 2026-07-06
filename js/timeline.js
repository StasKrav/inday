// ============================================
// ФУНКЦИИ РЕНДЕРИНГА ДЛЯ ТАЙМЛАЙНА
// (Добавить в main.js)
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

function getEmptyMessage() {
    if (window.state && state.searchQuery) {
        return `Ничего не найдено по запросу "${state.searchQuery}"`;
    }
    
    if (window.state && state.selectedTag) {
        const tagName = tags[state.selectedTag]?.name || '';
        if (state.showAll) {
            return `Нет событий с тегом "${tagName}"`;
        } else {
            const names = { day: 'дне', week: 'неделе', month: 'месяце' };
            const viewName = names[currentView] || 'дне';
            return `Нет событий с тегом "${tagName}" в ${viewName}`;
        }
    }
    
    if (window.state && state.showAll) {
        return 'Нет событий';
    }
    
    const names = { day: 'дне', week: 'неделе', month: 'месяце' };
    return `Нет событий в ${names[currentView] || 'дне'}`;
}

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

    // Если включен showAll - показываем все события
    if (window.state && state.showAll) {
        container.innerHTML = renderAllEvents(events);
        return;
    }

    // Стандартный рендеринг
    if (currentView === "day") {
        container.innerHTML = renderDayEvents(events);
    } else if (currentView === "week") {
        container.innerHTML = renderWeekEvents(events);
    } else {
        container.innerHTML = renderMonthEvents(events);
    }
}

function renderTagView(container) {
    const state = window.state || { selectedTag: null };
    if (!state.selectedTag) {
        renderTimeline();
        return;
    }
    
    const tag = tags[state.selectedTag];
    if (!tag) {
        state.selectedTag = null;
        if (typeof window.applyFilters === 'function') {
            window.applyFilters();
        }
        return;
    }

    // Собираем все события с этим тегом
    const events = calendarEvents.filter(
        (e) => e.tags && e.tags.includes(state.selectedTag)
    );

    // Сортируем по дате
    events.sort(
        (a, b) =>
            a.date.localeCompare(b.date) ||
            (a.time || "00:00").localeCompare(b.time || "00:00")
    );

    // Обновляем заголовок
    const title = document.getElementById("timelineTitle");
    if (title) {
        const count = events.length;
        if (state.showAll) {
            title.textContent = `Все события с тегом "${tag.name}" (${count})`;
        } else {
            title.textContent = `${tag.name} (${count})`;
        }
    }

    if (events.length === 0) {
        container.innerHTML = `
            <div class="timeline-empty">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p>Нет событий с тегом "${tag.name}"</p>
            </div>
        `;
        return;
    }

    container.innerHTML = events
        .map((event) => {
            const dateObj = parseDateKey(event.date);
            const dateStr = dateObj.toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "long",
                year: "numeric",
            });

            return `
                <div class="timeline-event" style="border-left-color: ${tag.color}; background: ${tag.color}11;" onclick="showEventDetails('${event.id}')">
                    <div class="timeline-event-time">${dateStr} ${event.time || ""}</div>
                    <div class="timeline-event-content">
                        <div class="timeline-event-title">${escapeHtml(event.title)}</div>
                        ${event.description ? `<div class="timeline-event-desc">${escapeHtml(event.description)}</div>` : ""}
                    </div>
                </div>
            `;
        })
        .join("");
}

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
        if (state.selectedTag) {
            const tagName = tags[state.selectedTag]?.name || '';
            const count = getFilteredEvents().length;
            title.textContent = `Все события с тегом "${tagName}" (${count})`;
        } else {
            const count = getFilteredEvents().length;
            title.textContent = `Все события (${count})`;
        }
        return;
    }
    
    // Фильтр по тегу (без showAll)
    if (state.selectedTag) {
        const tagName = tags[state.selectedTag]?.name || '';
        const count = getFilteredEvents().length;
        title.textContent = `${tagName} (${count})`;
        return;
    }
    
    // Стандартный режим (ничего не выбрано)
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