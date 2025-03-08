import { useState, useRef, useEffect } from "react";
import "./CSRD.css";
import { BsChat, BsX } from "react-icons/bs";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { db } from "../../firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

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
  const [isClosing, setIsClosing] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
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

  // Close chat widget with animation
  const handleCloseChat = () => {
    setIsClosing(true);
    setIsAnimating(true);

    // Use a slightly longer timeout than the animation duration
    // to ensure the slide out is completed before swap
    setTimeout(() => {
      setChatWidgetOpen(false);
      setIsClosing(false);

      // Add a small delay before allowing button to appear
      setTimeout(() => {
        setIsAnimating(false);
      }, 50);
    }, 350); // Increased from 300ms to 350ms
  };

  // Open chat widget
  const handleOpenChat = () => {
    setIsAnimating(true);
    setChatWidgetOpen(true);

    // Reset animating state after animation completes
    setTimeout(() => {
      setIsAnimating(false);
    }, 350);
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
        `${
          import.meta.env.VITE_BACKEND_API_URL
        }/query/stream?question=${encodeURIComponent(question)}`
      );

      let timeoutId;

      // Function to set up timeout
      const setupTimeout = () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          console.log("Stream timeout");
          eventSource.close();
          setLoading(false);
        }, 30000); // 30 seconds timeout
      };

      // Set initial timeout
      setupTimeout();

      // Handle incoming message chunks
      eventSource.onmessage = (event) => {
        // Reset timeout on each message
        setupTimeout();

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
        scrollToBottom();
      };

      // Handle errors
      eventSource.onerror = (error) => {
        console.error("EventSource error:", error);
        eventSource.close();
        clearTimeout(timeoutId);
        setLoading(false);

        // If we didn't get any message, show an error
        setMessages((prevMessages) => {
          const lastMessage = prevMessages[prevMessages.length - 1];
          if (lastMessage.id === tempId && !lastMessage.content) {
            return prevMessages.map((message) =>
              message.id === tempId
                ? {
                    ...message,
                    content: "Sorry, I encountered an error. Please try again.",
                  }
                : message
            );
          }
          return prevMessages;
        });
      };

      // Handle when the connection is closed
      eventSource.addEventListener("close", () => {
        eventSource.close();
        clearTimeout(timeoutId);
        setLoading(false);
      });

      // Clean up function that will be called when the component unmounts
      return () => {
        eventSource.close();
        clearTimeout(timeoutId);
        setLoading(false);
      };
    } catch (error) {
      console.error("Error setting up streaming:", error);
      setLoading(false);

      // Update the assistant message with an error
      setMessages((prevMessages) =>
        prevMessages.map((message) =>
          message.id === tempId
            ? {
                ...message,
                content: "Sorry, I encountered an error. Please try again.",
              }
            : message
        )
      );
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
    <div className={`csrd-page ${chatWidgetOpen ? "chat-open" : ""}`}>
      <div className="csrd-content">
        {/* Tab Navigation */}
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
            className={`tab-button ${
              activeTab === "governance" ? "active" : ""
            }`}
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
              <div className="section-header">
                <h2>Materiality Assessment</h2>
                <p className="section-description">
                  Identify and prioritize the sustainability issues that are
                  most significant to your organization and stakeholders.
                </p>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <div className="form-label-group">
                    <label>Assessment Details</label>
                    <div className="form-field">
                      <label>
                        Assessment Method <span className="required">*</span>
                      </label>
                      <select
                        defaultValue=""
                        onChange={(e) =>
                          handleFormChange(
                            "materiality",
                            "assessmentMethod",
                            e.target.value
                          )
                        }
                      >
                        <option value="" disabled>
                          Select assessment method
                        </option>
                        <option value="doubleMaterilaity">
                          Double Materiality
                        </option>
                        <option value="stakeholderEngagement">
                          Stakeholder Engagement
                        </option>
                        <option value="impactAssessment">
                          Impact Assessment
                        </option>
                      </select>
                      <span className="helper-text">
                        The methodology used to assess materiality
                      </span>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <div className="form-field">
                    <label>Assessment Frequency</label>
                    <select
                      onChange={(e) =>
                        handleFormChange(
                          "materiality",
                          "assessmentFrequency",
                          e.target.value
                        )
                      }
                    >
                      <option value="" disabled selected>
                        Select frequency
                      </option>
                      <option value="annual">Annual</option>
                      <option value="biannual">Bi-annual</option>
                      <option value="quarterly">Quarterly</option>
                    </select>
                    <span className="helper-text">
                      How often your organization conducts materiality
                      assessments
                    </span>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <div className="form-field">
                    <label>
                      Top Material Topics <span className="required">*</span>
                    </label>
                    <textarea
                      placeholder="List your top 3-5 material topics identified in your assessment"
                      onChange={(e) =>
                        handleFormChange(
                          "materiality",
                          "materialTopics",
                          e.target.value
                        )
                      }
                      rows="4"
                    ></textarea>
                    <span className="helper-text">
                      These are the issues that have the most significant impact
                      on your business and stakeholders
                    </span>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <div className="form-field">
                    <label>Last Assessment Date</label>
                    <input
                      type="date"
                      onChange={(e) =>
                        handleFormChange(
                          "materiality",
                          "lastAssessmentDate",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>

                <div className="form-group">
                  <div className="form-field error">
                    <label>
                      Stakeholders Involved <span className="required">*</span>
                    </label>
                    <select
                      defaultValue=""
                      onChange={(e) =>
                        handleFormChange(
                          "materiality",
                          "stakeholdersInvolved",
                          e.target.value
                        )
                      }
                      multiple
                    >
                      <option value="employees">Employees</option>
                      <option value="customers">Customers</option>
                      <option value="suppliers">Suppliers</option>
                      <option value="investors">Investors</option>
                      <option value="localCommunities">
                        Local Communities
                      </option>
                      <option value="ngos">NGOs</option>
                    </select>
                    <div className="error-message">
                      Please select at least one stakeholder group
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <div className="form-field">
                    <label>Assessment Methodology Description</label>
                    <textarea
                      placeholder="Briefly describe how your organization conducted the materiality assessment..."
                      onChange={(e) =>
                        handleFormChange(
                          "materiality",
                          "methodologyDescription",
                          e.target.value
                        )
                      }
                      rows="3"
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "stakeholder" && (
            <div className="form-section">
              <div className="section-header">
                <h2>Stakeholder Engagement</h2>
                <p className="section-description">
                  Document how your organization engages with various
                  stakeholders on sustainability matters.
                </p>
              </div>

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
              <div className="section-header">
                <h2>Governance & Oversight</h2>
                <p className="section-description">
                  Detail your organization&apos;s governance structure for
                  sustainability issues.
                </p>
              </div>

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
              <div className="section-header">
                <h2>Target & Actions</h2>
                <p className="section-description">
                  Set specific, measurable sustainability targets and track your
                  progress.
                </p>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <div className="form-field">
                    <label>
                      Carbon Reduction Target{" "}
                      <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 50% by 2030"
                      onChange={(e) =>
                        handleFormChange(
                          "target",
                          "carbonTarget",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "data" && (
            <div className="form-section">
              <div className="section-header">
                <h2>Data & Reporting</h2>
                <p className="section-description">
                  Specify your reporting frameworks and data collection
                  methodologies.
                </p>
              </div>

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
                    <span className="helper-text">
                      The primary framework used for sustainability reporting
                    </span>
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
      </div>

      {/* Always render both elements, but control visibility with CSS */}
      <div
        className={`chat-widget-button ${
          chatWidgetOpen || isAnimating ? "hidden" : ""
        }`}
        onClick={handleOpenChat}
      >
        <BsChat size={24} />
        <div className="chat-tooltip">
          <h4>Chat with our Expert AI</h4>
          <p>Click me! I can answer all your CSRD related questions</p>
        </div>
      </div>

      {(chatWidgetOpen || isAnimating) && (
        <div className={`chat-widget ${isClosing ? "closing" : ""}`}>
          <div className="chat-widget-header">
            <h3>Chat with our Expert AI</h3>
            <button onClick={handleCloseChat}>
              <BsX size={24} />
            </button>
          </div>
          <div className="chat-messages">
            {messages.length === 0 && (
              <div className="welcome-message">
                <h1>Hi,</h1>
                <p>How can I assist you today?</p>
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
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSubmit} className="chat-input-container">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              disabled={loading}
              className="chat-input"
            />
            <button type="submit" disabled={loading} className="send-button">
              {loading ? "..." : "Send"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default CSRD;
