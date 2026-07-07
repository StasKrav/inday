// ============================================
// EDITOR-PUBLIC.JS — РЕДАКТОР ПУБЛИЧНЫХ СОБЫТИЙ
// ============================================

// ============================================
// ОТКРЫТИЕ РЕДАКТОРА
// ============================================

function openPublicEventEditor(eventId = null) {
    // Создаем модалку редактора
    let modal = document.getElementById('publicEditorModal');
    
    if (!modal) {
        modal = createEditorModal();
        document.body.appendChild(modal);
    }
    
    // Если передан ID — загружаем событие для редактирования
    if (eventId) {
        const event = calendarEvents.find(e => e.id === eventId);
        if (event && isPublicEvent(event)) {
            loadEventToEditor(event);
        }
    } else {
        clearEditor();
    }
    
    modal.classList.add('visible');
    document.body.style.overflow = 'hidden';
}

function closePublicEventEditor() {
    const modal = document.getElementById('publicEditorModal');
    if (modal) modal.classList.remove('visible');
    document.body.style.overflow = '';
}

// ============================================
// СОЗДАНИЕ МОДАЛКИ РЕДАКТОРА
// ============================================

function createEditorModal() {
    const modal = document.createElement('div');
    modal.id = 'publicEditorModal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content editor-modal">
            <!-- Заголовок -->
            <div class="modal-header editor-header">
                <div style="display:flex;align-items:center;gap:12px;flex:1;">
                    <h3 style="font-size:18px;margin:0;" id="editorTitle">Создание публичного события</h3>
                </div>
                <button class="modal-close" onclick="closePublicEventEditor()">✕</button>
            </div>
            
            <!-- Тело редактора -->
            <div class="modal-body editor-body">
                <!-- Основная информация -->
                <div class="editor-section">
                    <div class="editor-row">
                        <div class="editor-field">
                            <label>Название события *</label>
                            <input type="text" id="editorTitleInput" class="editor-input" placeholder="Введите название...">
                        </div>
                    </div>
                    
                    <div class="editor-row two-cols">
                        <div class="editor-field">
                            <label>Дата *</label>
                            <input type="date" id="editorDateInput" class="editor-input">
                        </div>
                        <div class="editor-field">
                            <label>Время</label>
                            <input type="time" id="editorTimeInput" class="editor-input">
                        </div>
                    </div>
                    
                    <div class="editor-row">
                        <div class="editor-field">
                            <label>Цвет события</label>
                            <div class="editor-color-picker">
                                ${['#8b5cf6', '#ec4899', '#f59e0b', '#22c55e', '#06b6d4', '#ef4444'].map(color => `
                                    <div class="editor-color-option" data-color="${color}" style="background:${color}" onclick="selectEditorColor('${color}', this)"></div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    
                    <div class="editor-row">
                        <div class="editor-field">
                            <label>Источник / Организатор</label>
                            <input type="text" id="editorSourceInput" class="editor-input" placeholder="Например: Большой театр">
                        </div>
                    </div>
                    
                    <div class="editor-row">
                        <div class="editor-field">
                            <label>Место проведения</label>
                            <input type="text" id="editorVenueInput" class="editor-input" placeholder="Название площадки">
                        </div>
                    </div>
                    
                    <div class="editor-row two-cols">
                        <div class="editor-field">
                            <label>Адрес</label>
                            <input type="text" id="editorAddressInput" class="editor-input" placeholder="ул. Театральная, 1">
                        </div>
                        <div class="editor-field">
                            <label>Метро</label>
                            <input type="text" id="editorMetroInput" class="editor-input" placeholder="Театральная">
                        </div>
                    </div>
                    
                    <div class="editor-row">
                        <div class="editor-field">
                            <label>Внешняя ссылка</label>
                            <input type="url" id="editorUrlInput" class="editor-input" placeholder="https://example.com/event">
                        </div>
                    </div>
                </div>
                
                <!-- Разделитель -->
                <div class="editor-divider"></div>
                
                <!-- Описание (Markdown) -->
                <div class="editor-section">
                    <div class="editor-section-header">
                        <label style="font-weight:600;font-size:14px;">Описание (Markdown)</label>
                        <button class="editor-help-btn" onclick="toggleMarkdownHelp()">?</button>
                    </div>
                    
                    <div class="editor-markdown-help" id="markdownHelp" style="display:none;background:var(--background);padding:12px;border-radius:8px;margin-bottom:8px;font-size:12px;color:var(--text-secondary);">
                        <strong>Форматирование:</strong><br>
                        # Заголовок 1<br>
                        ## Заголовок 2<br>
                        **жирный текст**<br>
                        *курсив*<br>
                        [текст ссылки](https://example.com)<br>
                        - пункт списка
                    </div>
                    
                    <textarea id="editorDescriptionInput" class="editor-textarea" rows="8" placeholder="Введите описание в Markdown..."></textarea>
                </div>
                
                <!-- Разделитель -->
                <div class="editor-divider"></div>
                
                <!-- Изображения -->
                <div class="editor-section">
                    <div class="editor-section-header">
                        <label style="font-weight:600;font-size:14px;">Изображения</label>
                        <button class="editor-add-btn" onclick="addImageField()">Добавить</button>
                    </div>
                    <div id="editorImagesContainer">
                        <!-- Динамические поля для изображений -->
                    </div>
                    <div class="editor-hint">Ссылки на изображения (URL)</div>
                </div>
                
                <!-- Разделитель -->
                <div class="editor-divider"></div>
                
                <!-- Видео -->
                <div class="editor-section">
                    <div class="editor-section">
                        <div class="editor-section-header">
                            <label style="font-weight:600;font-size:14px;">Видео</label>
                            <button class="editor-add-btn" onclick="addVideoField()">+ Добавить видео</button>
                        </div>
                        <input type="text" id="editorVideoInput" class="editor-input" placeholder="https://www.youtube.com/embed/... или загрузите файл">
                        <div id="editorVideoContainer"></div>
                        <div class="editor-hint">Поддерживаются ссылки YouTube или загрузка видео файлов</div>
                    </div>
                </div>
                
                <!-- Разделитель -->
                <div class="editor-divider"></div>
                
                <!-- Дополнительные секции -->
                <div class="editor-section">
                    <div class="editor-section-header">
                        <label style="font-weight:600;font-size:14px;">Дополнительные секции</label>
                        <button class="editor-add-btn" onclick="addSectionField()">Добавить</button>
                    </div>
                    <div id="editorSectionsContainer">
                        <!-- Динамические секции -->
                    </div>
                </div>
                
                <!-- Разделитель -->
                <div class="editor-divider"></div>
                
                <!-- Реклама -->
                <div class="editor-section">
                    <div class="editor-section-header">
                        <label style="font-weight:600;font-size:14px;">Рекламные блоки</label>
                        <button class="editor-add-btn" onclick="addAdField()">Добавить</button>
                    </div>
                    <div id="editorAdsContainer">
                        <!-- Динамические рекламные блоки -->
                    </div>
                    <div class="editor-hint">Партнерская реклама и спецпредложения</div>
                </div>
                
                <!-- Кнопки -->
                <div style="margin-top:20px;display:flex;gap:10px;">
                    <button class="editor-save-btn" onclick="savePublicEvent()">Сохранить событие</button>
                    <button class="editor-preview-btn" onclick="previewPublicEvent()">Предпросмотр</button>
                    <button class="editor-cancel-btn" onclick="closePublicEventEditor()">Отмена</button>
                </div>
            </div>
        </div>
    `;
    
    return modal;
}

// ============================================
// УПРАВЛЕНИЕ ПОЛЯМИ
// ============================================

let selectedEditorColor = '#8b5cf6';
let editingPublicEventId = null;

function selectEditorColor(color, element) {
    selectedEditorColor = color;
    document.querySelectorAll('.editor-color-option').forEach(el => {
        el.classList.remove('active');
    });
    element.classList.add('active');
}

function addImageField(value = '') {
    const container = document.getElementById('editorImagesContainer');
    const div = document.createElement('div');
    div.className = 'editor-image-field';
    div.innerHTML = `
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
            <input type="text" class="editor-input" style="flex:1;min-width:150px;" 
                   placeholder="https://example.com/image.jpg" value="${value}">
            <button class="editor-upload-btn" onclick="uploadImage(this)" title="Загрузить файл">
                📁
            </button>
            <button class="editor-remove-btn" onclick="this.parentElement.parentElement.remove()">✕</button>
        </div>
        ${value ? `<div style="margin-top:4px;"><img src="${value}" style="max-height:60px;border-radius:4px;border:1px solid var(--border);"></div>` : ''}
        <div class="editor-upload-preview" style="display:none;margin-top:4px;"></div>
    `;
    container.appendChild(div);
}

// ============================================
// ЗАГРУЗКА НЕСКОЛЬКИХ ИЗОБРАЖЕНИЙ
// ============================================

async function uploadImage(button) {
    const field = button.closest('.editor-image-field');
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;  // ✅ РАЗРЕШАЕМ ВЫБОР НЕСКОЛЬКИХ ФАЙЛОВ
    
    input.onchange = async function(e) {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        
        let loadedCount = 0;
        let errorCount = 0;
        
        for (const file of files) {
            // Проверяем размер (максимум 5MB)
            if (file.size > 5 * 1024 * 1024) {
                showToast(`❌ ${file.name} слишком большой (максимум 5MB)`, true);
                errorCount++;
                continue;
            }
            
            try {
                // Сжимаем и конвертируем в base64
                const base64 = await compressImage(file);
                
                // Добавляем новое поле с загруженным фото
                addImageField(base64);
                loadedCount++;
                
            } catch (error) {
                console.error('❌ Ошибка загрузки:', error);
                errorCount++;
            }
        }
        
        if (loadedCount > 0) {
            showToast(`✅ Загружено ${loadedCount} фото`);
        }
        if (errorCount > 0) {
            showToast(`⚠️ ${errorCount} файлов не загружено`, true);
        }
    };
    
    input.click();
}

// ============================================
// СЖАТИЕ ИЗОБРАЖЕНИЙ
// ============================================

function compressImage(file, maxWidth = 1200, quality = 0.8) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                // Вычисляем новые размеры
                let width = img.width;
                let height = img.height;
                
                if (width > maxWidth) {
                    height = height * (maxWidth / width);
                    width = maxWidth;
                }
                
                // Создаем canvas и сжимаем
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// ============================================
// ЗАГРУЗКА ВИДЕО
// ============================================

function addVideoField(value = '') {
    const container = document.getElementById('editorVideoContainer');
    if (!container) {
        // Создаем контейнер если его нет
        const section = document.querySelector('.editor-section:has(#editorVideoInput)');
        if (section) {
            const wrapper = document.createElement('div');
            wrapper.id = 'editorVideoContainer';
            wrapper.style.marginTop = '8px';
            section.querySelector('.editor-section-header').after(wrapper);
        }
    }
    
    const div = document.createElement('div');
    div.className = 'editor-video-field';
    div.innerHTML = `
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
            <input type="text" class="editor-input" style="flex:1;min-width:150px;" 
                   placeholder="https://www.youtube.com/embed/..." value="${value}">
            <button class="editor-upload-btn" onclick="uploadVideo(this)" title="Загрузить видео файл">
                📁
            </button>
            ${value ? `<button class="editor-remove-btn" onclick="this.parentElement.parentElement.remove()">✕</button>` : ''}
        </div>
        ${value ? `<div style="margin-top:4px;font-size:12px;color:var(--text-secondary);">🎬 Видео загружено</div>` : ''}
        <div class="editor-upload-preview" style="display:none;margin-top:4px;"></div>
    `;
    
    const container2 = document.getElementById('editorVideoContainer');
    if (container2) {
        container2.appendChild(div);
    }
}

async function uploadVideo(button) {
    const field = button.closest('.editor-video-field') || button.closest('.editor-field');
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';
    
    input.onchange = async function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        // Проверяем размер (максимум 20MB)
        if (file.size > 20 * 1024 * 1024) {
            showToast('❌ Файл слишком большой (максимум 20MB)', true);
            return;
        }
        
        const preview = field.querySelector('.editor-upload-preview');
        preview.style.display = 'block';
        preview.innerHTML = `
            <div style="display:flex;align-items:center;gap:8px;padding:4px 8px;background:var(--background);border-radius:4px;">
                <span>🔄 Загрузка...</span>
                <span style="font-size:11px;color:var(--text-secondary);">${file.name}</span>
            </div>
        `;
        
        try {
            const base64 = await fileToBase64(file);
            
            const textInput = field.querySelector('input[type="text"]');
            textInput.value = base64;
            
            preview.innerHTML = `
                <div style="display:flex;align-items:center;gap:8px;padding:4px 8px;background:var(--primary-bg);border-radius:4px;border:1px solid var(--primary);">
                    <span>✅ Видео загружено</span>
                    <span style="font-size:11px;color:var(--text-secondary);">${file.name}</span>
                    <video src="${base64}" style="max-height:40px;border-radius:4px;" muted></video>
                </div>
            `;
            
            showToast(`✅ Видео загружено: ${file.name}`);
            
        } catch (error) {
            console.error('❌ Ошибка загрузки:', error);
            preview.innerHTML = `
                <div style="padding:4px 8px;color:#ef4444;background:rgba(239,68,68,0.1);border-radius:4px;">
                    ❌ Ошибка загрузки видео
                </div>
            `;
            showToast('❌ Ошибка загрузки видео', true);
        }
    };
    
    input.click();
}

function addSectionField(title = '', content = '', icon = '📌') {
    const container = document.getElementById('editorSectionsContainer');
    const div = document.createElement('div');
    div.className = 'editor-section-field';
    div.innerHTML = `
        <div style="display:flex;gap:8px;margin-bottom:4px;">
            <input type="text" class="editor-input" style="flex:0.5;" placeholder="Иконка" value="${icon}">
            <input type="text" class="editor-input" style="flex:2;" placeholder="Название секции" value="${title}">
            <button class="editor-remove-btn" onclick="this.parentElement.parentElement.remove()">✕</button>
        </div>
        <textarea class="editor-textarea" rows="3" placeholder="Содержание секции (Markdown)">${content}</textarea>
    `;
    container.appendChild(div);
}

function addAdField(title = '', description = '', image = '', link = '', buttonText = 'Подробнее →') {
    const container = document.getElementById('editorAdsContainer');
    const div = document.createElement('div');
    div.className = 'editor-ad-field';
    div.innerHTML = `
        <div style="display:flex;gap:8px;margin-bottom:4px;">
            <input type="text" class="editor-input" style="flex:2;" placeholder="Заголовок рекламы" value="${title}">
            <button class="editor-remove-btn" onclick="this.parentElement.parentElement.remove()">✕</button>
        </div>
        <div style="display:flex;gap:8px;margin-bottom:4px;">
            <input type="text" class="editor-input" style="flex:1;" placeholder="Описание" value="${description}">
            <input type="text" class="editor-input" style="flex:1;" placeholder="URL картинки" value="${image}">
        </div>
        <div style="display:flex;gap:8px;">
            <input type="text" class="editor-input" style="flex:1;" placeholder="Ссылка" value="${link}">
            <input type="text" class="editor-input" style="flex:0.7;" placeholder="Текст кнопки" value="${buttonText}">
        </div>
    `;
    container.appendChild(div);
}

// ============================================
// ЗАГРУЗКА СОБЫТИЯ В РЕДАКТОР
// ============================================

function loadEventToEditor(event) {
    editingPublicEventId = event.id;
    
    document.getElementById('editorTitle').textContent = 'Редактирование события';
    document.getElementById('editorTitleInput').value = event.title || '';
    document.getElementById('editorDateInput').value = event.date || '';
    document.getElementById('editorTimeInput').value = event.time || '';
    document.getElementById('editorSourceInput').value = event.source || '';
    document.getElementById('editorUrlInput').value = event.externalUrl || '';
    
    // Цвет
    if (event.color) {
        selectedEditorColor = event.color;
        document.querySelectorAll('.editor-color-option').forEach(el => {
            el.classList.toggle('active', el.dataset.color === event.color);
        });
    }
    
    const content = event.content || {};
    
    document.getElementById('editorVenueInput').value = content.venue || '';
    document.getElementById('editorAddressInput').value = content.address || '';
    document.getElementById('editorMetroInput').value = content.metro || '';
    document.getElementById('editorDescriptionInput').value = content.description || '';
    document.getElementById('editorVideoInput').value = content.video || '';
    
    // Изображения
    const imagesContainer = document.getElementById('editorImagesContainer');
    imagesContainer.innerHTML = '';
    if (content.images && content.images.length > 0) {
        content.images.forEach(img => addImageField(img));
    }
    
    // Секции
    const sectionsContainer = document.getElementById('editorSectionsContainer');
    sectionsContainer.innerHTML = '';
    if (content.sections && content.sections.length > 0) {
        content.sections.forEach(s => addSectionField(s.title, s.content, s.icon || '📌'));
    }
    
    // Реклама
    const adsContainer = document.getElementById('editorAdsContainer');
    adsContainer.innerHTML = '';
    if (content.ads && content.ads.length > 0) {
        content.ads.forEach(ad => addAdField(ad.title, ad.description, ad.image, ad.link, ad.buttonText));
    }
}

function clearEditor() {
    editingPublicEventId = null;
    document.getElementById('editorTitle').textContent = 'Создание публичного события';
    document.getElementById('editorTitleInput').value = '';
    document.getElementById('editorDateInput').value = formatDateKey(new Date());
    document.getElementById('editorTimeInput').value = '';
    document.getElementById('editorSourceInput').value = '';
    document.getElementById('editorUrlInput').value = '';
    document.getElementById('editorVenueInput').value = '';
    document.getElementById('editorAddressInput').value = '';
    document.getElementById('editorMetroInput').value = '';
    document.getElementById('editorDescriptionInput').value = '';
    document.getElementById('editorVideoInput').value = '';
    
    document.getElementById('editorImagesContainer').innerHTML = '';
    document.getElementById('editorSectionsContainer').innerHTML = '';
    document.getElementById('editorAdsContainer').innerHTML = '';
    
    // Цвет по умолчанию
    selectedEditorColor = '#8b5cf6';
    document.querySelectorAll('.editor-color-option').forEach(el => {
        el.classList.toggle('active', el.dataset.color === '#8b5cf6');
    });
}

// ============================================
// СОХРАНЕНИЕ СОБЫТИЯ (ИСПРАВЛЕННОЕ)
// ============================================

function savePublicEvent() {
    const title = document.getElementById('editorTitleInput').value.trim();
    const date = document.getElementById('editorDateInput').value;
    const time = document.getElementById('editorTimeInput').value;
    const source = document.getElementById('editorSourceInput').value.trim();
    const externalUrl = document.getElementById('editorUrlInput').value.trim();
    const venue = document.getElementById('editorVenueInput').value.trim();
    const address = document.getElementById('editorAddressInput').value.trim();
    const metro = document.getElementById('editorMetroInput').value.trim();
    const description = document.getElementById('editorDescriptionInput').value.trim();
    
    // ✅ ОДНО ОБЪЯВЛЕНИЕ video
    let video = document.getElementById('editorVideoInput').value.trim();
    
    // Валидация
    if (!title) {
        showToast('Введите название события', true);
        return;
    }
    if (!date) {
        showToast('Выберите дату', true);
        return;
    }
    
    // Собираем изображения
    const images = [];
    document.querySelectorAll('#editorImagesContainer .editor-image-field input').forEach(input => {
        if (input.value.trim()) images.push(input.value.trim());
    });
    
    // Собираем дополнительные видео (если есть)
    document.querySelectorAll('#editorVideoContainer .editor-video-field input[type="text"]').forEach(input => {
        if (input.value.trim() && input.id !== 'editorVideoInput') {
            // Можно сохранить как дополнительное видео
            // или добавить к основному через запятую
            if (video) video += ',';
            video += input.value.trim();
        }
    });
    
    // Собираем секции
    const sections = [];
    document.querySelectorAll('#editorSectionsContainer .editor-section-field').forEach(div => {
        const inputs = div.querySelectorAll('input');
        const textarea = div.querySelector('textarea');
        if (inputs[1]?.value.trim()) {
            sections.push({
                icon: inputs[0]?.value.trim() || '📌',
                title: inputs[1]?.value.trim(),
                content: textarea?.value.trim() || ''
            });
        }
    });
    
    // Собираем рекламу
    const ads = [];
    document.querySelectorAll('#editorAdsContainer .editor-ad-field').forEach(div => {
        const inputs = div.querySelectorAll('input');
        if (inputs[0]?.value.trim()) {
            ads.push({
                title: inputs[0]?.value.trim(),
                description: inputs[1]?.value.trim() || '',
                image: inputs[2]?.value.trim() || '',
                link: inputs[3]?.value.trim() || '#',
                buttonText: inputs[4]?.value.trim() || 'Подробнее →'
            });
        }
    });
    
    // Создаем объект события
    const eventData = {
        id: editingPublicEventId || 'pub_' + Date.now(),
        title: title,
        date: date,
        time: time || '',
        color: selectedEditorColor,
        type: 'public',
        source: source || 'Публичное событие',
        externalUrl: externalUrl || '',
        content: {
            venue: venue || '',
            address: address || '',
            metro: metro || '',
            description: description || '',
            images: images,
            video: video || '',
            sections: sections,
            ads: ads
        }
    };
    
    // Сохраняем
    if (editingPublicEventId) {
        const index = calendarEvents.findIndex(e => e.id === editingPublicEventId);
        if (index !== -1) {
            calendarEvents[index] = { ...calendarEvents[index], ...eventData };
            showToast('✅ Событие обновлено');
        }
    } else {
        calendarEvents.push(eventData);
        showToast('✅ Публичное событие создано');
    }
    
    saveCalendarEvents();
    renderTimeline();
    renderMiniCalendar();
    closePublicEventEditor();
}

// ============================================
// ПРЕДПРОСМОТР
// ============================================

function previewPublicEvent() {
    // Временно сохраняем и открываем в просмотрщике
    const tempId = 'preview_' + Date.now();
    const tempEvent = {
        id: tempId,
        title: document.getElementById('editorTitleInput').value.trim() || 'Без названия',
        date: document.getElementById('editorDateInput').value || formatDateKey(new Date()),
        time: document.getElementById('editorTimeInput').value || '',
        color: selectedEditorColor,
        type: 'public',
        source: document.getElementById('editorSourceInput').value.trim() || 'Публичное событие',
        externalUrl: document.getElementById('editorUrlInput').value.trim() || '',
        content: {
            venue: document.getElementById('editorVenueInput').value.trim() || '',
            address: document.getElementById('editorAddressInput').value.trim() || '',
            metro: document.getElementById('editorMetroInput').value.trim() || '',
            description: document.getElementById('editorDescriptionInput').value.trim() || '',
            video: document.getElementById('editorVideoInput').value.trim() || '',
            images: [],
            sections: [],
            ads: []
        }
    };
    
    // Собираем изображения
    document.querySelectorAll('#editorImagesContainer .editor-image-field input').forEach(input => {
        if (input.value.trim()) tempEvent.content.images.push(input.value.trim());
    });
    
    // Собираем секции
    document.querySelectorAll('#editorSectionsContainer .editor-section-field').forEach(div => {
        const inputs = div.querySelectorAll('input');
        const textarea = div.querySelector('textarea');
        if (inputs[1]?.value.trim()) {
            tempEvent.content.sections.push({
                icon: inputs[0]?.value.trim() || '📌',
                title: inputs[1]?.value.trim(),
                content: textarea?.value.trim() || ''
            });
        }
    });
    
    // Собираем рекламу
    document.querySelectorAll('#editorAdsContainer .editor-ad-field').forEach(div => {
        const inputs = div.querySelectorAll('input');
        if (inputs[0]?.value.trim()) {
            tempEvent.content.ads.push({
                title: inputs[0]?.value.trim(),
                description: inputs[1]?.value.trim() || '',
                image: inputs[2]?.value.trim() || '',
                link: inputs[3]?.value.trim() || '#',
                buttonText: inputs[4]?.value.trim() || 'Подробнее →'
            });
        }
    });
    
    // Показываем предпросмотр
    closePublicEventEditor();
    setTimeout(() => {
        // Добавляем временное событие
        const existing = calendarEvents.find(e => e.id === tempId);
        if (!existing) {
            calendarEvents.push(tempEvent);
            renderTimeline();
            // Открываем детали
            showEventDetails(tempId);
            // Удаляем временное событие после просмотра
            setTimeout(() => {
                calendarEvents = calendarEvents.filter(e => e.id !== tempId);
                saveCalendarEvents();
                renderTimeline();
            }, 100);
        }
    }, 300);
}

// ============================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function isImageFile(file) {
    return file.type.startsWith('image/');
}

function isVideoFile(file) {
    return file.type.startsWith('video/');
}

function toggleMarkdownHelp() {
    const help = document.getElementById('markdownHelp');
    help.style.display = help.style.display === 'none' ? 'block' : 'none';
}

// ============================================
// СТИЛИ ДЛЯ РЕДАКТОРА
// ============================================

function addEditorStyles() {
    const styleId = 'editor-styles';
    if (document.getElementById(styleId)) return;
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        .editor-modal {
            max-width: 700px !important;
            max-height: 90vh !important;
        }
        
        .editor-body {
            overflow-y: auto;
            max-height: calc(90vh - 120px);
        }
        
        .editor-section {
            margin-bottom: 16px;
        }
        
        .editor-row {
            margin-bottom: 10px;
        }
        
        .editor-row.two-cols {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
        }
        
        .editor-field label {
            display: block;
            font-size: 12px;
            font-weight: 600;
            color: var(--text-secondary);
            margin-bottom: 4px;
        }
        
        .editor-input {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid var(--border);
            border-radius: 8px;
            background: var(--background);
            color: var(--text);
            font-size: 14px;
            font-family: inherit;
            transition: all 0.2s ease;
            box-sizing: border-box;
        }
        
        .editor-input:focus {
            border-color: var(--primary);
            outline: none;
            box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
        }
        
        .editor-textarea {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid var(--border);
            border-radius: 8px;
            background: var(--background);
            color: var(--text);
            font-size: 14px;
            font-family: monospace;
            resize: vertical;
            transition: all 0.2s ease;
            box-sizing: border-box;
        }
        
        .editor-textarea:focus {
            border-color: var(--primary);
            outline: none;
            box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
        }
        
        .editor-divider {
            height: 1px;
            background: var(--border);
            margin: 16px 0;
        }
        
        .editor-section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        }
        
        .editor-add-btn {
            padding: 4px 12px;
            border: 1px dashed var(--primary);
            background: transparent;
            color: var(--primary);
            border-radius: 12px;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s ease;
            font-family: inherit;
        }
        
        .editor-add-btn:hover {
            background: var(--primary);
            color: white;
        }
        
        .editor-remove-btn {
            padding: 2px 8px;
            border: none;
            background: transparent;
            color: #ef4444;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.2s ease;
        }
        
        .editor-remove-btn:hover {
            transform: scale(1.2);
        }
        
        .editor-color-picker {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
        }
        
        .editor-color-option {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .editor-color-option:hover {
            transform: scale(1.1);
        }
        
        .editor-color-option.active {
            border-color: var(--text);
            transform: scale(1.4);
            box-shadow: 0 0 12px rgba(0,0,0,0.2);
        }
        
        .editor-image-field,
        .editor-section-field,
        .editor-ad-field {
            margin-bottom: 8px;
            padding: 8px;
            background: var(--background);
            border-radius: 8px;
            border: 1px solid var(--border);
        }
        
        .editor-hint {
            font-size: 11px;
            color: var(--text-secondary);
            opacity: 0.5;
            margin-top: 4px;
        }
        
        .editor-help-btn {
            width: 24px;
            height: 24px;
            border: 1px solid var(--border);
            background: transparent;
            border-radius: 50%;
            cursor: pointer;
            font-size: 14px;
            font-weight: 700;
            color: var(--text-secondary);
            transition: all 0.2s ease;
            font-family: inherit;
        }
        
        .editor-help-btn:hover {
            background: var(--primary-bg);
            color: var(--primary);
        }
        
        .editor-save-btn {
            padding: 10px 24px;
            background: var(--primary);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            font-family: inherit;
        }
        
        .editor-save-btn:hover {
            background: var(--primary-dark);
            transform: translateY(-2px);
            box-shadow: var(--shadow-md);
        }
        
        .editor-preview-btn {
            padding: 10px 24px;
            background: var(--background);
            color: var(--text);
            border: 1px solid var(--border);
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            font-family: inherit;
        }
        
        .editor-preview-btn:hover {
            background: var(--primary-bg);
            border-color: var(--primary);
            color: var(--primary);
        }
        
        .editor-cancel-btn {
            padding: 10px 24px;
            background: transparent;
            color: var(--text-secondary);
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            font-family: inherit;
            margin-left: auto;
        }
        
        .editor-cancel-btn:hover {
            background: var(--hover-bg);
            color: var(--text);
        }
        
        @media (max-width: 768px) {
            .editor-row.two-cols {
                grid-template-columns: 1fr;
            }
        }
    `;
    document.head.appendChild(style);
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    addEditorStyles();
});

// ============================================
// ЭКСПОРТ
// ============================================

window.openPublicEventEditor = openPublicEventEditor;
window.closePublicEventEditor = closePublicEventEditor;
window.savePublicEvent = savePublicEvent;
window.previewPublicEvent = previewPublicEvent;
window.selectEditorColor = selectEditorColor;
window.addImageField = addImageField;
window.addSectionField = addSectionField;
window.addAdField = addAdField;
window.toggleMarkdownHelp = toggleMarkdownHelp;
