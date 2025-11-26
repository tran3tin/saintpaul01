import { useState, useCallback } from 'react';
import { buildQueryString, parseQueryString } from '../utils/helpers';

/**
 * Custom hook for managing filters
 * @param {Object} initialFilters - Initial filter values
 * @returns {Object} Filter state and methods
 */
export const useFilter = (initialFilters = {}) => {
  const [filters, setFilters] = useState(initialFilters);

  // Update a single filter
  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  // Update multiple filters
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
    }));
  }, []);

  // Remove a filter
  const removeFilter = useCallback((key) => {
    setFilters(prev => {
      const { [key]: removed, ...rest } = prev;
      return rest;
    });
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  // Reset to initial filters
  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  // Check if filters have been modified
  const hasActiveFilters = useCallback(() => {
    return Object.keys(filters).some(key => {
      const value = filters[key];
      const initialValue = initialFilters[key];
      
      if (value === initialValue) return false;
      if (value === '' || value === null || value === undefined) return false;
      if (Array.isArray(value) && value.length === 0) return false;
      
      return true;
    });
  }, [filters, initialFilters]);

  // Get active filters count
  const activeFiltersCount = useCallback(() => {
    return Object.keys(filters).filter(key => {
      const value = filters[key];
      const initialValue = initialFilters[key];
      
      if (value === initialValue) return false;
      if (value === '' || value === null || value === undefined) return false;
      if (Array.isArray(value) && value.length === 0) return false;
      
      return true;
    }).length;
  }, [filters, initialFilters]);

  // Get filters as query string
  const toQueryString = useCallback(() => {
    return buildQueryString(filters);
  }, [filters]);

  // Set filters from query string
  const fromQueryString = useCallback((queryString) => {
    const parsed = parseQueryString(queryString);
    setFilters(prev => ({
      ...prev,
      ...parsed,
    }));
  }, []);

  // Get clean filters (remove empty values)
  const getCleanFilters = useCallback(() => {
    return Object.entries(filters).reduce((acc, [key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        if (Array.isArray(value) && value.length === 0) {
          return acc;
        }
        acc[key] = value;
      }
      return acc;
    }, {});
  }, [filters]);

  return {
    filters,
    setFilters,
    updateFilter,
    updateFilters,
    removeFilter,
    clearFilters,
    resetFilters,
    hasActiveFilters,
    activeFiltersCount,
    toQueryString,
    fromQueryString,
    getCleanFilters,
  };
};

export default useFilter;
