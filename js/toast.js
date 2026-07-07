// toast.js

let toastTimeout;
let toastElement = null;

function showToast(message, isError = false) {
    // Создаем тост один раз
    if (!toastElement) {
        toastElement = document.createElement('div');
        toastElement.className = 'toast';
        toastElement.id = 'toast';
        document.body.appendChild(toastElement);
    }
    
    clearTimeout(toastTimeout);
    
    toastElement.textContent = message;
    toastElement.style.display = 'flex';
    
    // Стиль для ошибок
    if (isError) {
        toastElement.style.borderLeftColor = '#ef4444';
    } else {
        toastElement.style.borderLeftColor = 'var(--primary)';
    }
    
    toastElement.classList.add('visible');
    
    toastTimeout = setTimeout(() => {
        toastElement.classList.remove('visible');
        setTimeout(() => {
            toastElement.style.display = 'none';
        }, 300);
    }, 2000);
}

// Делаем глобальной
window.showToast = showToast;

