// src/components/forms/FileUpload/FileUpload.jsx

import React, { useState, useRef } from "react";
import { Form, Button } from "react-bootstrap";
import "./FileUpload.css";

const FileUpload = ({
  label,
  name,
  onChange,
  error,
  touched,
  required = false,
  disabled = false,
  helpText,
  accept,
  multiple = false,
  maxSize = 10485760, // 10MB default
  maxFiles = 5,
  showPreview = true,
  className = "",
}) => {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const hasError = touched && error;

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const validateFile = (file) => {
    if (file.size > maxSize) {
      return `File "${
        file.name
      }" vượt quá kích thước cho phép (${formatFileSize(maxSize)})`;
    }
    return null;
  };

  const handleFiles = (fileList) => {
    const newFiles = Array.from(fileList);

    // Validate number of files
    if (!multiple && newFiles.length > 1) {
      alert("Chỉ được chọn 1 file");
      return;
    }

    if (multiple && files.length + newFiles.length > maxFiles) {
      alert(`Chỉ được chọn tối đa ${maxFiles} files`);
      return;
    }

    // Validate each file
    for (const file of newFiles) {
      const error = validateFile(file);
      if (error) {
        alert(error);
        return;
      }
    }

    // Update files
    const updatedFiles = multiple ? [...files, ...newFiles] : newFiles;
    setFiles(updatedFiles);

    // Generate previews for images
    if (showPreview) {
      const newPreviews = [];
      newFiles.forEach((file) => {
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onloadend = () => {
            newPreviews.push({
              name: file.name,
              url: reader.result,
              type: "image",
            });
            if (newPreviews.length === newFiles.length) {
              setPreviews(
                multiple ? [...previews, ...newPreviews] : newPreviews
              );
            }
          };
          reader.readAsDataURL(file);
        } else {
          newPreviews.push({
            name: file.name,
            type: "file",
          });
          if (newPreviews.length === newFiles.length) {
            setPreviews(multiple ? [...previews, ...newPreviews] : newPreviews);
          }
        }
      });
    }

    // Call onChange callback
    if (onChange) {
      onChange({
        target: {
          name,
          value: updatedFiles,
        },
      });
    }
  };

  const handleFileInputChange = (e) => {
    handleFiles(e.target.files);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files;
    handleFiles(droppedFiles);
  };

  const handleRemoveFile = (index) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    const updatedPreviews = previews.filter((_, i) => i !== index);

    setFiles(updatedFiles);
    setPreviews(updatedPreviews);

    if (onChange) {
      onChange({
        target: {
          name,
          value: updatedFiles,
        },
      });
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Form.Group className={`fileupload-group-custom ${className}`}>
      {label && (
        <Form.Label className="fileupload-label">
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </Form.Label>
      )}

      <div
        className={`
          fileupload-dropzone
          ${isDragging ? "dragging" : ""}
          ${hasError ? "has-error" : ""}
          ${disabled ? "disabled" : ""}
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          name={name}
          accept={accept}
          multiple={multiple}
          onChange={handleFileInputChange}
          disabled={disabled}
          className="fileupload-input"
        />

        <div className="fileupload-content">
          <div className="fileupload-icon">
            <i className="fas fa-cloud-upload-alt"></i>
          </div>
          <div className="fileupload-text">
            <p className="fileupload-title">
              Kéo thả file vào đây hoặc{" "}
              <Button
                variant="link"
                className="fileupload-browse"
                onClick={handleBrowseClick}
                disabled={disabled}
              >
                chọn file
              </Button>
            </p>
            <p className="fileupload-hint">
              {accept && `Định dạng: ${accept} • `}
              Kích thước tối đa: {formatFileSize(maxSize)}
              {multiple && ` • Tối đa ${maxFiles} files`}
            </p>
          </div>
        </div>
      </div>

      {/* File Previews */}
      {showPreview && previews.length > 0 && (
        <div className="fileupload-previews">
          {previews.map((preview, index) => (
            <div key={index} className="preview-item">
              {preview.type === "image" ? (
                <div className="preview-image">
                  <img src={preview.url} alt={preview.name} />
                </div>
              ) : (
                <div className="preview-file-icon">
                  <i className="fas fa-file"></i>
                </div>
              )}
              <div className="preview-info">
                <div className="preview-name" title={files[index]?.name}>
                  {files[index]?.name}
                </div>
                <div className="preview-size">
                  {formatFileSize(files[index]?.size)}
                </div>
              </div>
              <button
                type="button"
                className="preview-remove"
                onClick={() => handleRemoveFile(index)}
                disabled={disabled}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          ))}
        </div>
      )}

      {helpText && !hasError && (
        <Form.Text className="fileupload-help-text">
          <i className="fas fa-info-circle me-1"></i>
          {helpText}
        </Form.Text>
      )}

      {hasError && (
        <div className="invalid-feedback d-block">
          <i className="fas fa-exclamation-circle me-1"></i>
          {error}
        </div>
      )}
    </Form.Group>
  );
};

export default FileUpload;
