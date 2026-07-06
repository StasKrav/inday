// ============================================
// DETAILS.JS — УНИВЕРСАЛЬНЫЙ ПРОСМОТРЩИК
// ============================================

// ============================================
// ОСНОВНАЯ ФУНКЦИЯ — ИСПРАВЛЕННАЯ
// ============================================

function showEventDetails(eventId) {
    console.log('🔍 showEventDetails вызвана с ID:', eventId);
    
    // ✅ НЕ ПРЕОБРАЗОВЫВАЕМ ID, ищем как есть
    const event = calendarEvents.find((e) => e.id === eventId);
    
    if (!event) {
        // Пробуем найти как число (для старых событий)
        const numericId = parseFloat(eventId);
        if (!isNaN(numericId)) {
            const fallbackEvent = calendarEvents.find((e) => e.id === numericId);
            if (fallbackEvent) {
                console.log('✅ Найдено по числовому ID:', fallbackEvent.id);
                renderEventDetails(fallbackEvent);
                return;
            }
        }
        
        showToast("Событие не найдено", true);
        console.log('❌ Событие не найдено');
        return;
    }
    
    renderEventDetails(event);
}

function renderEventDetails(event) {
    currentDetailEventId = event.id;

    const emptyState = document.querySelector(".empty-state");
    const details = document.getElementById("eventDetails");

    if (emptyState) emptyState.style.display = "none";
    if (details) details.style.display = "flex";

    const fab = document.querySelector(".fab");
    const headerBtn = document.getElementById("headerAddBtn");
    if (fab) fab.style.display = "none";
    if (headerBtn) headerBtn.style.display = "flex";

    const colorEl = document.getElementById("detailColor");
    const titleEl = document.getElementById("detailTitle");

    if (colorEl) colorEl.style.background = event.color || '#6366f1';
    if (titleEl) titleEl.textContent = event.title || "Без названия";

    const detailsBody = document.querySelector('.details-body');
    if (!detailsBody) return;

    if (isPublicEvent(event)) {
        renderPublicEvent(event, detailsBody);
    } else {
        renderPersonalEvent(event, detailsBody);
    }
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
    console.log('🎨 Рендерим публичное событие:', event.title);
    
    const content = event.content || {};
    addPublicStyles();
    
    let html = `
        <div class="public-event">
            <!-- Базовая информация -->
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
    `;
    
    // Источник
    if (event.source) {
        html += `
            <div class="detail-row">
                <span class="detail-label">Источник</span>
                <span class="detail-value">
                    <span class="public-source-badge">${event.source}</span>
                </span>
            </div>
        `;
    }
    
    // Место
    if (content.venue) {
        html += `
            <div class="detail-row">
                <span class="detail-label">Место</span>
                <span class="detail-value">
                    <div class="public-venue-info">
                        <strong>${content.venue}</strong>
                        ${content.address ? `<div class="public-address">${content.address}</div>` : ''}
                        ${content.metro ? `<div class="public-metro">${content.metro}</div>` : ''}
                    </div>
                </span>
            </div>
        `;
    }
    
    // Описание (Markdown)
    if (content.description) {
        html += `
            <div class="detail-section">
                <h4 class="detail-section-title">Описание</h4>
                <div class="public-description markdown-body">
                    ${renderMarkdown(content.description)}
                </div>
            </div>
        `;
    }
    
    // Изображения
    if (content.images && content.images.length > 0) {
        const validImages = content.images.filter(img => img && img.trim());
        if (validImages.length > 0) {
            html += `
                <div class="detail-section">
                    <div class="public-gallery">
                        ${validImages.map(img => `
                            <img src="${img}" class="public-gallery-img" onclick="openImageGallery('${img}')" onerror="this.style.display='none'">
                        `).join('')}
                    </div>
                </div>
            `;
        }
    }
    
    // Видео
    if (content.video && content.video.trim()) {
        const isBase64 = content.video.startsWith('data:video/');
        const isYouTube = content.video.includes('youtube.com/embed') || content.video.includes('youtu.be');
        
        let videoHtml = '';
        if (isBase64) {
            videoHtml = `
                <video controls style="width:100%;border-radius:8px;max-height:400px;">
                    <source src="${content.video}">
                    Ваш браузер не поддерживает видео
                </video>
            `;
        } else if (isYouTube) {
            videoHtml = `
                <div class="public-video">
                    <iframe src="${content.video}" frameborder="0" allowfullscreen></iframe>
                </div>
            `;
        } else {
            videoHtml = `
                <video controls style="width:100%;border-radius:8px;max-height:400px;">
                    <source src="${content.video}">
                    Ваш браузер не поддерживает видео
                </video>
            `;
        }
        
        html += `
            <div class="detail-section">
                <h4 class="detail-section-title">Видео</h4>
                ${videoHtml}
            </div>
        `;
    }
    
    // Дополнительные секции
    if (content.sections && content.sections.length > 0) {
        html += content.sections.map(section => `
            <div class="detail-section">
                <h4 class="detail-section-title">${section.icon || '📌'} ${section.title}</h4>
                <div class="public-section-content markdown-body">
                    ${renderMarkdown(section.content)}
                </div>
            </div>
        `).join('');
    }
    
    // Реклама
    if (content.ads && content.ads.length > 0) {
        html += `
            <div class="detail-section">
                <h4 class="detail-section-title">💼 Спецпредложения</h4>
                <div class="public-ads">
                    ${content.ads.map(ad => `
                        <a href="${ad.link || '#'}" target="_blank" class="public-ad">
                            ${ad.image ? `<img src="${ad.image}" class="public-ad-img" onerror="this.style.display='none'">` : ''}
                            <div class="public-ad-content">
                                <div class="public-ad-title">${ad.title}</div>
                                ${ad.description ? `<div class="public-ad-desc">${ad.description}</div>` : ''}
                                <button class="public-ad-btn">${ad.buttonText || 'Подробнее →'}</button>
                            </div>
                        </a>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    // Внешняя ссылка
    if (event.externalUrl && event.externalUrl.trim()) {
        html += `
            <div class="detail-section">
                <a href="${event.externalUrl}" target="_blank" class="public-external-link">🔗 Открыть страницу события</a>
            </div>
        `;
    }
    
    // Теги
    if (event.tags && event.tags.length > 0) {
        html += `
            <div class="detail-row">
                <span class="detail-label">🏷 Теги</span>
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
        `;
    }
    
    // Бейдж
    html += `
        <div class="detail-badge public-badge">
            Публичное событие
        </div>
    `;
    
    html += `</div>`;
    
    container.innerHTML = html;
    console.log('✅ Публичное событие отрендерено');
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
// FALLBACK
// ============================================

function renderFallback(event, container) {
    container.innerHTML = `
        <div class="detail-row">
            <span class="detail-label">Дата</span>
            <span class="detail-value">${formatDateTimeDisplay(event.date, event.time)}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Описание</span>
            <span class="detail-value">${escapeHtml(event.description || 'Нет описания')}</span>
        </div>
        ${event.source ? `
            <div class="detail-row">
                <span class="detail-label">Источник</span>
                <span class="detail-value">${event.source}</span>
            </div>
        ` : ''}
    `;
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
        .public-source-badge {
            display: inline-block;
            padding: 2px 12px;
            background: rgba(139, 92, 246, 0.1);
            color: #8b5cf6;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
        }
        .public-venue-info { line-height: 1.6; }
        .public-address, .public-metro {
            font-size: 13px;
            color: var(--text-secondary);
        }
        .detail-section {
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px solid var(--border);
        }
        .detail-section:first-child {
            border-top: none;
            margin-top: 0;
            padding-top: 0;
        }
        .detail-section-title {
            font-size: 13px;
            font-weight: 700;
            color: var(--text);
            margin-bottom: 8px;
        }
        .public-description {
            font-size: 14px;
            line-height: 1.8;
            color: var(--text);
        }
        .public-description h1 { font-size: 22px; font-weight: 700; margin: 12px 0 8px; }
        .public-description h2 { font-size: 18px; font-weight: 600; margin: 10px 0 6px; }
        .public-description h3 { font-size: 16px; font-weight: 600; margin: 8px 0 4px; }
        .public-description ul { padding-left: 20px; margin: 8px 0; }
        .public-description li { margin: 4px 0; }
        .public-description a {
            color: var(--primary);
            text-decoration: none;
            border-bottom: 1px dashed var(--primary);
        }
        .public-description a:hover { border-bottom-style: solid; }
        .public-gallery {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
            margin-top: 4px;
        }
        .public-gallery-img {
            width: 100%;
            aspect-ratio: 1;
            object-fit: cover;
            border-radius: 8px;
            cursor: pointer;
            transition: transform 0.2s ease;
        }
        .public-gallery-img:hover { transform: scale(1.03); }
        .public-video {
            position: relative;
            padding-bottom: 56.25%;
            height: 0;
            border-radius: 8px;
            overflow: hidden;
        }
        .public-video iframe {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        }
        .public-section-content {
            font-size: 13px;
            color: var(--text-secondary);
            line-height: 1.6;
        }
        .public-ads {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .public-ad {
            display: flex;
            gap: 12px;
            background: var(--background);
            border-radius: 8px;
            overflow: hidden;
            text-decoration: none;
            color: var(--text);
            border: 1px solid var(--border);
            transition: all 0.2s ease;
        }
        .public-ad:hover {
            border-color: var(--primary);
            box-shadow: var(--shadow-md);
            transform: translateY(-2px);
        }
        .public-ad-img {
            width: 100px;
            height: 100px;
            object-fit: cover;
            flex-shrink: 0;
        }
        .public-ad-content {
            padding: 10px 12px;
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        .public-ad-title { font-size: 14px; font-weight: 700; }
        .public-ad-desc {
            font-size: 12px;
            color: var(--text-secondary);
            margin: 4px 0;
        }
        .public-ad-btn {
            padding: 4px 16px;
            background: var(--primary);
            color: white;
            border: none;
            border-radius: 16px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            align-self: flex-start;
            transition: all 0.2s ease;
        }
        .public-ad-btn:hover {
            background: var(--primary-dark);
            transform: scale(1.02);
        }
        .public-external-link {
            color: var(--primary);
            text-decoration: none;
            font-size: 13px;
        }
        .public-external-link:hover { text-decoration: underline; }
        @media (max-width: 768px) {
            .public-gallery { grid-template-columns: repeat(2, 1fr); }
            .public-ad { flex-direction: column; }
            .public-ad-img { width: 100%; height: 80px; }
        }
    `;
    document.head.appendChild(style);
}

// ============================================
// ЗАКРЫТИЕ ДЕТАЛЕЙ
// ============================================

function closeDetails() {
    const emptyState = document.querySelector(".empty-state");
    const details = document.getElementById("eventDetails");

    if (emptyState) emptyState.style.display = "flex";
    if (details) details.style.display = "none";
    currentDetailEventId = null;

    const fab = document.querySelector(".fab");
    const headerBtn = document.getElementById("headerAddBtn");
    if (fab) fab.style.display = "flex";
    if (headerBtn) headerBtn.style.display = "none";
}

// ============================================
// УДАЛЕНИЕ ИЗ ДЕТАЛЕЙ
// ============================================

function deleteEventFromDetail() {
    if (!currentDetailEventId) {
        showToast("Событие не выбрано", true);
        return;
    }

    const event = calendarEvents.find((e) => e.id === currentDetailEventId);
    if (!event) {
        showToast("Событие не найдено", true);
        return;
    }

    showConfirmDialog(
        "Удалить событие?",
        `Удалить "${event.title}"?`,
        "Удалить",
        () => {
            calendarEvents = calendarEvents.filter((e) => e.id !== currentDetailEventId);
            saveCalendarEvents();
            closeDetails();
            renderMiniCalendar();
            renderTimeline();
            showToast("Событие удалено");
        }
    );
}

// ============================================
// РЕДАКТИРОВАНИЕ ИЗ ДЕТАЛЕЙ
// ============================================

function editEventFromDetail() {
    if (!currentDetailEventId) {
        showToast("Событие не выбрано", true);
        return;
    }

    const event = calendarEvents.find((e) => e.id === currentDetailEventId);
    if (!event) {
        showToast("Событие не найдено", true);
        return;
    }

    const eventId = currentDetailEventId;
    closeDetails();

    setTimeout(() => {
        if (isPublicEvent(event)) {
            if (typeof openPublicEventEditor === 'function') {
                openPublicEventEditor(eventId);
            }
        } else {
            if (typeof editEvent === 'function') {
                editEvent(eventId);
            }
        }
    }, 200);
}

// ============================================
// ФУТЕР
// ============================================

function updateDetailsFooter(event) {
    // Показываем правильные кнопки в футере
    // Уже есть в HTML
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
window.updateDetailsFooter = updateDetailsFooter;

console.log('📋 Universal details module loaded');
