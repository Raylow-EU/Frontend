import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { db } from "../../firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import "./CSRD.css";
import { BsChat, BsX } from "react-icons/bs";
import { toast } from "react-toastify";

const CSRD = () => {
  const { user } = useSelector((state) => state.auth);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const messagesEndRef = useRef(null);

  // Form state
  const [activeTab, setActiveTab] = useState("materiality");
  const [chatWidgetOpen, setChatWidgetOpen] = useState(false);
  const [formData, setFormData] = useState({
    materiality: {},
    stakeholder: {},
    governance: {},
    target: {},
    data: {},
  });

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle chat submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message to chat history
    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);

    // Store the input for the API call
    const question = input.trim();

    // Clear input and set loading state
    setInput("");
    setLoading(true);

    // Create a temporary ID for the assistant message
    const tempId = Date.now().toString();

    // Add empty assistant message that we'll update with streamed content
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "",
        id: tempId,
      },
    ]);

    try {
      // Create an EventSource connection to the streaming endpoint
      const eventSource = new EventSource(
        `http://localhost:8000/query/stream?question=${encodeURIComponent(
          question
        )}`
      );

      // Handle incoming message chunks
      eventSource.onmessage = (event) => {
        const chunk = event.data;

        // Update the assistant message with the new chunk
        setMessages((prevMessages) =>
          prevMessages.map((message) =>
            message.id === tempId
              ? { ...message, content: message.content + chunk }
              : message
          )
        );

        // Auto scroll to the latest message
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      };

      // Handle errors
      eventSource.onerror = (error) => {
        console.error("EventSource error:", error);
        eventSource.close();
        setLoading(false);

        // Remove the loading indicator
        setLoading(false);
      };

      // Handle completion - assuming the backend sends a special "done" message
      eventSource.addEventListener("done", () => {
        console.log("Stream completed");
        eventSource.close();
        setLoading(false);
      });

      // Add a timeout in case the connection hangs
      const timeout = setTimeout(() => {
        console.log("Stream timeout");
        eventSource.close();
        setLoading(false);
      }, 30000); // 30 seconds timeout

      // Clear timeout when we get a message
      eventSource.onmessage = (event) => {
        clearTimeout(timeout); // Reset timeout on each message
        const chunk = event.data;

        // Update the assistant message with the new chunk
        setMessages((prevMessages) =>
          prevMessages.map((message) =>
            message.id === tempId
              ? { ...message, content: message.content + chunk }
              : message
          )
        );

        // Auto scroll to the latest message
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      };

      // Cleanup function
      return () => {
        clearTimeout(timeout);
        eventSource.close();
        setLoading(false);
      };
    } catch (error) {
      console.error("Error setting up streaming:", error);
      setLoading(false);
    }
  };

  // Handle form field changes
  const handleFormChange = (category, fieldName, value) => {
    setFormData((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [fieldName]: value,
      },
    }));
  };

  // Handle form submission
  const handleFormSubmit = async () => {
    if (!user) {
      toast.error("You must be logged in to submit the form");
      return;
    }

    console.log("Current user:", user); // Add this to debug

    setSubmitting(true);

    try {
      // Ensure user is properly authenticated
      if (!user.uid) {
        throw new Error("User ID is missing");
      }

      // Create a submission object with metadata
      const submission = {
        userId: user.uid,
        userName: user.displayName || "Anonymous",
        timestamp: serverTimestamp(),
        formData: formData,
      };

      console.log("Submitting data:", submission); // Debug log

      // Add to Firestore
      const docRef = await addDoc(
        collection(db, "csrdSubmissions"),
        submission
      );
      console.log("Document written with ID:", docRef.id);

      toast.success("Your CSRD form has been submitted successfully!");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(`Failed to submit form: ${error.message}`);
    } finally {
      setSubmitting(false);
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
                    <select
                      defaultValue=""
                      onChange={(e) =>
                        handleFormChange(
                          "materiality",
                          "requiredSelect",
                          e.target.value
                        )
                      }
                    >
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
                  <input
                    type="text"
                    placeholder="Hint text"
                    onChange={(e) =>
                      handleFormChange(
                        "materiality",
                        "optionalInput",
                        e.target.value
                      )
                    }
                  />
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
                    <select
                      defaultValue=""
                      onChange={(e) =>
                        handleFormChange(
                          "materiality",
                          "errorSelect",
                          e.target.value
                        )
                      }
                    >
                      <option value="" disabled>
                        Text
                      </option>
                      <option value="option1">Option 1</option>
                      <option value="option2">Option 2</option>
                    </select>
                    <div className="error-message">Error message</div>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <div className="form-field">
                  <label>
                    Label <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Hint text"
                    onChange={(e) =>
                      handleFormChange(
                        "materiality",
                        "requiredInput",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <div className="form-label-group">
                  <label>Selected</label>
                  <div className="form-field">
                    <label>Label</label>
                    <select
                      defaultValue="selected"
                      onChange={(e) =>
                        handleFormChange(
                          "materiality",
                          "selectedSelect",
                          e.target.value
                        )
                      }
                    >
                      <option value="selected">Selected item</option>
                      <option value="option1">Option 1</option>
                      <option value="option2">Option 2</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <div className="form-field">
                  <label>Label</label>
                  <input
                    type="text"
                    placeholder="Hint text"
                    onChange={(e) =>
                      handleFormChange(
                        "materiality",
                        "anotherOptionalInput",
                        e.target.value
                      )
                    }
                  />
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
                    <select
                      defaultValue="selected"
                      onChange={(e) =>
                        handleFormChange(
                          "materiality",
                          "requiredSelectedSelect",
                          e.target.value
                        )
                      }
                    >
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
                  <input
                    type="text"
                    placeholder="Hint text"
                    onChange={(e) =>
                      handleFormChange(
                        "materiality",
                        "finalRequiredInput",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <div className="form-field">
                  <label>Label</label>
                  <textarea
                    placeholder="Hint text"
                    rows="4"
                    onChange={(e) =>
                      handleFormChange(
                        "materiality",
                        "textareaInput",
                        e.target.value
                      )
                    }
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Placeholder content for other tabs */}
        {activeTab === "stakeholder" && (
          <div className="form-section">
            <div className="form-row">
              <div className="form-group full-width">
                <div className="form-field">
                  <label>
                    Stakeholder Groups <span className="required">*</span>
                  </label>
                  <select
                    onChange={(e) =>
                      handleFormChange(
                        "stakeholder",
                        "stakeholderGroups",
                        e.target.value
                      )
                    }
                  >
                    <option value="" disabled selected>
                      Select stakeholder groups
                    </option>
                    <option value="employees">Employees</option>
                    <option value="customers">Customers</option>
                    <option value="investors">Investors</option>
                    <option value="suppliers">Suppliers</option>
                    <option value="communities">Local Communities</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group full-width">
                <div className="form-field">
                  <label>Engagement Method</label>
                  <textarea
                    placeholder="Describe your stakeholder engagement methods"
                    rows="4"
                    onChange={(e) =>
                      handleFormChange(
                        "stakeholder",
                        "engagementMethod",
                        e.target.value
                      )
                    }
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "governance" && (
          <div className="form-section">
            <div className="form-row">
              <div className="form-group full-width">
                <div className="form-field">
                  <label>
                    Sustainability Governance{" "}
                    <span className="required">*</span>
                  </label>
                  <textarea
                    placeholder="Describe your sustainability governance structure"
                    rows="4"
                    onChange={(e) =>
                      handleFormChange(
                        "governance",
                        "sustainabilityGovernance",
                        e.target.value
                      )
                    }
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "target" && (
          <div className="form-section">
            <div className="form-row">
              <div className="form-group full-width">
                <div className="form-field">
                  <label>
                    Carbon Reduction Target <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 50% by 2030"
                    onChange={(e) =>
                      handleFormChange("target", "carbonTarget", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "data" && (
          <div className="form-section">
            <div className="form-row">
              <div className="form-group full-width">
                <div className="form-field">
                  <label>
                    Reporting Framework <span className="required">*</span>
                  </label>
                  <select
                    onChange={(e) =>
                      handleFormChange(
                        "data",
                        "reportingFramework",
                        e.target.value
                      )
                    }
                  >
                    <option value="" disabled selected>
                      Select reporting framework
                    </option>
                    <option value="gri">GRI Standards</option>
                    <option value="sasb">SASB</option>
                    <option value="tcfd">TCFD</option>
                    <option value="csrd">CSRD</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="form-submit-container">
          <button
            className="form-submit-button"
            onClick={handleFormSubmit}
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit CSRD Form"}
          </button>
        </div>
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
                key={message.id || index}
                className={`message ${
                  message.role === "user" ? "user-message" : "assistant-message"
                }`}
              >
                <div className="message-content">
                  {message.content || " "}
                  {message.role === "assistant" &&
                    loading &&
                    index === messages.length - 1 && (
                      <span className="typing-indicator">
                        <span className="dot"></span>
                        <span className="dot"></span>
                        <span className="dot"></span>
                      </span>
                    )}
                </div>
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
      )}
    </div>
  );
};

export default CSRD;
