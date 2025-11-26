// App Configuration
const config = {
  // API Configuration
  api: {
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    timeout: 30000,
  },
  
  // App Info
  app: {
    name: 'Hệ Thống Quản Lý Hội Dòng OSP',
    shortName: 'Hội Dòng OSP',
    version: '1.0.0',
    description: 'Hệ thống quản lý nhân sự Hội Dòng OSP',
  },
  
  // Pagination
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [10, 25, 50, 100],
  },
  
  // Date Format
  dateFormat: {
    display: 'DD/MM/YYYY',
    input: 'YYYY-MM-DD',
    datetime: 'DD/MM/YYYY HH:mm',
  },
  
  // File Upload
  upload: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedDocTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  },
  
  // Toast Notification
  toast: {
    duration: 3000,
    position: 'top-right',
  },
};

export default config;
