// ============================================
// ТЕГИ - ИСПРАВЛЕННАЯ ВЕРСИЯ
// ============================================
let tags = {};

// Загрузка тегов
function loadTags() {
    const saved = localStorage.getItem("keeprus_tags");
    if (saved) {
        try {
            tags = JSON.parse(saved);
            return;
        } catch (e) {}
    }

    // Дефолтные теги
    tags = {
        important: { id: "important", name: "Важное", color: "#ef4444" },
    };
    saveTags();
}

function saveTags() {
    localStorage.setItem("keeprus_tags", JSON.stringify(tags));
}

// Создание нового тега
function createTag(name, color) {
    const id = "tag_" + Date.now();
    tags[id] = {
        id: id,
        name: name.trim(),
        color: color || getRandomColor(),
    };
    saveTags();
    renderTags();
    return id;
}

// Получить случайный цвет
function getRandomColor() {
    const colors = [
        "#6366f1", "#8b5cf6", "#ec4899", "#ef4444", "#f59e0b",
        "#22c55e", "#06b6d4", "#14b8a6", "#f472b6", "#8b5cf6"
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Получить тег по имени (или создать)
function getOrCreateTag(name) {
    if (!name || !name.trim()) return null;
    const trimmed = name.trim();

    for (const key in tags) {
        if (tags[key].name.toLowerCase() === trimmed.toLowerCase()) {
            return key;
        }
    }

    return createTag(trimmed);
}

// Получить теги события
function getEventTags(event) {
    if (!event.tags) return [];
    return event.tags.map((id) => tags[id]).filter(Boolean);
}

// Рендеринг тегов
function renderTags() {
    const container = document.querySelector(".filter-chips");
    if (!container) return;

    // Используем состояние из filters.js
    const state = window.state || { selectedTag: null, showAll: false };
    const selectedTag = state.selectedTag;

    let html = `<button class="chip" data-filter="all">Все</button>`;

    const sortedTags = Object.values(tags)
        .sort((a, b) => a.name.localeCompare(b.name));

    sortedTags.forEach((tag) => {
        const count = getTagCount(tag.id);
        const isActive = selectedTag === tag.id;
        html += `
            <button class="chip ${isActive ? 'active' : ''}" 
                    data-filter="${tag.id}"
                    style="--tag-color: ${tag.color}"
                    title="Клик - фильтровать, двойной клик - редактировать"
                    ondblclick="editTag('${tag.id}')">
                <span class="tag-dot" style="background: ${tag.color};"></span>
                ${tag.name}
                <span class="tag-count">${count}</span>
            </button>
        `;
    });

    container.innerHTML = html;

    // ВЕШАЕМ ПРАВИЛЬНЫЕ ОБРАБОТЧИКИ
    container.querySelectorAll(".chip").forEach((chip) => {
        chip.addEventListener("click", function (e) {
            const filter = this.dataset.filter;
            
            if (filter === 'all') {
                // Вызываем toggleAllMode из filters.js
                if (typeof window.toggleAllMode === 'function') {
                    window.toggleAllMode();
                }
            } else {
                // Вызываем selectTag из filters.js
                if (typeof window.selectTag === 'function') {
                    window.selectTag(filter);
                }
            }
        });
    });
}

function getTagCount(tagId) {
    return calendarEvents.filter((e) => e.tags && e.tags.includes(tagId)).length;
}

// ============================================
// РЕДАКТИРОВАНИЕ ТЕГОВ (без изменений)
// ============================================

let editingTagId = null;
let editTagColor = "#6366f1";

function editTag(tagId) {
    const tag = tags[tagId];
    if (!tag) return;

    editingTagId = tagId;
    document.getElementById("editTagName").value = tag.name;
    editTagColor = tag.color;

    document.querySelectorAll("#editTagColors .color-option").forEach((el) => {
        el.classList.toggle("active", el.dataset.color === tag.color);
    });

    document.getElementById("editTagModal").classList.add("visible");
}

function closeEditTagModal() {
    document.getElementById("editTagModal").classList.remove("visible");
    editingTagId = null;
}

function selectEditTagColor(color, element) {
    editTagColor = color;
    document.querySelectorAll("#editTagColors .color-option").forEach((el) => {
        el.classList.remove("active");
    });
    element.classList.add("active");
}

function saveTagEdit() {
    const name = document.getElementById("editTagName").value.trim();

    if (!name) {
        showToast("Введите название");
        return;
    }

    if (editingTagId && tags[editingTagId]) {
        const oldColor = tags[editingTagId].color;
        tags[editingTagId].name = name;
        tags[editingTagId].color = editTagColor;

        calendarEvents.forEach((e) => {
            if (e.tags && e.tags.includes(editingTagId)) {
                if (!e.color || e.color === oldColor) {
                    e.color = editTagColor;
                }
            }
        });

        saveTags();
        saveCalendarEvents();
        closeEditTagModal();
        renderTags();
        renderMiniCalendar();
        renderTimeline();
    }
}

function deleteTag() {
    if (!editingTagId) return;

    const tag = tags[editingTagId];
    showConfirmDialog(
        "Удалить тег?",
        `Тег "${tag.name}" будет удалён из всех событий`,
        "Удалить",
        () => {
            calendarEvents.forEach((e) => {
                if (e.tags) {
                    e.tags = e.tags.filter((id) => id !== editingTagId);
                }
            });

            delete tags[editingTagId];
            saveTags();
            saveCalendarEvents();
            closeEditTagModal();
            renderTags();
            renderMiniCalendar();
            renderTimeline();
        },
    );
}

// ============================================
// ЭКСПОРТ
// ============================================

window.tags = tags;
window.loadTags = loadTags;
window.saveTags = saveTags;
window.createTag = createTag;
window.getOrCreateTag = getOrCreateTag;
window.getEventTags = getEventTags;
window.renderTags = renderTags;
window.editTag = editTag;
window.closeEditTagModal = closeEditTagModal;
window.selectEditTagColor = selectEditTagColor;
window.saveTagEdit = saveTagEdit;
window.deleteTag = deleteTag;
