// ============================================
// UTILITY
// ============================================
function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

function parseDateKey(dateStr) {
  if (!dateStr) return new Date();
  const parts = dateStr.split("-");
  return new Date(
    parseInt(parts[0]),
    parseInt(parts[1]) - 1,
    parseInt(parts[2]),
  );
}

function getMonthName(month) {
  const names = [
    "Январь",
    "Февраль",
    "Март",
    "Апрель",
    "Май",
    "Июнь",
    "Июль",
    "Август",
    "Сентябрь",
    "Октябрь",
    "Ноябрь",
    "Декабрь",
  ];
  return names[month];
}

function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

let calendarEvents = [];
let currentDate = new Date();
let selectedDate = new Date();
let selectedEventColor = "#1a73e8";
let editingEventId = null;
let viewingEventId = null;
let currentDetailEventId = null;
let currentView = "day"; // 'day', 'week', 'month'





