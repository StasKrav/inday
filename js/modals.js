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
