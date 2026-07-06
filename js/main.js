
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


