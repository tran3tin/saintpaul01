import { useState, useCallback } from 'react';

/**
 * Custom hook for managing modal state
 * @param {boolean} initialState - Initial open state
 * @returns {Object} Modal state and methods
 */
export const useModal = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);
  const [data, setData] = useState(null);
  const [modalType, setModalType] = useState(null);

  // Open modal
  const open = useCallback((modalData = null, type = null) => {
    setData(modalData);
    setModalType(type);
    setIsOpen(true);
  }, []);

  // Close modal
  const close = useCallback(() => {
    setIsOpen(false);
    // Optional: clear data after close animation
    setTimeout(() => {
      setData(null);
      setModalType(null);
    }, 300);
  }, []);

  // Toggle modal
  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  // Open with specific type
  const openWithType = useCallback((type, modalData = null) => {
    setModalType(type);
    setData(modalData);
    setIsOpen(true);
  }, []);

  // Check if modal is of specific type
  const isType = useCallback((type) => {
    return modalType === type;
  }, [modalType]);

  return {
    isOpen,
    data,
    modalType,
    open,
    close,
    toggle,
    openWithType,
    isType,
    setData,
    setModalType,
  };
};

export default useModal;
