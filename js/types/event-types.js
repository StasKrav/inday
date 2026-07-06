// ============================================
// EVENT TYPES — ТИПЫ СОБЫТИЙ
// ============================================

const EVENT_TYPES = {
    PERSONAL: 'personal',
    PUBLIC: 'public'
};

function isPersonalEvent(event) {
    return !event.type || event.type === EVENT_TYPES.PERSONAL;
}

function isPublicEvent(event) {
    return event.type === EVENT_TYPES.PUBLIC;
}

function getEventType(event) {
    return isPublicEvent(event) ? EVENT_TYPES.PUBLIC : EVENT_TYPES.PERSONAL;
}

// ============================================
// ЭКСПОРТ
// ============================================

window.EVENT_TYPES = EVENT_TYPES;
window.isPersonalEvent = isPersonalEvent;
window.isPublicEvent = isPublicEvent;
window.getEventType = getEventType;

console.log('📋 Event types loaded');
