// src/components/tables/TableActions/TableActions.jsx

import React from "react";
import { Button, Dropdown, ButtonGroup } from "react-bootstrap";
import "./TableActions.css";

const TableActions = ({
  onView,
  onEdit,
  onDelete,
  onCustomAction,
  customActions = [],
  showView = true,
  showEdit = true,
  showDelete = true,
  size = "sm",
  variant = "outline",
  dropdownMode = false,
  row,
  index,
}) => {
  const actions = [
    showView && {
      key: "view",
      label: "Xem",
      icon: "fas fa-eye",
      variant: "info",
      onClick: () => onView && onView(row, index),
    },
    showEdit && {
      key: "edit",
      label: "Sửa",
      icon: "fas fa-edit",
      variant: "warning",
      onClick: () => onEdit && onEdit(row, index),
    },
    showDelete && {
      key: "delete",
      label: "Xóa",
      icon: "fas fa-trash",
      variant: "danger",
      onClick: () => onDelete && onDelete(row, index),
    },
    ...customActions,
  ].filter(Boolean);

  if (dropdownMode) {
    return (
      <Dropdown as={ButtonGroup} size={size} className="table-actions-dropdown">
        <Dropdown.Toggle
          variant={variant === "outline" ? "outline-secondary" : "secondary"}
          id={`dropdown-actions-${index}`}
          className="table-actions-toggle"
        >
          <i className="fas fa-ellipsis-v"></i>
        </Dropdown.Toggle>

        <Dropdown.Menu align="end" className="table-actions-menu">
          {actions.map((action) => (
            <Dropdown.Item
              key={action.key}
              onClick={action.onClick}
              className={`table-action-item table-action-${action.variant}`}
            >
              <i className={`${action.icon} me-2`}></i>
              {action.label}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    );
  }

  return (
    <ButtonGroup size={size} className="table-actions-group">
      {actions.map((action) => (
        <Button
          key={action.key}
          variant={
            variant === "outline" ? `outline-${action.variant}` : action.variant
          }
          onClick={action.onClick}
          className="table-action-btn"
          title={action.label}
        >
          <i className={action.icon}></i>
          <span className="table-action-label d-none d-lg-inline ms-1">
            {action.label}
          </span>
        </Button>
      ))}
    </ButtonGroup>
  );
};

export default TableActions;
