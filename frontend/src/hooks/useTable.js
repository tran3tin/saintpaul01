// src/hooks/useTable.js

import { useState, useCallback, useMemo } from "react";
import usePagination from "./usePagination";
import useFilter from "./useFilter";

const useTable = (options = {}) => {
  const {
    initialPage = 1,
    initialPageSize = 10,
    initialFilters = {},
    initialSortBy = null,
    initialSortOrder = "asc",
  } = options;

  // Pagination
  const pagination = usePagination(initialPage, initialPageSize);

  // Filters
  const filter = useFilter(initialFilters);

  // Sorting
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortOrder, setSortOrder] = useState(initialSortOrder);

  // Selection
  const [selectedRows, setSelectedRows] = useState([]);

  // Search
  const [searchTerm, setSearchTerm] = useState("");

  /**
   * Handle sort
   */
  const handleSort = useCallback(
    (column, order) => {
      // Support both signatures: handleSort(column) and handleSort(column, order)
      if (order) {
        setSortBy(column);
        setSortOrder(order);
      } else {
        if (sortBy === column) {
          setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
          setSortBy(column);
          setSortOrder("asc");
        }
      }
    },
    [sortBy]
  );

  /**
   * Handle select row
   */
  const handleSelectRow = useCallback((rowId) => {
    setSelectedRows((prev) => {
      if (prev.includes(rowId)) {
        return prev.filter((id) => id !== rowId);
      } else {
        return [...prev, rowId];
      }
    });
  }, []);

  /**
   * Handle select all rows
   */
  const handleSelectAll = useCallback((rowIds) => {
    setSelectedRows((prev) => {
      if (prev.length === rowIds.length) {
        return [];
      } else {
        return rowIds;
      }
    });
  }, []);

  /**
   * Clear selection
   */
  const clearSelection = useCallback(() => {
    setSelectedRows([]);
  }, []);

  /**
   * Handle search
   */
  const handleSearch = useCallback(
    (term) => {
      setSearchTerm(term);
      pagination.firstPage(); // Reset to first page on search
    },
    [pagination]
  );

  /**
   * Get table params for API
   */
  const getTableParams = useCallback(() => {
    return {
      ...pagination.getPaginationParams(),
      ...filter.getFilterParams(),
      sortBy,
      sortOrder,
      search: searchTerm,
    };
  }, [pagination, filter, sortBy, sortOrder, searchTerm]);

  /**
   * Reset table state
   */
  const resetTable = useCallback(() => {
    pagination.reset();
    filter.resetFilters();
    setSortBy(initialSortBy);
    setSortOrder(initialSortOrder);
    setSelectedRows([]);
    setSearchTerm("");
  }, [pagination, filter, initialSortBy, initialSortOrder]);

  return {
    // Pagination
    ...pagination,

    // Filters
    filters: filter.filters,
    updateFilter: filter.updateFilter,
    updateFilters: filter.updateFilters,
    removeFilter: filter.removeFilter,
    clearFilters: filter.clearFilters,
    resetFilters: filter.resetFilters,
    hasActiveFilters: filter.hasActiveFilters,
    activeFilters: filter.activeFilters,

    // Sorting
    sortBy,
    sortOrder,
    handleSort,

    // Selection
    selectedRows,
    handleSelectRow,
    handleSelectAll,
    clearSelection,

    // Search
    searchTerm,
    handleSearch,

    // Utils
    getTableParams,
    resetTable,
  };
};

export default useTable;
