import React, { useState, useEffect, useRef } from "react";
import { Card, Form, Button, Spinner } from "react-bootstrap";
import { chatbotService } from "@services";
import { useAuth } from "@context/AuthContext";
import "./ChatbotWidget.css";

const ChatbotWidget = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content: `Xin chào ${
            user?.full_name || "bạn"
          }! 👋\n\nBạn cần tôi giúp gì?`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage = {
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setLoading(true);

    try {
      const response = await chatbotService.sendMessage({
        message: inputMessage,
        conversation_id: conversationId,
      });

      if (response.success) {
        const aiMessage = {
          role: "assistant",
          content: response.response,
          timestamp: new Date(),
          sources: response.sources,
        };

        setMessages((prev) => [...prev, aiMessage]);
        setConversationId(response.conversation_id);
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        role: "assistant",
        content: "❌ Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.",
        timestamp: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = async () => {
    if (window.confirm("Bạn có chắc muốn xóa lịch sử chat?")) {
      if (conversationId) {
        await chatbotService.clearConversation(conversationId);
      }
      setMessages([]);
      setConversationId(null);
      setIsOpen(false);
    }
  };

  const formatMessage = (content) => {
    return content
      .split("\n")
      .map((line) => {
        line = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        line = line.replace(/\*(.*?)\*/g, "<em>$1</em>");
        if (line.trim().startsWith("•") || line.trim().startsWith("-")) {
          line = `<li>${line.replace(/^[•\-]\s*/, "")}</li>`;
        }
        return line;
      })
      .join("<br/>");
  };

  return (
    <>
      <button
        className={`chatbot-toggle ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <i className="fas fa-times"></i>
        ) : (
          <>
            <i className="fas fa-comments"></i>
            <span className="chatbot-badge">AI</span>
          </>
        )}
      </button>

      {isOpen && (
        <Card className="chatbot-window">
          <Card.Header className="chatbot-header">
            <div className="d-flex align-items-center">
              <div className="chatbot-avatar">
                <i className="fas fa-robot"></i>
              </div>
              <div className="flex-grow-1">
                <h6 className="mb-0">Trợ lý AI</h6>
                <small className="text-muted">
                  <span className="status-dot"></span>
                  Đang hoạt động
                </small>
              </div>
              <div className="d-flex gap-2">
                <Button
                  variant="link"
                  size="sm"
                  className="text-white"
                  onClick={handleClearChat}
                  title="Xóa lịch sử"
                >
                  <i className="fas fa-trash"></i>
                </Button>
                <Button
                  variant="link"
                  size="sm"
                  className="text-white"
                  onClick={() => setIsOpen(false)}
                >
                  <i className="fas fa-minus"></i>
                </Button>
              </div>
            </div>
          </Card.Header>

          <Card.Body className="chatbot-messages">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`message ${message.role} ${
                  message.isError ? "error" : ""
                }`}
              >
                <div className="message-avatar">
                  {message.role === "user" ? (
                    <i className="fas fa-user"></i>
                  ) : (
                    <i className="fas fa-robot"></i>
                  )}
                </div>
                <div className="message-content">
                  <div
                    className="message-text"
                    dangerouslySetInnerHTML={{
                      __html: formatMessage(message.content),
                    }}
                  />
                  {message.sources && message.sources.length > 0 && (
                    <div className="message-sources">
                      <small className="text-muted">
                        <i className="fas fa-link me-1"></i>
                        Nguồn: {message.sources.map((s) => s.name).join(", ")}
                      </small>
                    </div>
                  )}
                  <small className="message-time">
                    {new Date(message.timestamp).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </small>
                </div>
              </div>
            ))}

            {loading && (
              <div className="message assistant">
                <div className="message-avatar">
                  <i className="fas fa-robot"></i>
                </div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </Card.Body>

          <Card.Footer className="chatbot-footer">
            <Form.Group className="mb-0">
              <div className="input-group">
                <Form.Control
                  as="textarea"
                  rows={1}
                  placeholder="Nhập tin nhắn..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  className="chatbot-input"
                />
                <Button
                  variant="primary"
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || loading}
                  className="chatbot-send-btn"
                >
                  {loading ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    <i className="fas fa-paper-plane"></i>
                  )}
                </Button>
              </div>
            </Form.Group>

            <div className="quick-actions">
              <button
                className="quick-action-btn"
                onClick={() => setInputMessage("Có bao nhiêu nữ tu?")}
              >
                📊 Số lượng
              </button>
              <button
                className="quick-action-btn"
                onClick={() => setInputMessage("Danh sách các cộng đoàn")}
              >
                🏠 Cộng đoàn
              </button>
              <button
                className="quick-action-btn"
                onClick={() => setInputMessage("Thống kê theo giai đoạn ơn gọi")}
              >
                📍 Giai đoạn
              </button>
              <button
                className="quick-action-btn"
                onClick={() => setInputMessage("Hướng dẫn sử dụng")}
              >
                ❓ Trợ giúp
              </button>
            </div>
          </Card.Footer>
        </Card>
      )}
    </>
  );
};

export default ChatbotWidget;
