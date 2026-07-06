// ============================================
// ПОКАЗ ДЕТАЛЕЙ СОБЫТИЯ
// ============================================

function showEventDetails(eventId) {
    // Приводим ID к числу (на случай если пришел строкой)
    const id = typeof eventId === "string" ? parseFloat(eventId) : eventId;
    
    // Ищем событие по ID
    const event = calendarEvents.find((e) => e.id === id);
    
    // Если событие не найдено - показываем ошибку
    if (!event) {
        if (typeof showToast === 'function') {
            showToast("Событие не найдено", true);
        } else {
            console.error('❌ Событие не найдено:', id);
        }
        return;
    }

    // Сохраняем ID текущего события для дальнейших операций
    currentDetailEventId = event.id;

    // Получаем DOM-элементы
    const emptyState = document.querySelector(".empty-state");
    const details = document.getElementById("eventDetails");
    const colorEl = document.getElementById("detailColor");
    const titleEl = document.getElementById("detailTitle");
    const dateTimeEl = document.getElementById("detailDateTime");
    const descEl = document.getElementById("detailDescription");
    const tagsContainer = document.getElementById("detailTags");

    // Показываем детали, скрываем пустое состояние
    if (emptyState) emptyState.style.display = "none";
    if (details) details.style.display = "flex";

    // Управление FAB и кнопкой в хедере
    const fab = document.querySelector(".fab");
    const headerBtn = document.getElementById("headerAddBtn");
    if (fab) fab.style.display = "none";
    if (headerBtn) headerBtn.style.display = "flex";

    // Устанавливаем цвет события
    if (colorEl) {
        colorEl.style.background = event.color || '#6366f1';
    }

    // Устанавливаем заголовок
    if (titleEl) {
        titleEl.textContent = event.title || "Без названия";
    }

    // Форматируем дату и время с помощью новой утилиты
    if (dateTimeEl) {
        dateTimeEl.textContent = formatDateTimeDisplay(event.date, event.time);
    }

    // Устанавливаем описание
    if (descEl) {
        descEl.textContent = event.description || "Нет описания";
    }

    // ============================================
    // ОТОБРАЖЕНИЕ ТЕГОВ
    // ============================================
    
    if (tagsContainer) {
        // Проверяем, есть ли теги у события
        const eventTags = getEventTags(event);
        
        if (eventTags && eventTags.length > 0) {
            // Если теги есть - рендерим их
            tagsContainer.innerHTML = eventTags
                .map(
                    (tag) => `
                        <span class="detail-tag" style="background: ${tag.color}22; color: ${tag.color}; border: 1px solid ${tag.color}44;">
                            <span class="tag-dot" style="background: ${tag.color};"></span>
                            ${escapeHtml(tag.name)}
                        </span>
                    `
                )
                .join("");
            tagsContainer.style.display = "flex";
        } else {
            // Если тегов нет - скрываем контейнер
            tagsContainer.style.display = "none";
        }
    }

    // ============================================
    // ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ (опционально)
    // ============================================
    
    // Можно добавить отображение ID события для отладки
    // console.log('📋 Показаны детали события:', event.id, event.title);
}

// ============================================
// ЗАКРЫТИЕ ДЕТАЛЕЙ
// ============================================

function closeDetails() {
    const emptyState = document.querySelector(".empty-state");
    const details = document.getElementById("eventDetails");

    if (emptyState) emptyState.style.display = "flex";
    if (details) details.style.display = "none";
    
    // Сбрасываем ID текущего события
    currentDetailEventId = null;

    // Восстанавливаем FAB и скрываем кнопку в хедере
    const fab = document.querySelector(".fab");
    const headerBtn = document.getElementById("headerAddBtn");
    if (fab) fab.style.display = "flex";
    if (headerBtn) headerBtn.style.display = "none";
}

// ============================================
// УДАЛЕНИЕ СОБЫТИЯ ИЗ ДЕТАЛЕЙ
// ============================================

// details.js - Проверь эту функцию

function deleteEventFromDetail() {
    console.log('🗑️ deleteEventFromDetail вызвана');
    console.log('  currentDetailEventId:', currentDetailEventId);
    
    if (!currentDetailEventId) {
        console.log('❌ Нет ID события');
        return;
    }

    const event = calendarEvents.find((e) => e.id === currentDetailEventId);
    console.log('  Найдено событие:', event?.title);
    
    if (!event) {
        console.log('❌ Событие не найдено');
        return;
    }

    // Проверяем, что showConfirmDialog существует
    console.log('  showConfirmDialog:', typeof showConfirmDialog);
    
    // Временное решение - удаляем без подтверждения
    console.log('🗑️ Удаляем без подтверждения (для теста)...');
    calendarEvents = calendarEvents.filter((e) => e.id !== currentDetailEventId);
    saveCalendarEvents();
    closeDetails();
    renderMiniCalendar();
    renderTimeline();
    console.log('✅ Событие удалено, осталось:', calendarEvents.length);
}

// ============================================
// РЕДАКТИРОВАНИЕ СОБЫТИЯ ИЗ ДЕТАЛЕЙ
// ============================================

function editEventFromDetail() {
    if (!currentDetailEventId) {
        if (typeof showToast === 'function') {
            showToast("Событие не выбрано", true);
        }
        return;
    }

    const eventId = currentDetailEventId;
    
    // Закрываем детали
    closeDetails();
    
    // Открываем модалку редактирования с небольшой задержкой
    setTimeout(() => {
        if (typeof editEvent === 'function') {
            editEvent(eventId);
        } else {
            console.error('❌ Функция editEvent не найдена');
            if (typeof showToast === 'function') {
                showToast("Ошибка редактирования", true);
            }
        }
    }, 200);
}

// ============================================
// ЭКСПОРТ
// ============================================

window.showEventDetails = showEventDetails;
window.closeDetails = closeDetails;
window.deleteEventFromDetail = deleteEventFromDetail;
window.editEventFromDetail = editEventFromDetail;
