import { useCallback } from 'react';
import { toast } from 'react-toastify';

/**
 * Custom hook for toast notifications
 * @returns {Object} Toast methods
 */
export const useToast = () => {
  // Show success toast
  const success = useCallback((message, options = {}) => {
    return toast.success(message, {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options,
    });
  }, []);

  // Show error toast
  const error = useCallback((message, options = {}) => {
    return toast.error(message, {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options,
    });
  }, []);

  // Show warning toast
  const warning = useCallback((message, options = {}) => {
    return toast.warning(message, {
      position: 'top-right',
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options,
    });
  }, []);

  // Show info toast
  const info = useCallback((message, options = {}) => {
    return toast.info(message, {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options,
    });
  }, []);

  // Show loading toast
  const loading = useCallback((message = 'Đang xử lý...') => {
    return toast.loading(message, {
      position: 'top-right',
    });
  }, []);

  // Update existing toast
  const update = useCallback((toastId, options) => {
    toast.update(toastId, {
      isLoading: false,
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      ...options,
    });
  }, []);

  // Dismiss toast
  const dismiss = useCallback((toastId) => {
    toast.dismiss(toastId);
  }, []);

  // Dismiss all toasts
  const dismissAll = useCallback(() => {
    toast.dismiss();
  }, []);

  // Promise toast (for async operations)
  const promise = useCallback((promiseFunc, messages = {}) => {
    return toast.promise(promiseFunc, {
      pending: messages.pending || 'Đang xử lý...',
      success: messages.success || 'Thành công!',
      error: messages.error || 'Có lỗi xảy ra!',
    });
  }, []);

  return {
    success,
    error,
    warning,
    info,
    loading,
    update,
    dismiss,
    dismissAll,
    promise,
  };
};

export default useToast;
