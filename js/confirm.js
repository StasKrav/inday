// ============================================
// CONFIRM DIALOG
// ============================================
let confirmCallback = null;

function showConfirmDialog(title, message, okText, callback) {
  const dialog = document.getElementById("genericConfirmDialog");
  if (!dialog) return;
  document.getElementById("genericConfirmTitle").textContent =
    title || "Подтверждение";
  document.getElementById("genericConfirmMessage").textContent = message || "";
  document.getElementById("genericConfirmOkBtn").textContent =
    okText || "Подтвердить";
  confirmCallback = callback;
  dialog.classList.add("visible");
}

function closeConfirmDialog() {
  const dialog = document.getElementById("genericConfirmDialog");
  if (dialog) dialog.classList.remove("visible");
  confirmCallback = null;
}

// confirm.js

document.addEventListener("DOMContentLoaded", function () {
    const okBtn = document.getElementById("genericConfirmOkBtn");
    const cancelBtn = document.getElementById("genericConfirmCancelBtn");
    const dialog = document.getElementById("genericConfirmDialog");

    if (okBtn) {
        okBtn.addEventListener("click", function () {
            if (confirmCallback) {
                try {
                    confirmCallback();
                } catch (e) {
                    console.error('Error in confirm callback:', e);
                    // ❌ Только если реальная ошибка
                    if (window.showToast) {
                        showToast('Ошибка выполнения', true);
                    }
                }
            }
            closeConfirmDialog();
        });
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener("click", closeConfirmDialog);
    }
    
    if (dialog) {
        dialog.addEventListener("click", function (e) {
            if (e.target === e.currentTarget) closeConfirmDialog();
        });
    }
});
