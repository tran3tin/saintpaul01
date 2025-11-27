// src/components/common/Modal/ConfirmModal.jsx

import React from "react";
import { Modal, Button } from "react-bootstrap";
import "./Modal.css";

const ConfirmModal = ({
  show,
  onHide,
  onConfirm,
  title = "Xác nhận",
  message = "Bạn có chắc chắn muốn thực hiện hành động này?",
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  variant = "danger",
  icon = "fas fa-exclamation-triangle",
  loading = false,
}) => {
  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm();
    }
    onHide();
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="sm"
      centered
      className="confirm-modal"
    >
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="w-100 text-center">
          <div className={`confirm-icon confirm-icon-${variant}`}>
            <i className={icon}></i>
          </div>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="text-center pt-2">
        <h5 className="mb-3">{title}</h5>
        <p className="text-muted mb-0">{message}</p>
      </Modal.Body>

      <Modal.Footer className="border-0 justify-content-center gap-2">
        <Button
          variant="secondary"
          onClick={onHide}
          disabled={loading}
          className="px-4"
        >
          {cancelText}
        </Button>
        <Button
          variant={variant}
          onClick={handleConfirm}
          disabled={loading}
          className="px-4"
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
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmModal;
