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

function changeDay(delta) {
  const newDate = new Date(selectedDate);
  newDate.setDate(newDate.getDate() + delta);
  selectedDate = newDate;
  renderMiniCalendar();
  renderTimeline();
}
