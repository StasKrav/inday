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
