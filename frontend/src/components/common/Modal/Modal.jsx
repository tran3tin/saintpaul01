// src/components/common/Modal/Modal.jsx

import React from "react";
import { Modal as BootstrapModal } from "react-bootstrap";
import "./Modal.css";

const Modal = ({
  show,
  onHide,
  title,
  children,
  footer,
  size = "md",
  centered = true,
  closeButton = true,
  backdrop = true,
  keyboard = true,
  className = "",
  headerClassName = "",
  bodyClassName = "",
  footerClassName = "",
}) => {
  return (
    <BootstrapModal
      show={show}
      onHide={onHide}
      size={size}
      centered={centered}
      backdrop={backdrop}
      keyboard={keyboard}
      className={`app-modal ${className}`}
    >
      {title && (
        <BootstrapModal.Header
          closeButton={closeButton}
          className={`modal-header-custom ${headerClassName}`}
        >
          <BootstrapModal.Title>{title}</BootstrapModal.Title>
        </BootstrapModal.Header>
      )}

      <BootstrapModal.Body className={`modal-body-custom ${bodyClassName}`}>
        {children}
      </BootstrapModal.Body>

      {footer && (
        <BootstrapModal.Footer
          className={`modal-footer-custom ${footerClassName}`}
        >
          {footer}
        </BootstrapModal.Footer>
      )}
    </BootstrapModal>
  );
};

export default Modal;
