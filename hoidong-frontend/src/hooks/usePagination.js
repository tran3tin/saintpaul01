import { useState, useCallback, useMemo } from 'react';
import { PAGINATION } from '../utils/constants';

/**
 * Custom hook for pagination
 * @param {Object} options - Pagination options
 * @returns {Object} Pagination state and methods
 */
export const usePagination = (options = {}) => {
  const {
    initialPage = PAGINATION.DEFAULT_PAGE,
    initialPageSize = PAGINATION.DEFAULT_PAGE_SIZE,
    totalItems = 0,
  } = options;

  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [total, setTotal] = useState(totalItems);

  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.ceil(total / pageSize) || 1;
  }, [total, pageSize]);

  // Calculate offset for API calls
  const offset = useMemo(() => {
    return (page - 1) * pageSize;
  }, [page, pageSize]);

  // Check if can go to previous page
  const canPrevious = page > 1;

  // Check if can go to next page
  const canNext = page < totalPages;

  // Go to specific page
  const goToPage = useCallback((newPage) => {
    const pageNumber = Math.max(1, Math.min(newPage, totalPages));
    setPage(pageNumber);
  }, [totalPages]);

  // Go to next page
  const nextPage = useCallback(() => {
    if (canNext) {
      setPage(prev => prev + 1);
    }
  }, [canNext]);

  // Go to previous page
  const previousPage = useCallback(() => {
    if (canPrevious) {
      setPage(prev => prev - 1);
    }
  }, [canPrevious]);

  // Go to first page
  const firstPage = useCallback(() => {
    setPage(1);
  }, []);

  // Go to last page
  const lastPage = useCallback(() => {
    setPage(totalPages);
  }, [totalPages]);

  // Change page size
  const changePageSize = useCallback((newPageSize) => {
    setPageSize(newPageSize);
    setPage(1); // Reset to first page when changing page size
  }, []);

  // Update total items
  const updateTotal = useCallback((newTotal) => {
    setTotal(newTotal);
    // Adjust current page if it exceeds new total pages
    const newTotalPages = Math.ceil(newTotal / pageSize) || 1;
    if (page > newTotalPages) {
      setPage(newTotalPages);
    }
  }, [page, pageSize]);

  // Reset pagination
  const reset = useCallback(() => {
    setPage(initialPage);
    setPageSize(initialPageSize);
  }, [initialPage, initialPageSize]);

  // Generate page numbers for display
  const pageNumbers = useMemo(() => {
    const delta = 2; // Number of pages to show on each side of current page
    const range = [];
    const rangeWithDots = [];

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= page - delta && i <= page + delta)
      ) {
        range.push(i);
      }
    }

    let prev;
    for (const i of range) {
      if (prev) {
        if (i - prev === 2) {
          rangeWithDots.push(prev + 1);
        } else if (i - prev !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      prev = i;
    }

    return rangeWithDots;
  }, [page, totalPages]);

  // Get pagination info for display
  const paginationInfo = useMemo(() => {
    const from = total === 0 ? 0 : offset + 1;
    const to = Math.min(offset + pageSize, total);
    return { from, to, total };
  }, [offset, pageSize, total]);

  return {
    // State
    page,
    pageSize,
    total,
    totalPages,
    offset,
    canPrevious,
    canNext,
    pageNumbers,
    paginationInfo,
    
    // Methods
    goToPage,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    changePageSize,
    updateTotal,
    setTotal: updateTotal,
    reset,
  };
};

export default usePagination;
