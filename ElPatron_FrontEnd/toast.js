// ==================== SISTEMA DE NOTIFICACIONES TOAST ====================

// Crear contenedor de toasts si no existe
function getToastContainer() {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    return container;
}

/**
 * Muestra una notificación toast
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo: 'success', 'error', 'warning', 'info'
 * @param {string} title - Título opcional
 * @param {number} duration - Duración en ms (default: 4000)
 */
function showToast(message, type = 'info', title = '', duration = 4000) {
    const container = getToastContainer();
    
    // Iconos según el tipo
    const icons = {
        success: 'fas fa-check',
        error: 'fas fa-times',
        warning: 'fas fa-exclamation',
        info: 'fas fa-info'
    };
    
    // Títulos por defecto si no se proporciona
    const defaultTitles = {
        success: '¡Éxito!',
        error: 'Error',
        warning: 'Atención',
        info: 'Información'
    };
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <div class="toast-icon ${type}">
            <i class="${icons[type] || icons.info}"></i>
        </div>
        <div class="toast-content">
            <div class="toast-title">${title || defaultTitles[type]}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
        <div class="toast-progress" style="animation-duration: ${duration}ms;"></div>
    `;
    
    container.appendChild(toast);
    
    // Auto-cerrar después del tiempo especificado
    setTimeout(() => {
        if (toast.parentElement) {
            toast.classList.add('toast-exit');
            setTimeout(() => toast.remove(), 300);
        }
    }, duration);
    
    return toast;
}

// Funciones de conveniencia
function toastSuccess(message, title = '') {
    return showToast(message, 'success', title);
}

function toastError(message, title = '') {
    return showToast(message, 'error', title, 5000);
}

function toastWarning(message, title = '') {
    return showToast(message, 'warning', title);
}

function toastInfo(message, title = '') {
    return showToast(message, 'info', title);
}

// Exportar funciones para uso global
window.showToast = showToast;
window.toastSuccess = toastSuccess;
window.toastError = toastError;
window.toastWarning = toastWarning;
window.toastInfo = toastInfo;

