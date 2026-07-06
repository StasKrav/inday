// ============================================
// ГАМБУРГЕР-МЕНЮ
// ============================================

function toggleHamburgerMenu() {
    const menu = document.getElementById('hamburgerMenu');
    if (!menu) {
        console.error('❌ Меню не найдено!');
        return;
    }
    
    menu.classList.toggle('visible');
    
    // Если меню открыто - добавляем обработчик для закрытия по клику вне
    if (menu.classList.contains('visible')) {
        setTimeout(() => {
            document.addEventListener('click', closeHamburgerMenuOutside);
        }, 10);
    } else {
        document.removeEventListener('click', closeHamburgerMenuOutside);
    }
}

function closeHamburgerMenu() {
    const menu = document.getElementById('hamburgerMenu');
    if (menu) {
        menu.classList.remove('visible');
    }
    document.removeEventListener('click', closeHamburgerMenuOutside);
}

function closeHamburgerMenuOutside(e) {
    const menu = document.getElementById('hamburgerMenu');
    const btn = document.getElementById('hamburgerBtn');
    
    if (!menu || !btn) return;
    
    // Если клик не по меню и не по кнопке - закрываем
    if (!menu.contains(e.target) && !btn.contains(e.target)) {
        closeHamburgerMenu();
    }
}

// ЭКСПОРТ В ГЛОБАЛЬНУЮ ОБЛАСТЬ
window.toggleHamburgerMenu = toggleHamburgerMenu;
window.closeHamburgerMenu = closeHamburgerMenu;

// ============================================
// ИМПОРТ / ЭКСПОРТ
// ============================================

function handleImport(event) {
    const file = event.target.files[0];
    if (!file) {
        console.log('❌ Файл не выбран');
        return;
    }
    
    console.log('📂 Импорт файла:', file.name);
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            console.log('📄 Данные из файла:', data);
            
            // Проверяем формат
            if (data.events && Array.isArray(data.events)) {
                // Новый формат с тегами
                calendarEvents = data.events;
                if (data.tags) {
                    tags = data.tags;
                    saveTags();
                }
                console.log('✅ Импортировано в новом формате');
            } else if (Array.isArray(data)) {
                // Старый формат (только события)
                calendarEvents = data;
                console.log('✅ Импортировано в старом формате');
            } else {
                showToast('❌ Неверный формат файла');
                console.error('❌ Неверный формат:', data);
                return;
            }
            
            // Восстанавливаем ID
            calendarEvents.forEach(event => {
                if (!event.id) event.id = Date.now() + Math.random();
                if (!event.tags) event.tags = [];
            });
            
            saveCalendarEvents();
            renderMiniCalendar();
            renderTimeline();
            renderTags();
            updateViewTitle();
            showToast(`Импортировано ${calendarEvents.length} событий`);
            console.log(`✅ Импортировано ${calendarEvents.length} событий`);
            
        } catch (err) {
            console.error('❌ Ошибка импорта:', err);
            showToast('❌ Ошибка при чтении файла');
        }
    };
    
    reader.onerror = function() {
        showToast('❌ Ошибка чтения файла');
        console.error('❌ Ошибка чтения файла');
    };
    
    reader.readAsText(file);
    
    // Сбрасываем input
    event.target.value = '';
}

// ЭКСПОРТ
window.handleImport = handleImport;

// ============================================
// ЭКСПОРТ (СОХРАНИТЬ)
// ============================================

function exportCalendar() {
    if (calendarEvents.length === 0) {
        showToast('❌ Нет событий для экспорта');
        return;
    }

    const data = {
        events: calendarEvents,
        tags: tags,
        exportedAt: new Date().toISOString(),
        version: '1.0'
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calendar_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Экспортировано ${calendarEvents.length} событий`);
    console.log(`✅ Экспортировано ${calendarEvents.length} событий`);
}

window.exportCalendar = exportCalendar;

// ============================================
// ОЧИСТИТЬ ВСЕ
// ============================================

function clearAllEvents() {
    if (calendarEvents.length === 0) {
        return;
    }

    showConfirmDialog(
        'Очистить календарь?',
        `Будет удалено ${calendarEvents.length} событий без возможности восстановления`,
        'Очистить',
        () => {
            calendarEvents = [];
            saveCalendarEvents();
            renderMiniCalendar();
            renderTimeline();
            renderTags();
            updateViewTitle();
            closeDetails();
            console.log('🗑️ Календарь очищен');
        }
    );
}

window.clearAllEvents = clearAllEvents;
