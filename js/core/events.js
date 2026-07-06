// events.js

function loadCalendarEvents() {
  const saved = localStorage.getItem("keeprus_calendar_events");
  if (saved) {
    try {
      calendarEvents = JSON.parse(saved);
      // Восстанавливаем ID и теги
      calendarEvents.forEach((event) => {
        if (!event.id) event.id = Date.now() + Math.random();
        if (!event.tags) event.tags = [];
      });
      return;
    } catch (e) {
      console.error("Ошибка загрузки событий:", e);
    }
  }
  
  // ✅ Просто пустой массив — пользователь сам создаст события
  calendarEvents = [];
  saveCalendarEvents();
}

function saveCalendarEvents() {
  localStorage.setItem(
    "keeprus_calendar_events",
    JSON.stringify(calendarEvents),
  );
}

