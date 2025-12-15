// src/features/users/pages/UserFormPage.jsx

import React, { useState, useEffect } from "react";
import { useAuth } from "@context/AuthContext";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Alert,
  Table,
  Spinner,
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { userService } from "@services";
import { communityService } from "@services";
import { useForm } from "@hooks";
import Input from "@components/forms/Input";
import FileUpload from "@components/forms/FileUpload/FileUpload";
import { isValidEmail, isValidPhone } from "@utils/validators";
import LoadingSpinner from "@components/common/Loading/LoadingSpinner";
import Breadcrumb from "@components/common/Breadcrumb";
import "./UserDetailPage.css";

const UserFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const { user, updateUser } = useAuth();
  const canViewCommunities = user?.permissions?.includes(
    "communities.view_list"
  );

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [userStatuses, setUserStatuses] = useState([
    { value: "active", label: "Đang hoạt động" },
    { value: "inactive", label: "Đã khóa" },
  ]);
  const [allPermissions, setAllPermissions] = useState({});
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [allCommunities, setAllCommunities] = useState([]);
  const [selectedCommunities, setSelectedCommunities] = useState([]);

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    setValues,
    setFieldValue,
    setFieldError,
    setFieldTouched,
  } = useForm({
    username: "",
    password: "",
    confirm_password: "",
    full_name: "",
    email: "",
    phone: "",
    status: "active",
    avatar: "",
  });

  useEffect(() => {
    console.log("UserFormPage mounted, userStatuses:", userStatuses);
    fetchAllPermissions();
    if (canViewCommunities) {
      fetchAllCommunities();
    } else {
      setAllCommunities([]);
    }
    if (isEditMode) {
      fetchUserData();
    }
  }, [id, canViewCommunities]);

  const fetchAllPermissions = async () => {
    try {
      const response = await userService.getAllPermissions();
      if (response.success) {
        setAllPermissions(response.data); // Grouped by module
      }
    } catch (error) {
      console.error("Error fetching permissions:", error);
    }
  };

  const fetchAllCommunities = async () => {
    try {
      const response = await communityService.getList();
      if (response.success || response.data) {
        const communities = response.data?.items || response.data || [];
        setAllCommunities(communities);
      }
    } catch (error) {
      // Silent fail for 403 - user doesn't have permission to view communities
      // This is expected when communities permission is not granted
      if (error.response?.status !== 403) {
        console.error("Error fetching communities:", error);
      }
      setAllCommunities([]);
    }
  };

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await userService.getById(id);
      console.log("Fetched user response:", response);

      if (response.success && response.data && response.data.user) {
        const userData = { ...response.data.user };
        // Map is_active từ backend (0/1) sang status cho frontend ('active'/'inactive')
        if (userData.is_active !== undefined) {
          userData.status =
            userData.is_active === 1 || userData.is_active === true
              ? "active"
              : "inactive";
        }
        // Ensure optional fields are never null to avoid React warnings
        userData.phone = userData.phone || "";
        userData.avatar = userData.avatar || "";
        console.log("User data loaded:", userData);
        setValues(userData);

        // Fetch user permissions
        const permResponse = await userService.getUserPermissions(id);
        if (permResponse.success) {
          const permIds = permResponse.data.map((p) => p.permission_id || p.id);
          setSelectedPermissions(permIds);
        }

        // Fetch user communities
        const commResponse = await userService.getUserCommunities(id);
        if (commResponse.success) {
          const commIds = commResponse.data.map((c) => c.id);
          setSelectedCommunities(commIds);
        }
      } else {
        setError(response.error || "Không thể tải dữ liệu người dùng");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      setError("Không thể tải dữ liệu người dùng");
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!values.username || !values.username.trim()) {
      newErrors.username = "Tên đăng nhập là bắt buộc";
    } else if (values.username.trim().length < 3) {
      newErrors.username = "Tên đăng nhập phải có ít nhất 3 ký tự";
    }

    if (!isEditMode) {
      if (!values.password) {
        newErrors.password = "Mật khẩu là bắt buộc";
      } else if (values.password.length < 6) {
        newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
      }

      if (!values.confirm_password) {
        newErrors.confirm_password = "Vui lòng xác nhận mật khẩu";
      } else if (values.password !== values.confirm_password) {
        newErrors.confirm_password = "Mật khẩu không khớp";
      }
    }

    if (!values.full_name || !values.full_name.trim()) {
      newErrors.full_name = "Họ tên là bắt buộc";
    }

    if (!values.email || !values.email.trim()) {
      newErrors.email = "Email là bắt buộc";
    } else if (!isValidEmail(values.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (values.phone && !isValidPhone(values.phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous messages
    setSuccessMessage("");
    setError("");

    console.log("Form submitted with values:", values);

    // Client-side validation
    const validationErrors = validate();
    console.log("Validation errors:", validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      // Set errors vào state để hiển thị
      Object.keys(validationErrors).forEach((fieldName) => {
        setFieldError(fieldName, validationErrors[fieldName]);
        setFieldTouched(fieldName, true);
      });

      // Hiển thị thông báo lỗi chung
      const errorMsg = "Vui lòng kiểm tra lại thông tin đã nhập";
      setError(errorMsg);
      toast.error(errorMsg);

      // Scroll to top để thấy thông báo lỗi
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      setSubmitting(true);

      // Prepare data for submission
      const submitData = { ...values };

      // If avatar is a File object, we need to handle it differently
      // For now, skip avatar file upload and just send the data
      if (
        submitData.avatar &&
        typeof submitData.avatar === "object" &&
        submitData.avatar instanceof File
      ) {
        // TODO: Implement file upload to server
        // For now, remove avatar from submission
        delete submitData.avatar;
      }

      console.log("Sending data to API:", submitData);

      let response;
      if (isEditMode) {
        response = await userService.update(id, submitData);
      } else {
        response = await userService.create(submitData);
      }

      console.log("API response:", response);

      if (response.success) {
        const userId = isEditMode ? id : response.data.id;

        // Update permissions
        await userService.updateUserPermissions(userId, selectedPermissions);

        // Update communities
        await userService.updateUserCommunities(userId, selectedCommunities);

        // If editing current user, update localStorage with new permissions
        if (isEditMode && user?.id === parseInt(id)) {
          // Get permission names from selected permission IDs
          const allPermList = Object.values(allPermissions).flat();
          const newPermissionNames = selectedPermissions
            .map((permId) => {
              const perm = allPermList.find((p) => p.id === permId);
              return perm?.name;
            })
            .filter(Boolean);

          updateUser({ permissions: newPermissionNames });
        }

        // Hiển thị thông báo thành công
        const successMsg = isEditMode
          ? "Cập nhật người dùng thành công"
          : "Tạo người dùng mới thành công";
        setSuccessMessage(successMsg);
        toast.success(successMsg);

        // Navigate sau 1.5 giây để user thấy thông báo
        setTimeout(() => {
          navigate(`/users/${userId}`);
        }, 1500);
      } else {
        const errorMsg = response.error || "Có lỗi xảy ra";
        setError(errorMsg);
        toast.error(errorMsg);
        // Scroll to top để thấy thông báo lỗi
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (error) {
      console.error("Error saving user:", error);

      // Xử lý lỗi từ backend
      if (error.response) {
        const { data } = error.response;

        // Nếu backend trả về field-specific errors
        if (data.errors) {
          Object.keys(data.errors).forEach((fieldName) => {
            setFieldError(fieldName, data.errors[fieldName]);
            setFieldTouched(fieldName, true);
          });
        }

        // Hiển thị message chung
        const errorMsg = data.message || "Có lỗi xảy ra khi lưu người dùng";
        setError(errorMsg);
        toast.error(errorMsg);
      } else if (error.request) {
        // Request được gửi nhưng không nhận được response
        const errorMsg =
          "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng!";
        setError(errorMsg);
        toast.error(errorMsg);
      } else {
        // Lỗi khác
        const errorMsg = error.message || "Có lỗi xảy ra khi lưu người dùng";
        setError(errorMsg);
        toast.error(errorMsg);
      }

      // Scroll to top để thấy thông báo lỗi
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (
      window.confirm(
        "Bạn có chắc chắn muốn hủy? Các thay đổi sẽ không được lưu."
      )
    ) {
      navigate(isEditMode ? `/users/${id}` : "/users");
    }
  };

  const handlePermissionToggle = (permissionId) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleModuleSelectAll = (module) => {
    const modulePermissions = allPermissions[module] || [];
    const modulePermissionIds = modulePermissions.map((p) => p.id);
    const allSelected = modulePermissionIds.every((id) =>
      selectedPermissions.includes(id)
    );

    if (allSelected) {
      // Deselect all in this module
      setSelectedPermissions((prev) =>
        prev.filter((id) => !modulePermissionIds.includes(id))
      );
    } else {
      // Select all in this module
      setSelectedPermissions((prev) => [
        ...prev.filter((id) => !modulePermissionIds.includes(id)),
        ...modulePermissionIds,
      ]);
    }
  };

  const handleCommunityToggle = (communityId) => {
    if (selectedCommunities.includes(communityId)) {
      setSelectedCommunities(
        selectedCommunities.filter((id) => id !== communityId)
      );
    } else {
      setSelectedCommunities([...selectedCommunities, communityId]);
    }
  };

  const handleCommunitySelectAll = () => {
    if (selectedCommunities.length === allCommunities.length) {
      setSelectedCommunities([]);
    } else {
      setSelectedCommunities(allCommunities.map((c) => c.id));
    }
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "60vh" }}
      >
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Breadcrumb */}
      <Breadcrumb
        title={isEditMode ? "Chỉnh sửa Người dùng" : "Thêm Người dùng Mới"}
        items={[
          { label: "Người dùng", link: "/users" },
          { label: isEditMode ? "Chỉnh sửa" : "Thêm mới" },
        ]}
      />

      {/* Error Message */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          <i className="fas fa-exclamation-circle me-2"></i>
          {error}
        </Alert>
      )}

      {/* Success Message */}
      {successMessage && (
        <Alert
          variant="success"
          dismissible
          onClose={() => setSuccessMessage("")}
        >
          <i className="fas fa-check-circle me-2"></i>
          {successMessage}
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        <Row className="g-4">
          <Col lg={8}>
            {/* Account Info */}
            <Card className="health-info-card">
              <Card.Header>
                <i className="fas fa-user-circle"></i>
                <span>Thông tin tài khoản</span>
              </Card.Header>
              <Card.Body>
                <Row className="g-3">
                  <Col md={12}>
                    <Input
                      label="Tên đăng nhập"
                      name="username"
                      value={values.username}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={errors.username}
                      touched={touched.username}
                      placeholder="Nhập tên đăng nhập"
                      disabled={isEditMode}
                      required
                    />
                  </Col>

                  {!isEditMode && (
                    <>
                      <Col md={6}>
                        <div className="position-relative">
                          <Input
                            label="Mật khẩu"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            value={values.password}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.password}
                            touched={touched.password}
                            placeholder="Nhập mật khẩu"
                            required
                          />
                          <button
                            type="button"
                            className="btn btn-sm btn-link position-absolute"
                            style={{ right: "10px", top: "35px" }}
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            <i
                              className={`fas fa-eye${
                                showPassword ? "-slash" : ""
                              }`}
                            ></i>
                          </button>
                        </div>
                      </Col>

                      <Col md={6}>
                        <Input
                          label="Xác nhận mật khẩu"
                          name="confirm_password"
                          type={showPassword ? "text" : "password"}
                          value={values.confirm_password}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={errors.confirm_password}
                          touched={touched.confirm_password}
                          placeholder="Nhập lại mật khẩu"
                          required
                        />
                      </Col>
                    </>
                  )}
                </Row>
              </Card.Body>
            </Card>

            {/* Personal Info */}
            <Card className="health-info-card">
              <Card.Header className="documents-header">
                <i className="fas fa-id-card"></i>
                <span>Thông tin cá nhân</span>
              </Card.Header>
              <Card.Body>
                <Row className="g-3">
                  <Col md={12}>
                    <Input
                      label="Họ và tên"
                      name="full_name"
                      value={values.full_name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={errors.full_name}
                      touched={touched.full_name}
                      placeholder="Nhập họ và tên đầy đủ"
                      required
                    />
                  </Col>

                  <Col md={6}>
                    <Input
                      label="Email"
                      name="email"
                      type="email"
                      value={values.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={errors.email}
                      touched={touched.email}
                      placeholder="example@email.com"
                      required
                    />
                  </Col>

                  <Col md={6}>
                    <Input
                      label="Số điện thoại"
                      name="phone"
                      value={values.phone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={errors.phone}
                      touched={touched.phone}
                      placeholder="0123456789"
                    />
                  </Col>

                  <Col md={12}>
                    <FileUpload
                      label="Ảnh đại diện"
                      name="avatar"
                      onChange={(files) => {
                        if (files && files.length > 0) {
                          setFieldValue("avatar", files[0]);
                        }
                      }}
                      error={errors.avatar}
                      touched={touched.avatar}
                      accept="image/*"
                      maxSize={5242880}
                      showPreview={true}
                      helpText="Chọn ảnh đại diện (tối đa 5MB, định dạng: JPG, PNG, GIF)"
                    />
                    {values.avatar && typeof values.avatar === "string" && (
                      <div className="mt-2">
                        <img
                          src={values.avatar}
                          alt="Avatar hiện tại"
                          style={{
                            width: "100px",
                            height: "100px",
                            objectFit: "cover",
                            borderRadius: "8px",
                          }}
                        />
                      </div>
                    )}
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Communities */}
            <Card className="permissions-card">
              <Card.Header className="bg-white border-bottom d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="fas fa-users me-2"></i>
                  Phân quyền Cộng đoàn
                </h5>
                <small className="text-muted">
                  <i className="fas fa-info-circle me-1"></i>
                  {selectedCommunities.length} cộng đoàn được chọn
                </small>
              </Card.Header>
              <Card.Body className="p-0">
                {allCommunities.length === 0 ? (
                  <div className="p-4 text-center text-muted">
                    <Spinner animation="border" size="sm" className="me-2" />
                    Đang tải cộng đoàn...
                  </div>
                ) : (
                  <div className="table-responsive">
                    <Table className="permissions-table mb-0" hover>
                      <thead>
                        <tr>
                          <th>Tên Cộng đoàn</th>
                          <th
                            className="text-center"
                            style={{ width: "120px" }}
                          >
                            <Form.Check
                              type="checkbox"
                              checked={
                                selectedCommunities.length ===
                                allCommunities.length
                              }
                              onChange={handleCommunitySelectAll}
                              label="Chọn tất cả"
                            />
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {allCommunities.map((community) => (
                          <tr key={community.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <i
                                  className="fas fa-home text-muted me-2"
                                  style={{ width: "20px" }}
                                ></i>
                                <div>
                                  <span>{community.name}</span>
                                  {community.location && (
                                    <small className="text-muted d-block">
                                      <i className="fas fa-map-marker-alt me-1"></i>
                                      {community.location}
                                    </small>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="text-center">
                              <Form.Check
                                type="checkbox"
                                checked={selectedCommunities.includes(
                                  community.id
                                )}
                                onChange={() =>
                                  handleCommunityToggle(community.id)
                                }
                                className="permission-checkbox"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Permissions */}
            <Card className="permissions-card">
              <Card.Header className="bg-white border-bottom d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="fas fa-shield-alt me-2"></i>
                  Phân quyền
                </h5>
                <small className="text-muted">
                  <i className="fas fa-info-circle me-1"></i>
                  {selectedPermissions.length} quyền được chọn
                </small>
              </Card.Header>
              <Card.Body className="p-0">
                {Object.keys(allPermissions).length === 0 ? (
                  <div className="p-4 text-center text-muted">
                    <Spinner animation="border" size="sm" className="me-2" />
                    Đang tải quyền...
                  </div>
                ) : (
                  <div className="table-responsive">
                    <Table className="permissions-table mb-0" hover>
                      <thead>
                        <tr>
                          <th className="module-column">Module / Quyền</th>
                          <th
                            className="text-center"
                            style={{ width: "120px" }}
                          >
                            Cấp quyền
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(allPermissions).map(
                          ([module, permissions]) => {
                            const modulePermissionIds = permissions.map(
                              (p) => p.id
                            );
                            const allSelected = modulePermissionIds.every(
                              (id) => selectedPermissions.includes(id)
                            );
                            const someSelected =
                              !allSelected &&
                              modulePermissionIds.some((id) =>
                                selectedPermissions.includes(id)
                              );

                            return (
                              <React.Fragment key={module}>
                                {/* Module Header Row */}
                                <tr className="module-row">
                                  <td>
                                    <strong>
                                      <i className="fas fa-folder-open me-2 text-warning"></i>
                                      {module}
                                    </strong>
                                    <span className="text-muted small ms-2">
                                      ({permissions.length} quyền)
                                    </span>
                                  </td>
                                  <td className="text-center">
                                    <Form.Check
                                      type="checkbox"
                                      checked={allSelected}
                                      ref={(el) => {
                                        if (el) el.indeterminate = someSelected;
                                      }}
                                      onChange={() =>
                                        handleModuleSelectAll(module)
                                      }
                                      title={`Chọn tất cả quyền ${module}`}
                                      className="module-checkbox"
                                    />
                                  </td>
                                </tr>
                                {/* Permission Rows */}
                                {permissions.map((permission) => (
                                  <tr key={permission.id}>
                                    <td className="permission-name ps-4">
                                      <div className="d-flex align-items-center">
                                        <i
                                          className="fas fa-key text-muted me-2"
                                          style={{ width: "20px" }}
                                        ></i>
                                        <span>{permission.displayName}</span>
                                      </div>
                                      {permission.description && (
                                        <small className="text-muted d-block ms-4 ps-2">
                                          {permission.description}
                                        </small>
                                      )}
                                    </td>
                                    <td className="text-center">
                                      <Form.Check
                                        type="checkbox"
                                        checked={selectedPermissions.includes(
                                          permission.id
                                        )}
                                        onChange={() =>
                                          handlePermissionToggle(permission.id)
                                        }
                                        className="permission-checkbox"
                                      />
                                    </td>
                                  </tr>
                                ))}
                              </React.Fragment>
                            );
                          }
                        )}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            {/* Actions */}
            <Card
              className="health-info-card sticky-top"
              style={{ top: "20px" }}
            >
              <Card.Header className="system-header">
                <i className="fas fa-cog"></i>
                <span>Thao tác</span>
              </Card.Header>
              <Card.Body>
                <Row className="g-3">
                  <Col xs={12}>
                    <Form.Group>
                      <Form.Label>Trạng thái</Form.Label>
                      <Form.Select
                        name="status"
                        value={values.status}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      >
                        {userStatuses.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col xs={12}>
                    <div className="d-grid gap-2">
                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        disabled={submitting}
                      >
                        {submitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Đang lưu...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-save me-2"></i>
                            {isEditMode ? "Cập nhật" : "Tạo mới"}
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="lg"
                        onClick={handleCancel}
                        disabled={submitting}
                      >
                        <i className="fas fa-times me-2"></i>
                        Hủy
                      </Button>
                    </div>
                  </Col>
                </Row>

                <hr />

                <div className="text-muted small">
                  <p className="mb-2">
                    <i className="fas fa-info-circle me-2"></i>
                    <strong>Lưu ý:</strong>
                  </p>
                  <ul className="ps-3 mb-0">
                    <li>Các trường có dấu (*) là bắt buộc</li>
                    <li>Tên đăng nhập không thể thay đổi sau khi tạo</li>
                    <li>Mật khẩu phải có ít nhất 6 ký tự</li>
                    {!isEditMode && (
                      <li>Email sẽ được dùng để gửi thông tin đăng nhập</li>
                    )}
                  </ul>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Form>
    </Container>
  );
};

export default UserFormPage;
