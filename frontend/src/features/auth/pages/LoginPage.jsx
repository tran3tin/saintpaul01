// src/features/auth/pages/LoginPage.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@context";
import LoginForm from "../components/LoginForm";
import "./LoginPage.css";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const handleLogin = async (values) => {
    setLoading(true);
    // KHÔNG clear errors ở đây - để LoginForm tự clear khi user gõ
    
    console.log('📝 Login attempt with:', values);

    const result = await login(values);
    
    console.log('📡 Login result:', result);

    if (result.success) {
      console.log('✅ Login successful, navigating to dashboard');
      navigate("/dashboard");
    } else {
      console.log('❌ Login failed:', result);
      // Xử lý lỗi từ result
      if (result.errors && Object.keys(result.errors).length > 0) {
        console.log('Setting field errors:', result.errors);
        setFieldErrors(result.errors);
      } else {
        // Nếu không có field errors, clear nó
        setFieldErrors({});
      }
      setError(result.error || "Đăng nhập thất bại. Vui lòng thử lại.");
    }
    
    setLoading(false);
  };

  return (
    <div className="login-page">
      <LoginForm
        onSubmit={handleLogin}
        loading={loading}
        error={error}
        fieldErrors={fieldErrors}
        onClearError={() => {
          setError(""); // Chỉ clear general error
          // KHÔNG clear fieldErrors - để LoginForm tự quản lý
        }}
      />
    </div>
  );
};

export default LoginPage;
