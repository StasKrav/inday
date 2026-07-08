// utility.js — ИСПРАВЛЕННАЯ ВЕРСИЯ

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// ============================================
// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
// ============================================
let calendarEvents = [];
let currentDate = new Date();
let selectedDate = new Date();
let selectedEventColor = "#1a73e8";
let editingEventId = null;
let viewingEventId = null;
let currentView = "day";

// ============================================
// СИНХРОНИЗАЦИЯ С window
// ============================================
window.calendarEvents = calendarEvents;
window.currentDate = currentDate;
window.selectedDate = selectedDate;
window.selectedEventColor = selectedEventColor;
window.editingEventId = editingEventId;
window.viewingEventId = viewingEventId;
window.currentView = currentView;

// ============================================
// ФУНКЦИЯ ДЛЯ ОБНОВЛЕНИЯ window.calendarEvents
// ============================================
function syncCalendarEvents() {
    window.calendarEvents = calendarEvents;
    // Также синхронизируем остальные переменные
    window.currentDate = currentDate;
    window.selectedDate = selectedDate;
    window.currentView = currentView;
}

// Экспортируем функцию
window.syncCalendarEvents = syncCalendarEvents;
