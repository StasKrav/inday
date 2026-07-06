// calendar.js - ИСПОЛЬЗУЕМ НОВЫЕ УТИЛИТЫ

function renderMiniCalendar() {
    const grid = document.getElementById("miniGrid");
    const monthYear = document.getElementById("miniMonthYear");
    const count = document.getElementById("miniEventsCount");

    if (!grid || !monthYear || !count) return;

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    monthYear.textContent = getMonthName(month) + " " + year;

    const monthEvents = calendarEvents.filter((e) => {
        const d = parseDateKey(e.date);
        return d.getMonth() === month && d.getFullYear() === year;
    });
    
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
        const hasEvents = calendarEvents.some((e) => e.date === dateStr);

        const dayBtn = document.createElement("button");
        dayBtn.className = "day";
        if (!isCurrentMonth) dayBtn.classList.add("other-month");
        if (isToday) dayBtn.classList.add("today");
        if (isSelected) dayBtn.classList.add("selected");
        if (hasEvents) dayBtn.classList.add("has-event");

        dayBtn.textContent = date.getDate();
        dayBtn.title = formatDateDisplay(date);

        dayBtn.addEventListener("click", () => {
            selectedDate = date;
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

    renderMiniCalendar();
    renderTimeline();
    updateViewTitle();

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
