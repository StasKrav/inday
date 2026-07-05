// ============================================
// TOAST
// ============================================
let toastTimeout;

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) {
    // Создаём toast, если его нет
    const newToast = document.createElement("div");
    newToast.className = "toast";
    newToast.id = "toast";
    document.body.appendChild(newToast);
    return showToast(message);
  }
  toast.textContent = message;
  toast.style.display = "flex";
  toast.classList.add("visible");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("visible");
    toast.style.display = "none";
  }, 2500);
}

// ============================================
// THEME
// ============================================
function toggleTheme() {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const newTheme = isDark ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("keeprus_calendar_theme", newTheme);
  updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
  const icon = document.getElementById("themeIcon");
  if (!icon) return;
  if (theme === "dark") {
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
  const saved = localStorage.getItem("keeprus_calendar_theme");
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
  const dialog = document.getElementById("genericConfirmDialog");
  if (!dialog) return;
  document.getElementById("genericConfirmTitle").textContent =
    title || "Подтверждение";
  document.getElementById("genericConfirmMessage").textContent = message || "";
  document.getElementById("genericConfirmOkBtn").textContent =
    okText || "Подтвердить";
  confirmCallback = callback;
  dialog.classList.add("visible");
}

function closeConfirmDialog() {
  const dialog = document.getElementById("genericConfirmDialog");
  if (dialog) dialog.classList.remove("visible");
  confirmCallback = null;
}

document.addEventListener("DOMContentLoaded", function () {
  const okBtn = document.getElementById("genericConfirmOkBtn");
  const cancelBtn = document.getElementById("genericConfirmCancelBtn");
  const dialog = document.getElementById("genericConfirmDialog");

  if (okBtn) {
    okBtn.addEventListener("click", function () {
      if (confirmCallback) confirmCallback();
      closeConfirmDialog();
    });
  }
  if (cancelBtn) cancelBtn.addEventListener("click", closeConfirmDialog);
  if (dialog) {
    dialog.addEventListener("click", function (e) {
      if (e.target === e.currentTarget) closeConfirmDialog();
    });
  }
});

// ============================================
// UTILITY
// ============================================
function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

function parseDateKey(dateStr) {
  if (!dateStr) return new Date();
  const parts = dateStr.split("-");
  return new Date(
    parseInt(parts[0]),
    parseInt(parts[1]) - 1,
    parseInt(parts[2]),
  );
}

function getMonthName(month) {
  const names = [
    "Январь",
    "Февраль",
    "Март",
    "Апрель",
    "Май",
    "Июнь",
    "Июль",
    "Август",
    "Сентябрь",
    "Октябрь",
    "Ноябрь",
    "Декабрь",
  ];
  return names[month];
}

function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

let calendarEvents = [];
let currentDate = new Date();
let selectedDate = new Date();
let selectedEventColor = "#1a73e8";
let editingEventId = null;
let viewingEventId = null;
let currentDetailEventId = null;
let currentView = "day"; // 'day', 'week', 'month'

function loadCalendarEvents() {
  const saved = localStorage.getItem("keeprus_calendar_events");
  if (saved) {
    try {
      calendarEvents = JSON.parse(saved);
      calendarEvents.forEach((event) => {
        if (!event.id) event.id = Date.now() + Math.random();
      });
      return;
    } catch (e) {
      console.error("Ошибка загрузки событий:", e);
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
      title: "Встреча с командой",
      date: formatDateKey(today),
      time: "14:00",
      color: "#6366f1",
      description: "Обсуждение нового проекта",
    },
    {
      id: Date.now() + 1,
      title: "Завершить проект",
      date: formatDateKey(tomorrow),
      time: "18:00",
      color: "#ef4444",
      description: "Дедлайн по проекту",
    },
    {
      id: Date.now() + 2,
      title: "Планёрка",
      date: formatDateKey(dayAfter),
      time: "10:00",
      color: "#22c55e",
      description: "Еженедельная планерка",
    },
  ];
}

function saveCalendarEvents() {
  localStorage.setItem(
    "keeprus_calendar_events",
    JSON.stringify(calendarEvents),
  );
}

function renderMiniCalendar() {
  const grid = document.getElementById("miniGrid");
  const monthYear = document.getElementById("miniMonthYear");
  const count = document.getElementById("miniEventsCount");

  if (!grid || !monthYear || !count) return;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  monthYear.textContent = getMonthName(month) + " " + year;

  // Если выбран тег — показываем количество событий с этим тегом в месяце
  let monthEvents;
  const state = window.state || { selectedTag: null };
  if (state.selectedTag) {
      monthEvents = calendarEvents.filter((e) => {
          const d = parseDateKey(e.date);
          return (
              d.getMonth() === month &&
              d.getFullYear() === year &&
              e.tags &&
              e.tags.includes(state.selectedTag)
          );
      });
  } else {
      monthEvents = calendarEvents.filter((e) => {
          const d = parseDateKey(e.date);
          return d.getMonth() === month && d.getFullYear() === year;
      });
  }
  count.textContent = monthEvents.length + " событий";

  const firstDay = new Date(year, month, 1);
  let firstDayOfWeek = firstDay.getDay();
  firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDayOfWeek);

  const today = new Date();
  const todayStr = formatDateKey(today);
  const selectedStr = formatDateKey(selectedDate);

  grid.innerHTML = "";

  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    const dateStr = formatDateKey(date);
    const isCurrentMonth = date.getMonth() === month;
    const isToday = dateStr === todayStr;
    const isSelected = dateStr === selectedStr;

    // Проверяем наличие событий с учётом фильтра
    let hasEvents;
    const state = window.state || { selectedTag: null };
    if (state.selectedTag) {
        hasEvents = calendarEvents.some(
            (e) => e.date === dateStr && e.tags && e.tags.includes(state.selectedTag)
        );
    } else {
        hasEvents = calendarEvents.some((e) => e.date === dateStr);
    }

    const dayBtn = document.createElement("button");
    dayBtn.className = "day";
    if (!isCurrentMonth) dayBtn.classList.add("other-month");
    if (isToday) dayBtn.classList.add("today");
    if (isSelected) dayBtn.classList.add("selected");
    if (hasEvents) dayBtn.classList.add("has-event");

    dayBtn.textContent = date.getDate();
    dayBtn.title = date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    dayBtn.addEventListener("click", () => {
        selectedDate = date;
        // Если выбран тег — сбрасываем его при клике на день
        const state = window.state || { selectedTag: null };
        if (state.selectedTag) {
            state.selectedTag = null;
            if (typeof window.applyFilters === 'function') {
                window.applyFilters();
            }
        }
        renderMiniCalendar();
        renderTimeline();
        updateViewTitle();
        const searchInput = document.getElementById("globalSearch");
        if (searchInput) searchInput.value = "";
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

  const state = window.state || { selectedTag: null, showAll: false };
  if (state.selectedTag) {
      state.selectedTag = null;
      state.showAll = false;
      // Обновляем UI через filters.js
      if (typeof window.applyFilters === 'function') {
          window.applyFilters();
      }
  }

  renderMiniCalendar();
  renderTimeline();
  updateViewTitle();
  updateWidgets(selectedDate);

  const searchInput = document.getElementById("globalSearch");
  if (searchInput) searchInput.value = "";
}

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

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d;
}

function renderDayView(container) {
  const dateStr = formatDateKey(selectedDate);
  // Фильтруем события по дате
  const events = calendarEvents.filter((e) => e.date === dateStr);

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

  events.sort((a, b) => (a.time || "00:00").localeCompare(b.time || "00:00"));

  container.innerHTML = events
    .map(
      (event) => `
        <div class="timeline-event" style="border-left-color: ${event.color}" onclick="showEventDetails('${event.id}')">
            <div class="timeline-event-time">${event.time || "Весь день"}</div>
            <div class="timeline-event-content">
                <div class="timeline-event-title">${escapeHtml(event.title)}</div>
                ${event.description ? `<div class="timeline-event-desc">${escapeHtml(event.description)}</div>` : ""}
            </div>
        </div>
    `,
    )
    .join("");
}

function renderWeekView(container) {
  const weekStart = getWeekStart(selectedDate);
  const events = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    const dateStr = formatDateKey(date);
    const dayEvents = calendarEvents.filter((e) => e.date === dateStr);
    dayEvents.forEach((e) => {
      events.push({
        ...e,
        _dayLabel: date.toLocaleDateString("ru-RU", {
          weekday: "short",
          day: "numeric",
        }),
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

  events.sort(
    (a, b) =>
      a.date.localeCompare(b.date) ||
      (a.time || "00:00").localeCompare(b.time || "00:00"),
  );

  container.innerHTML = events
    .map(
      (event) => `
        <div class="timeline-event" style="border-left-color: ${event.color}" onclick="showEventDetails('${event.id}')">
            <div class="timeline-event-time">${event._dayLabel} ${event.time || ""}</div>
            <div class="timeline-event-content">
                <div class="timeline-event-title">${escapeHtml(event.title)}</div>
                ${event.description ? `<div class="timeline-event-desc">${escapeHtml(event.description)}</div>` : ""}
            </div>
        </div>
    `,
    )
    .join("");
}

function renderMonthView(container) {
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const events = calendarEvents.filter((e) => {
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

  container.innerHTML = events
    .map((event) => {
      const dateObj = parseDateKey(event.date);
      const dateStr = dateObj.toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "short",
      });
      return `
            <div class="timeline-event" style="border-left-color: ${event.color}" onclick="showEventDetails('${event.id}')">
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

function changeDay(delta) {
  const newDate = new Date(selectedDate);
  newDate.setDate(newDate.getDate() + delta);
  selectedDate = newDate;
  renderMiniCalendar();
  renderTimeline();
}

function toggleView() {
  const views = ["day", "week", "month"];
  const currentIndex = views.indexOf(currentView);
  currentView = views[(currentIndex + 1) % views.length];
  renderTimeline();
  updateViewIcon();
}

function changeView(view) {
  currentView = view;

  // Обновляем активную кнопку
  document
    .querySelectorAll(".timeline-nav .nav-icon")
    .forEach((el) => el.classList.remove("active"));
  const viewMap = {
    day: "viewDayBtn",
    week: "viewWeekBtn",
    month: "viewMonthBtn",
  };
  const activeBtn = document.getElementById(viewMap[view]);
  if (activeBtn) activeBtn.classList.add("active");

  renderTimeline();
  updateViewTitle();
}

function updateViewIcon() {
  const icon = document.getElementById("viewIcon");
  if (!icon) return;

  if (currentView === "day") {
    icon.innerHTML = `
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/>
        `;
  } else if (currentView === "week") {
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
  const id = typeof eventId === "string" ? parseFloat(eventId) : eventId;
  const event = calendarEvents.find((e) => e.id === id);
  if (!event) {
    showToast("Событие не найдено");
    return;
  }

  currentDetailEventId = event.id;

  const emptyState = document.querySelector(".empty-state");
  const details = document.getElementById("eventDetails");

  if (emptyState) emptyState.style.display = "none";
  if (details) details.style.display = "flex";

  // Скрываем FAB, показываем кнопку в хедере
  const fab = document.querySelector(".fab");
  const headerBtn = document.getElementById("headerAddBtn");
  if (fab) fab.style.display = "none";
  if (headerBtn) headerBtn.style.display = "flex";

  const colorEl = document.getElementById("detailColor");
  const titleEl = document.getElementById("detailTitle");
  const dateTimeEl = document.getElementById("detailDateTime");
  const descEl = document.getElementById("detailDescription");

  if (colorEl) colorEl.style.background = event.color;
  if (titleEl) titleEl.textContent = event.title || "Без названия";

  let dateTime = "—";
  if (event.date && event.time) {
    const dateObj = parseDateKey(event.date);
    const options = { day: "numeric", month: "long", year: "numeric" };
    dateTime =
      dateObj.toLocaleDateString("ru-RU", options) + " в " + event.time;
  } else if (event.date) {
    const dateObj = parseDateKey(event.date);
    const options = { day: "numeric", month: "long", year: "numeric" };
    dateTime = dateObj.toLocaleDateString("ru-RU", options);
  }
  if (dateTimeEl) dateTimeEl.textContent = dateTime;
  if (descEl) descEl.textContent = event.description || "Нет описания";

  // Теги
  const tagsContainer = document.getElementById("detailTags");
  if (tagsContainer) {
    const eventTags = getEventTags(event);
    if (eventTags.length > 0) {
      tagsContainer.innerHTML = eventTags
        .map(
          (tag) => `
                    <span class="detail-tag" style="background: ${tag.color}22; color: ${tag.color}; border: 1px solid ${tag.color}44;">
                        <span class="tag-dot" style="background: ${tag.color};"></span>
                        ${tag.name}
                    </span>
                `,
        )
        .join("");
      tagsContainer.style.display = "flex";
    } else {
      tagsContainer.style.display = "none";
    }
  }
}

function closeDetails() {
  const emptyState = document.querySelector(".empty-state");
  const details = document.getElementById("eventDetails");

  if (emptyState) emptyState.style.display = "flex";
  if (details) details.style.display = "none";
  currentDetailEventId = null;

  // Показываем FAB, скрываем кнопку в хедере
  const fab = document.querySelector(".fab");
  const headerBtn = document.getElementById("headerAddBtn");
  if (fab) fab.style.display = "flex";
  if (headerBtn) headerBtn.style.display = "none";
}

function deleteEventFromDetail() {
  if (currentDetailEventId) {
    const event = calendarEvents.find((e) => e.id === currentDetailEventId);
    if (event) {
      showConfirmDialog(
        "Удалить событие?",
        `Удалить "${event.title}"?`,
        "Удалить",
        () => {
          calendarEvents = calendarEvents.filter(
            (e) => e.id !== currentDetailEventId,
          );
          saveCalendarEvents();
          closeDetails();
          renderMiniCalendar();
          renderTimeline();
          showToast("Событие удалено");
        },
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
    document.getElementById('eventTags').value = '';
    
    // Сброс выбора цвета на дефолтный
    selectedEventColor = '#6366f1';
    
    // Обновляем активный цвет в палитре
    document.querySelectorAll('#addEventModal .color-option').forEach(el => {
        el.classList.toggle('active', el.dataset.color === '#6366f1');
    });
    
    document.getElementById('addEventModal').classList.add('visible');
    setTimeout(() => document.getElementById('eventTitle').focus(), 100);
}

function closeAddEventModal() {
  document.getElementById("addEventModal").classList.remove("visible");

  // Восстанавливаем кнопки в зависимости от состояния
  const details = document.getElementById("eventDetails");
  const isDetailsOpen = details && details.style.display !== "none";
  const fab = document.querySelector(".fab");
  const headerBtn = document.getElementById("headerAddBtn");

  if (isDetailsOpen) {
    // Если детали открыты — FAB скрыт, кнопка в хедере видна
    if (fab) fab.style.display = "none";
    if (headerBtn) headerBtn.style.display = "flex";
  } else {
    // Если детали закрыты — FAB виден, кнопка в хедере скрыта
    if (fab) fab.style.display = "flex";
    if (headerBtn) headerBtn.style.display = "none";
  }
}

function selectEventColor(color, element) {
    selectedEventColor = color;
    
    // Находим все цветные кружочки в модалке
    const colorOptions = document.querySelectorAll('#addEventModal .color-option');
    colorOptions.forEach(el => {
        el.classList.remove('active');
    });
    
    // Активируем выбранный
    if (element) {
        element.classList.add('active');
    } else {
        // Если элемент не передан - ищем по цвету
        colorOptions.forEach(el => {
            if (el.dataset.color === color) {
                el.classList.add('active');
            }
        });
    }
}

function editEvent(eventId) {
    const id = typeof eventId === 'string' ? parseFloat(eventId) : eventId;
    const event = calendarEvents.find(e => e.id === id);
    if (!event) {
        showToast('❌ Событие не найдено');
        return;
    }

    editingEventId = event.id;
    document.getElementById('eventTitle').value = event.title || '';
    document.getElementById('eventDate').value = event.date || '';
    document.getElementById('eventTime').value = event.time || '';
    document.getElementById('eventDescription').value = event.description || '';
    
    // Показываем теги
    const eventTags = getEventTags(event);
    document.getElementById('eventTags').value = eventTags.map(t => t.name).join(', ');
    
    // Устанавливаем цвет события
    selectedEventColor = event.color || '#6366f1';
    
    // Обновляем активный цвет в палитре
    document.querySelectorAll('#addEventModal .color-option').forEach(el => {
        el.classList.toggle('active', el.dataset.color === selectedEventColor);
    });

    document.getElementById('addEventModal').classList.add('visible');
    setTimeout(() => document.getElementById('eventTitle').focus(), 100);
}

// В функции saveEvent добавьте поле tags
function saveEvent() {
    const title = document.getElementById('eventTitle').value.trim();
    const date = document.getElementById('eventDate').value;
    const time = document.getElementById('eventTime').value;
    const description = document.getElementById('eventDescription').value.trim();
    const tagsInput = document.getElementById('eventTags').value.trim();

    if (!title) {
        showToast('❌ Введите название события');
        return;
    }

    if (!date) {
        showToast('❌ Выберите дату');
        return;
    }

    // Используем выбранный цвет
    let color = selectedEventColor || '#6366f1';

    // Обработка тегов
    let tagIds = [];
    if (tagsInput) {
        const tagNames = tagsInput
            .split(',')
            .map(t => t.trim())
            .filter(Boolean);
        tagIds = tagNames.map(name => getOrCreateTag(name)).filter(Boolean);
        
        // Если есть теги - берём цвет первого тега
        if (tagIds.length > 0 && tags[tagIds[0]]) {
            color = tags[tagIds[0]].color;
        }
    }

    if (editingEventId) {
        // Редактирование существующего события
        const index = calendarEvents.findIndex(e => e.id === editingEventId);
        if (index !== -1) {
            calendarEvents[index] = {
                ...calendarEvents[index],
                title,
                date,
                time,
                description,
                tags: tagIds,
                color: color
            };
            showToast('✅ Событие обновлено');
        }
    } else {
        // Создание нового события
        calendarEvents.push({
            id: Date.now() + Math.random(),
            title,
            date,
            time,
            description,
            tags: tagIds,
            color: color
        });
        showToast('✅ Событие добавлено');
    }

    saveCalendarEvents();
    closeAddEventModal();
    renderMiniCalendar();
    renderTimeline();
    renderTags();
}

function deleteEvent(eventId) {
  const id = typeof eventId === "string" ? parseFloat(eventId) : eventId;
  const event = calendarEvents.find((e) => e.id === id);
  if (!event) return;

  showConfirmDialog(
    "Удалить событие?",
    `Удалить "${event.title}"?`,
    "Удалить",
    () => {
      calendarEvents = calendarEvents.filter((e) => e.id !== id);
      saveCalendarEvents();
      renderMiniCalendar();
      renderTimeline();
      if (currentDetailEventId === id) closeDetails();
      showToast("Событие удалено");
    },
  );
}

function viewEvent(eventId) {
  const id = typeof eventId === "string" ? parseFloat(eventId) : eventId;
  const event = calendarEvents.find((e) => e.id === id);
  if (!event) {
    showToast("Событие не найдено");
    return;
  }

  viewingEventId = event.id;

  const colorEl = document.getElementById("viewEventColor");
  const titleEl = document.getElementById("viewEventTitle");
  const dateTimeEl = document.getElementById("viewEventDateTime");
  const descEl = document.getElementById("viewEventDescription");

  if (colorEl) colorEl.style.background = event.color;
  if (titleEl) titleEl.textContent = event.title || "Без названия";

  let dateTime = "—";
  if (event.date && event.time) {
    const dateObj = parseDateKey(event.date);
    const options = { day: "numeric", month: "long", year: "numeric" };
    dateTime =
      dateObj.toLocaleDateString("ru-RU", options) + " в " + event.time;
  } else if (event.date) {
    const dateObj = parseDateKey(event.date);
    const options = { day: "numeric", month: "long", year: "numeric" };
    dateTime = dateObj.toLocaleDateString("ru-RU", options);
  }
  if (dateTimeEl) dateTimeEl.textContent = dateTime;
  if (descEl) descEl.textContent = event.description || "Нет описания";

  const modal = document.getElementById("viewEventModal");
  if (modal) {
    modal.classList.add("visible");
    document.body.style.overflow = "hidden";
  }
}

function closeViewEventModal() {
  const modal = document.getElementById("viewEventModal");
  if (modal) modal.classList.remove("visible");
  document.body.style.overflow = "";
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
    const event = calendarEvents.find((e) => e.id === eventId);
    if (event) {
      closeViewEventModal();
      setTimeout(() => deleteEvent(eventId), 200);
    }
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("globalSearch");
  if (searchInput) {
    searchInput.addEventListener("input", function (e) {
      const term = e.target.value.trim();
      if (term.length > 0) {
        const filtered = getFilteredEvents();
        const results = filtered.filter(
          (e) =>
            e.title.toLowerCase().includes(term.toLowerCase()) ||
            (e.description &&
              e.description.toLowerCase().includes(term.toLowerCase())),
        );
        showSearchResults(results, term);
      } else {
        renderTimeline();
        updateViewTitle();
      }
    });

    // ⌘K / Ctrl+K
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

  container.innerHTML = results
    .map((event) => {
      const dateObj = parseDateKey(event.date);
      const dateStr = dateObj.toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "short",
      });
      return `
            <div class="timeline-event" style="border-left-color: ${event.color}" onclick="showEventDetails('${event.id}')">
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

document.addEventListener("DOMContentLoaded", function () {
  const chips = document.querySelectorAll(".chip");
  chips.forEach((chip) => {
    chip.addEventListener("click", function () {
      chips.forEach((c) => c.classList.remove("active"));
      this.classList.add("active");

      const filter = this.dataset.filter;
      if (filter === "all") {
        renderTimeline();
        return;
      }

      // Простая фильтрация по цвету/категории
      const colorMap = {
        work: "#6366f1",
        personal: "#22c55e",
        important: "#ef4444",
      };

      const color = colorMap[filter];
      if (color) {
        const container = document.getElementById("timeline");
        const events = calendarEvents.filter((e) => e.color === color);
        if (events.length === 0) {
          container.innerHTML = `
                        <div class="timeline-empty">
                            <p>Нет событий в этой категории</p>
                        </div>
                    `;
          return;
        }
        container.innerHTML = events
          .map(
            (event) => `
                    <div class="timeline-event" style="border-left-color: ${event.color}" onclick="showEventDetails('${event.id}')">
                        <div class="timeline-event-time">${event.date} ${event.time || ""}</div>
                        <div class="timeline-event-content">
                            <div class="timeline-event-title">${escapeHtml(event.title)}</div>
                            ${event.description ? `<div class="timeline-event-desc">${escapeHtml(event.description)}</div>` : ""}
                        </div>
                    </div>
                `,
          )
          .join("");
      }
    });
  });
});


// Инициализация цветов в модалке
function initTagColorPicker() {
  const container = document.getElementById("editTagColors");
  if (!container) return;

  const colors = [
    "#6366f1",
    "#8b5cf6",
    "#ec4899",
    "#ef4444",
    "#f59e0b",
    "#22c55e",
    "#06b6d4",
    "#14b8a6",
    "#f472b6",
  ];

  container.innerHTML = colors
    .map(
      (color) => `
        <div class="color-option" data-color="${color}" style="background:${color};" onclick="selectEditTagColor('${color}', this)"></div>
    `,
    )
    .join("");
}

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
              e.description.toLowerCase().includes(term.toLowerCase())),
        );
        showSearchResults(results, term);
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
// ГАМБУРГЕР-МЕНЮ
// ============================================

function toggleHamburgerMenu() {
    const menu = document.getElementById('hamburgerMenu');
    if (!menu) {
        console.error('❌ Меню не найдено!');
        return;
    }
    
    menu.classList.toggle('visible');
    
    // Если меню открыто - добавляем обработчик для закрытия по клику вне
    if (menu.classList.contains('visible')) {
        setTimeout(() => {
            document.addEventListener('click', closeHamburgerMenuOutside);
        }, 10);
    } else {
        document.removeEventListener('click', closeHamburgerMenuOutside);
    }
}

function closeHamburgerMenu() {
    const menu = document.getElementById('hamburgerMenu');
    if (menu) {
        menu.classList.remove('visible');
    }
    document.removeEventListener('click', closeHamburgerMenuOutside);
}

function closeHamburgerMenuOutside(e) {
    const menu = document.getElementById('hamburgerMenu');
    const btn = document.getElementById('hamburgerBtn');
    
    if (!menu || !btn) return;
    
    // Если клик не по меню и не по кнопке - закрываем
    if (!menu.contains(e.target) && !btn.contains(e.target)) {
        closeHamburgerMenu();
    }
}

// ЭКСПОРТ В ГЛОБАЛЬНУЮ ОБЛАСТЬ
window.toggleHamburgerMenu = toggleHamburgerMenu;
window.closeHamburgerMenu = closeHamburgerMenu;

// ============================================
// ИМПОРТ / ЭКСПОРТ
// ============================================

function handleImport(event) {
    const file = event.target.files[0];
    if (!file) {
        console.log('❌ Файл не выбран');
        return;
    }
    
    console.log('📂 Импорт файла:', file.name);
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            console.log('📄 Данные из файла:', data);
            
            // Проверяем формат
            if (data.events && Array.isArray(data.events)) {
                // Новый формат с тегами
                calendarEvents = data.events;
                if (data.tags) {
                    tags = data.tags;
                    saveTags();
                }
                console.log('✅ Импортировано в новом формате');
            } else if (Array.isArray(data)) {
                // Старый формат (только события)
                calendarEvents = data;
                console.log('✅ Импортировано в старом формате');
            } else {
                showToast('❌ Неверный формат файла');
                console.error('❌ Неверный формат:', data);
                return;
            }
            
            // Восстанавливаем ID
            calendarEvents.forEach(event => {
                if (!event.id) event.id = Date.now() + Math.random();
                if (!event.tags) event.tags = [];
            });
            
            saveCalendarEvents();
            renderMiniCalendar();
            renderTimeline();
            renderTags();
            updateViewTitle();
            showToast(`✅ Импортировано ${calendarEvents.length} событий`);
            console.log(`✅ Импортировано ${calendarEvents.length} событий`);
            
        } catch (err) {
            console.error('❌ Ошибка импорта:', err);
            showToast('❌ Ошибка при чтении файла');
        }
    };
    
    reader.onerror = function() {
        showToast('❌ Ошибка чтения файла');
        console.error('❌ Ошибка чтения файла');
    };
    
    reader.readAsText(file);
    
    // Сбрасываем input
    event.target.value = '';
}

// ЭКСПОРТ
window.handleImport = handleImport;

// ============================================
// ЭКСПОРТ (СОХРАНИТЬ)
// ============================================

function exportCalendar() {
    if (calendarEvents.length === 0) {
        showToast('❌ Нет событий для экспорта');
        return;
    }

    const data = {
        events: calendarEvents,
        tags: tags,
        exportedAt: new Date().toISOString(),
        version: '1.0'
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calendar_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`✅ Экспортировано ${calendarEvents.length} событий`);
    console.log(`✅ Экспортировано ${calendarEvents.length} событий`);
}

window.exportCalendar = exportCalendar;

// ============================================
// ОЧИСТИТЬ ВСЕ
// ============================================

function clearAllEvents() {
    if (calendarEvents.length === 0) {
        showToast('📭 Календарь уже пуст');
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
            renderTags();
            updateViewTitle();
            closeDetails();
            showToast('🗑️ Календарь очищен');
            console.log('🗑️ Календарь очищен');
        }
    );
}

window.clearAllEvents = clearAllEvents;
