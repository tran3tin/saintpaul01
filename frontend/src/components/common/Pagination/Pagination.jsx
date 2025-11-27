// src/components/common/Pagination/Pagination.jsx

import React from "react";
import { Pagination as BootstrapPagination } from "react-bootstrap";
import "./Pagination.css";

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  maxVisible = 5,
  showFirstLast = true,
  showPrevNext = true,
  size = "md",
  className = "",
}) => {
  if (totalPages <= 1) return null;

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const halfVisible = Math.floor(maxVisible / 2);

    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, currentPage + halfVisible);

    // Adjust if at the beginning
    if (currentPage <= halfVisible) {
      endPage = Math.min(totalPages, maxVisible);
    }

    // Adjust if at the end
    if (currentPage + halfVisible >= totalPages) {
      startPage = Math.max(1, totalPages - maxVisible + 1);
    }

    // Add first page and ellipsis
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push("ellipsis-start");
      }
    }

    // Add page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Add last page and ellipsis
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push("ellipsis-end");
      }
      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className={`app-pagination ${className}`}>
      <BootstrapPagination size={size} className="mb-0">
        {/* First Page */}
        {showFirstLast && (
          <BootstrapPagination.First
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
          />
        )}

        {/* Previous Page */}
        {showPrevNext && (
          <BootstrapPagination.Prev
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          />
        )}

        {/* Page Numbers */}
        {pages.map((page, index) => {
          if (typeof page === "string" && page.startsWith("ellipsis")) {
            return <BootstrapPagination.Ellipsis key={page} disabled />;
          }

          return (
            <BootstrapPagination.Item
              key={index}
              active={page === currentPage}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </BootstrapPagination.Item>
          );
        })}

        {/* Next Page */}
        {showPrevNext && (
          <BootstrapPagination.Next
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          />
        )}

        {/* Last Page */}
        {showFirstLast && (
          <BootstrapPagination.Last
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
          />
        )}
      </BootstrapPagination>

      {/* Page Info */}
      <div className="pagination-info">
        Trang <strong>{currentPage}</strong> / <strong>{totalPages}</strong>
      </div>
    </div>
  );
};

export default Pagination;
