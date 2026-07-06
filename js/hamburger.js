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
// ЭКСПОРТ (СОХРАНИТЬ) — С ВЫБОРОМ ПАПКИ
// ============================================

async function exportCalendar() {
    if (calendarEvents.length === 0) {
        showToast('❌ Нет событий для экспорта', true);
        return;
    }

    // ПРОВЕРЯЕМ ПОДДЕРЖКУ
    if ('showDirectoryPicker' in window) {
        try {
            console.log('📁 Открываем диалог выбора папки...');
            const dirHandle = await window.showDirectoryPicker();
            console.log('📁 Выбрана папка:', dirHandle.name);
            
            const fileName = `calendar_backup_${new Date().toISOString().slice(0, 10)}.json`;
            const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
            const writable = await fileHandle.createWritable();
            
            const data = {
                events: calendarEvents,
                tags: tags || {},
                exportedAt: new Date().toISOString(),
                version: '1.0'
            };
            
            await writable.write(JSON.stringify(data, null, 2));
            await writable.close();
            
            showToast(`✅ Сохранено: ${fileName} (в папку ${dirHandle.name})`);
            console.log(`✅ Сохранено в: ${dirHandle.name}/${fileName}`);
            return;
            
        } catch (error) {
            if (error.name === 'AbortError' || error.message?.includes('abort')) {
                showToast('ℹ️ Сохранение отменено');
                console.log('ℹ️ Пользователь отменил выбор папки');
                return;
            }
            console.error('❌ Ошибка при выборе папки:', error);
            // Если ошибка — пробуем сохранить в Загрузки
            showToast('⚠️ Ошибка выбора папки, сохраняем в Загрузки...');
        }
    } else {
        console.log('ℹ️ showDirectoryPicker не поддерживается');
    }

    // FALLBACK: сохраняем в Загрузки
    exportToDownloads();
}

// ============================================
// СОХРАНЕНИЕ В ЗАГРУЗКИ (FALLBACK)
// ============================================

function exportToDownloads() {
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
    a.download = `calendar_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast(`✅ Сохранено в Загрузки (${calendarEvents.length} событий)`);
    console.log(`✅ Сохранено в Загрузки`);
}

// ============================================
// ИМПОРТ (ОТКРЫТЬ) — С ВЫБОРОМ ФАЙЛА
// ============================================

async function importCalendar() {
    if ('showOpenFilePicker' in window) {
        try {
            console.log('📂 Открываем диалог выбора файла...');
            const [fileHandle] = await window.showOpenFilePicker({
                types: [{
                    description: 'JSON файлы',
                    accept: { 'application/json': ['.json'] }
                }],
                multiple: false
            });
            
            const file = await fileHandle.getFile();
            const text = await file.text();
            const data = JSON.parse(text);
            
            importCalendarData(data);
            showToast(`✅ Импортировано: ${file.name} (${data.events?.length || 0} событий)`);
            console.log(`✅ Импортировано из: ${fileHandle.name}`);
            return;
            
        } catch (error) {
            if (error.name === 'AbortError' || error.message?.includes('abort')) {
                showToast('ℹ️ Импорт отменен');
                console.log('ℹ️ Пользователь отменил выбор файла');
                return;
            }
            console.error('❌ Ошибка при выборе файла:', error);
            showToast('⚠️ Ошибка выбора файла, используем стандартный способ...');
        }
    }

    // FALLBACK: через input
    document.getElementById('importFileInput').click();
}

// ============================================
// ОБРАБОТЧИК ИМПОРТА (через input)
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
            importCalendarData(data);
            showToast(`✅ Импортировано: ${file.name} (${data.events?.length || 0} событий)`);
        } catch (err) {
            console.error('❌ Ошибка импорта:', err);
            showToast('❌ Ошибка при чтении файла', true);
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

// ============================================
// ОБЩАЯ ФУНКЦИЯ ИМПОРТА
// ============================================

function importCalendarData(data) {
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
            showToast('🗑️ Календарь очищен');
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
window.importCalendarData = importCalendarData;
window.clearAllEvents = clearAllEvents;

console.log('📁 Hamburger module loaded');


// ============================================
// СОХРАНЕНИЕ С МОДАЛКОЙ
// ============================================

let selectedFolderHandle = null;
let selectedFolderName = null;

function openSaveFileModal() {
    const modal = document.getElementById('saveFileModal');
    const input = document.getElementById('saveFileName');
    
    if (!modal || !input) {
        console.error('❌ Модалка сохранения не найдена');
        showToast('❌ Ошибка интерфейса', true);
        return;
    }
    
    // Имя по умолчанию
    const defaultName = `calendar_backup_${new Date().toISOString().slice(0, 10)}`;
    input.value = defaultName;
    
    // Сбрасываем выбранную папку
    selectedFolderHandle = null;
    selectedFolderName = null;
    document.getElementById('saveFolderPath').value = '';
    document.getElementById('saveFolderStatus').textContent = 
        'Если папка не выбрана, файл сохранится в Загрузки';
    
    modal.classList.add('visible');
    
    // Фокус на поле ввода имени
    setTimeout(() => input.focus(), 100);
    input.select();
}

function closeSaveFileModal() {
    const modal = document.getElementById('saveFileModal');
    if (modal) modal.classList.remove('visible');
}

async function selectSaveFolder() {
    // Проверяем поддержку
    if (!('showDirectoryPicker' in window)) {
        showToast('❌ Выбор папки не поддерживается в этом браузере', true);
        return;
    }
    
    try {
        console.log('📁 Открываем диалог выбора папки...');
        const dirHandle = await window.showDirectoryPicker();
        
        selectedFolderHandle = dirHandle;
        selectedFolderName = dirHandle.name;
        
        document.getElementById('saveFolderPath').value = dirHandle.name;
        document.getElementById('saveFolderStatus').textContent = 
            `✅ Выбрана папка: ${dirHandle.name}`;
        document.getElementById('saveFolderStatus').style.color = 'var(--primary)';
        
        showToast(`📁 Выбрана папка: ${dirHandle.name}`);
        console.log(`📁 Выбрана папка: ${dirHandle.name}`);
        
    } catch (error) {
        if (error.name === 'AbortError' || error.message?.includes('abort')) {
            showToast('ℹ️ Выбор папки отменен');
        } else {
            console.error('❌ Ошибка выбора папки:', error);
            showToast('❌ Ошибка при выборе папки', true);
        }
    }
}

async function confirmSaveFile() {
    // Получаем имя файла
    const input = document.getElementById('saveFileName');
    let fileName = input.value.trim();
    
    // Валидация
    if (!fileName) {
        showToast('❌ Введите имя файла', true);
        input.focus();
        return;
    }
    
    // Запрещаем спецсимволы
    const invalidChars = /[<>:"/\\|?*]/g;
    if (invalidChars.test(fileName)) {
        showToast('❌ Имя содержит недопустимые символы: < > : " / \\ | ? *', true);
        input.focus();
        return;
    }
    
    // Убираем .json если пользователь ввел
    if (fileName.endsWith('.json')) {
        fileName = fileName.slice(0, -5);
    }
    
    const fullFileName = `${fileName}.json`;
    
    // Закрываем модалку
    closeSaveFileModal();
    
    // Сохраняем
    await saveCalendarFile(fullFileName, selectedFolderHandle);
}

async function saveCalendarFile(fileName, folderHandle) {
    if (calendarEvents.length === 0) {
        showToast('❌ Нет событий для экспорта', true);
        return;
    }

    const data = {
        events: calendarEvents,
        tags: tags || {},
        exportedAt: new Date().toISOString(),
        version: '1.0'
    };

    const json = JSON.stringify(data, null, 2);

    // Если папка выбрана — сохраняем туда
    if (folderHandle) {
        try {
            console.log(`💾 Сохраняем в папку: ${selectedFolderName}/${fileName}`);
            const fileHandle = await folderHandle.getFileHandle(fileName, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(json);
            await writable.close();
            
            showToast(`✅ Сохранено: ${fileName} (в папку ${selectedFolderName})`);
            console.log(`✅ Сохранено в: ${selectedFolderName}/${fileName}`);
            return;
        } catch (error) {
            console.error('❌ Ошибка сохранения в папку:', error);
            showToast('⚠️ Ошибка сохранения в папку, пробуем в Загрузки...');
        }
    }

    // FALLBACK: сохраняем в Загрузки
    console.log(`💾 Сохраняем в Загрузки: ${fileName}`);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast(`✅ Сохранено: ${fileName} (в Загрузки)`);
    console.log(`✅ Сохранено в Загрузки: ${fileName}`);
}

// ============================================
// ЭКСПОРТ ДЛЯ МОДАЛКИ
// ============================================

window.openSaveFileModal = openSaveFileModal;
window.closeSaveFileModal = closeSaveFileModal;
window.selectSaveFolder = selectSaveFolder;
window.confirmSaveFile = confirmSaveFile;
