// ============================================
// DATE UTILS - ЕДИНЫЙ МОДУЛЬ ДЛЯ РАБОТЫ С ДАТАМИ
// ============================================

// ============================================
// ФОРМАТИРОВАНИЕ
// ============================================

/**
 * Форматирует дату в ключ YYYY-MM-DD
 */
function formatDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

/**
 * Парсит строку YYYY-MM-DD в объект Date
 */
function parseDateKey(dateStr) {
    if (!dateStr) return new Date();
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
}

/**
 * Форматирует дату для отображения (локализовано)
 */
function formatDateDisplay(date, options = {}) {
    const defaultOptions = {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    };
    return date.toLocaleDateString('ru-RU', { ...defaultOptions, ...options });
}

/**
 * Форматирует время для отображения
 */
function formatTimeDisplay(time) {
    if (!time) return 'Весь день';
    return time;
}

/**
 * Форматирует дату и время для отображения
 */
function formatDateTimeDisplay(date, time) {
    if (!date) return '—';
    
    const dateObj = typeof date === 'string' ? parseDateKey(date) : date;
    let result = formatDateDisplay(dateObj);
    
    if (time) {
        result += ` в ${formatTimeDisplay(time)}`;
    }
    
    return result;
}

// ============================================
// НАЗВАНИЯ
// ============================================

/**
 * Возвращает название месяца
 */
function getMonthName(month) {
    const names = [
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];
    return names[month];
}

/**
 * Возвращает короткое название месяца
 */
function getShortMonthName(month) {
    const names = [
        'янв', 'фев', 'мар', 'апр', 'май', 'июн',
        'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'
    ];
    return names[month];
}

/**
 * Возвращает название дня недели
 */
function getDayName(date, short = false) {
    const names = short
        ? ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс']
        : ['понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота', 'воскресенье'];
    return names[date.getDay() === 0 ? 6 : date.getDay() - 1];
}

// ============================================
// СРАВНЕНИЕ
// ============================================

/**
 * Проверяет, что даты равны (по дню)
 */
function isSameDay(date1, date2) {
    return formatDateKey(date1) === formatDateKey(date2);
}

/**
 * Проверяет, что даты в одном месяце
 */
function isSameMonth(date1, date2) {
    return date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
}

/**
 * Проверяет, что дата сегодня
 */
function isToday(date) {
    return isSameDay(date, new Date());
}

// ============================================
// НАВИГАЦИЯ
// ============================================

/**
 * Возвращает начало недели (понедельник)
 */
function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    return d;
}

/**
 * Возвращает конец недели (воскресенье)
 */
function getWeekEnd(date) {
    const start = getWeekStart(date);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return end;
}

/**
 * Возвращает диапазон недели для отображения
 */
function getWeekRange(date) {
    const start = getWeekStart(date);
    const end = getWeekEnd(date);
    return {
        start,
        end,
        display: `${formatDateDisplay(start, { day: 'numeric', month: 'short' })} — ${formatDateDisplay(end, { day: 'numeric', month: 'short', year: 'numeric' })}`
    };
}

// ============================================
// ВАЛИДАЦИЯ
// ============================================

/**
 * Проверяет, что строка является валидной датой YYYY-MM-DD
 */
function isValidDateStr(dateStr) {
    if (!dateStr) return false;
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateStr)) return false;
    
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year &&
           date.getMonth() === month - 1 &&
           date.getDate() === day;
}

// ============================================
// ЭКСПОРТ
// ============================================

// Для глобального использования
window.formatDateKey = formatDateKey;
window.parseDateKey = parseDateKey;
window.formatDateDisplay = formatDateDisplay;
window.formatTimeDisplay = formatTimeDisplay;
window.formatDateTimeDisplay = formatDateTimeDisplay;
window.getMonthName = getMonthName;
window.getShortMonthName = getShortMonthName;
window.getDayName = getDayName;
window.isSameDay = isSameDay;
window.isSameMonth = isSameMonth;
window.isToday = isToday;
window.getWeekStart = getWeekStart;
window.getWeekEnd = getWeekEnd;
window.getWeekRange = getWeekRange;
window.isValidDateStr = isValidDateStr;

