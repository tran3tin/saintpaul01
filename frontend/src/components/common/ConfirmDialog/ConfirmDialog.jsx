// src/components/common/ConfirmDialog/ConfirmDialog.jsx

import React from "react";
import { Modal, Button } from "react-bootstrap";
import "./ConfirmDialog.css";

const ConfirmDialog = ({
  show,
  onHide,
  onConfirm,
  title = "Xác nhận",
  message = "Bạn có chắc chắn muốn thực hiện hành động này?",
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  variant = "danger",
  icon,
  loading = false,
  size = "sm",
}) => {
  const getDefaultIcon = () => {
    const icons = {
      danger: "fas fa-exclamation-triangle",
      warning: "fas fa-exclamation-circle",
      success: "fas fa-check-circle",
      info: "fas fa-info-circle",
      primary: "fas fa-question-circle",
    };
    return icons[variant] || icons.danger;
  };

  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm();
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size={size}
      centered
      backdrop="static"
      keyboard={!loading}
      className="confirm-dialog"
    >
      <Modal.Body className="text-center p-4">
        <div className={`confirm-dialog-icon confirm-dialog-icon-${variant}`}>
          <i className={icon || getDefaultIcon()}></i>
        </div>

        <h5 className="confirm-dialog-title">{title}</h5>
        <p className="confirm-dialog-message">{message}</p>

        <div className="confirm-dialog-actions">
          <Button
            variant="secondary"
            onClick={onHide}
            disabled={loading}
            className="btn-cancel"
          >
            {cancelText}
          </Button>
          <Button
            variant={variant}
            onClick={handleConfirm}
            disabled={loading}
            className="btn-confirm"
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Đang xử lý...
              </>
            ) : (
              confirmText
            )}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ConfirmDialog;
