// ============================================
// ГАМБУРГЕР-МЕНЮ
// ============================================

function toggleHamburgerMenu() {
    const menu = document.getElementById('hamburgerMenu');
    if (!menu) return;
    
    menu.classList.toggle('visible');
    
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
    if (menu) menu.classList.remove('visible');
    document.removeEventListener('click', closeHamburgerMenuOutside);
}

function closeHamburgerMenuOutside(e) {
    const menu = document.getElementById('hamburgerMenu');
    const btn = document.getElementById('hamburgerBtn');
    if (!menu || !btn) return;
    if (!menu.contains(e.target) && !btn.contains(e.target)) {
        closeHamburgerMenu();
    }
}

// ============================================
// СОХРАНЕНИЕ ЧЕРЕЗ НАТИВНОЕ ОКНО
// ============================================

async function exportCalendar() {
    if (calendarEvents.length === 0) {
        showToast('📭 Нет событий для экспорта', true);
        return;
    }

    // Проверяем поддержку File System Access API
    if (!('showSaveFilePicker' in window)) {
        // Fallback для старых браузеров
        const defaultName = `calendar_backup_${new Date().toISOString().slice(0, 10)}`;
        const fileName = prompt('Введите имя файла:', defaultName);
        if (fileName === null) return;
        const finalName = fileName.trim() || defaultName;
        downloadFile(finalName);
        return;
    }

    try {
        // Подготавливаем данные
        const data = {
            events: calendarEvents,
            tags: tags || {},
            exportedAt: new Date().toISOString(),
            version: '1.0'
        };

        // Предлагаем имя по умолчанию
        const defaultName = `calendar_backup_${new Date().toISOString().slice(0, 10)}.json`;
        
        // Открываем нативное окно сохранения
        const fileHandle = await window.showSaveFilePicker({
            suggestedName: defaultName,
            types: [{
                description: 'JSON файлы',
                accept: { 'application/json': ['.json'] }
            }]
        });

        // Сохраняем файл
        const writable = await fileHandle.createWritable();
        await writable.write(JSON.stringify(data, null, 2));
        await writable.close();

        showToast(`✅ Сохранено: ${fileHandle.name}`);
        console.log(`💾 Сохранено в: ${fileHandle.name}`);

    } catch (error) {
        if (error.name === 'AbortError' || error.message?.includes('abort')) {
            showToast('ℹ️ Сохранение отменено');
        } else {
            console.error('❌ Ошибка сохранения:', error);
            showToast('❌ Ошибка сохранения', true);
        }
    }
}

// Fallback для старых браузеров
function downloadFile(fileName) {
    const data = {
        events: calendarEvents,
        tags: tags || {},
        exportedAt: new Date().toISOString(),
        version: '1.0'
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.endsWith('.json') ? fileName : `${fileName}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('✅ Сохранено в Загрузки');
}

// ============================================
// ИМПОРТ ЧЕРЕЗ НАТИВНОЕ ОКНО
// ============================================

async function importCalendar() {
    // Проверяем поддержку
    if ('showOpenFilePicker' in window) {
        try {
            const [fileHandle] = await window.showOpenFilePicker({
                types: [{
                    description: 'JSON файлы',
                    accept: { 'application/json': ['.json'] }
                }],
                multiple: false
            });
            
            const file = await fileHandle.getFile();
            const text = await file.text();
            importData(text);
            showToast(`✅ Импортировано: ${file.name}`);
            return;
        } catch (error) {
            if (error.name === 'AbortError') {
                showToast('ℹ️ Импорт отменен');
                return;
            }
            console.error('❌ Ошибка импорта:', error);
            showToast('❌ Ошибка при импорте', true);
        }
    }

    // Fallback
    document.getElementById('importFileInput').click();
}

function handleImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            importData(e.target.result);
            showToast(`✅ Импортировано: ${file.name}`);
        } catch (err) {
            showToast('❌ Ошибка при чтении файла', true);
            console.error('Ошибка импорта:', err);
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

function importData(text) {
    const data = JSON.parse(text);
    
    if (data.events && Array.isArray(data.events)) {
        calendarEvents = data.events;
        if (data.tags) {
            tags = data.tags;
            saveTags();
        }
    } else if (Array.isArray(data)) {
        calendarEvents = data;
    } else {
        throw new Error('Неверный формат файла');
    }
    
    calendarEvents.forEach(event => {
        if (!event.id) event.id = Date.now() + Math.random();
        if (!event.tags) event.tags = [];
    });
    
    saveCalendarEvents();
    renderMiniCalendar();
    renderTimeline();
    renderTags();
    updateViewTitle();
}

// ============================================
// ОЧИСТИТЬ ВСЕ
// ============================================

function clearAllEvents() {
    if (calendarEvents.length === 0) {
        showToast('📭 Календарь уже пуст');
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
            showToast('🗑️ Все события удалены');
        }
    );
}

// ============================================
// ЭКСПОРТ
// ============================================

window.toggleHamburgerMenu = toggleHamburgerMenu;
window.closeHamburgerMenu = closeHamburgerMenu;
window.exportCalendar = exportCalendar;
window.importCalendar = importCalendar;
window.handleImport = handleImport;
window.clearAllEvents = clearAllEvents;
