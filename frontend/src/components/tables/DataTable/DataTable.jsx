// src/components/tables/DataTable/DataTable.jsx

import React, { useState } from "react";
import { Table, Form, Button, Dropdown } from "react-bootstrap";
import Pagination from "@components/common/Pagination";
import LoadingSpinner from "@components/common/Loading/LoadingSpinner";
import EmptyState from "@components/common/EmptyState";
import "./DataTable.css";

const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  selectable = false,
  selectedRows = [],
  onSelectRow,
  onSelectAll,
  sortable = true,
  sortBy,
  sortOrder = "asc",
  onSort,
  pagination = true,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  striped = true,
  hover = true,
  bordered = false,
  size = "md",
  emptyText = "Không có dữ liệu",
  emptyIcon = "fas fa-inbox",
  className = "",
  actions = [],
  onRowClick,
}) => {
  const [hoveredRow, setHoveredRow] = useState(null);

  const handleSort = (column) => {
    if (!sortable || !column.sortable || !onSort) return;

    const newOrder =
      sortBy === column.key && sortOrder === "asc" ? "desc" : "asc";
    onSort(column.key, newOrder);
  };

  const handleSelectAll = (e) => {
    if (onSelectAll) {
      onSelectAll(e.target.checked);
    }
  };

  const handleSelectRow = (row, index) => {
    if (onSelectRow) {
      onSelectRow(row, index);
    }
  };

  const isRowSelected = (row, index) => {
    return selectedRows.includes(index) || selectedRows.includes(row.id);
  };

  const renderSortIcon = (column) => {
    if (!sortable || !column.sortable) return null;

    if (sortBy !== column.key) {
      return <i className="fas fa-sort sort-icon"></i>;
    }

    return (
      <i
        className={`fas fa-sort-${
          sortOrder === "asc" ? "up" : "down"
        } sort-icon active`}
      ></i>
    );
  };

  const renderCellContent = (column, row, rowIndex) => {
    if (column.render) {
      return column.render(row, rowIndex);
    }

    const value = row[column.key];

    if (value === null || value === undefined) {
      return <span className="text-muted">—</span>;
    }

    return value;
  };

  if (loading) {
    return (
      <div className="datatable-loading">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={emptyIcon}
        title="Không có dữ liệu"
        description={emptyText}
        size="medium"
      />
    );
  }

  return (
    <div className={`datatable-wrapper ${className}`}>
      <div className="datatable-container">
        <Table
          striped={striped}
          hover={hover}
          bordered={bordered}
          size={size}
          className="datatable"
        >
          <thead className="datatable-header">
            <tr>
              {selectable && (
                <th className="datatable-checkbox-cell">
                  <Form.Check
                    type="checkbox"
                    checked={
                      selectedRows.length > 0 &&
                      selectedRows.length === data.length
                    }
                    onChange={handleSelectAll}
                    className="datatable-checkbox"
                  />
                </th>
              )}

              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`
                    ${column.sortable ? "sortable" : ""}
                    ${column.align ? `text-${column.align}` : ""}
                    ${column.className || ""}
                  `}
                  style={{ width: column.width }}
                  onClick={() => handleSort(column)}
                >
                  <div className="datatable-header-content">
                    <span>{column.label}</span>
                    {renderSortIcon(column)}
                  </div>
                </th>
              ))}

              {actions.length > 0 && (
                <th
                  className="datatable-actions-header text-center"
                  style={{ width: "120px" }}
                >
                  Thao tác
                </th>
              )}
            </tr>
          </thead>

          <tbody className="datatable-body">
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={`
                  datatable-row
                  ${isRowSelected(row, rowIndex) ? "selected" : ""}
                  ${onRowClick ? "clickable" : ""}
                `}
                onClick={() => onRowClick && onRowClick(row, rowIndex)}
              >
                {selectable && (
                  <td
                    className="datatable-checkbox-cell"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Form.Check
                      type="checkbox"
                      checked={isRowSelected(row, rowIndex)}
                      onChange={() => handleSelectRow(row, rowIndex)}
                      className="datatable-checkbox"
                    />
                  </td>
                )}

                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className={`
                      ${column.align ? `text-${column.align}` : ""}
                      ${column.className || ""}
                    `}
                  >
                    {renderCellContent(column, row, rowIndex)}
                  </td>
                ))}

                {actions.length > 0 && (
                  <td
                    className="datatable-actions-cell text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Dropdown>
                      <Dropdown.Toggle
                        variant="light"
                        size="sm"
                        className="datatable-actions-toggle"
                      >
                        <i className="fas fa-ellipsis-v"></i>
                      </Dropdown.Toggle>
                      <Dropdown.Menu align="end">
                        {actions.map((action, actionIndex) => (
                          <Dropdown.Item
                            key={actionIndex}
                            onClick={() => action.onClick(row, rowIndex)}
                            className={`text-${action.variant || "dark"}`}
                          >
                            {action.icon && (
                              <i className={`${action.icon} me-2`}></i>
                            )}
                            {action.label}
                          </Dropdown.Item>
                        ))}
                      </Dropdown.Menu>
                    </Dropdown>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {pagination && totalPages > 1 && (
        <div className="datatable-pagination">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};

export default DataTable;
