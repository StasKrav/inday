// ============================================
// DETAILS.JS — ИСПРАВЛЕННАЯ ВЕРСИЯ (БЕЗ ДУБЛИКАТОВ)
// ============================================

// Функция для получения актуальных событий
function getEvents() {
    // Сначала пробуем получить из window
    if (window.calendarEvents && window.calendarEvents.length > 0) {
        return window.calendarEvents;
    }
    // Если window пустой — используем глобальную
    return calendarEvents || [];
}

let currentDetailEventId = null;

function showEventDetails(eventId) {
    // ✅ НЕ ПРЕОБРАЗОВЫВАТЬ строковый ID в число
    const id = eventId;  // Просто оставляем как есть
    
    console.log('🔍 showEventDetails вызвана с id:', id, 'тип:', typeof id);
    
    // Используем глобальные события
    const events = window.calendarEvents || calendarEvents || [];
    console.log('📋 Всего событий:', events.length);
    
    const event = events.find(e => {
        // Сравниваем как строки (и числа, и строки)
        return String(e.id) === String(id);
    });
    
    console.log('🎯 Найдено событие:', event?.title || 'НЕ НАЙДЕНО');
    
    if (!event) {
        showToast('❌ Событие не найдено', true);
        return;
    }

    currentDetailEventId = event.id;
    const isPublic = event.type === 'public';
    const isAdmin = localStorage.getItem('calendar_admin_mode') === 'true';

    const fab = document.querySelector('.fab');
        const headerBtn = document.getElementById('headerAddBtn');
        
        if (fab) {
            fab.style.display = 'none';  // Скрываем FAB
            fab.style.opacity = '0';
            fab.style.pointerEvents = 'none';
        }
        if (headerBtn) {
            headerBtn.style.display = 'flex';  // Показываем кнопку в хедере
        }

    // Показываем детали
    document.getElementById('emptyState').style.display = 'none';
    document.getElementById('eventDetails').style.display = 'flex';

    // Основная информация
    document.getElementById('detailColor').style.background = event.color || '#6366f1';
    document.getElementById('detailTitle').textContent = event.title || 'Без названия';

    // Дата и время
    let dateStr = '—';
    let timeStr = '—';
    if (event.date) {
        const dateObj = parseDateKey(event.date);
        dateStr = formatDateDisplay(dateObj);
        timeStr = event.time || 'Весь день';
    }
    document.getElementById('detailDateTime').textContent = dateStr;
    document.getElementById('detailTime').textContent = timeStr;

    // Описание
    const desc = event.description || (event.content?.description) || 'Нет описания';
    document.getElementById('detailDescription').textContent = desc;

    // Теги
    const tagsContainer = document.getElementById('detailTags');
    tagsContainer.innerHTML = '';
    if (event.tags && event.tags.length > 0) {
        event.tags.forEach(tagId => {
            const tag = tags[tagId];
            if (tag) {
                const span = document.createElement('span');
                span.className = 'detail-tag';
                span.style.background = tag.color + '20';
                span.style.color = tag.color;
                span.innerHTML = `<span class="tag-dot" style="background:${tag.color}"></span>${tag.name}`;
                tagsContainer.appendChild(span);
            }
        });
    } else {
        tagsContainer.innerHTML = '<span style="color:var(--text-secondary);opacity:0.4;font-size:12px;">Нет тегов</span>';
    }

    // ============================================
    // УПРАВЛЕНИЕ КНОПКАМИ
    // ============================================
    const editBtn = document.querySelector('.btn-edit');
    const deleteBtn = document.querySelector('.btn-delete');

    // Убираем старый бейдж
    const oldBadge = document.querySelector('.public-badge');
    if (oldBadge) oldBadge.remove();

    // Добавляем бейдж "Публичное" для публичных событий
    if (isPublic) {
        const titleWrap = document.querySelector('.details-title-wrap');
        const badge = document.createElement('span');
        badge.className = 'public-badge';
        badge.textContent = 'Публичное';
        titleWrap.appendChild(badge);
    }

    // ============================================
    // ЛОГИКА КНОПОК
    // ============================================
    
    if (isPublic) {
        // ======= ПУБЛИЧНОЕ СОБЫТИЕ =======
        if (isAdmin) {
            // ✅ АДМИН: может редактировать и удалять
            editBtn.style.display = 'flex';
            deleteBtn.style.display = 'flex';
            deleteBtn.textContent = 'Удалить';
            editBtn.innerHTML = `

                Редактировать
            `;
            editBtn.title = 'Редактировать публичное событие (админ)';
        } else {
            // ❌ ПОЛЬЗОВАТЕЛЬ: только удаление
            editBtn.style.display = 'none';
            deleteBtn.style.display = 'flex';
            deleteBtn.textContent = 'Удалить';
        }
    } else {
        // ======= ЛИЧНОЕ СОБЫТИЕ =======
        editBtn.style.display = 'flex';
        deleteBtn.style.display = 'flex';
        deleteBtn.textContent = 'Удалить';
        editBtn.innerHTML = `

            Редактировать
        `;
        editBtn.title = 'Редактировать событие';
    }

    // Отключаем клик по событию в таймлайне
    document.querySelectorAll('.timeline-event').forEach(el => {
        el.style.cursor = 'default';
    });
}

// ============================================
// ЗАКРЫТИЕ ДЕТАЛЕЙ
// ============================================

function closeDetails() {
    document.getElementById('eventDetails').style.display = 'none';
    document.getElementById('emptyState').style.display = 'flex';
    currentDetailEventId = null;

    // ============================================
    // ВОССТАНАВЛИВАЕМ FAB И КНОПКУ В ХЕДЕРЕ
    // ============================================
    const fab = document.querySelector('.fab');
    const headerBtn = document.getElementById('headerAddBtn');
    
    if (fab) {
        fab.style.display = 'flex';
        fab.style.opacity = '1';
        fab.style.pointerEvents = 'auto';
    }
    if (headerBtn) {
        headerBtn.style.display = 'none';
    }

    document.querySelectorAll('.timeline-event').forEach(el => {
        el.style.cursor = 'pointer';
    });
}

// ============================================
// УДАЛЕНИЕ ИЗ ДЕТАЛЕЙ
// ============================================

function deleteEventFromDetail() {
    if (currentDetailEventId) {
        deleteEvent(currentDetailEventId);
    }
}

// ============================================
// РЕДАКТИРОВАНИЕ ИЗ ДЕТАЛЕЙ
// ============================================

function editEventFromDetail() {
    if (!currentDetailEventId) return;
    
    const events = window.calendarEvents || calendarEvents || [];
    // ✅ Сравниваем как строки
    const event = events.find(e => String(e.id) === String(currentDetailEventId));
    if (!event) return;
    
    const isPublic = event.type === 'public';
    const isAdmin = localStorage.getItem('calendar_admin_mode') === 'true';
    
    if (isPublic && !isAdmin) {
        showToast('❌ Публичные события может редактировать только администратор', true);
        return;
    }
    
    closeDetails();
    
    if (isPublic && isAdmin) {
        setTimeout(() => {
            if (typeof openPublicEventEditor === 'function') {
                openPublicEventEditor(event.id);
            } else {
                showToast('❌ Редактор публичных событий не найден', true);
            }
        }, 300);
    } else {
        setTimeout(() => {
            editEvent(event.id);
        }, 300);
    }
}

// ============================================
// РЕНДЕРИНГ ДЛЯ СТАРЫХ ВЫЗОВОВ (совместимость)
// ============================================

function renderEventDetails(event) {
    showEventDetails(event.id);
}

// ============================================
// РЕНДЕРИНГ ЛИЧНОГО СОБЫТИЯ
// ============================================

function renderPersonalEvent(event, container) {
    container.innerHTML = `
        <div class="detail-row">
            <span class="detail-label">Дата</span>
            <span class="detail-value">${formatDateTimeDisplay(event.date, event.time)}</span>
        </div>
        ${event.time ? `
            <div class="detail-row">
                <span class="detail-label">Время</span>
                <span class="detail-value">${event.time}</span>
            </div>
        ` : ''}
        <div class="detail-row">
            <span class="detail-label">Описание</span>
            <span class="detail-value">${escapeHtml(event.description || 'Нет описания')}</span>
        </div>
        ${event.tags && event.tags.length > 0 ? `
            <div class="detail-row">
                <span class="detail-label">Теги</span>
                <div class="detail-tags">
                    ${event.tags.map(tagId => {
                        const tag = tags[tagId];
                        return tag ? `
                            <span class="detail-tag" style="background: ${tag.color}22; color: ${tag.color}; border: 1px solid ${tag.color}44;">
                                <span class="tag-dot" style="background: ${tag.color};"></span>
                                ${tag.name}
                            </span>
                        ` : '';
                    }).join('')}
                </div>
            </div>
        ` : ''}
        <div class="detail-badge personal-badge">
            Личное событие
        </div>
    `;
    addPersonalStyles();
}

// ============================================
// РЕНДЕРИНГ ПУБЛИЧНОГО СОБЫТИЯ
// ============================================

function renderPublicEvent(event, container) {
    const content = event.content || {};
    addPublicStyles();
    
    let html = `
        <div class="public-event-container">
            <!-- ЗАГОЛОВОК -->
            <div class="public-header">
                <h1 class="public-title">${escapeHtml(event.title)}</h1>
                ${event.source ? `<div class="public-source">${escapeHtml(event.source)}</div>` : ''}
                <div class="public-status-badge">📌 Публичное</div>
            </div>
            
            <!-- БАЗОВАЯ ИНФОРМАЦИЯ -->
            <div class="public-meta">
                <span class="public-meta-item">📅 ${formatDateTimeDisplay(event.date, event.time)}</span>
                ${content.venue ? `<span class="public-meta-item">📍 ${escapeHtml(content.venue)}</span>` : ''}
                ${content.address ? `<span class="public-meta-item">🏠 ${escapeHtml(content.address)}</span>` : ''}
            </div>
    `;
    
    // ГАЛЕРЕЯ
    if (content.images && content.images.length > 0) {
        const validImages = content.images.filter(img => img && img.trim());
        if (validImages.length > 0) {
            const count = validImages.length;
            
            html += `<div class="public-gallery-wrapper">`;
            
            if (count === 1) {
                html += `
                    <div class="public-gallery-single" onclick="openImageGallery('${validImages[0]}')">
                        <img src="${validImages[0]}" class="public-gallery-img" onerror="this.parentElement.style.display='none'">
                    </div>
                `;
            } else if (count === 2) {
                html += `
                    <div class="public-gallery-two">
                        ${validImages.map(img => `
                            <div class="public-gallery-item" onclick="openImageGallery('${img}')">
                                <img src="${img}" class="public-gallery-img" onerror="this.parentElement.style.display='none'">
                            </div>
                        `).join('')}
                    </div>
                `;
            } else if (count === 3) {
                html += `
                    <div class="public-gallery-three">
                        <div class="public-gallery-three-main" onclick="openImageGallery('${validImages[0]}')">
                            <img src="${validImages[0]}" class="public-gallery-img" onerror="this.parentElement.style.display='none'">
                        </div>
                        <div class="public-gallery-three-side">
                            ${validImages.slice(1).map(img => `
                                <div class="public-gallery-item" onclick="openImageGallery('${img}')">
                                    <img src="${img}" class="public-gallery-img" onerror="this.parentElement.style.display='none'">
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            } else {
                html += `
                    <div class="public-gallery-grid">
                        ${validImages.map(img => `
                            <div class="public-gallery-item" onclick="openImageGallery('${img}')">
                                <img src="${img}" class="public-gallery-img" onerror="this.parentElement.style.display='none'">
                            </div>
                        `).join('')}
                    </div>
                `;
            }
            
            html += `</div>`;
        }
    }
    
    // ВИДЕО
    if (content.video && content.video.trim()) {
        const isBase64 = content.video.startsWith('data:video/');
        const isYouTube = content.video.includes('youtube.com/embed') || content.video.includes('youtu.be');
        
        if (isBase64) {
            html += `
                <div class="public-video-section">
                    <video controls class="public-video-player">
                        <source src="${content.video}">
                        Ваш браузер не поддерживает видео
                    </video>
                </div>
            `;
        } else if (isYouTube) {
            html += `
                <div class="public-video-section">
                    <div class="public-video-wrapper">
                        <iframe src="${content.video}" frameborder="0" allowfullscreen></iframe>
                    </div>
                </div>
            `;
        } else {
            html += `
                <div class="public-video-section">
                    <video controls class="public-video-player">
                        <source src="${content.video}">
                        Ваш браузер не поддерживает видео
                    </video>
                </div>
            `;
        }
    }
    
    // ОПИСАНИЕ
    if (content.description) {
        html += `
            <div class="public-description markdown-body">
                ${renderMarkdown(content.description)}
            </div>
        `;
    }
    
    // СЕКЦИИ
    if (content.sections && content.sections.length > 0) {
        html += content.sections.map(section => `
            <div class="public-section">
                <div class="public-section-title">${escapeHtml(section.title)}</div>
                <div class="public-section-content markdown-body">
                    ${renderMarkdown(section.content)}
                </div>
            </div>
        `).join('');
    }
    
    // РЕКЛАМА
    if (content.ads && content.ads.length > 0) {
        html += `
            <div class="public-ads">
                ${content.ads.map(ad => `
                    <a href="${ad.link || '#'}" target="_blank" class="public-ad">
                        ${ad.image ? `<img src="${ad.image}" class="public-ad-img" onerror="this.style.display='none'">` : ''}
                        <div class="public-ad-content">
                            <div class="public-ad-title">${escapeHtml(ad.title)}</div>
                            ${ad.description ? `<div class="public-ad-desc">${escapeHtml(ad.description)}</div>` : ''}
                            <span class="public-ad-btn">${escapeHtml(ad.buttonText || 'Подробнее')}</span>
                        </div>
                    </a>
                `).join('')}
            </div>
        `;
    }
    
    // ВНЕШНЯЯ ССЫЛКА
    if (event.externalUrl && event.externalUrl.trim()) {
        html += `
            <div class="public-external-link">
                <a href="${event.externalUrl}" target="_blank">🔗 Открыть страницу события</a>
            </div>
        `;
    }
    
    html += `</div>`;
    
    container.innerHTML = html;
}

// ============================================
// РЕНДЕРИНГ MARKDOWN
// ============================================

function renderMarkdown(text) {
    if (!text) return '';
    
    let html = text;
    
    // Заголовки
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // Жирный
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Курсив
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Ссылки
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
    
    // Списки
    html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    
    // Абзацы
    html = html.replace(/\n\n/g, '</p><p>');
    html = '<p>' + html + '</p>';
    html = html.replace(/<p><ul>/g, '<ul>');
    html = html.replace(/<\/ul><\/p>/g, '</ul>');
    html = html.replace(/<p><\/p>/g, '');
    
    return html;
}

// ============================================
// СТИЛИ
// ============================================

function addPersonalStyles() {
    const styleId = 'personal-event-styles';
    if (document.getElementById(styleId)) return;
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        .detail-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
            margin-top: 12px;
        }
        .personal-badge {
            background: rgba(99, 102, 241, 0.1);
            color: #6366f1;
            border: 1px solid rgba(99, 102, 241, 0.2);
        }
        .public-badge {
            background: rgba(139, 92, 246, 0.1);
            color: #8b5cf6;
            border: 1px solid rgba(139, 92, 246, 0.2);
        }
    `;
    document.head.appendChild(style);
}

function addPublicStyles() {
    const styleId = 'public-event-styles';
    if (document.getElementById(styleId)) return;
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        .public-event-container {
            font-family: 'Inter', -apple-system, sans-serif;
            color: var(--text);
            padding: 4px 0;
        }
        .public-header { margin-bottom: 12px; }
        .public-title { font-size: 22px; font-weight: 700; margin: 0; line-height: 1.2; }
        .public-source { font-size: 13px; color: var(--text-secondary); opacity: 0.5; margin-top: 2px; }
        .public-status-badge {
            display: inline-block;
            padding: 2px 12px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: 600;
            background: rgba(139, 92, 246, 0.08);
            color: #8b5cf6;
            border: 1px solid rgba(139, 92, 246, 0.12);
            margin-top: 4px;
        }
        .public-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 8px 16px;
            padding: 8px 0;
            margin-bottom: 12px;
            border-bottom: 1px solid var(--border);
            font-size: 13px;
            color: var(--text-secondary);
        }
        .public-gallery-wrapper { margin: 12px 0; }
        .public-gallery-single {
            width: 100%;
            border-radius: 12px;
            overflow: hidden;
            cursor: pointer;
            background: var(--background);
        }
        .public-gallery-single .public-gallery-img {
            width: 100%;
            height: auto;
            max-height: 500px;
            object-fit: cover;
            display: block;
        }
        .public-gallery-two {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 6px;
        }
        .public-gallery-two .public-gallery-item {
            aspect-ratio: 4/3;
            border-radius: 10px;
            overflow: hidden;
            cursor: pointer;
            background: var(--background);
        }
        .public-gallery-two .public-gallery-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }
        .public-gallery-three {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 6px;
        }
        .public-gallery-three-main {
            aspect-ratio: 4/3;
            border-radius: 10px;
            overflow: hidden;
            cursor: pointer;
            background: var(--background);
        }
        .public-gallery-three-main .public-gallery-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }
        .public-gallery-three-side {
            display: grid;
            grid-template-rows: 1fr 1fr;
            gap: 6px;
        }
        .public-gallery-three-side .public-gallery-item {
            aspect-ratio: 1/1;
            border-radius: 10px;
            overflow: hidden;
            cursor: pointer;
            background: var(--background);
        }
        .public-gallery-three-side .public-gallery-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }
        .public-gallery-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 6px;
        }
        .public-gallery-grid .public-gallery-item {
            aspect-ratio: 4/3;
            border-radius: 10px;
            overflow: hidden;
            cursor: pointer;
            background: var(--background);
        }
        .public-gallery-grid .public-gallery-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }
        .public-gallery-item:hover,
        .public-gallery-single:hover,
        .public-gallery-three-main:hover {
            transform: scale(1.01);
            transition: transform 0.2s ease;
        }
        .public-video-section { margin: 12px 0; }
        .public-video-wrapper {
            position: relative;
            padding-bottom: 56.25%;
            height: 0;
            border-radius: 10px;
            overflow: hidden;
        }
        .public-video-wrapper iframe {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        }
        .public-video-player {
            width: 100%;
            border-radius: 10px;
            max-height: 400px;
        }
        .public-description {
            font-size: 14px;
            line-height: 1.7;
            color: var(--text);
            margin: 8px 0;
        }
        .public-description h1, .public-description h2, .public-description h3 {
            margin: 8px 0 4px;
            font-weight: 600;
        }
        .public-description h1 { font-size: 18px; }
        .public-description h2 { font-size: 16px; }
        .public-description h3 { font-size: 14px; }
        .public-description p { margin: 4px 0; }
        .public-description ul { padding-left: 20px; margin: 4px 0; }
        .public-description li { margin: 2px 0; }
        .public-description a {
            color: var(--primary);
            text-decoration: none;
            border-bottom: 1px solid rgba(99, 102, 241, 0.2);
        }
        .public-section {
            margin: 12px 0;
            padding: 12px 16px;
            background: var(--background);
            border-radius: 10px;
            border-left: 3px solid var(--primary);
        }
        .public-section-title {
            font-size: 13px;
            font-weight: 700;
            color: var(--text);
            margin-bottom: 4px;
        }
        .public-section-content {
            font-size: 13px;
            color: var(--text-secondary);
            line-height: 1.6;
        }
        .public-ads {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin: 12px 0;
        }
        .public-ad {
            display: flex;
            gap: 12px;
            background: var(--background);
            border-radius: 10px;
            overflow: hidden;
            text-decoration: none;
            color: var(--text);
            border: 1px solid var(--border);
            transition: all 0.2s ease;
        }
        .public-ad:hover {
            border-color: var(--primary);
            box-shadow: 0 2px 12px rgba(0,0,0,0.06);
            transform: translateY(-2px);
        }
        .public-ad-img {
            width: 80px;
            height: 80px;
            object-fit: cover;
            flex-shrink: 0;
        }
        .public-ad-content {
            padding: 8px 12px;
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        .public-ad-title { font-size: 13px; font-weight: 700; }
        .public-ad-desc { font-size: 12px; color: var(--text-secondary); margin: 2px 0; }
        .public-ad-btn {
            display: inline-block;
            padding: 4px 14px;
            background: var(--primary);
            color: white;
            border: none;
            border-radius: 14px;
            font-size: 11px;
            font-weight: 600;
            cursor: pointer;
            align-self: flex-start;
            transition: all 0.2s ease;
        }
        .public-ad-btn:hover {
            background: var(--primary-dark);
            transform: scale(1.02);
        }
        .public-external-link { margin: 8px 0; }
        .public-external-link a {
            color: var(--primary);
            text-decoration: none;
            font-size: 13px;
            font-weight: 500;
            border-bottom: 1px solid rgba(99, 102, 241, 0.2);
        }
        .public-external-link a:hover {
            border-bottom-color: var(--primary);
        }
        @media (max-width: 768px) {
            .public-title { font-size: 18px; }
            .public-gallery-single .public-gallery-img { max-height: 300px; }
            .public-gallery-two { grid-template-columns: 1fr; }
            .public-gallery-two .public-gallery-item { aspect-ratio: 4/3; }
            .public-gallery-three { grid-template-columns: 1fr; }
            .public-gallery-three-main { aspect-ratio: 4/3; }
            .public-gallery-three-side {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 6px;
            }
            .public-gallery-three-side .public-gallery-item { aspect-ratio: 4/3; }
            .public-gallery-grid { grid-template-columns: 1fr 1fr; }
            .public-ad { flex-direction: column; }
            .public-ad-img { width: 100%; height: 60px; }
            .public-meta { font-size: 12px; gap: 4px 12px; }
        }
    `;
    document.head.appendChild(style);
}

// ============================================
// ОТКРЫТИЕ ГАЛЕРЕИ
// ============================================

function openImageGallery(imageUrl) {
    const modal = document.createElement('div');
    modal.className = 'gallery-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        cursor: pointer;
    `;
    modal.onclick = () => modal.remove();
    
    const img = document.createElement('img');
    img.src = imageUrl;
    img.style.cssText = `
        max-width: 90vw;
        max-height: 90vh;
        object-fit: contain;
        border-radius: 8px;
    `;
    
    modal.appendChild(img);
    document.body.appendChild(modal);
}

// ============================================
// ЭКСПОРТ
// ============================================

window.showEventDetails = showEventDetails;
window.closeDetails = closeDetails;
window.deleteEventFromDetail = deleteEventFromDetail;
window.editEventFromDetail = editEventFromDetail;
window.renderPersonalEvent = renderPersonalEvent;
window.renderPublicEvent = renderPublicEvent;
window.renderMarkdown = renderMarkdown;
window.openImageGallery = openImageGallery;
window.renderEventDetails = renderEventDetails;
