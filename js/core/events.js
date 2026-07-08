// events.js

function loadCalendarEvents() {
    const saved = localStorage.getItem("keeprus_calendar_events");
    if (saved) {
        try {
            calendarEvents = JSON.parse(saved);
            calendarEvents.forEach((event) => {
                if (!event.id) event.id = Date.now() + Math.random();
                if (!event.tags) event.tags = [];
            });
        } catch (e) {
            console.error("Ошибка загрузки событий:", e);
            calendarEvents = [];
        }
    } else {
        calendarEvents = [];
    }
    
    // ✅ СИНХРОНИЗАЦИЯ ПОСЛЕ ЗАГРУЗКИ
    if (typeof syncCalendarEvents === 'function') {
        syncCalendarEvents();
    } else {
        // fallback
        window.calendarEvents = calendarEvents;
    }
    
    saveCalendarEvents();
}

function saveCalendarEvents() {
    localStorage.setItem(
        "keeprus_calendar_events",
        JSON.stringify(calendarEvents)
    );
    
    // ✅ СИНХРОНИЗАЦИЯ ПОСЛЕ СОХРАНЕНИЯ
    if (typeof syncCalendarEvents === 'function') {
        syncCalendarEvents();
    } else {
        window.calendarEvents = calendarEvents;
    }
}
