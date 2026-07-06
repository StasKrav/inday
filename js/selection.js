// ============================================
// SELECTION MODE - МУЛЬТИ-ВЫБОР СОБЫТИЙ
// ============================================

let selectMode = false;
let selectedEventIds = new Set();

// ============================================
// ПЕРЕКЛЮЧЕНИЕ РЕЖИМА ВЫБОРА
// ============================================

function toggleSelectMode() {
    selectMode = !selectMode;
    
    const btn = document.getElementById('selectModeBtn');
    const container = document.querySelector('.timeline-module');
    const deleteBtn = document.getElementById('deleteSelectedBtn');
    
    if (selectMode) {
        btn.classList.add('select-mode');
        container.classList.add('select-mode-active');
        // Очищаем выбор при включении режима
        clearSelection();
    } else {
        btn.classList.remove('select-mode');
        container.classList.remove('select-mode-active');
        clearSelection();
        deleteBtn.style.display = 'none';
    }
    
    console.log('🔘 Режим выбора:', selectMode ? 'ВКЛ' : 'ВЫКЛ');
}

// ============================================
// ВЫБОР СОБЫТИЯ
// ============================================

function selectEvent(eventId, element) {
    if (!selectMode) return;
    
    const id = typeof eventId === 'string' ? parseFloat(eventId) : eventId;
    
    if (selectedEventIds.has(id)) {
        selectedEventIds.delete(id);
        element.classList.remove('selected');
    } else {
        selectedEventIds.add(id);
        element.classList.add('selected');
    }
    
    updateSelectionUI();
}

// ============================================
// ОБНОВЛЕНИЕ UI ВЫБОРА
// ============================================

function updateSelectionUI() {
    const count = selectedEventIds.size;
    const deleteBtn = document.getElementById('deleteSelectedBtn');
    const countEl = document.getElementById('selectedCount');
    
    if (count > 0) {
        deleteBtn.style.display = 'flex';
        if (countEl) countEl.textContent = count;
    } else {
        deleteBtn.style.display = 'none';
    }
}

// ============================================
// ОЧИСТКА ВЫБОРА
// ============================================

function clearSelection() {
    // Убираем класс selected со всех событий
    document.querySelectorAll('.timeline-event.selected').forEach(el => {
        el.classList.remove('selected');
    });
    selectedEventIds.clear();
    updateSelectionUI();
}

// ============================================
// УДАЛЕНИЕ ВЫБРАННЫХ СОБЫТИЙ
// ============================================

function deleteSelectedEvents() {
    const count = selectedEventIds.size;
    
    if (count === 0) {
        if (typeof showToast === 'function') {
            showToast('Нет выбранных событий', true);
        }
        return;
    }

    // ✅ Удаляем БЕЗ ПОДТВЕРЖДЕНИЯ (как просили)
    console.log(`🗑️ Удаляем ${count} событий без подтверждения...`);
    
    // Фильтруем массив
    const idsToDelete = Array.from(selectedEventIds);
    calendarEvents = calendarEvents.filter(e => !idsToDelete.includes(e.id));
    
    // Сохраняем
    saveCalendarEvents();
    
    // Очищаем выбор
    clearSelection();
    
    // Обновляем интерфейс
    renderTimeline();
    renderMiniCalendar();
    
    // Закрываем детали если открыты и удалены
    if (currentDetailEventId && idsToDelete.includes(currentDetailEventId)) {
        closeDetails();
    }
    
    // Показываем уведомление
    if (typeof showToast === 'function') {
        showToast(`🗑️ Удалено ${count} событий`);
    }
    
    console.log(`✅ Удалено ${count} событий`);
}

// ============================================
// ВСПОМОГАТЕЛЬНЫЕ
// ============================================

function getSelectedEvents() {
    return calendarEvents.filter(e => selectedEventIds.has(e.id));
}

function isSelectMode() {
    return selectMode;
}

// ============================================
// ЭКСПОРТ
// ============================================

window.selectMode = selectMode;
window.selectedEventIds = selectedEventIds;
window.toggleSelectMode = toggleSelectMode;
window.selectEvent = selectEvent;
window.clearSelection = clearSelection;
window.deleteSelectedEvents = deleteSelectedEvents;
window.getSelectedEvents = getSelectedEvents;
window.isSelectMode = isSelectMode;
window.updateSelectionUI = updateSelectionUI;

console.log('✅ Selection mode initialized');
