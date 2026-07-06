// utility.js - ТОЛЬКО ОБЩИЕ УТИЛИТЫ

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Глобальные переменные
let calendarEvents = [];
let currentDate = new Date();
let selectedDate = new Date();
let selectedEventColor = "#1a73e8";
let editingEventId = null;
let viewingEventId = null;
let currentDetailEventId = null;
let currentView = "day";

// Экспорт
window.escapeHtml = escapeHtml;
window.calendarEvents = calendarEvents;
window.currentDate = currentDate;
window.selectedDate = selectedDate;
window.selectedEventColor = selectedEventColor;
window.editingEventId = editingEventId;
window.viewingEventId = viewingEventId;
window.currentDetailEventId = currentDetailEventId;
window.currentView = currentView;
