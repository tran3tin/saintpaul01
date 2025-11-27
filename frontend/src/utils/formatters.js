// src/utils/formatters.js

/**
 * Format date to Vietnamese format
 * @param {string|Date} date
 * @param {string} format - 'short' | 'long' | 'full'
 * @returns {string}
 */
export const formatDate = (date, format = "short") => {
  if (!date) return "";

  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  switch (format) {
    case "short":
      return `${day}/${month}/${year}`;

    case "long":
      return `${day}/${month}/${year} ${hours}:${minutes}`;

    case "full":
      const weekdays = [
        "Chủ Nhật",
        "Thứ Hai",
        "Thứ Ba",
        "Thứ Tư",
        "Thứ Năm",
        "Thứ Sáu",
        "Thứ Bảy",
      ];
      const weekday = weekdays[d.getDay()];
      return `${weekday}, ${day}/${month}/${year} ${hours}:${minutes}`;

    case "time":
      return `${hours}:${minutes}`;

    case "month-year":
      return `${month}/${year}`;

    default:
      return `${day}/${month}/${year}`;
  }
};

/**
 * Format date to ISO string for API
 * @param {string|Date} date
 * @returns {string}
 */
export const formatDateForAPI = (date) => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0]; // YYYY-MM-DD
};

/**
 * Calculate age from birth date
 * @param {string|Date} birthDate
 * @returns {number}
 */
export const calculateAge = (birthDate) => {
  if (!birthDate) return 0;

  const birth = new Date(birthDate);
  const today = new Date();

  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
};

/**
 * Format number with thousand separators
 * @param {number} number
 * @returns {string}
 */
export const formatNumber = (number) => {
  if (number === null || number === undefined) return "";
  return new Intl.NumberFormat("vi-VN").format(number);
};

/**
 * Format currency (VND)
 * @param {number} amount
 * @returns {string}
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return "";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

/**
 * Format phone number
 * @param {string} phone
 * @returns {string}
 */
export const formatPhone = (phone) => {
  if (!phone) return "";

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, "");

  // Format: 0xxx xxx xxx
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{4})(\d{3})(\d{3})/, "$1 $2 $3");
  }

  return phone;
};

/**
 * Format file size
 * @param {number} bytes
 * @returns {string}
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

/**
 * Truncate text
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

/**
 * Format religious name (Tên Thánh + Họ tên)
 * @param {string} religiousName
 * @param {string} fullName
 * @returns {string}
 */
export const formatReligiousName = (religiousName, fullName) => {
  if (!religiousName && !fullName) return "";
  if (!religiousName) return fullName;
  if (!fullName) return religiousName;
  return `${religiousName} ${fullName}`;
};

/**
 * Get initials from name
 * @param {string} name
 * @returns {string}
 */
export const getInitials = (name) => {
  if (!name) return "";

  const parts = name.trim().split(" ");
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

/**
 * Format duration (in minutes)
 * @param {number} minutes
 * @returns {string}
 */
export const formatDuration = (minutes) => {
  if (!minutes) return "0 phút";

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return `${mins} phút`;
  if (mins === 0) return `${hours} giờ`;
  return `${hours} giờ ${mins} phút`;
};

/**
 * Format percentage
 * @param {number} value
 * @param {number} total
 * @param {number} decimals
 * @returns {string}
 */
export const formatPercentage = (value, total, decimals = 1) => {
  if (!total || total === 0) return "0%";
  const percentage = (value / total) * 100;
  return `${percentage.toFixed(decimals)}%`;
};

/**
 * Format relative time (e.g., "2 giờ trước")
 * @param {string|Date} date
 * @returns {string}
 */
export const formatRelativeTime = (date) => {
  if (!date) return "";

  const d = new Date(date);
  const now = new Date();
  const diffMs = now - d;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "Vừa xong";
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} tháng trước`;
  return `${Math.floor(diffDays / 365)} năm trước`;
};

/**
 * Calculate duration between two dates
 * @param {string|Date} startDate
 * @param {string|Date} endDate - if null, uses current date
 * @returns {string}
 */
export const calculateDuration = (startDate, endDate = null) => {
  if (!startDate) return "";

  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();

  if (isNaN(start.getTime())) return "";
  if (endDate && isNaN(end.getTime())) return "";

  const diffMs = end - start;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffYears > 0) {
    const remainingMonths = diffMonths % 12;
    if (remainingMonths > 0) {
      return `${diffYears} nam ${remainingMonths} thang`;
    }
    return `${diffYears} nam`;
  }

  if (diffMonths > 0) {
    const remainingDays = diffDays % 30;
    if (remainingDays > 0) {
      return `${diffMonths} thang ${remainingDays} ngay`;
    }
    return `${diffMonths} thang`;
  }

  if (diffDays > 0) {
    return `${diffDays} ngay`;
  }

  return "Hom nay";
};
