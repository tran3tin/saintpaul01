/**
 * Get full name with title
 * @param {Object} sister - Sister object
 * @returns {string} Full name with title
 */
export const getFullName = (sister) => {
  if (!sister) return '';
  const parts = [];
  if (sister.ten_thanh) parts.push(sister.ten_thanh);
  if (sister.ho_ten) parts.push(sister.ho_ten);
  return parts.join(' ') || 'Chưa có tên';
};

/**
 * Get religious name
 * @param {Object} sister - Sister object
 * @returns {string} Religious name
 */
export const getReligiousName = (sister) => {
  if (!sister) return '';
  return sister.ten_dong || '-';
};

/**
 * Get stage display name in Vietnamese
 * @param {string} stage - Stage code
 * @returns {string} Stage display name
 */
export const getStageDisplayName = (stage) => {
  const stageNames = {
    tim_hieu: 'Tìm Hiểu',
    nha: 'Nhà',
    thinh_sinh: 'Thỉnh Sinh',
    tap_sinh: 'Tập Sinh',
    khan_tam: 'Khấn Tạm',
    khan_trong: 'Khấn Trọn',
  };
  return stageNames[stage] || stage || '-';
};

/**
 * Get stage color class
 * @param {string} stage - Stage code
 * @returns {string} CSS class name
 */
export const getStageColorClass = (stage) => {
  const stageClasses = {
    tim_hieu: 'tim-hieu',
    nha: 'nha',
    thinh_sinh: 'thinh-sinh',
    tap_sinh: 'tap-sinh',
    khan_tam: 'khan-tam',
    khan_trong: 'khan-trong',
  };
  return stageClasses[stage] || '';
};

/**
 * Get stage icon
 * @param {string} stage - Stage code
 * @returns {string} Font Awesome icon class
 */
export const getStageIcon = (stage) => {
  const stageIcons = {
    tim_hieu: 'fas fa-search',
    nha: 'fas fa-home',
    thinh_sinh: 'fas fa-book-open',
    tap_sinh: 'fas fa-seedling',
    khan_tam: 'fas fa-praying-hands',
    khan_trong: 'fas fa-crown',
  };
  return stageIcons[stage] || 'fas fa-circle';
};

/**
 * Get status badge variant
 * @param {string} status - Status code
 * @returns {string} Bootstrap variant
 */
export const getStatusVariant = (status) => {
  const statusVariants = {
    active: 'success',
    inactive: 'secondary',
    pending: 'warning',
    suspended: 'danger',
    departed: 'dark',
  };
  return statusVariants[status] || 'secondary';
};

/**
 * Generate initials from name
 * @param {string} name - Full name
 * @returns {string} Initials
 */
export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Generate avatar URL
 * @param {string} name - Full name
 * @param {string} bgColor - Background color (hex without #)
 * @param {string} textColor - Text color (hex without #)
 * @returns {string} Avatar URL
 */
export const getAvatarUrl = (name, bgColor = 'e3f2fd', textColor = '1565c0') => {
  const encodedName = encodeURIComponent(name || 'User');
  return `https://ui-avatars.com/api/?name=${encodedName}&background=${bgColor}&color=${textColor}&size=128`;
};

/**
 * Download file from blob
 * @param {Blob} blob - File blob
 * @param {string} filename - File name
 */
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    return success;
  }
};

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in ms
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit = 300) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Deep clone object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if object is empty
 * @param {Object} obj - Object to check
 * @returns {boolean} Is empty
 */
export const isEmpty = (obj) => {
  if (!obj) return true;
  if (Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  return false;
};

/**
 * Parse query string to object
 * @param {string} queryString - Query string
 * @returns {Object} Parsed object
 */
export const parseQueryString = (queryString) => {
  return Object.fromEntries(new URLSearchParams(queryString));
};

/**
 * Build query string from object
 * @param {Object} params - Parameters object
 * @returns {string} Query string
 */
export const buildQueryString = (params) => {
  const filteredParams = Object.entries(params)
    .filter(([, value]) => value !== null && value !== undefined && value !== '')
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
  return new URLSearchParams(filteredParams).toString();
};

/**
 * Sleep function for async/await
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after ms
 */
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Safe JSON parse
 * @param {string} str - JSON string
 * @param {*} fallback - Fallback value
 * @returns {*} Parsed value or fallback
 */
export const safeJsonParse = (str, fallback = null) => {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
};
