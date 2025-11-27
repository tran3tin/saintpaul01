// src/features/auth/pages/ForgotPasswordPage.jsx

import React, { useState } from "react";
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import { authService } from "@services";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Vui long nhap email");
      return;
    }

    try {
      setLoading(true);
      await authService.forgotPassword({ email });
      setSuccess(true);
    } catch (err) {
      console.error("Error:", err);
      setError("Co loi xay ra. Vui long thu lai sau.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={6} lg={5}>
            <Card className="shadow-sm">
              <Card.Body className="p-4 text-center">
                <div className="mb-4">
                  <span style={{ fontSize: "4rem" }}>📧</span>
                </div>
                <h4 className="mb-3">Kiem tra email cua ban</h4>
                <p className="text-muted mb-4">
                  Chung toi da gui huong dan dat lai mat khau den email{" "}
                  <strong>{email}</strong>
                </p>
                <Link to="/login">
                  <Button variant="primary">Quay lai dang nhap</Button>
                </Link>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <h3>Quen mat khau</h3>
                <p className="text-muted">
                  Nhap email cua ban de nhan huong dan dat lai mat khau
                </p>
              </div>

              {error && (
                <Alert variant="danger" dismissible onClose={() => setError("")}>
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Nhap email cua ban"
                    required
                  />
                </Form.Group>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-100 mb-3"
                  disabled={loading}
                >
                  {loading ? "Dang xu ly..." : "Gui yeu cau"}
                </Button>

                <div className="text-center">
                  <Link to="/login">Quay lai dang nhap</Link>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ForgotPasswordPage;
