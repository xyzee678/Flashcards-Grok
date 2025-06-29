// Utility functions for the flashcard app

/**
 * Compresses an image file to reduce size
 * @param {File} file - The image file to compress
 * @param {number} maxSize - Maximum width/height in pixels
 * @param {number} quality - Compression quality (0 to 1)
 * @returns {Promise<string>} - Base64 encoded image
 */
export async function compressImage(file, maxSize = 300, quality = 0.7) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let { width, height } = img;
                if (width > height) {
                    if (width > maxSize) {
                        height *= maxSize / width;
                        width = maxSize;
                    }
                } else {
                    if (height > maxSize) {
                        width *= maxSize / height;
                        height = maxSize;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL(file.type, quality));
            };
            img.onerror = () => reject(new Error('Image load failed'));
            img.src = e.target.result;
        };
        reader.onerror = () => reject(new Error('File read failed'));
        reader.readAsDataURL(file);
    });
}

/**
 * Sanitizes input to prevent XSS
 * @param {string} input - The input string to sanitize
 * @returns {string} - Sanitized string
 */
export function sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

/**
 * Displays a modal with a message
 * @param {string} message - The message to display
 */
export function showModal(message) {
    const modal = document.getElementById('modal');
    const modalMessage = document.getElementById('modalMessage');
    modalMessage.innerHTML = sanitizeInput(message);
    modal.classList.remove('hidden');
}

/**
 * Closes the modal
 */
export function closeModal() {
    document.getElementById('modal').classList.add('hidden');
}

/**
 * Generates a unique ID
 * @returns {string} - Unique ID
 */
export function generateId() {
    return 'id-' + Math.random().toString(36).substr(2, 9);
}

/**
 * Validates file size and type
 * @param {File} file - The file to validate
 * @param {number} maxSizeMB - Max file size in MB
 * @returns {boolean} - Whether file is valid
 */
export function validateFile(file, maxSizeMB = 5) {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
        showModal('Invalid file type. Please upload JPEG, PNG, or GIF.');
        return false;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
        showModal(`File size exceeds ${maxSizeMB}MB limit.`);
        return false;
    }
    return true;
}
