import { useState, useRef, useEffect } from "react";
import "./CSRD.css";

const CSRD = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

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
    <div className="page-container">
      <h1>CSRD Reporting</h1>
      <p>Your CSRD reporting dashboard and tools</p>

      <div className="csrd-content">
        <div className="chat-container">
          <div className="chat-header">
            <h2>Sustainability Regulations Expert</h2>
          </div>
          <div className="chat-messages">
            {messages.length === 0 && (
              <div className="welcome-message">
                Ask me any questions about CSRD regulations and sustainability
                reporting.
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
              <div className="message assistant-message">
                <div className="message-content loading-dots">
                  Thinking<span>.</span>
                  <span>.</span>
                  <span>.</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
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
      </div>
    </div>
  );
};

export default CSRD;
