import { useState, useRef, useEffect } from "react";
import "./CSRD.css";
import { BsChat, BsX } from "react-icons/bs";

const CSRD = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // New state for the tabbed form
  const [activeTab, setActiveTab] = useState("materiality");
  const [chatWidgetOpen, setChatWidgetOpen] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message to chat history
    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);

    // Clear input and set loading state
    setInput("");
    setLoading(true);

    try {
      // Send query to backend
      const res = await fetch("http://localhost:8000/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input }),
      });

      const data = await res.json();

      // Add assistant response to chat history
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer.text || "Sorry, I couldn't find an answer.",
        },
      ]);
    } catch (error) {
      console.error("Error fetching response:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Error fetching response. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="csrd-page">
      {/* Tabbed Navigation */}
      <div className="csrd-tabs">
        <button
          className={`tab-button ${
            activeTab === "materiality" ? "active" : ""
          }`}
          onClick={() => setActiveTab("materiality")}
        >
          Materiality Assessment
        </button>
        <button
          className={`tab-button ${
            activeTab === "stakeholder" ? "active" : ""
          }`}
          onClick={() => setActiveTab("stakeholder")}
        >
          Stakeholder Engagement
        </button>
        <button
          className={`tab-button ${activeTab === "governance" ? "active" : ""}`}
          onClick={() => setActiveTab("governance")}
        >
          Governance & Oversight
        </button>
        <button
          className={`tab-button ${activeTab === "target" ? "active" : ""}`}
          onClick={() => setActiveTab("target")}
        >
          Target & Actions
        </button>
        <button
          className={`tab-button ${activeTab === "data" ? "active" : ""}`}
          onClick={() => setActiveTab("data")}
        >
          Data & Reporting
        </button>
      </div>

      {/* Form Content */}
      <div className="csrd-form-container">
        {activeTab === "materiality" && (
          <div className="form-section">
            <div className="form-row">
              <div className="form-group">
                <div className="form-label-group">
                  <label>Required</label>
                  <div className="form-field">
                    <label>
                      Label <span className="required">*</span>
                    </label>
                    <select defaultValue="">
                      <option value="" disabled>
                        Text
                      </option>
                      <option value="option1">Option 1</option>
                      <option value="option2">Option 2</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <div className="form-field">
                  <label>Label</label>
                  <input type="text" placeholder="Hint text" />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <div className="form-label-group">
                  <label>Error</label>
                  <div className="form-field error">
                    <label>
                      Label <span className="required">*</span>
                    </label>
                    <select defaultValue="">
                      <option value="" disabled>
                        Text
                      </option>
                      <option value="option1">Option 1</option>
                      <option value="option2">Option 2</option>
                    </select>
                    <p className="error-message">Error message</p>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <div className="form-field">
                  <label>
                    Label <span className="required">*</span>
                  </label>
                  <input type="text" placeholder="Hint text" />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <div className="form-label-group">
                  <label>Selected</label>
                  <div className="form-field">
                    <label>Label</label>
                    <select defaultValue="selected">
                      <option value="selected">Selected item</option>
                      <option value="option1">Option 1</option>
                      <option value="option2">Option 2</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <div className="form-label-group">
                  <label>Required + Selected</label>
                  <div className="form-field">
                    <label>
                      Label <span className="required">*</span>
                    </label>
                    <select defaultValue="selected">
                      <option value="selected">Selected item</option>
                      <option value="option1">Option 1</option>
                      <option value="option2">Option 2</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <div className="form-field">
                  <label>
                    Label <span className="required">*</span>
                  </label>
                  <input type="text" placeholder="Hint text" />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <div className="form-field">
                  <label>Label</label>
                  <textarea placeholder="Hint text" rows="4"></textarea>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Placeholder content for other tabs */}
        {activeTab === "stakeholder" && (
          <div className="form-section">
            Stakeholder Engagement form fields will go here
          </div>
        )}
        {activeTab === "governance" && (
          <div className="form-section">
            Governance & Oversight form fields will go here
          </div>
        )}
        {activeTab === "target" && (
          <div className="form-section">
            Target & Actions form fields will go here
          </div>
        )}
        {activeTab === "data" && (
          <div className="form-section">
            Data & Reporting form fields will go here
          </div>
        )}
      </div>

      {/* Chat Widget */}
      {!chatWidgetOpen ? (
        <div
          className="chat-widget-button"
          onClick={() => setChatWidgetOpen(true)}
        >
          <BsChat size={24} />
          <div className="chat-tooltip">
            <h4>Chat with our Expert AI</h4>
            <p>Click me! I can answer all your CSRD related questions</p>
          </div>
        </div>
      ) : (
        <div className="chat-widget">
          <div className="chat-widget-header">
            <h3>Chat with our Expert AI</h3>
            <button onClick={() => setChatWidgetOpen(false)}>
              <BsX size={24} />
            </button>
          </div>
          <div className="chat-messages">
            {messages.length === 0 && (
              <div className="welcome-message">
                Ask me anything about CSRD requirements!
              </div>
            )}
            {messages.map((message, index) => (
              <div
                key={index}
                className={`message ${
                  message.role === "user" ? "user-message" : "assistant-message"
                }`}
              >
                <div className="message-content">{message.content}</div>
              </div>
            ))}
            {loading && (
              <div className="assistant-message loading-message">
                <div className="loading-dots">
                  <span>.</span>
                  <span>.</span>
                  <span>.</span>
                </div>
              </div>
            )}
          </div>
          <form onSubmit={handleSubmit} className="chat-input-container">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about sustainability regulations..."
              disabled={loading}
              className="chat-input"
            />
            <button type="submit" disabled={loading} className="send-button">
              {loading ? "Thinking..." : "Send"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default CSRD;
