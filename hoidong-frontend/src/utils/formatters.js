import { format, parseISO, differenceInYears, differenceInMonths, addDays, isValid } from 'date-fns';
import { vi } from 'date-fns/locale';

/**
 * Format date to Vietnamese display format
 * @param {string|Date} date - Date to format
 * @param {string} formatStr - Format string (default: 'dd/MM/yyyy')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, formatStr = 'dd/MM/yyyy') => {
  if (!date) return '-';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '-';
    return format(dateObj, formatStr, { locale: vi });
  } catch {
    return '-';
  }
};

/**
 * Format datetime
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted datetime string
 */
export const formatDateTime = (date) => {
  return formatDate(date, 'dd/MM/yyyy HH:mm');
};

/**
 * Calculate age from birth date
 * @param {string|Date} birthDate - Birth date
 * @returns {number} Age in years
 */
export const calculateAge = (birthDate) => {
  if (!birthDate) return null;
  
  try {
    const dateObj = typeof birthDate === 'string' ? parseISO(birthDate) : birthDate;
    if (!isValid(dateObj)) return null;
    return differenceInYears(new Date(), dateObj);
  } catch {
    return null;
  }
};

/**
 * Calculate duration between two dates
 * @param {string|Date} startDate - Start date
 * @param {string|Date} endDate - End date (optional, defaults to now)
 * @returns {string} Duration string (e.g., "2 năm 3 tháng")
 */
export const calculateDuration = (startDate, endDate = new Date()) => {
  if (!startDate) return '-';
  
  try {
    const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
    const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
    
    if (!isValid(start) || !isValid(end)) return '-';
    
    const years = differenceInYears(end, start);
    const months = differenceInMonths(end, addDays(start, years * 365));
    
    if (years > 0 && months > 0) {
      return `${years} năm ${months} tháng`;
    } else if (years > 0) {
      return `${years} năm`;
    } else if (months > 0) {
      return `${months} tháng`;
    } else {
      return 'Mới';
    }
  } catch {
    return '-';
  }
};

/**
 * Format number with thousand separators
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '-';
  return new Intl.NumberFormat('vi-VN').format(num);
};

/**
 * Format currency (VND)
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '-';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

/**
 * Format phone number
 * @param {string} phone - Phone number
 * @returns {string} Formatted phone number
 */
export const formatPhone = (phone) => {
  if (!phone) return '-';
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  // Format as Vietnamese phone number
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Format file size
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let unitIndex = 0;
  let size = bytes;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
};
