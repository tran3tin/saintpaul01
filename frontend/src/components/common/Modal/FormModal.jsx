// src/components/common/Modal/FormModal.jsx

import React from "react";
import { Modal, Button } from "react-bootstrap";
import "./Modal.css";

const FormModal = ({
  show,
  onHide,
  onSubmit,
  title,
  children,
  submitText = "Lưu",
  cancelText = "Hủy",
  submitVariant = "primary",
  loading = false,
  size = "lg",
  disableSubmit = false,
}) => {
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (onSubmit) {
      await onSubmit(e);
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
      className="form-modal"
    >
      <form onSubmit={handleSubmit}>
        <Modal.Header closeButton={!loading} className="modal-header-custom">
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>

        <Modal.Body className="modal-body-custom">{children}</Modal.Body>

        <Modal.Footer className="modal-footer-custom">
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            {cancelText}
          </Button>
          <Button
            variant={submitVariant}
            type="submit"
            disabled={loading || disableSubmit}
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
              <>
                <i className="fas fa-save me-2"></i>
                {submitText}
              </>
            )}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default FormModal;
